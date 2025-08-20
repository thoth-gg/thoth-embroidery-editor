import type p5 from "p5"

export abstract class EditorView {
  abstract draw(p: p5): void;
  abstract mouseClicked(p: p5): void;
  abstract doubleClicked(p: p5): void;

  getName(): string {
    return this.constructor.name;
  }
}