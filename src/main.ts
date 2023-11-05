import { MarchingSquares } from "./MarchingSquares";
import ObstacleManager from "./ObstacleManager";
import { Ray, distance } from "./Ray";
import { Rect } from "./Rect";
import SeededRandom from "./SeededRandom";
import { Vector2 } from "./Vector2";
import Voxelizer from "./Voxelizer";
import applyAnyAnglePathing, { applyAnyAnglePathingInPlace } from "./applyAnyAnglePathing";
import normalize from "./normalize";

const seededRandom = new SeededRandom(123345666);

const existingContainer = document.querySelector('#demo-container') as HTMLElement;
const container = existingContainer ?? document.createElement("div");
container.style.position = "relative";

if (!existingContainer){
  document.body.appendChild(container);
}

// Create and embed a canvas into the page
const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 800;
container.appendChild(canvas);
const ctx = canvas.getContext("2d")!;

const cellSize = 20;
const rows = Math.floor(canvas.height / cellSize);
const cols = Math.floor(canvas.width / cellSize);

// Function to render a grid on the canvas
function renderGrid(): void {
  ctx.strokeStyle = "#eee";

  for (let i = 0; i <= rows; i++) {
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(canvas.width, i * cellSize);
    ctx.stroke();
  }

  for (let j = 0; j <= cols; j++) {
    ctx.moveTo(j * cellSize, 0);
    ctx.lineTo(j * cellSize, canvas.height);
    ctx.stroke();
  }
}

// Function to render obstacles on the canvas
function renderObstacles(obstacleManager: ObstacleManager): void {
  ctx.fillStyle = "rgb(255,200,200)";

  for (const obstacle of obstacleManager.getAllObstacles()) {
    // ctx.fillStyle = `#f0f`; // rgb(${(seededRandom.random() * 255) | 0}, ${(seededRandom.random() * 255) | 0}, ${(seededRandom.random() * 255) | 0})`;
    ctx.fillRect(
      obstacle.x * cellSize,
      obstacle.y * cellSize,
      obstacle.width * cellSize,
      obstacle.height * cellSize
    );
    // ctx.strokeRect(
    //   obstacle.x * cellSize,
    //   obstacle.y * cellSize,
    //   obstacle.width * cellSize,
    //   obstacle.height * cellSize
    // );
  }
}

function renderVoxels(list: Rect[]): void {
  ctx.fillStyle = "#A1E084";
  ctx.strokeStyle = "white";
  for (const rect of list) {
    // ctx.fillStyle = `rgba(${(seededRandom.random() * 255) | 0}, ${(seededRandom.random() * 255) | 0}, ${(seededRandom.random() * 255) | 0}, 1)`;
    ctx.fillRect(
      rect.x * cellSize,
      rect.y * cellSize,
      rect.width * cellSize,
      rect.height * cellSize
    );
    ctx.strokeRect(
      rect.x * cellSize,
      rect.y * cellSize,
      rect.width * cellSize,
      rect.height * cellSize
    );
    // ctx.fill();
    // ctx.stroke();
  }
}

export const obstacleManager = new ObstacleManager(cols, rows);
for (let i = 0; i < 250; i++) {
  obstacleManager.addObstacle({
    x: (seededRandom.random() * cols) | 0,
    y: (seededRandom.random() * rows) | 0,
    width: 1 + ((seededRandom.random() * 2) | 0),
    height: 1 + ((seededRandom.random() * 2) | 0),
  });
}

// const vox = new Voxelizer(0.2);
// const fullSize = { x: 0, y: 0, width: cols, height: rows };
// console.time("voxelize");
// const voxels = vox.voxelize(fullSize, obstacleManager);
// console.timeEnd("voxelize");


const render = () => {
  ctx.fillStyle = 'white';
  ctx.fillRect(0,0,800,800); //.clearRect(0, 0, 800, 800);
  // renderGrid();
  // renderObstacles(obstacleManager);
  // renderVoxels(voxels);
  // obstacleManager.draw(ctx, cellSize);
  // quadtree.draw(ctx, cellSize);
  // requestAnimationFrame(render);
};

render();

const marchingSquares = new MarchingSquares(ctx, cols, rows, cellSize, obstacleManager.obstacles);


const secondCanvas = document.createElement("canvas");
container.appendChild(secondCanvas);

secondCanvas.height = secondCanvas.width = canvas.height;
secondCanvas.style.position = "absolute";
secondCanvas.style.left = secondCanvas.style.top = "0px";

const secondCtx = secondCanvas.getContext("2d")!;

const path: Vector2[] = [];

var drawing = false;
secondCanvas.addEventListener("mousedown", (e) => {
  drawing = true;
});
secondCanvas.addEventListener("mouseup", (e) => {
  drawing = false;
});


let last = {x:0, y: 0};
secondCanvas.addEventListener("mousemove", (e) => {
  if (!drawing) { return; }
  const rect = canvas.getBoundingClientRect();
  const mouseX = (((e.clientX - rect.left) / cellSize) | 0) + 0.5;
  const mouseY = (((e.clientY - rect.top) / cellSize) | 0) + 0.5;
  const cursor = { x: mouseX, y: mouseY, width: 0.1, height: 0.1 }

  if (cursor.x === last.x && cursor.y === last.y){
    return;
  }

  last.x = cursor.x;
  last.y = cursor.y;

  if (!obstacleManager.intersects(cursor)){
    path.push(cursor);
  }

  updateSimplifiedPath();





});

// function linear_smoothPath(path: Vector2[]) {
//   if (path.length <= 2) {
//     return path;
//   }
//   let rayCount = 0;

//   const newPath: Vector2[] = [];
//   const ray: Ray = { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };

//   let currentIdx = 0;
//   newPath.push(path[0]);

//   while (currentIdx < path.length - 1) {
//     ray.origin = path[currentIdx];

//     let found = false;
//     for (let i = path.length - 1; i > currentIdx; i--) {
//       ray.direction = {
//         x: path[i].x - ray.origin.x,
//         y: path[i].y - ray.origin.y,
//       };
//       const mag = Math.sqrt(
//         ray.direction.x * ray.direction.x + ray.direction.y * ray.direction.y
//       );
//       ray.direction = { x: ray.direction.x / mag, y: ray.direction.y / mag };

//       const rayDist = distance(ray.origin, path[i]);
//       const hit = obstacleManager.raycast(ray, rayDist);
//       rayCount += 1;
//       if (!hit) {
//         currentIdx = i;
//         found = true;
//         break;
//       }
//     }

//     // If we didn't find any further node that's directly visible,
//     // just move to the next node in the path.
//     if (!found) {
//       currentIdx++;
//     }

//     newPath.push(path[currentIdx]);
//   }

//   console.log('linear ray count:', rayCount);

//   return newPath;
// }

function updateSimplifiedPath() {
  secondCtx.clearRect(0, 0, 800, 800);
  const smoothedPath = applyAnyAnglePathing(path, (pt1, pt2) => {
    const rayDist = distance(pt1, pt2);
    const rayDirection = normalize({
      x: pt2.x - pt1.x,
      y: pt2.y - pt1.y,
    });
    // Perform a raycast to see if the ray hits any obstacles
    const hit = obstacleManager.raycast({ origin: pt1, direction: rayDirection }, rayDist);
    // We need to return `true` if this does NOT have any obstructions between pt1 and pt2
    return !hit;
  });

  secondCtx.lineWidth = 4;
  secondCtx.strokeStyle = "rgba(255,128,0,1)";
  secondCtx.beginPath();
  smoothedPath.reduce<Vector2 | null>((prev, curr) => {
    if (prev == null) {
      return curr;
    }

    secondCtx.moveTo(prev.x * cellSize, prev.y * cellSize);
    secondCtx.lineTo(curr.x * cellSize, curr.y * cellSize);

    return curr;
  }, null);
  secondCtx.stroke();
  secondCtx.closePath();



  secondCtx.beginPath();
  secondCtx.strokeStyle = 'rgba(0,0,0,0.175)';
  secondCtx.lineWidth = 1;
  path.reduce<Vector2 | null>((prev, curr) => {
    if (prev == null) {
      return curr;
    }

    secondCtx.moveTo(prev.x * cellSize, prev.y * cellSize);
    secondCtx.lineTo(curr.x * cellSize, curr.y * cellSize);

    return curr;
  }, null);
  secondCtx.closePath();
  secondCtx.stroke();
}
