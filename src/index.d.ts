declare module 'svg-path-parser' {
  export function parseSVG(input: string | null): any[]
  export function makeAbsolute(input: any[]): any[]
}
