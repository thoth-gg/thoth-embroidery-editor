declare module 'simple-bezier' {
  export default function bezier(points: number[][], steps: number): number[][]
}
declare module 'svg-path-parser' {
  export function parseSVG(input: string | null): any[]
  export function makeAbsolute(input: any[]): any[]
}
