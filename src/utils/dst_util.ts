// make_square_dst.ts
// Node.js (ESM想定). 1cm square plotted with JUMP moves and STITCH dots at corners.
import { Buffer } from "buffer";
import { Point } from "../models/point";

type Cmd = "stitch" | "jump" | "color"

// DST: tenths of a millimeter (0.1mm). Max per record is 121 (81+27+9+3+1).
const DST_MAX_DELTA = 121;

type BitSpec = { weight: number; byteIndex: 0 | 1 | 2; posBit: number; negBit: number };

// Byte layout from DST docs:
// Byte1: bit7 y+1, bit6 y-1, bit5 y+9, bit4 y-9, bit3 x-9, bit2 x+9, bit1 x-1, bit0 x+1
// Byte2: bit7 y+3, bit6 y-3, bit5 y+27, bit4 y-27, bit3 x-27, bit2 x+27, bit1 x-3, bit0 x+3
// Byte3: bit7 jump, bit6 color change, bit5 y+81, bit4 y-81, bit3 x-81, bit2 x+81, bit1 set, bit0 set
const X_BITS: BitSpec[] = [
    { weight: 1, byteIndex: 0, posBit: 0, negBit: 1 },
    { weight: 3, byteIndex: 1, posBit: 0, negBit: 1 },
    { weight: 9, byteIndex: 0, posBit: 2, negBit: 3 },
    { weight: 27, byteIndex: 1, posBit: 2, negBit: 3 },
    { weight: 81, byteIndex: 2, posBit: 2, negBit: 3 },
];

const Y_BITS: BitSpec[] = [
    { weight: 1, byteIndex: 0, posBit: 7, negBit: 6 },
    { weight: 3, byteIndex: 1, posBit: 7, negBit: 6 },
    { weight: 9, byteIndex: 0, posBit: 5, negBit: 4 },
    { weight: 27, byteIndex: 1, posBit: 5, negBit: 4 },
    { weight: 81, byteIndex: 2, posBit: 5, negBit: 4 },
];


function setBit(b: number, bit: number): number {
    return b | (1 << bit);
}

function encodeAxis(bytes: [number, number, number], value: number, specs: BitSpec[]) {
    let n = value;

    // specs は weight が 1,3,9,27,81 の昇順であること
    for (const s of specs) {
        // JS の % は負で負余りになるので 0..2 に正規化
        const r = ((n % 3) + 3) % 3;

        if (r === 0) {
            // digit = 0
            n = Math.trunc(n / 3);
        } else if (r === 1) {
            // digit = +1
            bytes[s.byteIndex] = setBit(bytes[s.byteIndex], s.posBit);
            n = Math.trunc((n - 1) / 3);
        } else {
            // r === 2 => digit = -1
            bytes[s.byteIndex] = setBit(bytes[s.byteIndex], s.negBit);
            n = Math.trunc((n + 1) / 3);
        }
    }

    if (n !== 0) {
        throw new Error(`DST delta out of range: ${value}`);
    }
}

function assertCmdBytes(cmd: "stitch" | "jump" | "color", b2: number) {
    const isJump = (b2 & 0x80) !== 0;
    const isStop = (b2 & 0x40) !== 0;
    const hasBase = (b2 & 0x03) === 0x03;

    if (!hasBase) throw new Error(`invalid control bits: b2=0x${b2.toString(16)}`);

    if (cmd === "stitch" && (isJump || isStop)) {
        throw new Error(`stitch record has jump/stop bit: b2=0x${b2.toString(16)}`);
    }
    if (cmd === "jump" && (!isJump || isStop)) {
        throw new Error(`jump record malformed: b2=0x${b2.toString(16)}`);
    }
    if (cmd === "color" && (!isJump || !isStop)) {
        throw new Error(`color record malformed: b2=0x${b2.toString(16)}`);
    }
}


function encodeRecord(dx: number, dy: number, cmd: Cmd): Uint8Array {
    // Validate that dx and dy are within the encodable range
    if (Math.abs(dx) > DST_MAX_DELTA || Math.abs(dy) > DST_MAX_DELTA) {
        throw new Error(`DST delta out of range: dx=${dx}, dy=${dy} (max=${DST_MAX_DELTA})`);
    }

    const bytes: [number, number, number] = [0, 0, 0];

    encodeAxis(bytes, dx, X_BITS);
    encodeAxis(bytes, dy, Y_BITS);

    // ★必須：bit0/bit1 は全レコードで 1
    bytes[2] |= 0x03; // 0b00000011  :contentReference[oaicite:1]{index=1}

    // cmdフラグ（座標ビットは壊さないよう |= で足す）
    if (cmd === "jump") bytes[2] |= 0x80;        // bit7 :contentReference[oaicite:2]{index=2}
    else if (cmd === "color") bytes[2] |= 0xC0;  // bit6+7 :contentReference[oaicite:3]{index=3}
    // stitch は追加無し（0x03 のみ）
    assertCmdBytes(cmd, bytes[2])
    return Uint8Array.from(bytes);
}


function endRecord(): Uint8Array {
    // End of pattern: 00 00 F3
    return Uint8Array.from([0x00, 0x00, 0xF3]);
}

function clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n));
}

function splitMove(totalDx: number, totalDy: number): Array<{ dx: number; dy: number }> {
    const steps: Array<{ dx: number; dy: number }> = [];
    let dx = Math.round(totalDx);
    let dy = Math.round(totalDy);

    while (dx !== 0 || dy !== 0) {
        // Clamp to valid range
        const stepDx = dx === 0 ? 0 : clamp(dx, -DST_MAX_DELTA, DST_MAX_DELTA);
        const stepDy = dy === 0 ? 0 : clamp(dy, -DST_MAX_DELTA, DST_MAX_DELTA);

        steps.push({ dx: stepDx, dy: stepDy });
        dx -= stepDx;
        dy -= stepDy;

        // Safety check to prevent infinite loops
        if (steps.length > 10000) {
            throw new Error(`splitMove: too many steps required for dx=${totalDx}, dy=${totalDy}`);
        }
    }
    return steps;
}

function padNum(n: number, width: number): string {
    const s = Math.abs(Math.trunc(n)).toString();
    return s.padStart(width, "0");
}

function makeHeader(opts: {
    label: string;
    stitchCount: number;
    colorCount: number;
    maxX: number;
    minX: number;
    maxY: number;
    minY: number;
    ax: number;
    ay: number;
}): Buffer {
    const label16 = opts.label.slice(0, 16).padEnd(16, " ");

    // Common DST header fields. Values are in 0.1mm units.
    const parts: string[] = [];
    parts.push(`LA:${label16}\r`);
    parts.push(`ST:${padNum(opts.stitchCount, 7)}\r`);
    parts.push(`CO:${padNum(opts.colorCount, 3)}\r`);
    parts.push(`+X:${padNum(opts.maxX, 5)}\r`);
    parts.push(`-X:${padNum(opts.minX, 5)}\r`);
    parts.push(`+Y:${padNum(opts.maxY, 5)}\r`);
    parts.push(`-Y:${padNum(opts.minY, 5)}\r`);

    const axSign = opts.ax >= 0 ? "+" : "-";
    const aySign = opts.ay >= 0 ? "+" : "-";
    parts.push(`AX:${axSign}${padNum(opts.ax, 5)}\r`);
    parts.push(`AY:${aySign}${padNum(opts.ay, 5)}\r`);

    // Multi-design fields (rarely used): set to 0
    parts.push(`MX:+${padNum(0, 5)}\r`);
    parts.push(`MY:+${padNum(0, 5)}\r`);

    // Previous design
    parts.push(`PD:******\r`);

    let headerAscii = parts.join("");
    let headerBuf = Buffer.from(headerAscii, "ascii");

    // Header terminator: 0x1A then spaces; pad to 512 bytes total.
    const terminator = Buffer.from([0x1a, 0x20, 0x20, 0x20]);

    let combined = Buffer.concat([headerBuf, terminator]);
    if (combined.length > 512) {
        // If you add more fields, keep it within 512.
        combined = Buffer.from(combined.subarray(0, 512));
    } else if (combined.length < 512) {
        const pad = Buffer.alloc(512 - combined.length, 0x20);
        combined = Buffer.concat([combined, pad]);
    }
    return combined;
}

export function buildDST(absolutePoints: Point[]): Buffer {
    const records: Uint8Array[] = [];

    if (absolutePoints.length === 0) {
        throw new Error("absolutePoints must not be empty");
    }

    let currentX = 0;
    let currentY = 0;

    // すべてのポイントを処理（最初のポイントも含む）
    for (let i = 0; i < absolutePoints.length; i++) {
        const target = absolutePoints[i];

        // 座標を整数に丸める（DST形式は0.1mm単位）
        const targetX = Math.round(target.x);
        const targetY = Math.round(target.y);

        // 現在位置から目標位置への相対距離を計算
        const dx = targetX - currentX;
        const dy = targetY - currentY;

        // 大きな移動を複数のステップに分割
        const steps = splitMove(dx, dy);

        // 最初のポイントの場合、すべてのステップでstitch
        // それ以外の場合、最後のステップ以外はJUMPで移動
        const isFirstPoint = i === 0;

        if (isFirstPoint && steps.length > 0) {
            // 最初のポイント：すべてのステップでstitch
            for (const step of steps) {
                records.push(encodeRecord(step.dx, step.dy, "stitch"));
                currentX += step.dx;
                currentY += step.dy;
            }
        } else {
            // 2番目以降のポイント：最後のステップ以外はJUMP
            for (const step of steps.slice(0, -1)) {
                records.push(encodeRecord(step.dx, step.dy, "jump"));
                currentX += step.dx;
                currentY += step.dy;
            }

            // 最後のステップでstitch（頂点で点を打つ）
            if (steps.length > 0) {
                const lastStep = steps[steps.length - 1];
                records.push(encodeRecord(lastStep.dx, lastStep.dy, "stitch"));
                currentX += lastStep.dx;
                currentY += lastStep.dy;
            }
        }
    }

    records.push(endRecord());

    // stitch count in header usually counts commands excluding the final end record
    const stitchCount = records.length - 1;

    // extents: calculate from absolutePoints
    const xValues = absolutePoints.map(p => p.x);
    const yValues = absolutePoints.map(p => p.y);
    const maxX = Math.max(...xValues);
    const minX = Math.min(...xValues);
    const maxY = Math.max(...yValues);
    const minY = Math.min(...yValues);

    const header = makeHeader({
        label: "PATTERN",
        stitchCount,
        colorCount: 0,
        maxX,
        minX,
        maxY,
        minY,
        ax: currentX,
        ay: currentY,
    });

    const body = Buffer.concat(records.map((r) => Buffer.from(r)));
    return Buffer.concat([header, body]);
}

// Example usage (commented out):
// const points = [
//     new Point(0, 0),
//     new Point(100, 0),
//     new Point(100, 100),
//     new Point(0, 100),
//     new Point(0, 0),
// ];
// const out = buildDST(points);
// console.log(`wrote pattern.dst (${out.length} bytes)`);
