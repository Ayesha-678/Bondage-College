"use strict";
var InventoryBraRibbonOptions = [
	{
		Name: "SingleStrip",
		Property: { Type: null },
	},
	{
		Name: "TightSingleStrip",
		Property: { Type: "TightSingleStrip" },

	},
	{
		Name: "Bra",
		Property: { Type: "Bra" },

	},
	{
		Name: "StraplessBra",
		Property: { Type: "StraplessBra" },

	},
	{
		Name: "Swimsuit1",
		Property: { Type: "Swimsuit1" },

	},
];

// Loads the item extension properties
function InventoryBraRibbonLoad() {
	ExtendedItemLoad(InventoryBraRibbonOptions, "SelectRibbonWrap");
}

// Draw the item extension screen
function InventoryBraRibbonDraw() {
	ExtendedItemDraw(InventoryBraRibbonOptions, "ClothPriorityType", null, true, true);
}

// Catches the item extension clicks
function InventoryBraRibbonClick() {
	ExtendedItemClick(InventoryBraRibbonOptions, true);
}