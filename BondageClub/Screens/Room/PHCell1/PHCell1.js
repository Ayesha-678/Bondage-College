"use strict";
var PHCell1Background = "Cell";
var PHCell1Vent = null;

function PHCell1Run() {
    DrawCharacter(Player, 750, 0, 1);
    DrawImage("Screens/Room/PHCell1/Vent.png", 50,-600)


}

function PHCell1Click() {
    if (MouseIn(750, 0, 500, 1000)) CharacterSetCurrent(Player);
    if (MouseIn(50, 400, 500, 600)) CharacterSetCurrent(PHCell1Vent);


}

function PHCell1Load() {
    if (!PHCell1Vent) {
        PHCell1Vent =
        CharacterLoadNPC("NPC_PHCell1_Vent");
        PHCell1Vent.FixedImage = "Screens/Room/PHCell1/Vent.png";
        PHCell1Vent.AllowItem = false;
    }
}