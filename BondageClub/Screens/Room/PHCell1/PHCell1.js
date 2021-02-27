"use strict";
var PHCell1Background = "Cell";

function PHCell1Run() {
    DrawCharacter(Player, 750, 0, 1);

}

function PHCell1Click() {
    if (MouseIn(750, 0, 500, 1000)) CharacterSetCurrent(Player);

}