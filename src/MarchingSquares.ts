import Bitmasker from "./Bitmasker";
import SketchyContext from "./SketchyContext";

const ALLOW_PASSING_DIAGONALLY = false;

export enum CornerMask {
  NW,
  NE,
  SW,
  SE,
};

export class MarchingSquares {
  public constructor(private outlineCtx: SketchyContext | CanvasRenderingContext2D,private backgroundCtx: SketchyContext | CanvasRenderingContext2D, private gridWidth: number, private gridHeight: number, private cellSize: number, private checkSomethingAtPoint: (pt: { x: number; y: number; }) => boolean) {
    this.runAlgorithm();
  }

  private handleMaskStroke(position: { x: number; y: number; }, maskRef: Bitmasker<CornerMask>) {
    const halfSize = this.cellSize / 2;
    const size = this.cellSize;
    const ctx = this.outlineCtx;
    ctx.save();
    ctx.translate(-halfSize, -halfSize);

    ctx.fillStyle = ctx.strokeStyle = 'rgba(130,125,125, 0.5)';
    ctx.lineWidth = 2;

    const drawPos = position;
    drawPos.x *= size;
    drawPos.y *= size;

    // Define midpoints for convenience
    const mx = (drawPos.x + (size / 2)) | 0;
    const my = (drawPos.y + (size / 2)) | 0;

    ctx.beginPath();

    // Configuration 1: Only NW is active
    if (maskRef.all(CornerMask.NW, ~CornerMask.NE, ~CornerMask.SW, ~CornerMask.SE)) {
      ctx.moveTo(drawPos.x, my);
      ctx.lineTo(mx, drawPos.y);
    }

    // Configuration 2: Only NE is active
    if (maskRef.all(~CornerMask.NW, CornerMask.NE, ~CornerMask.SW, ~CornerMask.SE)) {
      ctx.moveTo(mx, drawPos.y);
      ctx.lineTo(drawPos.x + size, my);
    }

    // Configuration 3: NW and NE are active
    if (maskRef.all(CornerMask.NW, CornerMask.NE, ~CornerMask.SW, ~CornerMask.SE)) {
      ctx.moveTo(drawPos.x, my);
      ctx.lineTo(drawPos.x + size, my);
    }

    // Configuration 4: Only SW is active
    if (maskRef.all(~CornerMask.NW, ~CornerMask.NE, CornerMask.SW, ~CornerMask.SE)) {
      ctx.moveTo(drawPos.x, my);
      ctx.lineTo(mx, drawPos.y + size);
    }

    // Configuration 5: NW and SW are active
    if (maskRef.all(CornerMask.NW, ~CornerMask.NE, CornerMask.SW, ~CornerMask.SE)) {
      ctx.moveTo(mx, drawPos.y);
      ctx.lineTo(mx, drawPos.y + size);
    }

    // Configuration 6: NE and SW are active
    if (maskRef.all(~CornerMask.NW, CornerMask.NE, CornerMask.SW, ~CornerMask.SE)) {
      if (ALLOW_PASSING_DIAGONALLY) {
        ctx.moveTo(drawPos.x, my);
        ctx.lineTo(drawPos.x + halfSize, my + halfSize);
        ctx.moveTo(drawPos.x + halfSize, my - halfSize);
        ctx.lineTo(drawPos.x + size, my);
      } else {
        ctx.moveTo(drawPos.x, my);
        ctx.lineTo(drawPos.x + halfSize, my - halfSize);
        ctx.moveTo(drawPos.x + size, my);
        ctx.lineTo(drawPos.x + halfSize, my + halfSize);
      }

    }

    // Configuration 7: NW, NE, and SW are active
    if (maskRef.all(CornerMask.NW, CornerMask.NE, CornerMask.SW, ~CornerMask.SE)) {
      ctx.moveTo(drawPos.x + halfSize, drawPos.y + size);
      ctx.lineTo(drawPos.x + size, drawPos.y + halfSize);
    }

    // Configuration 8: Only SE is active
    if (maskRef.all(~CornerMask.NW, ~CornerMask.NE, ~CornerMask.SW, CornerMask.SE)) {
      ctx.moveTo(mx, drawPos.y + size);
      ctx.lineTo(drawPos.x + size, my);
    }

    // Configuration 9: NW and SE are active
    if (maskRef.all(CornerMask.NW, ~CornerMask.NE, ~CornerMask.SW, CornerMask.SE)) {
      if (ALLOW_PASSING_DIAGONALLY) {
        ctx.moveTo(drawPos.x, my);
        ctx.lineTo(drawPos.x + halfSize, my - halfSize);
        ctx.moveTo(drawPos.x + halfSize, my + halfSize);
        ctx.lineTo(drawPos.x + size, my);
      } else {
        ctx.moveTo(drawPos.x, my);
        ctx.lineTo(drawPos.x + halfSize, my + halfSize);
        ctx.moveTo(drawPos.x + halfSize, my - halfSize);
        ctx.lineTo(drawPos.x + size, my);
      }
    }

    // Configuration 10: NE and SE are active
    if (maskRef.all(~CornerMask.NW, CornerMask.NE, ~CornerMask.SW, CornerMask.SE)) {
      ctx.moveTo(drawPos.x + halfSize, drawPos.y);
      ctx.lineTo(drawPos.x + halfSize, drawPos.y + size);
    }

    // Configuration 11: NW, NE, and SE are active
    if (maskRef.all(CornerMask.NW, CornerMask.NE, ~CornerMask.SW, CornerMask.SE)) {
      ctx.moveTo(drawPos.x, my);
      ctx.lineTo(drawPos.x + halfSize, my + halfSize);
    }

    // Configuration 12: SW and SE are active
    if (maskRef.all(~CornerMask.NW, ~CornerMask.NE, CornerMask.SW, CornerMask.SE)) {
      ctx.moveTo(drawPos.x, my);
      ctx.lineTo(drawPos.x + size, my);
    }

    // Configuration 13: NW, SW, and SE are active
    if (maskRef.all(CornerMask.NW, ~CornerMask.NE, CornerMask.SW, CornerMask.SE)) {
      ctx.moveTo(mx, drawPos.y);
      ctx.lineTo(mx + halfSize, drawPos.y + halfSize);
    }

    // Configuration 14: NE, SW, and SE are active
    if (maskRef.all(~CornerMask.NW, CornerMask.NE, CornerMask.SW, CornerMask.SE)) {
      ctx.moveTo(drawPos.x, my);
      ctx.lineTo(drawPos.x + halfSize, my - halfSize);
    }

    // Configuration 15: All corners are active
    // if (mask.all(CornerMask.NW, CornerMask.NE, CornerMask.SW, CornerMask.SE)) {
    //   ctx.rect(drawPos.x, drawPos.y, size, size);
    // }
    ctx.closePath();
    ctx.stroke(); // Apply the drawing to the canvas
    ctx.translate(halfSize, halfSize);
    ctx.restore();
  }


  private handleMaskFill(position: { x: number; y: number; }, maskRef: Bitmasker<CornerMask>) {
    const halfSize = this.cellSize / 2;
    const size = this.cellSize;
    const ctx = this.backgroundCtx;
    ctx.save();
    ctx.translate(-halfSize, -halfSize);



    const drawPos = position;
    drawPos.x *= size;
    drawPos.y *= size;

    // Define midpoints for convenience
    const mx = (drawPos.x + (size / 2)) | 0;
    const my = (drawPos.y + (size / 2)) | 0;

    ctx.fillStyle = ctx.strokeStyle = 'rgba(130,125,125, 0.25)';
    ctx.lineWidth = 2;


    // Configuration 1: Only NW is active
    if (maskRef.all(CornerMask.NW, ~CornerMask.NE, ~CornerMask.SW, ~CornerMask.SE)) {
      ctx.beginPath();
      ctx.moveTo(drawPos.x, drawPos.y);
      ctx.lineTo(drawPos.x, my);
      ctx.lineTo(mx, drawPos.y);
      ctx.closePath();
      ctx.fill();
    }

    // Configuration 2: Only NE is active
    if (maskRef.all(~CornerMask.NW, CornerMask.NE, ~CornerMask.SW, ~CornerMask.SE)) {
      ctx.beginPath();
      ctx.moveTo(mx, drawPos.y);
      ctx.lineTo(drawPos.x + size, drawPos.y);
      ctx.lineTo(drawPos.x + size, my);
      ctx.closePath();
      ctx.fill();
    }

    // Configuration 3: NW and NE are active
    if (maskRef.all(CornerMask.NW, CornerMask.NE, ~CornerMask.SW, ~CornerMask.SE)) {
      ctx.beginPath();
      ctx.moveTo(drawPos.x, drawPos.y);
      ctx.lineTo(drawPos.x, my);
      ctx.lineTo(drawPos.x + size, my);
      ctx.lineTo(drawPos.x + size, drawPos.y);
      ctx.closePath();
      ctx.fill();
    }

    // Configuration 4: Only SW is active
    if (maskRef.all(~CornerMask.NW, ~CornerMask.NE, CornerMask.SW, ~CornerMask.SE)) {
      ctx.beginPath();
      ctx.moveTo(drawPos.x, drawPos.y + size);
      ctx.lineTo(mx, drawPos.y + size);
      ctx.lineTo(drawPos.x, my);
      ctx.closePath();
      ctx.fill();
    }

    // Configuration 5: NW and SW are active
    if (maskRef.all(CornerMask.NW, ~CornerMask.NE, CornerMask.SW, ~CornerMask.SE)) {
      ctx.beginPath();
      ctx.moveTo(drawPos.x, drawPos.y);
      ctx.lineTo(mx, drawPos.y);
      ctx.lineTo(mx, drawPos.y + size);
      ctx.lineTo(drawPos.x, drawPos.y + size);
      ctx.closePath();
      ctx.fill();
    }

    // Configuration 6: NE and SW are active
    if (maskRef.all(~CornerMask.NW, CornerMask.NE, CornerMask.SW, ~CornerMask.SE)) {
      ctx.beginPath();
      ctx.moveTo(drawPos.x, my);
      ctx.lineTo(drawPos.x, drawPos.y + size);
      ctx.lineTo(mx, drawPos.y + size);
      ctx.lineTo(drawPos.x + size, my);
      ctx.lineTo(drawPos.x + size, drawPos.y);
      ctx.lineTo(drawPos.x + halfSize, drawPos.y);
      ctx.lineTo(drawPos.x, my);
      ctx.closePath();
      ctx.fill();
    }


    // Configuration 7: NW, NE, and SW are active
    if (maskRef.all(CornerMask.NW, CornerMask.NE, CornerMask.SW, ~CornerMask.SE)) {
      ctx.beginPath();
      ctx.moveTo(drawPos.x, drawPos.y);
      ctx.lineTo(drawPos.x, drawPos.y + size);
      ctx.lineTo(mx, drawPos.y + size);
      ctx.lineTo(drawPos.x + size, my);
      ctx.lineTo(drawPos.x + size, drawPos.y);
      ctx.lineTo(drawPos.x, drawPos.y);
      // ctx.lineTo(drawPos.x + halfSize, drawPos.y + size);
      // ctx.lineTo(drawPos.x + size, drawPos.y - halfSize);
      ctx.closePath();
      ctx.fill();
    }

    // Configuration 8: Only SE is active
    if (maskRef.all(~CornerMask.NW, ~CornerMask.NE, ~CornerMask.SW, CornerMask.SE)) {
      ctx.beginPath();
      ctx.moveTo(mx, drawPos.y + size);
      ctx.lineTo(drawPos.x + size, drawPos.y + size);
      ctx.lineTo(drawPos.x + size, my);
      ctx.closePath();
      ctx.fill();
    }

    // Configuration 9: NW and SE are active
    if (maskRef.all(CornerMask.NW, ~CornerMask.NE, ~CornerMask.SW, CornerMask.SE)) {
      ctx.beginPath();
      ctx.moveTo(drawPos.x, drawPos.y);
      ctx.lineTo(drawPos.x, my);
      ctx.lineTo(mx, drawPos.y + size);
      ctx.lineTo(drawPos.x + size, drawPos.y + size);
      ctx.lineTo(drawPos.x + size, my);
      ctx.lineTo(drawPos.x + halfSize, drawPos.y);
      ctx.lineTo(drawPos.x, drawPos.y);
      // ctx.lineTo(drawPos.x + size, drawPos.y + size);
      // ctx.lineTo(drawPos.x, drawPos.y + size);
      ctx.closePath();
      ctx.fill();
    }

    // Configuration 10: NE and SE are active
    if (maskRef.all(~CornerMask.NW, CornerMask.NE, ~CornerMask.SW, CornerMask.SE)) {
      ctx.beginPath();
      ctx.moveTo(drawPos.x + size, drawPos.y);
      ctx.lineTo(drawPos.x + size, drawPos.y + size);
      ctx.lineTo(mx, drawPos.y + size);
      ctx.lineTo(mx, drawPos.y);
      ctx.closePath();
      ctx.fill();
    }

    // Configuration 11: NW, NE, and SE are active
    if (maskRef.all(CornerMask.NW, CornerMask.NE, ~CornerMask.SW, CornerMask.SE)) {
      ctx.beginPath();
      ctx.moveTo(drawPos.x, drawPos.y);
      ctx.lineTo(drawPos.x, my);
      ctx.lineTo(drawPos.x + halfSize, drawPos.y + size);
      ctx.lineTo(drawPos.x + size, drawPos.y + size);
      ctx.lineTo(drawPos.x + size, drawPos.y);
      ctx.lineTo(drawPos.x, drawPos.y);
      ctx.closePath();
      ctx.fill();
    }

    // Configuration 12: SW and SE are active
    if (maskRef.all(~CornerMask.NW, ~CornerMask.NE, CornerMask.SW, CornerMask.SE)) {
      ctx.beginPath();
      ctx.moveTo(drawPos.x, drawPos.y + size);
      ctx.lineTo(drawPos.x + size, drawPos.y + size);
      ctx.lineTo(drawPos.x + size, my);
      ctx.lineTo(drawPos.x, my);
      ctx.closePath();
      ctx.fill();
    }

    // Configuration 13: NW, SW, and SE are active
    if (maskRef.all(CornerMask.NW, ~CornerMask.NE, CornerMask.SW, CornerMask.SE)) {
      ctx.beginPath();
      ctx.moveTo(drawPos.x, drawPos.y);
      ctx.lineTo(drawPos.x, drawPos.y + size);
      ctx.lineTo(drawPos.x + size, drawPos.y + size);
      ctx.lineTo(drawPos.x + size, my);
      ctx.lineTo(mx, drawPos.y);
      ctx.closePath();
      ctx.fill();
    }

    // Configuration 14: NE, SW, and SE are active
    if (maskRef.all(~CornerMask.NW, CornerMask.NE, CornerMask.SW, CornerMask.SE)) {
      ctx.beginPath();
      ctx.moveTo(mx, drawPos.y);
      ctx.lineTo(drawPos.x + size, drawPos.y);
      ctx.lineTo(drawPos.x + size, drawPos.y + size);
      ctx.lineTo(drawPos.x, drawPos.y + size);
      ctx.lineTo(drawPos.x, my);
      ctx.closePath();
      ctx.fill();
    }

    // Configuration 15: All corners are active
    if (maskRef.all(CornerMask.NW, CornerMask.NE, CornerMask.SW, CornerMask.SE)) {
      ctx.rect(drawPos.x, drawPos.y, size, size);
      ctx.fill();
    }

    ctx.translate(halfSize, halfSize);
    ctx.restore();
  }

  public runAlgorithm = () => {
    const checkDist = 0.5;
    const mask = new Bitmasker<CornerMask>();
    for (let y = 0; y <= this.gridHeight; y += 1) {
      for (let x = 0; x <= this.gridWidth; x += 1) {
        mask.unset();
        this.getMaskForPoint(x, checkDist, y, mask);
        this.handleMaskStroke({ x, y }, mask);
        this.handleMaskFill({ x, y }, mask);
      }
    }
  };

  private getMaskForPoint(x: number, checkDist: number, y: number, maskRef: Bitmasker<CornerMask>) {
    if (this.checkSomethingAtPoint({ x: x - checkDist, y: y - checkDist })) {
      maskRef.set(CornerMask.NW);
    }
    if (this.checkSomethingAtPoint({ x: x + checkDist, y: y - checkDist })) {
      maskRef.set(CornerMask.NE);
    }
    if (this.checkSomethingAtPoint({ x: x - checkDist, y: y + checkDist })) {
      maskRef.set(CornerMask.SW);
    }
    if (this.checkSomethingAtPoint({ x: x + checkDist, y: y + checkDist })) {
      maskRef.set(CornerMask.SE);
    }
  }
}
