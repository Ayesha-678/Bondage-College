"use strict";
var PHWardenOfficeBackground = "WardenOffice";
var PHWardenOfficeDrawer = null;

function PHWardenOfficeRun() {
    DrawCharacter(Player, 750, 0, 1);
    if (Player.CanWalk()) DrawButton(1885, 25, 90, 90, "", "White", "Icons/Exit.png", TextGet("Leave"));

}

function PHWardenOfficeClick() {
    if (MouseIn(750, 0, 500, 1000)) CharacterSetCurrent(Player);
    if (MouseIn(1885, 25, 90, 90) && Player.CanWalk()) CommonSetScreen("Room", "PrisonHall");


}

function PHWardenOfficeLoad() {

}
