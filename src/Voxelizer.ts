import ObstacleManager from "./ObstacleManager";
import { Rect } from "./Rect";

export default class Voxelizer {
  constructor(public minVoxelSize: number = 1) {
  }

  public voxelize(area: Rect, obstacles: ObstacleManager, output: Rect[] = []): Rect[] {
    if (!obstacles.intersects(area)) {
      output.push(area);
    } else {
      const halfWidth = area.width / 2;
      const halfHeight = area.height / 2;
      if (halfWidth >= this.minVoxelSize && halfHeight >= this.minVoxelSize) {
        this.voxelize({ x: area.x, y: area.y, width: halfWidth, height: halfHeight }, obstacles, output);
        this.voxelize({ x: area.x + halfWidth, y: area.y, width: halfWidth, height: halfHeight }, obstacles, output);
        this.voxelize({ x: area.x, y: area.y + halfHeight, width: halfWidth, height: halfHeight }, obstacles, output);
        this.voxelize({ x: area.x + halfWidth, y: area.y + halfHeight, width: halfWidth, height: halfHeight }, obstacles, output);
      }
    }
    return output;
  }


  public voxelizeList(area: Rect, obstacles: ObstacleManager, output: Rect[] = []): Rect[] {
    const toProcess: Rect[] = [area];

    while (toProcess.length) {
      const next = toProcess.pop();
      if (!next) { continue; }

      if (!obstacles.intersects(next)) {
        output.push(next);
      } else {
        const halfWidth = next.width / 2;
        const halfHeight = next.height / 2;
        if (halfWidth >= this.minVoxelSize && halfHeight >= this.minVoxelSize) {
          toProcess.push({ x: next.x, y: next.y, width: halfWidth, height: halfHeight });
          toProcess.push({ x: next.x + halfWidth, y: next.y, width: halfWidth, height: halfHeight });
          toProcess.push({ x: next.x, y: next.y + halfHeight, width: halfWidth, height: halfHeight });
          toProcess.push({ x: next.x + halfWidth, y: next.y + halfHeight, width: halfWidth, height: halfHeight });
        }
      }
    }

    return output;
  }
}
