"use strict";
var PrisonEscapeBackground = "BrickWall";
var PrisonEscapePlayer = null
var PrisonEscapeState = "Menu"

/**
 * Loads the kinky dungeon game
 * @returns {void} - Nothing
 */
function PrisonEscapeLoad() {
	//PrisonEscapeCreateMap(MiniGameDifficulty);
	var appearance = CharacterAppearanceStringify(Player)
	CharacterAppearanceRestore(PrisonEscapePlayer, appearance)
	CharacterReleaseTotal(PrisonEscapePlayer)
	CharacterNaked(PrisonEscapePlayer)
	InventoryWear(PrisonEscapePlayer, "WitchHat1", "Hat")
	InventoryWear(PrisonEscapePlayer, "Dress3", "Cloth")
	InventoryWear(PrisonEscapePlayer, "Socks4", "Socks")
	InventoryWear(PrisonEscapePlayer, "Heels3", "Shoes")
	
	
	CharacterAppearanceSetColorForGroup(PrisonEscapePlayer, "#444444", "Socks");
	CharacterAppearanceSetColorForGroup(PrisonEscapePlayer, "#222222", "Shoes");
	
	PrisonEscapeState = "Menu"
}

/**
 * Runs the kinky dungeon game and draws its components on screen
 * @returns {void} - Nothing
 */
function PrisonEscapeRun() {

	// Draw the characters
	DrawCharacter(PrisonEscapePlayer, 0, 0, 1);


	
	DrawButton(1885, 25, 90, 90, "", "White", "Icons/Exit.png");
	
	if (PrisonEscapeState == "Menu") {
		// Draw temp start screen
		DrawText(TextGet("Intro"), 1250, 400, "white", "silver");
		DrawText(TextGet("Intro2"), 1250, 500, "white", "silver");
		DrawText(TextGet("Intro3"), 1250, 600, "white", "silver");
		DrawButton(1075, 750, 350, 64, TextGet("GameStart"), "White", "");
	} else if (PrisonEscapeState == "Game") {
		PrisonEscapeDrawGame();
	}

}

/**
 * Handles clicks during the kinky dungeon game
 * @returns {void} - Nothing
 */
function PrisonEscapeClick() {
	if (MouseIn(1885, 25, 90, 90) && Player.CanWalk()) {
		PrisonEscapeExit()
	}
	if (PrisonEscapeState == "Menu") {
		if (MouseIn(1075, 750, 350, 64)) {
			PrisonEscapeInitialize(1)
			PrisonEscapeState = "Game"
		}
	} else if (PrisonEscapeState == "Game") {
		PrisonEscapeClickGame();
	}
}

/**
 * Handles exit during the kinky dungeon game
 * @returns {void} - Nothing
 */
function PrisonEscapeExit() {
	CommonDynamicFunction(MiniGameReturnFunction + "()");
}