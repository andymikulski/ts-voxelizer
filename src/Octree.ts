import { Box } from "./Box";
import { Ray, intersectRayRectangle, distance, Vector3, intersectRayBox, Ray3D } from "./Ray";
import { Vector2 } from "./Vector2";
import { inflateBox, inflateRect } from "./inflateRect";

const MAX_ITEMS = 10;
const MAX_LEVELS = 5;

export class Octree {
  private level: number;
  private bounds: Box;
  private objects: Box[] = [];
  private nodes: Octree[] = [];

  constructor(level: number, bounds: Box) {
    this.level = level;
    this.bounds = bounds;
  }

  public getAllObjects(): Box[] {
    const output: Box[] = [...this.objects];
    for (const node of this.nodes) {
      output.push(...node.getAllObjects());
    }
    return output;
  }

  public clear(): void {
    this.objects = [];
    for (const node of this.nodes) {
      node.clear();
    }
    this.nodes = [];
  }

  private split(): void {
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const subDepth = this.bounds.depth / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;
    const z = this.bounds.z;

    this.nodes[0] = new Octree(this.level + 1, { x, y, z, width: subWidth, height: subHeight, depth: subDepth });
    this.nodes[1] = new Octree(this.level + 1, { x: x + subWidth, y, z, width: subWidth, height: subHeight, depth: subDepth });
    this.nodes[2] = new Octree(this.level + 1, { x, y: y + subHeight, z, width: subWidth, height: subHeight, depth: subDepth });
    this.nodes[3] = new Octree(this.level + 1, { x: x + subWidth, y: y + subHeight, z, width: subWidth, height: subHeight, depth: subDepth });
    this.nodes[4] = new Octree(this.level + 1, { x, y, z: z + subDepth, width: subWidth, height: subHeight, depth: subDepth });
    this.nodes[5] = new Octree(this.level + 1, { x: x + subWidth, y, z: z + subDepth, width: subWidth, height: subHeight, depth: subDepth });
    this.nodes[6] = new Octree(this.level + 1, { x, y: y + subHeight, z: z + subDepth, width: subWidth, height: subHeight, depth: subDepth });
    this.nodes[7] = new Octree(this.level + 1, { x: x + subWidth, y: y + subHeight, z: z + subDepth, width: subWidth, height: subHeight, depth: subDepth });
  }

  // private getIndex(box: Box): number {
  //   let index = -1;
  //   const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
  //   const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;
  //   const depthMidpoint = this.bounds.z + this.bounds.depth / 2;

  //   const fitsLeft = box.x < verticalMidpoint && (box.x + box.width) < verticalMidpoint;
  //   const fitsRight = box.x > verticalMidpoint;
  //   const fitsTop = box.y < horizontalMidpoint && (box.y + box.height) < horizontalMidpoint;
  //   const fitsBottom = box.y > horizontalMidpoint;
  //   const fitsFront = box.z < depthMidpoint && (box.z + box.depth) < depthMidpoint;
  //   const fitsBack = box.z > depthMidpoint;

  //   if (fitsLeft && fitsTop && fitsFront) index = 0;
  //   if (fitsRight && fitsTop && fitsFront) index = 1;
  //   if (fitsLeft && fitsBottom && fitsFront) index = 2;
  //   if (fitsRight && fitsBottom && fitsFront) index = 3;
  //   if (fitsLeft && fitsTop && fitsBack) index = 4;
  //   if (fitsRight && fitsTop && fitsBack) index = 5;
  //   if (fitsLeft && fitsBottom && fitsBack) index = 6;
  //   if (fitsRight && fitsBottom && fitsBack) index = 7;

  //   return index;
  // }

  public insert(box: Box): void {
    if (!intersects(this.bounds, box)) return;

    if (this.objects.length < MAX_ITEMS && !this.nodes[0]) {
      this.objects.push(box);
      return;
    }

    if (!this.nodes[0]) this.split();

    for (const node of this.nodes) {
      node.insert(box);
    }
  }

  public query(rangeBox: Box): Box[] {
    const itemsInRange: Box[] = [];

    if (!intersects(this.bounds, rangeBox)) return itemsInRange;

    for (const box of this.objects) {
      if (intersects(box, rangeBox)) itemsInRange.push(box);
    }

    if (!this.nodes[0]) return itemsInRange;

    for (const node of this.nodes) {
      itemsInRange.push(...node.query(rangeBox));
    }

    return itemsInRange;
  }

  public intersect(searchRect: Box): boolean {
    // If the search rect doesn't overlap this Quad, return false.
    if (!intersects(this.bounds, searchRect)) {
      return false;
    }

    // Check objects in this QuadTree node.
    for (const rect of this.objects) {
      if (intersects(rect, searchRect)) {
        return true;  // Found an intersecting rect, return true immediately.
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

  public raycast(ray: Ray3D, maxDistance: number = Infinity): { point: Vector3, hit: Box } | null {
    // If the ray doesn't intersect the quadtree's bounds, return null.
    if (!intersectRayRectangle(ray, this.bounds)) {
      return null;
    }

    let closestRect: Box | null = null;
    let closestHit: Vector3 | null = null;
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

    const inflation = 0.25;

    // Check objects in this QuadTree node.
    for (const rect of this.objects) {
      const info = intersectRayBox(ray, inflateBox(rect, inflation));
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

// Assuming you have an `intersects` function to check the intersection between two boxes:
function intersects(b1: Box, b2: Box): boolean {
  return (b1.x < b2.x + b2.width &&
    b1.x + b1.width > b2.x &&
    b1.y < b2.y + b2.height &&
    b1.y + b1.height > b2.y &&
    b1.z < b2.z + b2.depth &&
    b1.z + b1.depth > b2.z);
}

