import { EPS, Ray, distance, intersectRayRectangle } from "./Ray";
import { Rect, intersects } from "./Rect";
import { Vector2 } from "./Vector2";
import { inflateRect } from "./inflateRect";



export default class QuadTree {
  private MAX_ITEMS = 8; // Adjust this as needed.
  private MAX_LEVEL = 5;

  private level: number;
  private bounds: Rect;
  private objects: Rect[] = [];
  private nodes: QuadTree[] = [];

  constructor(level: number, bounds: Rect) {
    this.level = level;
    this.bounds = bounds;
  }

  public getAllObjects = () => {
    const output: Rect[] = [];
    Array.prototype.push.apply(output, this.objects);

    this.nodes.forEach((x) => {
      Array.prototype.push.apply(output, x.getAllObjects());
    });
    return output;
  }

  // Clear the quadtree.
  public clear = (): void => {
    this.objects = [];
    for (const node of this.nodes) {
      if (node) {
        node.clear();
      }
    }
    this.nodes = [];
  }

  // Split the node into 4 subnodes.
  private split = (): void => {
    if (this.level >= this.MAX_LEVEL) {
      return;
    }

    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;

    this.nodes[0] = new QuadTree(this.level + 1, {
      x: x + subWidth,
      y: y,
      width: subWidth,
      height: subHeight,
    });
    this.nodes[1] = new QuadTree(this.level + 1, {
      x: x,
      y: y,
      width: subWidth,
      height: subHeight,
    });
    this.nodes[2] = new QuadTree(this.level + 1, {
      x: x,
      y: y + subHeight,
      width: subWidth,
      height: subHeight,
    });
    this.nodes[3] = new QuadTree(this.level + 1, {
      x: x + subWidth,
      y: y + subHeight,
      width: subWidth,
      height: subHeight,
    });

    // re-insert the objects into the split nodes
    for (const obj of this.objects) {
      for (const node of this.nodes) {
        node.insert(obj);
      }
    }

    this.objects = [];
  }

  public insert(rect: Rect): void {
    // If the rect doesn't belong in this quadrant of the QuadTree, return.
    if (!intersects(this.bounds, rect)) {
      return;
    }

    if (this.nodes[0]) {
      for (const node of this.nodes) {
        node.insert(rect);
      }
      return;
    }

    // If below the capacity and not subdivided yet, insert into this QuadTree node.
    this.objects.push(rect);
    if (this.objects.length >= this.MAX_ITEMS) {
      this.split();
    }
  }

  public getAt(point: Vector2): Rect[] {
    return this.query({ x: point.x, y: point.y, width: EPS, height: EPS });
  }

  public query(rangeRect: Rect): Rect[] {
    const itemsInRange: Rect[] = [];

    // If range doesn't overlap this Quad, return empty array.
    if (!intersects(this.bounds, rangeRect)) {
      return itemsInRange;
    }

    // Check objects in this QuadTree node.
    for (const rect of this.objects) {
      if (intersects(rect, rangeRect)) {
        itemsInRange.push(rect);
      }
    }

    // If leaf node, stop here.
    if (!this.nodes[0]) {
      return itemsInRange;
    }

    // Otherwise, traverse child nodes.
    for (const node of this.nodes) {
      itemsInRange.push(...node.query(rangeRect));
    }

    return itemsInRange;
  }

  public intersect(searchRect: Rect): boolean {
    // If the search rect doesn't overlap this Quad, return false.
    if (!intersects(this.bounds, searchRect)) {
      return false;
    }

    // Check objects in this QuadTree node.
    for (const rect of this.objects) {
      if (intersects(rect, searchRect)) {
        return true; // Found an intersecting rect, return true immediately.
      }
    }

    // If this is a leaf node, return false.
    if (!this.nodes[0]) {
      return false;
    }

    // Otherwise, check the child nodes.
    for (const node of this.nodes) {
      if (node.intersect(searchRect)) {
        return true;
      }
    }

    // If we've checked everything and found no intersections, return false.
    return false;
  }

  public raycast(
    ray: Ray,
    maxDistance: number = Infinity
  ): { point: Vector2; hit: Rect } | null {
    // If the ray doesn't intersect the quadtree's bounds, return null.
    if (!intersectRayRectangle(ray, this.bounds)) {
      return null;
    }

    let closestRect: Rect | null = null;
    let closestHit: Vector2 | null = null;
    let minDistance = Infinity;

    // If this is not a leaf node, check the child nodes first.
    if (this.nodes[0]) {
      for (const node of this.nodes) {
        const intersectedRect = node.raycast(ray);
        if (intersectedRect) {
          const d = distance(ray.origin, intersectedRect.point);
          if (d >= maxDistance) {
            continue;
          }
          if (d < minDistance) {
            closestRect = intersectedRect.hit;
            closestHit = intersectedRect.point;
            minDistance = d;
          }
        }
      }
    }

    const inflation = 0.17;

    // Check objects in this QuadTree node.
    for (const rect of this.objects) {
      const info = intersectRayRectangle(ray, inflateRect(rect, inflation));
      if (info) {
        const d = distance(ray.origin, info);
        if (d >= maxDistance) {
          continue;
        }
        if (d < minDistance) {
          closestRect = rect;
          closestHit = info;
          minDistance = d;
        }
      }
    }

    return closestRect ? { point: closestHit!, hit: closestRect } : null;
  }

}
