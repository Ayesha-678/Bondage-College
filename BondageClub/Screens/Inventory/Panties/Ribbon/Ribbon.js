"use strict";
var InventoryPantiesRibbonOptions = [
	{
		Name: "Thong",
		Property: { Type: null, },
    },
    {
		Name: "Panties",
		Property: { Type: "Panties", },
    },
    {
		Name: "Bikini",
		Property: { Type: "Bikini", },
    },
    {
		Name: "OpenCrotch",
		Property: { Type: "OpenCrotch", Expose: ["ItemVulva", "ItemVulvaPiercings", "ItemButt"] },
		
	},

];

// Loads the item extension properties
function InventoryPantiesRibbonLoad() {
	ExtendedItemLoad(InventoryPantiesRibbonOptions, "SelectRibbonWrap");
}

// Draw the item extension screen
function InventoryPantiesRibbonDraw() {
	ExtendedItemDraw(InventoryPantiesRibbonOptions, "RibbonPantiesWrap", null, true, true);
}

// Catches the item extension clicks
function InventoryPantiesRibbonClick() {
	ExtendedItemClick(InventoryPantiesRibbonOptions, true);
}