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
		Name: "Panties2",
		Property: { Type: "Panties2", },
    },
    {
		Name: "Panties3",
        Property: { Type: "Panties", },
	},

];

// Loads the item extension properties
function InventoryPantiesRibbonLoad() {
	ExtendedItemLoad(InventoryPantiesRibbonOptions, "SelectRibbonWrap");
}

// Draw the item extension screen
function InventoryPantiesRibbonDraw() {
	ExtendedItemDraw(InventoryPantiesRibbonOptions, "RibbonWrap", null, true, true);
}

// Catches the item extension clicks
function InventoryPantiesRibbonClick() {
	ExtendedItemClick(InventoryPantiesRibbonOptions, true);
}