import { Vector2 } from "./Vector2";


function random(scale: number) {
  return (Math.random() > 0.5 ? 1 : -1) * (Math.random() * scale);
}
function lameRandom(scale: number) {
  return (Math.random() * scale);
}

export default class SketchyContext {
  private context: CanvasRenderingContext2D;
  private currentPosition: Vector2 = { x: 0, y: 0 };

  constructor(context: CanvasRenderingContext2D, private sketchAmount = 2, private forceLineConnects = true) {
    this.context = context;
  }

  fillRect(x: number, y: number, width: number, height: number): void {
    this.context.fillRect(x, y, width, height);
  }

  // Move to a new position without drawing a line
  moveTo(x: number, y: number): void {
    this.currentPosition = { x, y };
    this.context.moveTo(x, y);
  }

  // Draw a line to a new position from the current position
  lineTo(x: number, y: number): void {
    if (this.forceLineConnects) {
      // this.context.moveTo(this.currentPosition.x + random(1), this.currentPosition.y+ random(1));
      this.context.lineTo(x, y);
    }

    const lineCount = this.sketchAmount;
    for (let i = 0; i < lineCount; i++) {
      this.context.moveTo(this.currentPosition.x + random(lineCount), this.currentPosition.y + random(lineCount));
      this.context.lineTo(x + random(lineCount), y + random(lineCount));
    }
    // this.context.lineWidth = lw;
    this.currentPosition = { x, y };
  }

  clearRect(x: number, y: number, width: number, height: number) { this.context.clearRect(x, y, width, height); }
  rect(x: number, y: number, width: number, height: number) { this.context.rect(x, y, width, height); }

  fill() { this.context.fill(); }
  save() { this.context.save(); }
  beginPath() { this.context.beginPath(); }
  closePath() { this.context.closePath(); }
  stroke() { this.context.stroke(); }
  restore() { this.context.restore(); }
  translate(x: number, y: number) { this.context.translate(x, y); }

  public get fillStyle(): string | CanvasGradient | CanvasPattern {
    return this.context.fillStyle;
  }
  public set fillStyle(value: string | CanvasGradient | CanvasPattern) {
    this.context.fillStyle = value;
  }

  public get strokeStyle(): string | CanvasGradient | CanvasPattern {
    return this.context.strokeStyle;
  }
  public set strokeStyle(value: string | CanvasGradient | CanvasPattern) {
    this.context.strokeStyle = value;
  }

  public get lineWidth(): number {
    return this.context.lineWidth;
  }
  public set lineWidth(value: number) {
    this.context.lineWidth = value;
  }
}