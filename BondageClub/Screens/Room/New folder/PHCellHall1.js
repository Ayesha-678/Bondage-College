"use strict";
var PHCellHall1Background = "OutsideCells";
var PHCellHall1Inmate1 = null;
var PHCellHall1Inmate2 = null;

function PHCellHall1Run() {
    DrawCharacter(Player, 750, 0, 1);
    DrawCharacter(PHCellHall1Inmate1, 250, 0, 1);
    if (Player.CanWalk()) DrawButton(1885, 25, 90, 90, "", "White", "Icons/Exit.png", TextGet("Leave"));

}


function PHCellHall1Click() {
    if (MouseIn(750, 0, 500, 1000)) CharacterSetCurrent(Player);
    if (MouseIn(1885, 25, 90, 90) && Player.CanWalk()) CommonSetScreen("Room", "PrisonHall");


}


function PHCellHall1Load() {

    if (!PHCellHall1Inmate1) {
        PHCellHall1Inmate1 =
        CharacterLoadNPC("NPC_PHCellHall1_Inmate1");
        InventoryRemove(PHCellHall1Inmate1, "ClothAccessory");
        InventoryWear(PHCellHall1Inmate1, "TShirt1", "Cloth", "#834D0F")
        InventoryWear(PHCellHall1Inmate1, "Pajama1", "ClothLower", "#834D0F")
        InventoryRemove(PHCellHall1Inmate1, "Shoes")
    }
}