"use strict";
var PHWardenOfficeBackground = "WardenOffice";
var PHWardenOfficeDrawer = null;
var PHWardenOfficeHaveNote = false;
var PHWardenOfficeSecretDrawerDiscovered = false;

function PHWardenOfficeRun() {
    DrawCharacter(Player, 750, 0, 1);
    DrawImage("Screens/Room/PHWardenOffice/Drawer.png", 100,30)
    if (Player.CanWalk()) DrawButton(1885, 25, 90, 90, "", "White", "Icons/Exit.png", TextGet("Leave"));

}

function PHWardenOfficeClick() {
    if (MouseIn(750, 0, 500, 1000)) CharacterSetCurrent(Player);
    if (MouseIn(100, 400, 500, 600)) CharacterSetCurrent(PHWardenOfficeDrawer);
    if (MouseIn(1885, 25, 90, 90) && Player.CanWalk()) CommonSetScreen("Room", "PrisonHall");


}

function PHWardenOfficeLoad() {
    if (!PHWardenOfficeDrawer) {
        PHWardenOfficeDrawer =
        CharacterLoadNPC("NPC_PHWardenOffice_Drawer");
        PHWardenOfficeDrawer.FixedImage = "Screens/Room/PHWardenOffice/Drawer.png";
        PHWardenOfficeDrawer.AllowItem = false;
    }

}

function PHWardenOfficeGivePlayerHighSecHandcuffs() {
    InventoryAdd(Player, "HighSecurityHandCuffs", "ItemArms");
}

function PHWardenOfficeGivePlayerWardenOutfit(){
    InventoryAdd(Player, "WardenOutfit", "Cloth")
}

function PHWardenOfficeGivePlayerPrisonBinder(){
    InventoryAdd(Player, "PrisonArmbinder", "ItemArms")
}

function PHWardenOfficeGetNote() {
    PHWardenOfficeHaveNote = true;
}

function PHWardenOfficeDiscoverSecretDrawer() {
    PHWardenOfficeSecretDrawerDiscovered = true;
}
