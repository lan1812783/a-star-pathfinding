// This function is invoke only one time when the page load
const drawGrid: Function = (
  numWidthCells: number = nWidCells,
  numHeightCells: number = nHeiCells,
  cellWidth: number = cellWid,
  cellHeight: number = cellHei,
  sourceX: number = sX,
  sourceY: number = sY,
  targetX: number = tX,
  targetY: number = tY,
  distance = ManhattanDistance
) => {
  // Draw grid
  const grid: HTMLElement = document.querySelector(".grid") as HTMLDivElement;

  // Specify grid's inline css properties
  grid.style.width = `${cellWidth * numWidthCells}rem`;
  grid.style.height = `${cellHeight * numHeightCells}rem`;
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${numWidthCells}, 1fr)`;

  // Create cells for grid
  for (let i = 0; i < numHeightCells; i++) {
    for (let j = 0; j < numWidthCells; j++) {
      // Create a cell and its ID
      const id: number = calcID(j + 1, i + 1);
      const cell: HTMLElement = document.createElement("div");

      // Add newly generated cell from class Cell to 'cells' array
      cells.push(
        new Cell(
          j + 1, // X position
          i + 1, // Y position
          undefined, // Starting F score
          Infinity, // Starting G score
          distance(j + 1, i + 1, targetX, targetY), // H score
          undefined, // Starting parent of cell
          false // Starting as not an obstacle of cell
        )
      );

      // Specify cell's inline css properties
      cell.id = `${id}`;
      cell.style.width = `${cellWidth}rem`;
      cell.style.height = `${cellHeight}rem`;
      cell.style.border = `1px solid ${gridColor}`;
      cell.style.borderRadius = "2px";
      cell.style.transition = "all 0.2s ease-in-out";

      // Draw Source cell
      if (sourceX === j + 1 && sourceY === i + 1)
        cell.style.backgroundColor = sourceColor;
      // Draw Target cell
      else if (targetX === j + 1 && targetY === i + 1)
        cell.style.backgroundColor = targetColor;
      // Draw original cell
      else {
        cell.style.backgroundColor = cellColor;
      }

      // Add newly generated cell to the grid
      grid.appendChild(cell);
    }
  }
};

// Draw obstacles
// https://stackoverflow.com/questions/2970973/mouseover-while-mousedown
declare var $: any;
$(document).ready(function () {
  let isDown: boolean = false; // Tracks status of mouse button

  $(document)
    .mousedown(function () {
      isDown = true; // When mouse goes down, set isDown to true
    })
    .mouseup(function () {
      isDown = false; // When mouse goes up, set isDown to false
    });

  // Because the first clicked cell does not trigger mouseover event as we check if mouse goes down after check the event, so we need the mousedown event to make sure first click cell is an obstacle, of course except Source and Target cell
  $(".grid > div").mousedown(function (e: Event) {
    if ((startAlgorithm && !doneAlgorithm) || !isReset) return;

    const cellID: number = Number($(e.target).attr("id"));

    if (cellID !== calcID(sX, sY) && cellID !== calcID(tX, tY)) {
      cells[cellID - 1].isObstacle = true;

      $(this).css({ backgroundColor: obstacleColor });
    }
  });

  // Click on a cell and drag to the others to make them obstacles, except Source and Target cell
  $(".grid > div").mouseover(function (e: Event) {
    const cellID: number = Number($(e.target).attr("id"));
    const allCells = document.querySelectorAll(".grid div") as NodeListOf<
      HTMLDivElement
    >;

    // This is used to fade background color without jquery, not capable of implementing this yet
    allCells.forEach((cell: HTMLDivElement) => {
      if (cellID === Number(cell.id)) {
        // Do the fade
      }
    });

    // Take action on hovered cell when mouse is down and the cell is neither Source nor Target cell
    if (isDown && (!startAlgorithm || doneAlgorithm) && isReset) {
      if (cellID !== calcID(sX, sY) && cellID !== calcID(tX, tY)) {
        cells[cellID - 1].isObstacle = true;

        $(this).css({ backgroundColor: obstacleColor });
      }
    }
  });
});

// --- o
// |
// |
// |
// o
const ManhattanDistance: Function = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
): number => {
  return (Math.abs(targetX - sourceX) + Math.abs(targetY - sourceY)) * 10;
};

//     o
//    /
//   /
//  /
// o
const EuclideanDistance = () => {};

// --- o
//
//
//
// o
const DiagonalDistance = () => {};

// Calculate cell's ID based on its x and y position
const calcID: Function = (x: number, y: number): number => {
  return (y - 1) * nWidCells + x;
};

// Check if a neighbor is in openList or not
const isInOpenList: Function = (cellID: number) => {
  for (let i = 0; i < openList.length; i++)
    if (cellID == calcID(openList[i].x, openList[i].y)) return true;

  return false;
};

// Check if a neighbor is in closedList or not
const isInClosedList: Function = (cellID: number) => {
  for (let i = 0; i < closedList.length; i++)
    if (cellID == calcID(closedList[i].x, closedList[i].y)) return true;

  return false;
};

// Process neighbor
const updateNeighbor: Function = (
  parent: Cell,
  neighbor: Cell,
  parentID: number,
  distance: number
): void => {
  let reset: boolean = false;

  if (parent.g + distance < neighbor.g) reset = true;

  neighbor.g = reset ? parent.g + distance : neighbor.g;
  neighbor.f = neighbor.g + neighbor.h;
  neighbor.parent = reset ? parentID : neighbor.parent;
};

// Return all valid neighbors' IDs
const processingNeighbors: Function = (
  processingCell: Cell, // Current processing cell
  processingCellID: number // Current processing cell's ID
): number[] => {
  // Calculate all 8 neighbors' ID for later checking if any is invalid
  const topLeftID: number = calcID(processingCell.x - 1, processingCell.y - 1);
  const topID: number = calcID(processingCell.x, processingCell.y - 1);
  const topRightID: number = calcID(processingCell.x + 1, processingCell.y - 1);
  const leftID: number = calcID(processingCell.x - 1, processingCell.y);
  const rightID: number = calcID(processingCell.x + 1, processingCell.y);
  const bottomLeftID: number = calcID(
    processingCell.x - 1,
    processingCell.y + 1
  );
  const bottomID: number = calcID(processingCell.x, processingCell.y + 1);
  const bottomRightID: number = calcID(
    processingCell.x + 1,
    processingCell.y + 1
  );

  // For each valid neighbor, push it to this array
  const neighborsIDs: number[] = [];

  // Check for any vavid neighbors
  if (
    1 <= topLeftID &&
    topLeftID <= nWidCells * nHeiCells &&
    processingCellID % nWidCells != 1 &&
    !isInClosedList(topLeftID) &&
    cells[topLeftID - 1].isObstacle == false &&
    (cells[topID - 1].isObstacle == false ||
      cells[leftID - 1].isObstacle == false)
  ) {
    updateNeighbor(processingCell, cells[topLeftID - 1], processingCellID, 14);

    if (!isInOpenList(topLeftID)) neighborsIDs.push(topLeftID);
  }
  if (
    1 <= topID &&
    topID <= nWidCells * nHeiCells &&
    !isInClosedList(topID) &&
    cells[topID - 1].isObstacle == false
  ) {
    updateNeighbor(processingCell, cells[topID - 1], processingCellID, 10);

    if (!isInOpenList(topID)) neighborsIDs.push(topID);
  }
  if (
    1 <= topRightID &&
    topRightID <= nWidCells * nHeiCells &&
    processingCellID % nWidCells != 0 &&
    !isInClosedList(topRightID) &&
    cells[topRightID - 1].isObstacle == false &&
    (cells[topID - 1].isObstacle == false ||
      cells[rightID - 1].isObstacle == false)
  ) {
    updateNeighbor(processingCell, cells[topRightID - 1], processingCellID, 14);

    if (!isInOpenList(topRightID)) neighborsIDs.push(topRightID);
  }
  if (
    1 <= leftID &&
    leftID <= nWidCells * nHeiCells &&
    processingCellID % nWidCells != 1 &&
    !isInClosedList(leftID) &&
    cells[leftID - 1].isObstacle == false
  ) {
    updateNeighbor(processingCell, cells[leftID - 1], processingCellID, 10);

    if (!isInOpenList(leftID)) neighborsIDs.push(leftID);
  }
  if (
    1 <= rightID &&
    rightID <= nWidCells * nHeiCells &&
    processingCellID % nWidCells != 0 &&
    !isInClosedList(rightID) &&
    cells[rightID - 1].isObstacle == false
  ) {
    updateNeighbor(processingCell, cells[rightID - 1], processingCellID, 10);

    if (!isInOpenList(rightID)) neighborsIDs.push(rightID);
  }
  if (
    1 <= bottomLeftID &&
    bottomLeftID <= nWidCells * nHeiCells &&
    processingCellID % nWidCells != 1 &&
    !isInClosedList(bottomLeftID) &&
    cells[bottomLeftID - 1].isObstacle == false &&
    (cells[bottomID - 1].isObstacle == false ||
      cells[leftID - 1].isObstacle == false)
  ) {
    updateNeighbor(
      processingCell,
      cells[bottomLeftID - 1],
      processingCellID,
      14
    );

    if (!isInOpenList(bottomLeftID)) neighborsIDs.push(bottomLeftID);
  }
  if (
    1 <= bottomID &&
    bottomID <= nWidCells * nHeiCells &&
    !isInClosedList(bottomID) &&
    cells[bottomID - 1].isObstacle == false
  ) {
    updateNeighbor(processingCell, cells[bottomID - 1], processingCellID, 10);

    if (!isInOpenList(bottomID)) neighborsIDs.push(bottomID);
  }
  if (
    1 <= bottomRightID &&
    bottomRightID <= nWidCells * nHeiCells &&
    processingCellID % nWidCells != 0 &&
    !isInClosedList(bottomRightID) &&
    cells[bottomRightID - 1].isObstacle == false &&
    (cells[rightID - 1].isObstacle == false ||
      cells[bottomID - 1].isObstacle == false)
  ) {
    updateNeighbor(
      processingCell,
      cells[bottomRightID - 1],
      processingCellID,
      14
    );

    if (!isInOpenList(bottomRightID)) neighborsIDs.push(bottomRightID);
  }

  // Draw processing cell with orange color and its neighbors with blue color
  const allCells = document.querySelectorAll(".grid div") as NodeListOf<
    HTMLDivElement
  >;

  neighborsIDs.forEach((neighborID) => {
    allCells.forEach((cell) => {
      if (
        processingCellID == Number(cell.id) &&
        processingCellID != sID &&
        processingCellID != tID
      )
        cell.style.backgroundColor = processingColor;

      if (neighborID == Number(cell.id) && neighborID != tID)
        cell.style.backgroundColor = neighborColor;
    });
  });
  // Done draw processing cell and its neighbors

  // Return all valid neighbors
  return neighborsIDs;
};

// Pop the cell with the least F score out of openList then return it for being a proessing cell
const min_fScore_cell: Function = (openCellList: Cell[]): Cell => {
  let minIdx: number = 0;

  for (let i = 0; i < openCellList.length; i++)
    if (openCellList[minIdx].f > openCellList[i].f) minIdx = i;

  return openCellList.splice(minIdx, 1)[0]; // splice() pops number of elements out of array, then returns a list of poped elements
};

// Draw the shortest path if found one, if not, alert to the user that there is no valid path
const drawPath: Function = (): void => {
  const allCells = document.querySelectorAll(".grid div") as NodeListOf<
    HTMLDivElement
  >;

  let cellIDOnPath: number = tID;

  // Backtrack all parents begin from Target cell
  const intervalID = setInterval(() => {
    if (cells[cellIDOnPath - 1]) cellIDOnPath = cells[cellIDOnPath - 1].parent;

    allCells.forEach((cell) => {
      if (cellIDOnPath == Number(cell.id))
        cell.style.backgroundColor = pathColor;
    });

    if (cells[cellIDOnPath - 1] && cells[cellIDOnPath - 1].parent == sID) {
      doneAlgorithm = true;
      clearInterval(intervalID);
    }

    if (!cells[cellIDOnPath - 1]) {
      alert("Không tìm thấy đường đi từ nguồn đến đích.");
      doneAlgorithm = true;
      clearInterval(intervalID);
    }
  }, 40);
};

// A* algorithm
const A_Star: Function = (): void => {
  openList.push(cells[sID - 1]);

  cells[sID - 1].g = 0;

  const intervalID = setInterval(() => {
    const processingCell: Cell = min_fScore_cell(openList); // Returns the cell with the least F score, then pops it out of the openList
    const processingCellID: number = calcID(processingCell.x, processingCell.y);

    closedList.push(processingCell);

    const neighborsIDs = processingNeighbors(processingCell, processingCellID);

    for (let i = 0; i < neighborsIDs.length; i++) {
      openList.push(cells[neighborsIDs[i] - 1]);
    }

    if (processingCellID == tID || openList.length == 0) {
      drawPath();

      clearInterval(intervalID);
    }
  }, 40);
};

// Default value
const nWidCells: number = 80, // Number of cells per row
  nHeiCells: number = 30, // Number of cells per column
  cellWid: number = 1, // Cell's width (rem)
  cellHei: number = 1, // Cell's height (rem)
  sX: number = nWidCells / 4, // X position of Source
  sY: number = nHeiCells / 2, // Y position of Target
  tX: number = (3 * nWidCells) / 4, // X position of Target
  tY: number = nHeiCells / 2; // Y position of Target

// PROBLEM: alpha channel is ignored, didn't know why
const gridColor: string = "rgba(0, 0, 0, 1)"; // Grid's color
const cellColor: string = "rgba(255, 255, 255, 1)"; // Original cell's color
const sourceColor: string = "rgba(255, 0, 0, 1)"; // Source cell's color
const targetColor: string = "rgba(255, 255, 0, 1)"; // Target cell's color
const obstacleColor: string = "rgba(96, 96, 96, 1)"; // Obstacle cells' color
const processingColor: string = "rgba(102, 178, 255, 1)"; // Processing cell's color
const neighborColor: string = "rgba(128, 255, 0, 1)"; // Neighbor cells' color
const pathColor: string = "rgba(180, 5, 255, 1)"; // Path cells' color

// Class contains all properties of a cell
class Cell {
  x: number; // X position of this cell
  y: number; // Y position of this cell
  f: number; // F score = G score + H score
  g: number; // G score = distance form Source to this cell
  h: number; // H score = distance from Target to this cell
  parent: number; // ID of the cell which previously goes to this cell
  isObstacle: boolean; // Is this cell an obstacle or not

  constructor(
    x: number,
    y: number,
    f: number,
    g: number,
    h: number,
    parent: number,
    isObstacle: boolean
  ) {
    this.x = x;
    this.y = y;
    this.f = f;
    this.g = g;
    this.h = h;
    this.parent = parent;
    this.isObstacle = isObstacle;
  }
}

// Contains cells, each cell is beased on class Cell, ID of a cell starts from 1, but index starts from 0, so ID - 1 = index
const cells: Cell[] = [];

const sID: number = calcID(sX, sY);
const tID: number = calcID(tX, tY);
const openList: Cell[] = [];
const closedList: Cell[] = [];

let isReset: boolean = true;
let startAlgorithm: boolean = false;
let doneAlgorithm: boolean = false;

const main: Function = (): void => {
  // Draw grid and default Source and Target position
  drawGrid();

  // Click Start button to begin visualization process
  document.querySelector(".startBtn").addEventListener("click", () => {
    if (isReset) {
      isReset = false;
      startAlgorithm = true;
      A_Star(sX, sY, tX, tY);
    }
  });

  // Click Reset button to clear the grid
  document.querySelector(".resetBtn").addEventListener("click", () => {
    if (startAlgorithm && !doneAlgorithm) return;

    isReset = true;
    startAlgorithm = false;
    doneAlgorithm = false;

    // Reset f score, g score, parent, isObstacle to starting value
    cells.forEach((cell) => {
      cell.f = undefined;
      cell.g = Infinity;
      cell.parent = undefined;
      cell.isObstacle = false;
    });

    // Clear openList and closedList both to empty array
    openList.splice(0, openList.length);
    closedList.splice(0, closedList.length);

    // Redraw grid
    const allCells = document.querySelectorAll(".grid div") as NodeListOf<
      HTMLDivElement
    >;

    allCells.forEach((cell) => {
      if (sID != Number(cell.id) && tID != Number(cell.id))
        cell.style.backgroundColor = cellColor;
    });
    // End redraw grid
  });
};

main();
