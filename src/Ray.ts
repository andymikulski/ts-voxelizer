import { Box } from "./Box";
import { Rect } from "./Rect";
import { Vector2 } from "./Vector2";

export type RayIntersectionResult = {
  rect?: Rect,
  point: Vector2
};


type Segment3D = {
  x1: number;
  y1: number;
  z1: number;
  x2: number;
  y2: number;
  z2: number;
};


type Segment2D = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
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


export type Ray = {
  origin: Vector2;
  direction: Vector2;
};

const sides = [
  { x1: 0, y1: 0, x2: 0, y2: 0 },
  { x1: 0, y1: 0, x2: 0, y2: 0 },
  { x1: 0, y1: 0, x2: 0, y2: 0 },
  { x1: 0, y1: 0, x2: 0, y2: 0 },
];
export function intersectRayRectangle(ray: Ray, rect: Rect): Vector2 | null {
  sides[0].x1 = rect.x;
  sides[0].y1 = rect.y;
  sides[0].x2 = rect.x + rect.width;
  sides[0].y2 = rect.y;
  // top side

  sides[1].x1 = rect.x;
  sides[1].y1 = rect.y + rect.height;
  sides[1].x2 = rect.x + rect.width;
  sides[1].y2 = rect.y + rect.height;
  // bottom side

  sides[2].x1 = rect.x;
  sides[2].y1 = rect.y;
  sides[2].x2 = rect.x;
  sides[2].y2 = rect.y + rect.height;
  // left side

  sides[3].x1 = rect.x + rect.width;
  sides[3].y1 = rect.y;
  sides[3].x2 = rect.x + rect.width;
  sides[3].y2 = rect.y + rect.height;
  // right side

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

let det;
let ua;
let ub;
function intersectRaySegment(ray: Ray, segment: Segment2D): Vector2 | null {
  det = (ray.direction.x * (segment.y2 - segment.y1)) - (ray.direction.y * (segment.x2 - segment.x1));
  if (det === 0) return null; // lines are parallel

  ua = ((segment.x2 - segment.x1) * (ray.origin.y - segment.y1) - (segment.y2 - segment.y1) * (ray.origin.x - segment.x1)) / (det + EPS);
  ub = ((ray.direction.x) * (ray.origin.y - segment.y1) - (ray.direction.y) * (ray.origin.x - segment.x1)) / (det + EPS);

  if (ua >= 0 && ub >= 0 && ub <= 1) {
    return {
      x: ray.origin.x + ua * ray.direction.x,
      y: ray.origin.y + ua * ray.direction.y
    };
  }

  return null;
}


export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

export function sqrdDistance3D(point1: Vector3, point2: Vector3) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const dz = point2.z - point1.z;

  return (dx * dx + dy * dy + dz * dz);
}

export type Ray3D = {
  origin: Vector3;
  direction: Vector3;
};

export function intersectRayBox(ray: Ray3D, box: Box): Vector3 | null {
  const sides = [
    // front face
    { x1: box.x, y1: box.y, z1: box.z, x2: box.x + box.width, y2: box.y + box.height, z2: box.z },
    // back face
    { x1: box.x, y1: box.y, z1: box.z + box.depth, x2: box.x + box.width, y2: box.y + box.height, z2: box.z + box.depth },
    // left side
    { x1: box.x, y1: box.y, z1: box.z, x2: box.x, y2: box.y + box.height, z2: box.z + box.depth },
    // right side
    { x1: box.x + box.width, y1: box.y, z1: box.z, x2: box.x + box.width, y2: box.y + box.height, z2: box.z + box.depth },
    // bottom
    { x1: box.x, y1: box.y, z1: box.z, x2: box.x + box.width, y2: box.y, z2: box.z + box.depth },
    // top
    { x1: box.x, y1: box.y + box.height, z1: box.z, x2: box.x + box.width, y2: box.y + box.height, z2: box.z + box.depth }
  ];

  let dist = Infinity;
  let closest = null;
  for (const side of sides) {
    const intersection = intersectRaySegment3D(ray, side);
    if (intersection) {
      const d = sqrdDistance3D(ray.origin, intersection);
      if (d < dist) {
        dist = d;
        closest = intersection;
      }
    }
  }

  return closest;
}


function intersectRaySegment3D(ray: Ray3D, segment: Segment3D): Vector3 | null {
  const dirCrossE = cross(ray.direction, {
    x: segment.x2 - segment.x1,
    y: segment.y2 - segment.y1,
    z: segment.z2 - segment.z1
  });

  const det = dot(ray.direction, dirCrossE);

  if (Math.abs(det) < EPS) return null; // lines are parallel

  const diff = {
    x: ray.origin.x - segment.x1,
    y: ray.origin.y - segment.y1,
    z: ray.origin.z - segment.z1
  };

  const ua = dot(diff, dirCrossE) / det;

  const diffCrossRayDir = cross(diff, ray.direction);

  const ub = dot({ x: segment.x2 - segment.x1, y: segment.y2 - segment.y1, z: segment.z2 - segment.z1 }, diffCrossRayDir) / det;

  if (ua >= 0 && ub >= 0 && ub <= 1) {
    return {
      x: ray.origin.x + ua * ray.direction.x,
      y: ray.origin.y + ua * ray.direction.y,
      z: ray.origin.z + ua * ray.direction.z
    };
  }

  return null;
}

function cross(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

function dot(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}