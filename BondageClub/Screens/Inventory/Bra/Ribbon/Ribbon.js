"use strict";
var InventoryBraRibbonOptions = [
	{
		Name: "SingleStrip",
		Property: { Type: null, Hide: ["ItemNipples", "ItemNipplesPiercings"] },
	},
	{
		Name: "TightSingleStrip",
		Property: { Type: "TightSingleStrip", Hide: ["ItemNipples", "ItemNipplesPiercings"] },

	},
	{
		Name: "Bra",
		Property: { Type: "Bra", Hide: ["ItemNipples", "ItemNipplesPiercings"] },

	},
	{
		Name: "Bikini",
		Property: { Type: "Bikini", Hide: ["ItemNipples", "ItemNipplesPiercings"] },

	},
	{
		Name: "StraplessBra",
		Property: { Type: "StraplessBra", Hide: ["ItemNipples", "ItemNipplesPiercings"] },

	},
	{
		Name: "Swimsuit1",
		Property: { Type: "Swimsuit1", Hide: ["ItemNipples", "ItemNipplesPiercings", "ItemVulva", "ItemVulvaPeircings", "ItemButt"] },

	},
	{
		Name: "Swimsuit2",
		Property: { Type: "Swimsuit2", Hide: ["ItemNipples", "ItemNipplesPiercings", "ItemVulva", "ItemVulvaPeircings", "ItemButt"] },

	},
	{
		Name: "FrameBra",
		Property: { Type: "FrameBra", Expose: ["ItemNipples", "ItemNipplesPiercings", "ItemBreast"] },
		

	},
];

// Loads the item extension properties
function InventoryBraRibbonLoad() {
	ExtendedItemLoad(InventoryBraRibbonOptions, "SelectRibbonWrap");
}

// Draw the item extension screen
function InventoryBraRibbonDraw() {
	ExtendedItemDraw(InventoryBraRibbonOptions, "RibbonBraWrap", null, true, true);
}

// Catches the item extension clicks
function InventoryBraRibbonClick() {
	ExtendedItemClick(InventoryBraRibbonOptions, true);
}