import { Vector2 } from "./Vector2";

export default function normalize(vec: Vector2) {
  const mag = Math.sqrt(
    vec.x * vec.x + vec.y * vec.y
  );
  vec.x = vec.x / mag;
  vec.y = vec.y / mag;
  return vec;
}
