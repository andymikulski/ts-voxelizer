import Bitmasker from "./Bitmasker";
import QuadTree from "./QuadTree";
import { Vector2 } from "./Vector2";

const ALLOW_PASSING_DIAGONALLY = false;

export enum CornerMask {
  NW,
  NE,
  SW,
  SE,
};

export class MarchingSquares {
  public constructor(private ctx: CanvasRenderingContext2D, private gridWidth: number, private gridHeight: number, private cellSize: number, private tree: QuadTree) {
    this.runAlgorithm();
  }
  private checkSomethingAtPt = (pt: Vector2) => {
    return this.tree.getAt(pt).length > 0;
  };

  private handleMask(position: Vector2, maskRef: Bitmasker<CornerMask>) {
    const halfSize = this.cellSize / 2;
    const size = this.cellSize;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(-halfSize, -halfSize);

    ctx.fillStyle = ctx.strokeStyle = 'rgba(100,0,128,0.2)';
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

  private runAlgorithm = () => {
    const checkDist = 0.5;
    const mask = new Bitmasker<CornerMask>();
    for (let y = 0; y <= this.gridHeight; y += 1) {
      for (let x = 0; x <= this.gridWidth; x += 1) {
        mask.unset();
        this.getMaskForPoint(x, checkDist, y, mask);
        this.handleMask({ x, y }, mask);
      }
    }
  };

  private getMaskForPoint(x: number, checkDist: number, y: number, maskRef: Bitmasker<CornerMask>) {
    if (this.checkSomethingAtPt({ x: x - checkDist, y: y - checkDist })) {
      maskRef.set(CornerMask.NW);
    }
    if (this.checkSomethingAtPt({ x: x + checkDist, y: y - checkDist })) {
      maskRef.set(CornerMask.NE);
    }
    if (this.checkSomethingAtPt({ x: x - checkDist, y: y + checkDist })) {
      maskRef.set(CornerMask.SW);
    }
    if (this.checkSomethingAtPt({ x: x + checkDist, y: y + checkDist })) {
      maskRef.set(CornerMask.SE);
    }
  }
}
