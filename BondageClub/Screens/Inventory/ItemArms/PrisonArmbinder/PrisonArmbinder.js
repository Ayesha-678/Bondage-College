"use strict";

var InventoryItemArmsPrisonArmbinderOptions = [
	{
		Name: "Straps",
		Property: { Type: null, Difficulty: 0 },
	},
	{
        Name: "CrossStraps",
        Prerequisite: ["HasExtraStraps"],
		Property: { Type: "CrossStraps", Difficulty: 3 },
	},
	{
        Name: "RingStraps",
        Prerequisite: ["HasExtraStraps"],
		Property: { Type: "RingStraps", Difficulty: 3 },
    },	
    {
        Name: "SecurityStraps",
        Prerequisite: ["HasExtraStraps"],
		Property: { Type: "SecurityStraps", Difficulty: 4 },
	},	
];

// Loads the item extension properties
function InventoryItemArmsPrisonArmbinderLoad() {
	ExtendedItemLoad(InventoryItemArmsPrisonArmbinderOptions, "SelectStrapType");
}

// Draw the item extension screen
function InventoryItemArmsPrisonArmbinderDraw() {
	ExtendedItemDraw(InventoryItemArmsPrisonArmbinderOptions, "PrisonArmbinderType");
}

// Catches the item extension clicks
function InventoryItemArmsPrisonArmbinderClick() {
	ExtendedItemClick(InventoryItemArmsPrisonArmbinderOptions);
}

function InventoryItemArmsPrisonArmbinderPublishAction(C, Option) {
	var msg = "PrisonArmbinderSet" + Option.Name;
	var Dictionary = [
		{ Tag: "SourceCharacter", Text: Player.Name, MemberNumber: Player.MemberNumber },
		{ Tag: "DestinationCharacter", Text: C.Name, MemberNumber: C.MemberNumber },
	];
	ChatRoomPublishCustomAction(msg, true, Dictionary);
}

function InventoryItemArmsPrisonArmbinderNpcDialog(C, Option) {
	C.CurrentDialog = DialogFind(C, "PrisonArmbinderSet" + Option.Name, "ItemArms");
}
