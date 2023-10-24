import ObstacleManager from "./ObstacleManager";
import { Ray, distance } from "./Ray";
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

const obstacleManager = new ObstacleManager(cols, rows);
for (let i = 0; i < 250; i++) {
  obstacleManager.addObstacle({
    x: (Math.random() * cols) | 0,
    y: (Math.random() * rows) | 0,
    width: 1 + ((Math.random() * 2) | 0),
    height: 1 + ((Math.random() * 2) | 0),
  });
}

const vox = new Voxelizer(0.2);
const fullSize = { x: 0, y: 0, width: cols, height: rows };
// console.time("voxelize");
const voxels = vox.voxelize(fullSize, obstacleManager);
// const voxels = vox.voxelizeList({ x: 0, y: 0, width: cols, height: rows }, obstacleManager);
// console.timeEnd("voxelize");

const render = () => {
  ctx.clearRect(0, 0, 800, 800);
  renderGrid();
  renderObstacles(obstacleManager);
  // renderVoxels(voxels);
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

var drawing = false;
secondCanvas.addEventListener("mousedown", (e) => {
  drawing = true;
});
secondCanvas.addEventListener("mouseup", (e) => {
  drawing = false;
});

secondCanvas.addEventListener("mousemove", (e) => {
  if (!drawing) { return; }
  const rect = canvas.getBoundingClientRect();
  const mouseX = (((e.clientX - rect.left) / cellSize) | 0) + 0.5;
  const mouseY = (((e.clientY - rect.top) / cellSize) | 0) + 0.5;
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

function linear_smoothPath(path: Vector2[]) {
  if (path.length <= 2) {
    return path;
  }
  let rayCount = 0;

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
      rayCount += 1;
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

  console.log('linear ray count:', rayCount);

  return newPath;
}


function smoothPath(path: Vector2[]): Vector2[] {
  if (path.length <= 2) {
    return path;
  }
  let rayCount = 0;

  const newPath: Vector2[] = [];
  const ray: Ray = { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } };

  let currentIdx = 0;
  newPath.push(path[0]);

  while (currentIdx < path.length - 1) {
    ray.origin = path[currentIdx];

    let lo = currentIdx + 1;
    let hi = path.length - 1;
    let nextIdx = -1;

    while (lo <= hi) {
      let mid = Math.floor((lo + hi) / 2);

      ray.direction = {
        x: path[mid].x - ray.origin.x,
        y: path[mid].y - ray.origin.y,
      };
      const mag = Math.sqrt(
        ray.direction.x * ray.direction.x + ray.direction.y * ray.direction.y
      );
      ray.direction = { x: ray.direction.x / mag, y: ray.direction.y / mag };

      const rayDist = distance(ray.origin, path[mid]);
      const hit = obstacleManager.raycast(ray, rayDist);
      rayCount += 1;
      if (!hit) {
        nextIdx = mid;  // Store the furthest seen so far
        lo = mid + 1;   // Move closer to the end
      } else {
        hi = mid - 1;   // Move closer to the start
      }
    }

    if (nextIdx == -1) {
      nextIdx = currentIdx + 1;  // If no direct line of sight, just move to the next point
    }

    newPath.push(path[nextIdx]);
    currentIdx = nextIdx;
  }

  console.log('binary ray count:', rayCount);

  return newPath;
}


window.addEventListener("keydown", (e) => {
  if (e.key === "s" || e.key === "S") {
    // secondCtx.clearRect(0, 0, 800, 800);
    console.log('green')
    const newpath = smoothPath(path);

    secondCtx.lineWidth = 4;
    secondCtx.strokeStyle = "rgba(0,255,0,1)";
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


    console.log('blue')
    const otherNewPath = linear_smoothPath(path);

    secondCtx.lineWidth = 2;
    secondCtx.strokeStyle = "rgba(0,0,255,1)";
    secondCtx.beginPath();
    otherNewPath.reduce<Vector2 | null>((prev, curr) => {
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






// secondCanvas.addEventListener('mousemove', (e) => {

//   const rayOrigin = { x: cols / 2, y: rows / 4 };


//   const rect = canvas.getBoundingClientRect();
//   const mouseX = e.clientX - rect.left;
//   const mouseY = e.clientY - rect.top;

//   // Compute the direction from rayOrigin to mouse cursor.
//   const dirX = mouseX - (rayOrigin.x * cellSize);
//   const dirY = mouseY - (rayOrigin.y * cellSize);

//   // Normalize the direction.
//   const mag = Math.sqrt(dirX * dirX + dirY * dirY);
//   const rayDirection = { x: dirX / mag, y: dirY / mag };

//   // Create the ray.
//   const ray = { origin: rayOrigin, direction: rayDirection };

//   secondCtx.clearRect(0, 0, 800, 800);

//   // getRaycastPoint(ray);
//   var res = obstacleManager.antiRaycast(ray, 1000);
//   if (res) {
//     secondCtx.fillRect((res.point.x * cellSize) - 5, (res.point.y * cellSize) - 5, 10, 10);
//   }

//   secondCtx.beginPath();
//   secondCtx.strokeStyle = 'white';
//   secondCtx.moveTo(ray.origin.x * cellSize, ray.origin.y * cellSize);
//   secondCtx.lineTo((ray.origin.x + ray.direction.x) * cellSize, (ray.origin.y + ray.direction.y) * cellSize);
//   secondCtx.stroke();
//   secondCtx.closePath();
// });
