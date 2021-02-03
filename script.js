// This function is invoke only one time when the page load
var drawGrid = function (numWidthCells, numHeightCells, cellWidth, cellHeight, sourceX, sourceY, targetX, targetY, distance) {
    if (numWidthCells === void 0) { numWidthCells = nWidCells; }
    if (numHeightCells === void 0) { numHeightCells = nHeiCells; }
    if (cellWidth === void 0) { cellWidth = cellWid; }
    if (cellHeight === void 0) { cellHeight = cellHei; }
    if (sourceX === void 0) { sourceX = sX; }
    if (sourceY === void 0) { sourceY = sY; }
    if (targetX === void 0) { targetX = tX; }
    if (targetY === void 0) { targetY = tY; }
    if (distance === void 0) { distance = ManhattanDistance; }
    // Draw grid
    var grid = document.querySelector(".grid");
    // Specify grid's inline css properties
    grid.style.width = cellWidth * numWidthCells + "rem";
    grid.style.height = cellHeight * numHeightCells + "rem";
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(" + numWidthCells + ", 1fr)";
    // Create cells for grid
    for (var i = 0; i < numHeightCells; i++) {
        for (var j = 0; j < numWidthCells; j++) {
            // Create a cell and its ID
            var id = calcID(j + 1, i + 1);
            var cell = document.createElement("div");
            // Add newly generated cell from class Cell to 'cells' array
            cells.push(new Cell(j + 1, // X position
            i + 1, // Y position
            undefined, // Starting F score
            Infinity, // Starting G score
            distance(j + 1, i + 1, targetX, targetY), // H score
            undefined, // Starting parent of cell
            false // Starting as not an obstacle of cell
            ));
            // Specify cell's inline css properties
            cell.id = "" + id;
            cell.style.width = cellWidth + "rem";
            cell.style.height = cellHeight + "rem";
            cell.style.border = "1px solid " + gridColor;
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
$(document).ready(function () {
    var isDown = false; // Tracks status of mouse button
    $(document)
        .mousedown(function () {
        isDown = true; // When mouse goes down, set isDown to true
    })
        .mouseup(function () {
        isDown = false; // When mouse goes up, set isDown to false
    });
    // Because the first clicked cell does not trigger mouseover event as we check if mouse goes down after check the event, so we need the mousedown event to make sure first click cell is an obstacle, of course except Source and Target cell
    $(".grid > div").mousedown(function (e) {
        if ((startAlgorithm && !doneAlgorithm) || !isReset)
            return;
        var cellID = Number($(e.target).attr("id"));
        if (cellID !== calcID(sX, sY) && cellID !== calcID(tX, tY)) {
            cells[cellID - 1].isObstacle = true;
            $(this).css({ backgroundColor: obstacleColor });
        }
    });
    // Click on a cell and drag to the others to make them obstacles, except Source and Target cell
    $(".grid > div").mouseover(function (e) {
        var cellID = Number($(e.target).attr("id"));
        var allCells = document.querySelectorAll(".grid div");
        // This is used to fade background color without jquery, not capable of implementing this yet
        allCells.forEach(function (cell) {
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
var ManhattanDistance = function (sourceX, sourceY, targetX, targetY) {
    return (Math.abs(targetX - sourceX) + Math.abs(targetY - sourceY)) * 10;
};
//     o
//    /
//   /
//  /
// o
var EuclideanDistance = function () { };
// --- o
//
//
//
// o
var DiagonalDistance = function () { };
// Calculate cell's ID based on its x and y position
var calcID = function (x, y) {
    return (y - 1) * nWidCells + x;
};
// Check if a neighbor is in openList or not
var isInOpenList = function (cellID) {
    for (var i = 0; i < openList.length; i++)
        if (cellID == calcID(openList[i].x, openList[i].y))
            return true;
    return false;
};
// Check if a neighbor is in closedList or not
var isInClosedList = function (cellID) {
    for (var i = 0; i < closedList.length; i++)
        if (cellID == calcID(closedList[i].x, closedList[i].y))
            return true;
    return false;
};
// Process neighbor
var updateNeighbor = function (parent, neighbor, parentID, distance) {
    var reset = false;
    if (parent.g + distance < neighbor.g)
        reset = true;
    neighbor.g = reset ? parent.g + distance : neighbor.g;
    neighbor.f = neighbor.g + neighbor.h;
    neighbor.parent = reset ? parentID : neighbor.parent;
};
// Return all valid neighbors' IDs
var processingNeighbors = function (processingCell, // Current processing cell
processingCellID // Current processing cell's ID
) {
    // Calculate all 8 neighbors' ID for later checking if any is invalid
    var topLeftID = calcID(processingCell.x - 1, processingCell.y - 1);
    var topID = calcID(processingCell.x, processingCell.y - 1);
    var topRightID = calcID(processingCell.x + 1, processingCell.y - 1);
    var leftID = calcID(processingCell.x - 1, processingCell.y);
    var rightID = calcID(processingCell.x + 1, processingCell.y);
    var bottomLeftID = calcID(processingCell.x - 1, processingCell.y + 1);
    var bottomID = calcID(processingCell.x, processingCell.y + 1);
    var bottomRightID = calcID(processingCell.x + 1, processingCell.y + 1);
    // For each valid neighbor, push it to this array
    var neighborsIDs = [];
    // Check for any vavid neighbors
    if (1 <= topLeftID &&
        topLeftID <= nWidCells * nHeiCells &&
        processingCellID % nWidCells != 1 &&
        !isInClosedList(topLeftID) &&
        cells[topLeftID - 1].isObstacle == false &&
        (cells[topID - 1].isObstacle == false ||
            cells[leftID - 1].isObstacle == false)) {
        updateNeighbor(processingCell, cells[topLeftID - 1], processingCellID, 14);
        if (!isInOpenList(topLeftID))
            neighborsIDs.push(topLeftID);
    }
    if (1 <= topID &&
        topID <= nWidCells * nHeiCells &&
        !isInClosedList(topID) &&
        cells[topID - 1].isObstacle == false) {
        updateNeighbor(processingCell, cells[topID - 1], processingCellID, 10);
        if (!isInOpenList(topID))
            neighborsIDs.push(topID);
    }
    if (1 <= topRightID &&
        topRightID <= nWidCells * nHeiCells &&
        processingCellID % nWidCells != 0 &&
        !isInClosedList(topRightID) &&
        cells[topRightID - 1].isObstacle == false &&
        (cells[topID - 1].isObstacle == false ||
            cells[rightID - 1].isObstacle == false)) {
        updateNeighbor(processingCell, cells[topRightID - 1], processingCellID, 14);
        if (!isInOpenList(topRightID))
            neighborsIDs.push(topRightID);
    }
    if (1 <= leftID &&
        leftID <= nWidCells * nHeiCells &&
        processingCellID % nWidCells != 1 &&
        !isInClosedList(leftID) &&
        cells[leftID - 1].isObstacle == false) {
        updateNeighbor(processingCell, cells[leftID - 1], processingCellID, 10);
        if (!isInOpenList(leftID))
            neighborsIDs.push(leftID);
    }
    if (1 <= rightID &&
        rightID <= nWidCells * nHeiCells &&
        processingCellID % nWidCells != 0 &&
        !isInClosedList(rightID) &&
        cells[rightID - 1].isObstacle == false) {
        updateNeighbor(processingCell, cells[rightID - 1], processingCellID, 10);
        if (!isInOpenList(rightID))
            neighborsIDs.push(rightID);
    }
    if (1 <= bottomLeftID &&
        bottomLeftID <= nWidCells * nHeiCells &&
        processingCellID % nWidCells != 1 &&
        !isInClosedList(bottomLeftID) &&
        cells[bottomLeftID - 1].isObstacle == false &&
        (cells[bottomID - 1].isObstacle == false ||
            cells[leftID - 1].isObstacle == false)) {
        updateNeighbor(processingCell, cells[bottomLeftID - 1], processingCellID, 14);
        if (!isInOpenList(bottomLeftID))
            neighborsIDs.push(bottomLeftID);
    }
    if (1 <= bottomID &&
        bottomID <= nWidCells * nHeiCells &&
        !isInClosedList(bottomID) &&
        cells[bottomID - 1].isObstacle == false) {
        updateNeighbor(processingCell, cells[bottomID - 1], processingCellID, 10);
        if (!isInOpenList(bottomID))
            neighborsIDs.push(bottomID);
    }
    if (1 <= bottomRightID &&
        bottomRightID <= nWidCells * nHeiCells &&
        processingCellID % nWidCells != 0 &&
        !isInClosedList(bottomRightID) &&
        cells[bottomRightID - 1].isObstacle == false &&
        (cells[rightID - 1].isObstacle == false ||
            cells[bottomID - 1].isObstacle == false)) {
        updateNeighbor(processingCell, cells[bottomRightID - 1], processingCellID, 14);
        if (!isInOpenList(bottomRightID))
            neighborsIDs.push(bottomRightID);
    }
    // Draw processing cell with orange color and its neighbors with blue color
    var allCells = document.querySelectorAll(".grid div");
    neighborsIDs.forEach(function (neighborID) {
        allCells.forEach(function (cell) {
            if (processingCellID == Number(cell.id) &&
                processingCellID != sID &&
                processingCellID != tID)
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
var min_fScore_cell = function (openCellList) {
    var minIdx = 0;
    for (var i = 0; i < openCellList.length; i++)
        if (openCellList[minIdx].f > openCellList[i].f)
            minIdx = i;
    return openCellList.splice(minIdx, 1)[0]; // splice() pops number of elements out of array, then returns a list of poped elements
};
// Draw the shortest path if found one, if not, alert to the user that there is no valid path
var drawPath = function () {
    var allCells = document.querySelectorAll(".grid div");
    var cellIDOnPath = tID;
    // Backtrack all parents begin from Target cell
    var intervalID = setInterval(function () {
        if (cells[cellIDOnPath - 1])
            cellIDOnPath = cells[cellIDOnPath - 1].parent;
        allCells.forEach(function (cell) {
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
var A_Star = function () {
    openList.push(cells[sID - 1]);
    cells[sID - 1].g = 0;
    var intervalID = setInterval(function () {
        var processingCell = min_fScore_cell(openList); // Returns the cell with the least F score, then pops it out of the openList
        var processingCellID = calcID(processingCell.x, processingCell.y);
        closedList.push(processingCell);
        var neighborsIDs = processingNeighbors(processingCell, processingCellID);
        for (var i = 0; i < neighborsIDs.length; i++) {
            openList.push(cells[neighborsIDs[i] - 1]);
        }
        if (processingCellID == tID || openList.length == 0) {
            drawPath();
            clearInterval(intervalID);
        }
    }, 40);
};
// Default value
var nWidCells = 80, // Number of cells per row
nHeiCells = 30, // Number of cells per column
cellWid = 1, // Cell's width (rem)
cellHei = 1, // Cell's height (rem)
sX = nWidCells / 4, // X position of Source
sY = nHeiCells / 2, // Y position of Target
tX = (3 * nWidCells) / 4, // X position of Target
tY = nHeiCells / 2; // Y position of Target
// PROBLEM: alpha channel is ignored, didn't know why
var gridColor = "rgba(0, 0, 0, 1)"; // Grid's color
var cellColor = "rgba(255, 255, 255, 1)"; // Original cell's color
var sourceColor = "rgba(255, 0, 0, 1)"; // Source cell's color
var targetColor = "rgba(255, 255, 0, 1)"; // Target cell's color
var obstacleColor = "rgba(96, 96, 96, 1)"; // Obstacle cells' color
var processingColor = "rgba(102, 178, 255, 1)"; // Processing cell's color
var neighborColor = "rgba(128, 255, 0, 1)"; // Neighbor cells' color
var pathColor = "rgba(180, 5, 255, 1)"; // Path cells' color
// Class contains all properties of a cell
var Cell = /** @class */ (function () {
    function Cell(x, y, f, g, h, parent, isObstacle) {
        this.x = x;
        this.y = y;
        this.f = f;
        this.g = g;
        this.h = h;
        this.parent = parent;
        this.isObstacle = isObstacle;
    }
    return Cell;
}());
// Contains cells, each cell is beased on class Cell, ID of a cell starts from 1, but index starts from 0, so ID - 1 = index
var cells = [];
var sID = calcID(sX, sY);
var tID = calcID(tX, tY);
var openList = [];
var closedList = [];
var isReset = true;
var startAlgorithm = false;
var doneAlgorithm = false;
var main = function () {
    // Draw grid and default Source and Target position
    drawGrid();
    // Click Start button to begin visualization process
    document.querySelector(".startBtn").addEventListener("click", function () {
        if (isReset) {
            isReset = false;
            startAlgorithm = true;
            A_Star(sX, sY, tX, tY);
        }
    });
    // Click Reset button to clear the grid
    document.querySelector(".resetBtn").addEventListener("click", function () {
        if (startAlgorithm && !doneAlgorithm)
            return;
        isReset = true;
        startAlgorithm = false;
        doneAlgorithm = false;
        // Reset f score, g score, parent, isObstacle to starting value
        cells.forEach(function (cell) {
            cell.f = undefined;
            cell.g = Infinity;
            cell.parent = undefined;
            cell.isObstacle = false;
        });
        // Clear openList and closedList both to empty array
        openList.splice(0, openList.length);
        closedList.splice(0, closedList.length);
        // Redraw grid
        var allCells = document.querySelectorAll(".grid div");
        allCells.forEach(function (cell) {
            if (sID != Number(cell.id) && tID != Number(cell.id))
                cell.style.backgroundColor = cellColor;
        });
        // End redraw grid
    });
};
main();
