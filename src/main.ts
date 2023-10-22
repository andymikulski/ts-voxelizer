import ObstacleManager from "./ObstacleManager";
import QuadTree from "./QuadTree";
import { Ray, distance, intersectRayRectangle } from "./Ray";
import { Rect } from "./Rect";
import { Vector2 } from "./Vector2";
import Voxelizer from "./Voxelizer";

const container = document.createElement("div");
container.style.position = "relative";
document.body.appendChild(container);

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
  ctx.fillStyle = "red";
  ctx.strokeStyle = "black";

  for (const obstacle of obstacleManager.getAllObstacles()) {
    // ctx.fillStyle = `#f0f`; // rgb(${(Math.random() * 255) | 0}, ${(Math.random() * 255) | 0}, ${(Math.random() * 255) | 0})`;
    ctx.fillRect(
      obstacle.x * cellSize,
      obstacle.y * cellSize,
      obstacle.width * cellSize,
      obstacle.height * cellSize
    );
    ctx.strokeRect(
      obstacle.x * cellSize,
      obstacle.y * cellSize,
      obstacle.width * cellSize,
      obstacle.height * cellSize
    );
  }
}

function renderVoxels(list: Rect[]): void {
  ctx.fillStyle = "#A1E084";
  ctx.strokeStyle = "white";
  for (const rect of list) {
    // ctx.fillStyle = `rgba(${(Math.random() * 255) | 0}, ${(Math.random() * 255) | 0}, ${(Math.random() * 255) | 0}, 1)`;
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

// Example usage
const obstacleManager = new ObstacleManager(cols, rows);
for (let i = 0; i < 100; i++) {
  obstacleManager.addObstacle({
    x: (Math.random() * cols) | 0,
    y: (Math.random() * rows) | 0,
    width: 1 + ((Math.random() * 2) | 0),
    height: 1 + ((Math.random() * 2) | 0),
  });
}

const vox = new Voxelizer(0.2);
const fullSize = { x: 0, y: 0, width: cols, height: rows };
console.time("voxelize");
const voxels = vox.voxelize(fullSize, obstacleManager);
// const voxels = vox.voxelizeList({ x: 0, y: 0, width: cols, height: rows }, obstacleManager);
console.timeEnd("voxelize");

const render = () => {
  ctx.clearRect(0, 0, 800, 800);
  renderGrid();
  renderObstacles(obstacleManager);
  renderVoxels(voxels);
  // obstacleManager.draw(ctx, cellSize);
  // quadtree.draw(ctx, cellSize);
  // requestAnimationFrame(render);
};

render();

const secondCanvas = document.createElement("canvas");
container.appendChild(secondCanvas);

secondCanvas.height = secondCanvas.width = canvas.height;
secondCanvas.style.position = "absolute";
secondCanvas.style.left = secondCanvas.style.top = "0px";

const secondCtx = secondCanvas.getContext("2d")!;

const path: Vector2[] = [];

secondCanvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) / cellSize;
  const mouseY = (e.clientY - rect.top) / cellSize;
  path.push({ x: mouseX, y: mouseY });

  secondCtx.beginPath();
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

});

function smoothPath(path: Vector2[]) {
  if (path.length <= 2) {
    return path;
  }

  const newPath: Vector2[] = [];
  const ray: Ray = { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };

  let currentIdx = 0;
  newPath.push(path[0]);

  while (currentIdx < path.length - 1) {
    ray.origin = path[currentIdx];

    let found = false;
    for (let i = path.length - 1; i > currentIdx; i--) {
      ray.direction = {
        x: path[i].x - ray.origin.x,
        y: path[i].y - ray.origin.y,
      };
      const mag = Math.sqrt(
        ray.direction.x * ray.direction.x + ray.direction.y * ray.direction.y
      );
      ray.direction = { x: ray.direction.x / mag, y: ray.direction.y / mag };

      const rayDist = distance(ray.origin, path[i]);
      const hit = obstacleManager.raycast(ray, rayDist);
      if (!hit) {
        currentIdx = i;
        found = true;
        break;
      }
    }

    // If we didn't find any further node that's directly visible,
    // just move to the next node in the path.
    if (!found) {
      currentIdx++;
    }

    newPath.push(path[currentIdx]);
  }

  return newPath;
}

window.addEventListener("keydown", (e) => {
  if (e.key === "s" || e.key === "S") {
    // secondCtx.clearRect(0, 0, 800, 800);
    const newpath = smoothPath(path);

    secondCtx.strokeStyle = "rgba(255,0,0,0.2)";
    secondCtx.beginPath();
    newpath.reduce<Vector2 | null>((prev, curr) => {
      if (prev == null) {
        return curr;
      }

      secondCtx.moveTo(prev.x * cellSize, prev.y * cellSize);
      secondCtx.lineTo(curr.x * cellSize, curr.y * cellSize);

      return curr;
    }, null);
    secondCtx.stroke();

    secondCtx.closePath();
  }
});
