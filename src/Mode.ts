import IMode from "./IMode";

class Mode implements IMode {
  public readonly name: string;
  public readonly px: number;
  public readonly padding: number;
  public readonly width: number;
  public readonly height: number;
  public readonly numBoom: number;
  public readonly hint: number;
  constructor(
    name: string,
    px: number,
    padding: number,
    width: number,
    height: number,
    numBoom: number,
    hint: number
  ) {
    this.name = name;
    this.px = px;
    this.padding = padding;
    this.width = width;
    this.height = height;
    this.numBoom = numBoom;
    this.hint = hint;
  }
  public get widthPx() {
    return this.px * this.width;
  }
}

export default Mode;
