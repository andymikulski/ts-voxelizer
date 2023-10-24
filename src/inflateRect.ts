import { Box } from "./Box";
import { Rect } from "./Rect";

export function inflateRect(rect: Rect, amount: number): Rect {
  // Calculate the center of the rectangle
  const centerX = rect.x + rect.width * 0.5;
  const centerY = rect.y + rect.height * 0.5;

  // Inflate/deflate the width and height
  const newWidth = rect.width + 2 * amount;
  const newHeight = rect.height + 2 * amount;

  // Calculate the new x and y such that the rectangle remains centered
  const newX = centerX - newWidth * 0.5;
  const newY = centerY - newHeight * 0.5;

  return {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight
  };
}


export function inflateBox(box: Box, amount: number): Box {
  // Calculate the center of the rectangle
  const centerX = box.x + box.width * 0.5;
  const centerY = box.y + box.height * 0.5;
  const centerZ = box.z + box.depth * 0.5;

  // Inflate/deflate the width and height
  const newWidth = box.width + 2 * amount;
  const newHeight = box.height + 2 * amount;
  const newDepth = box.depth + 2 * amount;

  // Calculate the new x and y such that the rectangle remains centered
  const newX = centerX - newWidth * 0.5;
  const newY = centerY - newHeight * 0.5;
  const newZ = centerZ - newDepth * 0.5;

  return {
    x: newX,
    y: newY,
    z: newZ,
    width: newWidth,
    height: newHeight,
    depth: newDepth,
  };
}
