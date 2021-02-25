"use strict";

var MiniGamePrisonEscapeCheckpoint = 0;
var MiniGamePrisonEscapeLevel = 1;
var PrisonEscapeMapIndex = [];


var PrisonEscapeGrid = ""
var PrisonEscapeGrid_Last = ""
var PrisonEscapeGridSize = 50
var PrisonEscapeGridWidth = 27
var PrisonEscapeGridHeight = 15


var PrisonEscapeSpriteSize = 72

var PrisonEscapeCanvas = document.createElement("canvas");
var PrisonEscapeContext = null
var PrisonEscapeCanvasFow = document.createElement("canvas");
var PrisonEscapeContextFow = null
var PrisonEscapeCanvasPlayer = document.createElement("canvas");
var PrisonEscapeContextPlayer = null

var PrisonEscapeEntities = []
var PrisonEscapeTerrain = []
var PrisonEscapePlayerEntity = null

var PrisonEscapeMapBrightness = 5

function PrisonEscapeInitialize(Level, Random) {
	MiniGamePrisonEscapeLevel = Level
	
	for (let I = 1; I < 10; I++)
		PrisonEscapeMapIndex.push(I)

	// Option to shuffle the dungeon types besides the initial one (graveyard)
	if (Random) {
		/* Randomize array in-place using Durstenfeld shuffle algorithm */
		// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
		for (var i = PrisonEscapeMapIndex.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = PrisonEscapeMapIndex[i];
			PrisonEscapeMapIndex[i] = PrisonEscapeMapIndex[j];
			PrisonEscapeMapIndex[j] = temp;
		}
	}
	PrisonEscapeMapIndex.unshift(0)
	PrisonEscapeMapIndex.push(10)
	
	PrisonEscapeCreateMap(PrisonEscapeMapParams[PrisonEscapeMapIndex[0]])
	
	
	PrisonEscapeContext = PrisonEscapeCanvas.getContext("2d")
	PrisonEscapeCanvas.width = PrisonEscapeGridSize*PrisonEscapeGridWidth;
	PrisonEscapeCanvas.height = PrisonEscapeGridSize*PrisonEscapeGridHeight;

	PrisonEscapeContextFow = PrisonEscapeCanvasFow.getContext("2d")
	PrisonEscapeCanvasFow.width = PrisonEscapeCanvas.width
	PrisonEscapeCanvasFow.height = PrisonEscapeCanvas.height;
	
	
	PrisonEscapeContextPlayer = PrisonEscapeCanvasPlayer.getContext("2d")
	PrisonEscapeCanvasPlayer.width = PrisonEscapeGridSize
	PrisonEscapeCanvasPlayer.height = PrisonEscapeGridSize;
}
// Starts the the game at a specified level
function PrisonEscapeCreateMap(MapParams) {
	PrisonEscapeGrid = ""
	
	// Generate the grid
	for (let X = 0; X < PrisonEscapeGridHeight; X++) {
		for (let Y = 0; Y < PrisonEscapeGridWidth; Y++)
			PrisonEscapeGrid = PrisonEscapeGrid + '1'
		PrisonEscapeGrid = PrisonEscapeGrid + '\n'
	}
	
	// We only rerender the map when the grid changes
	PrisonEscapeGrid_Last = ""
	
	// Setup variables
	
	var rows = PrisonEscapeGrid.split('\n')
	var height = PrisonEscapeGridHeight
	var width = PrisonEscapeGridWidth
	var startpos = 1 + 2*Math.floor(Math.random()*0.5 * (height - 2))
	
	// MAP GENERATION
	
	var VisitedRooms = []
	PrisonEscapeMapSet(1, startpos, '0', VisitedRooms)
	//PrisonEscapeMapSet(rows[0].length-2, endpos, '0')
	
	// Use primm algorithm with modification to spawn random rooms in the maze
	
	var openness = MapParams["openness"]
	var density = MapParams["density"]
	var doodadchance = MapParams["doodadchance"]
	PrisonEscapeCreateMaze(VisitedRooms, width, height, openness, density)	
	
	PrisonEscapeReplaceDoodads(doodadchance, width, height) // Replace random internal walls with doodads
	
	
	
	// Place the player!
	PrisonEscapePlayerEntity = {Type:"Player", x: 1, y:startpos}
	PrisonEscapeEntities.push(PrisonEscapePlayerEntity)
	
	// Set map brightness
	PrisonEscapeMapBrightness = MapParams["brightness"]
}

function PrisonEscapeReplaceDoodads(Chance, width, height) {
	for (let X = 1; X < width; X += 1)
		for (let Y = 1; Y < height; Y += 1)
			if (PrisonEscapeMapGet(X, Y) == '1' && Math.random() < Chance) {
				PrisonEscapeMapSet(X, Y, 'X')
			}
				
}

function PrisonEscapeCreateMaze(VisitedRooms, width, height, openness, density) {
	// Variable setup
	
	var Walls = {}
	var WallsList = {}
	var VisitedCells = {}
	
	// Initialize the first cell in our Visited Cells list
	
	VisitedCells[VisitedRooms[0].x + "," + VisitedRooms[0].y] = {x:VisitedRooms[0].x, y:VisitedRooms[0].y}
	
	// Walls are basically even/odd pairs.
	for (let X = 2; X < width; X += 2)
		for (let Y = 1; Y < height; Y += 2)
			if (PrisonEscapeMapGet(X, Y) == '1') {
				Walls[X + "," + Y] = {x:X, y:Y}
			}
	for (let X = 1; X < width; X += 2)
		for (let Y = 2; Y < height; Y += 2)
			if (PrisonEscapeMapGet(X, Y) == '1') {
				Walls[X + "," + Y] = {x:X, y:Y}
			}
		
	// Setup the wallslist for the first room
	PrisonEscapeMazeWalls(VisitedRooms[0], Walls, WallsList)
	
	// Per a randomized primm algorithm from Wikipedia, we loop through the list of walls until there are no more walls
	
	var WallKeys = Object.keys(WallsList)
	var CellKeys = Object.keys(VisitedCells)
			
	while (WallKeys.length > 0) {
		var I = Math.floor(Math.random() * WallKeys.length)
		var wall = Walls[WallKeys[I]]
		var unvisitedCell = null
		
		// Check if wall is horizontal or vertical and determine if there is a single unvisited cell on the other side of the wall
		if (wall.x % 2 == 0) { //horizontal wall
			if (!VisitedCells[(wall.x-1) + "," + wall.y]) unvisitedCell = {x:wall.x-1, y:wall.y}
			if (!VisitedCells[(wall.x+1) + "," + wall.y]) {
				if (unvisitedCell) unvisitedCell = null
				else unvisitedCell = {x:wall.x+1, y:wall.y}
			}
		} else { //vertical wall
			if (!VisitedCells[wall.x + "," + (wall.y-1)]) unvisitedCell = {x:wall.x, y:wall.y-1}
			if (!VisitedCells[wall.x + "," + (wall.y+1)]) {
				if (unvisitedCell) unvisitedCell = null
				else unvisitedCell = {x:wall.x, y:wall.y+1}
			}
		}
		
		// We only add a new cell if only one of the cells is unvisited
		if (unvisitedCell) {
			delete Walls[wall.x + "," + wall.y]

			PrisonEscapeMapSet(wall.x, wall.y, '0')
			PrisonEscapeMapSet(unvisitedCell.x, unvisitedCell.y, '0')
			VisitedCells[unvisitedCell.x + "," + unvisitedCell.y] = unvisitedCell
			
			PrisonEscapeMazeWalls(unvisitedCell, Walls, WallsList)
		}

		// Either way we remove this wall from consideration
		delete WallsList[wall.x + "," + wall.y]
		
		// Chance of spawning a room!
		if (Math.random() < 0.1 - 0.015*density) {
			var size = 1+Math.ceil(Math.random() * (openness))
			
			// We open up the tiles
			for (let XX = wall.x; XX < wall.x +size; XX++)
				for (let YY = wall.y; YY < wall.y+size; YY++) {
					PrisonEscapeMapSet(XX, YY, '0')
					VisitedCells[XX + "," + YY] = {x:XX, y:YY}
					PrisonEscapeMazeWalls({x:XX, y:YY}, Walls, WallsList)
					delete Walls[XX + "," + YY]
				}
				
			// We also remove all walls inside the room from consideration!
			for (let XX = wall.x; XX < wall.x +size; XX++)
				for (let YY = wall.y; YY < wall.y+size; YY++) {
					delete WallsList[XX + "," + YY]
				}
		}
		
		// Update keys
		
		WallKeys = Object.keys(WallsList)
		CellKeys = Object.keys(VisitedCells)
	}

}

function PrisonEscapeMazeWalls(Cell, Walls, WallsList) {
	if (Walls[(Cell.x+1) + "," + Cell.y]) WallsList[(Cell.x+1) + "," + Cell.y] = {x:Cell.x+1, y:Cell.y}
	if (Walls[(Cell.x-1) + "," + Cell.y]) WallsList[(Cell.x-1) + "," + Cell.y] = {x:Cell.x-1, y:Cell.y}
	if (Walls[Cell.x + "," + (Cell.y+1)]) WallsList[Cell.x + "," + (Cell.y+1)] = {x:Cell.x, y:Cell.y+1}
	if (Walls[Cell.x + "," + (Cell.y-1)]) WallsList[Cell.x + "," + (Cell.y-1)] = {x:Cell.x, y:Cell.y-1}
}

function PrisonEscapeMapSet(X, Y, SetTo, VisitedRooms) {
	var height = PrisonEscapeGridHeight
	var width = PrisonEscapeGridWidth
	
	if (X > 0 && X < width-1 && Y > 0 && Y < height-1) {
		PrisonEscapeGrid = PrisonEscapeGrid.replaceAt(X + Y*(width+1), SetTo)
		if (VisitedRooms)
			VisitedRooms.push({x: X, y: Y})
		return true;
	}
	return false;
}

function PrisonEscapeMapGet(X, Y) {
	var height = PrisonEscapeGrid.split('\n').length
	var width = PrisonEscapeGrid.split('\n')[0].length
	
	return PrisonEscapeGrid[X + Y*(width+1)]
}

const canvasOffsetX = 500
const canvasOffsetY = 164

// Draw function for the game portion
function PrisonEscapeDrawGame() {
	MiniGamePrisonEscapeCheckpoint = 10*Math.floor(MiniGamePrisonEscapeLevel / 10)
		
	DrawText(TextGet("CurrentLevel") + MiniGamePrisonEscapeLevel, 1000, 72, "white", "silver");
	DrawText(TextGet("DungeonName" + PrisonEscapeMapIndex[MiniGamePrisonEscapeCheckpoint]), 1500, 72, "white", "silver");
	
	
	var movedirection = PrisonEscapeGetDirection(PrisonEscapePlayerEntity.x*PrisonEscapeGridSize + canvasOffsetX, PrisonEscapePlayerEntity.y*PrisonEscapeGridSize + canvasOffsetY)
	
	if (PrisonEscapeCanvas) {
		
		if (PrisonEscapeGrid_Last != PrisonEscapeGrid) {
			PrisonEscapeContext.fillStyle = "rgba(20,20,20.0,1.0)";
			PrisonEscapeContext.fillRect(0, 0, PrisonEscapeCanvas.width, PrisonEscapeCanvas.height);
			PrisonEscapeContext.fill()
			// Draw the grid
			var rows = PrisonEscapeGrid.split('\n')
			for (let R = 0; R < rows.length; R++)  {
				for (let X = 0; X < rows[R].length; X++)  {
					var sprite = "Floor"
					if (rows[R][X] == "1") sprite = "Wall"
					else if (rows[R][X] == "X") sprite = "Doodad"
						
					DrawImageZoomCanvas("Screens/Minigame/PrisonEscape/" + sprite + PrisonEscapeMapIndex[MiniGamePrisonEscapeCheckpoint] + ".png", PrisonEscapeContext, 0, 0, PrisonEscapeSpriteSize, PrisonEscapeSpriteSize, X*PrisonEscapeGridSize, R*PrisonEscapeGridSize, PrisonEscapeGridSize, PrisonEscapeGridSize, false)
				}
			}
			
			//PrisonEscapeGrid_Last = PrisonEscapeGrid
		}
		
		// Draw fog of war
		var rows = PrisonEscapeGrid.split('\n')
		for (let Y = 0; Y < rows.length; Y++)  {
			for (let X = 0; X < rows[Y].length; X++)  {
				var dist = Math.sqrt((X - PrisonEscapePlayerEntity.x) * (X - PrisonEscapePlayerEntity.x) + (Y - PrisonEscapePlayerEntity.y) * (Y - PrisonEscapePlayerEntity.y))
				
				PrisonEscapeContext.beginPath();
				PrisonEscapeContext.fillStyle = "rgba(0,0,0," + Math.max(0.0,1.0 - Math.min(1.0, 2*(PrisonEscapeMapBrightness - dist)/PrisonEscapeMapBrightness)) + ")";
				
				PrisonEscapeContext.fillRect(X*PrisonEscapeGridSize, Y*PrisonEscapeGridSize, PrisonEscapeGridSize, PrisonEscapeGridSize);
				PrisonEscapeContext.fill()
				

			}
		}
		
		// Draw targeting reticule
		if ((movedirection.x != 0 || movedirection.y != 0)) {
			PrisonEscapeContext.beginPath();
			PrisonEscapeContext.rect((movedirection.x + PrisonEscapePlayerEntity.x)*PrisonEscapeGridSize, (movedirection.y + PrisonEscapePlayerEntity.y)*PrisonEscapeGridSize, PrisonEscapeGridSize, PrisonEscapeGridSize);
			PrisonEscapeContext.lineWidth = 3;
			PrisonEscapeContext.strokeStyle = "#ff4444";
			PrisonEscapeContext.stroke()
		}
		MainCanvas.drawImage(PrisonEscapeCanvas, canvasOffsetX, canvasOffsetY);
		
	}
	
	CharacterSetFacialExpression(PrisonEscapePlayer, "Emoticon", null);
	
	// Draw the player no matter what
	PrisonEscapeContextPlayer.fillStyle = "rgba(0,0,0,1.0)";
	PrisonEscapeContextPlayer.fillRect(0, 0, PrisonEscapeCanvasPlayer.width, PrisonEscapeCanvasPlayer.height);
	PrisonEscapeContextPlayer.fill()
	DrawCharacter(PrisonEscapePlayer, -PrisonEscapeGridSize/2, 0, PrisonEscapeGridSize/250, false, PrisonEscapeContextPlayer)
	
	

	MainCanvas.drawImage(PrisonEscapeCanvasPlayer,  PrisonEscapePlayerEntity.x*PrisonEscapeGridSize + canvasOffsetX, PrisonEscapePlayerEntity.y*PrisonEscapeGridSize + canvasOffsetY); 
	 
}

// returns an object containing coordinates of which direction the player will move after a click, plus a time multiplier
function PrisonEscapeGetDirection(PX, PY) {
	const dx = MouseX - PX - PrisonEscapeGridSize / 2
	const dy = MouseY - PY - PrisonEscapeGridSize / 2
	
	var X = 0;
	var Y = 0;
	
	// Cardinal directions first - up down left right
	if (dy > 0 && Math.abs(dx) < Math.abs(dy)/2.61312593) Y = 1
	else if (dy < 0 && Math.abs(dx) < Math.abs(dy)/2.61312593) Y = -1
	else if (dx > 0 && Math.abs(dy) < Math.abs(dx)/2.61312593) X = 1
	else if (dx < 0 && Math.abs(dy) < Math.abs(dx)/2.61312593) X = -1
	
	// Diagonals
	else if (dy > 0 && dx > dy/2.61312593) {Y = 1; X = 1}
	else if (dy > 0 && -dx > dy/2.61312593) {Y = 1; X = -1}
	else if (dy < 0 && dx > -dy/2.61312593) {Y = -1; X = 1}
	else if (dy < 0 && -dx > -dy/2.61312593) {Y = -1; X = -1}
	
	return {x:X, y:Y, delta:Math.sqrt(X*X+Y*Y)}
}


// Click function for the game portion
function PrisonEscapeClickGame(Level) {
	// First we handle buttons
	
	
	// If no buttons are clicked then we handle move
	
	//{
		var movedirection = PrisonEscapeGetDirection(PrisonEscapePlayerEntity.x*PrisonEscapeGridSize + canvasOffsetX, PrisonEscapePlayerEntity.y*PrisonEscapeGridSize + canvasOffsetY)
		var moveX = movedirection.x + PrisonEscapePlayerEntity.x
		var moveY = movedirection.y + PrisonEscapePlayerEntity.y
		var moveObject = PrisonEscapeMapGet(moveX, moveY)
		if (moveObject == '0') { // If the player can move to an empy space
			PrisonEscapePlayerEntity.x = moveX
			PrisonEscapePlayerEntity.y = moveY
			PrisonEscapeAdvanceTime(movedirection.delta)
		}
	//}
}

function PrisonEscapeAdvanceTime(delta) {
	// Here we move enemies and such
}

