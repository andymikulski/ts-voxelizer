import { Rect } from "./Rect";
import { Vector2 } from "./Vector2";

export type RayIntersectionResult = {
  rect?: Rect,
  point: { x: number, y: number }
};


export type Ray = {
  origin: Vector2;
  direction: Vector2;
};


export const EPS = 1e-4;

export function distance(point1: Vector2, point2: Vector2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;

  return Math.sqrt(dx * dx + dy * dy);
}

export function sqrdDistance(point1: Vector2, point2: Vector2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;

  return (dx * dx + dy * dy);
}


export function intersectRayRectangle(ray: Ray, rect: Rect): { x: number, y: number } | null {
  const sides = [
    { x1: rect.x, y1: rect.y, x2: rect.x + rect.width, y2: rect.y }, // top side
    { x1: rect.x, y1: rect.y + rect.height, x2: rect.x + rect.width, y2: rect.y + rect.height }, // bottom side
    { x1: rect.x, y1: rect.y, x2: rect.x, y2: rect.y + rect.height }, // left side
    { x1: rect.x + rect.width, y1: rect.y, x2: rect.x + rect.width, y2: rect.y + rect.height }  // right side
  ];

  let dist = Infinity;
  let closest = null;
  for (const side of sides) {
    const intersection = intersectRaySegment(ray, side);
    if (intersection) {
      var d = sqrdDistance(ray.origin, intersection);
      if (d < dist) {
        dist = d;
        closest = intersection;
      }
    }
  }

  return closest;
}

function intersectRaySegment(ray: Ray, segment: { x1: number, y1: number, x2: number, y2: number }): { x: number, y: number } | null {
  const det = (ray.direction.x * (segment.y2 - segment.y1)) - (ray.direction.y * (segment.x2 - segment.x1));
  if (det === 0) return null; // lines are parallel

  const ua = ((segment.x2 - segment.x1) * (ray.origin.y - segment.y1) - (segment.y2 - segment.y1) * (ray.origin.x - segment.x1)) / (det + EPS);
  const ub = ((ray.direction.x) * (ray.origin.y - segment.y1) - (ray.direction.y) * (ray.origin.x - segment.x1)) / (det + EPS);

  if (ua >= 0 && ub >= 0 && ub <= 1) {
    return {
      x: ray.origin.x + ua * ray.direction.x,
      y: ray.origin.y + ua * ray.direction.y
    };
  }

  return null;
}