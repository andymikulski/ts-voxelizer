import QuadTree from "./QuadTree";
import { Ray } from "./Ray";
import { Rect } from "./Rect";

export default class ObstacleManager {
  public obstacles: QuadTree;

  constructor(gridWidth: number, gridHeight: number) {
    this.obstacles = new QuadTree(0, { x: 0, y: 0, width: gridWidth, height: gridHeight });
  }

  // Add an obstacle to the list
  addObstacle(obstacle: Rect): void {
    this.obstacles.insert(obstacle);
  }

  // Check if a given Rect intersects with any of the obstacles
  intersects(rect: Rect): boolean {
    return this.obstacles.intersect(rect);
  }

  raycast(ray: Ray, maxDistance: number) {
    return this.obstacles.raycast(ray, maxDistance);
  }

  getObstacles(area: Rect): Rect[] {
    return this.obstacles.query(area);
  }

  getAllObstacles() {
    return this.obstacles.getAllObjects();
  }

}

