"use strict";
var PrisonHallBackground = "PrisonHall";
var PrisonHallHeadWarden = null;
var PrisonHallDisplayPrisoner = null;
var PrisonHallWardenAccess = false;
var PrisonHallInmateAccess = false;
var PrisonHallTouristAccess = false;
var PrisonHallCanLeave = true;

function PrisonHallRun() {
    DrawCharacter(Player, 250, 0, 1);
    DrawCharacter(PrisonHallHeadWarden, 750, 0, 1);
    DrawCharacter(PrisonHallDisplayPrisoner, 1350, 0, 1);
    if (Player.CanWalk() && PrisonHallCanLeave == true )  DrawButton(1885, 25, 90, 90, "", "White", "Icons/Exit.png", TextGet("Leave"));
    if (Player.CanWalk() && PrisonHallWardenAccess == true) DrawButton(1885, 145, 90, 90, "", "White", "Icons/Exit.png", TextGet("WardenOffice"));

}

function PrisonHallClick() {
    if (MouseIn(250, 0, 500, 1000)) CharacterSetCurrent(Player);
    if (MouseIn(750, 0, 500, 1000)) CharacterSetCurrent(PrisonHallHeadWarden);
    if (MouseIn(1350, 0, 500, 1000)) CharacterSetCurrent(PrisonHallDisplayPrisoner);
    if (MouseIn(1885, 25, 90, 90) && Player.CanWalk() && PrisonHallCanLeave == true) CommonSetScreen("Room", "MainHall");
    if (MouseIn(1885, 145, 90, 90) && Player.CanWalk() && PrisonHallWardenAccess == true) CommonSetScreen("Room", "PHWardenOffice");
}



    function PrisonHallLoad() {
        
        if (!PrisonHallHeadWarden) {
            PrisonHallHeadWarden =
            CharacterLoadNPC("NPC_PrisonHall_HeadWarden");
            InventoryWear(PrisonHallHeadWarden, "LeatherCropTop", "Cloth", "#6256D7");        
            InventoryRemove(PrisonHallHeadWarden, "ClothAccessory");     
            InventoryWear(PrisonHallHeadWarden, "Jeans1", "ClothLower");
            InventoryWear(PrisonHallHeadWarden, "PoliceWomanHat", "Hat");
            InventoryWear(PrisonHallHeadWarden, "SpankingToys", "ItemHands"); 
            PrisonHallHeadWarden.AllowItem = false;
                     

        }
        if (!PrisonHallDisplayPrisoner) {
            PrisonHallDisplayPrisoner =
            CharacterLoadNPC("NPC_PrisonHall_DisplayPrisoner");
            InventoryRemove(PrisonHallDisplayPrisoner, "Cloth");      
            InventoryRemove(PrisonHallDisplayPrisoner, "ClothLower"); 
            InventoryRemove(PrisonHallDisplayPrisoner, "Bra");      
            InventoryRemove(PrisonHallDisplayPrisoner, "Panties"); 
            InventoryRemove(PrisonHallDisplayPrisoner, "Shoes"); 
            InventoryRemove(PrisonHallDisplayPrisoner, "Socks"); 
            InventoryRemove(PrisonHallDisplayPrisoner, "Hat");  
            InventoryRemove(PrisonHallDisplayPrisoner, "ClothAccessory");      
            InventoryWear(PrisonHallDisplayPrisoner, "LeatherCollar", "ItemNeck"); 
            InventoryWear(PrisonHallDisplayPrisoner, "CollarChainMedium", "ItemNeckRestraints"); 
        }
    }

function PrisonHallWardenAccessGet() {
    PrisonHallWardenAccess = true
    PrisonHallCanLeave = false
}

function PrisonHallInmateAccessGet() {
    PrisonHallInmateAccess = true
    PrisonHallCanLeave = false
}

function PrisonHallTouristAccessGet() {
    PrisonHallTouristAccess = true
    PrisonHallCanLeave = false
}

function PrisonHallAccessRemove() {
    PrisonHallWardenAccess = false
    PrisonHallInmateAccess = false
    PrisonHallTouristAccess = false
    PrisonHallCanLeave = true
}

function PrisonHallInmateOrTourist() {
    return PrisonHallInmateAccess || PrisonHallTouristAccess;
}

function PrisonHallInmateOrWarden() {
    return PrisonHallInmateAccess || PrisonHallWardenAccess;
}

function PrisonHallWardenOrTourist() {
    return PrisonHallWardenAccess || PrisonHallTouristAccess;
}

