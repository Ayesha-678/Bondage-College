"use strict";
var InventorySocksRibbonOptions = [
	{
		Name: "Ankle",
		Property: { Type: null },
    },
    {
		Name: "Short",
		Property: { Type: "Short" },
    },
    {
		Name: "Medium",
		Property: { Type: "Medium" },
    },
    {
		Name: "High",
		Property: { Type: "High" },
	},
	{
		Name: "Full",
		Property: { Type: "Full" },
		
	},
	{
		Name: "Footless",
		Property: { Type: "Footless" },
		
	},

];

// Loads the item extension properties
function InventorySocksRibbonLoad() {
	ExtendedItemLoad(InventorySocksRibbonOptions, "SelectRibbonWrap");
}

// Draw the item extension screen
function InventorySocksRibbonDraw() {
	ExtendedItemDraw(InventorySocksRibbonOptions, "RibbonSockWrap", null, true, true);
}

// Catches the item extension clicks
function InventorySocksRibbonClick() {
	ExtendedItemClick(InventorySocksRibbonOptions, true);
}