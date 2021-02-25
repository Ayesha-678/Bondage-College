"use strict";

/**
 * Female3DCGExtended.js
 * ---------------------
 * This file contains definitions and configuration for extended items. Items which are marked as Extended in
 * `Female3DCG.js` and which have an extended item definition here will have their load/draw/click functions
 * _automatically_ created when assets are loaded, saving the need for an individual extended item script.
 *
 * Currently, only modular items are supported, but this will expand in the future.
 */

/**
 * An enum encapsulating the available extended item archetypes
 * MODULAR - Indicates that this item is modular, with several independently configurable modules
 * @enum {string}
 * @see {@link ModularItemConfig}
 */
const ExtendedArchetype = {
	MODULAR: "modular",
};

/**
 * An object containing all extended item configurations.
 * @const {ExtendedItemConfig}
 */
const AssetFemale3DCGExtended = {
	ItemArms: {
		HighSecurityStraitJacket: {
			Archetype: ExtendedArchetype.MODULAR,
			Config: {
				Modules: [
					{
						Name: "Crotch", Key: "c",
						Options: [
							{}, // c0 - No crotch panel
							{ // c1 - Crotch panel
								Property: {
									Difficulty: 1,
									Block: ["ItemPelvis", "ItemVulva", "ItemVulvaPiercings", "ItemButt"],
									Hide: ["ItemVulva", "ItemVulvaPiercings"],
									HideItem: ["ItemButtAnalBeads2"],
								},
							},
						],
					},
					{
						Name: "Arms", Key: "a",
						Options: [
							{}, // a0 - Arms loose
							{ Property: { Difficulty: 2 }, SelfBondageLevel: 8 }, // a1 - Arms in front
							{ Property: { Difficulty: 3 }, SelfBondageLevel: 8 }, // a2 - Arms behind
						],
					},
					{
						Name: "Straps", Key: "s",
						Options: [
							{}, // s0 - No crotch straps
							{ // s1 - One crotch strap
								Property: {
									Difficulty: 1,
									Block: ["ItemPelvis", "ItemVulva", "ItemVulvaPiercings", "ItemButt"],
									Hide: ["ItemVulvaPiercings"],
									HideItem: ["ItemButtAnalBeads2"],
								},
							},
							{ Property: { Difficulty: 2, Block: ["ItemPelvis"] } }, // s2 - Two crotch straps
							{ // s3 - Three crotch straps
								Property: {
									Difficulty: 2,
									Block: ["ItemPelvis", "ItemVulva", "ItemVulvaPiercings", "ItemButt"],
									Hide: ["ItemVulvaPiercings"],
									HideItem: ["ItemButtAnalBeads2"],
								},
							},
						],
					},
				],
			},
		}, // HighSecurityStraitJacket
		PrisonStraitJacket: {
			Archetype: ExtendedArchetype.MODULAR,
			Config: {
			Modules: [
				{
					Name: "Arms", Key: "a",
					Options: [
						{}, // a0 - Arms loose
						{ Property: { Difficulty: 2 }, SelfBondageLevel: 8 }, // a1 - Arms in front
						{ Property: { Difficulty: 3 }, SelfBondageLevel: 8 }, // a2 - Arms behind
						{ Property: { Difficulty: 3 }, SelfBondageLevel: 8 }, // a3 - Arms crossed down
						{ Property: { Difficulty: 3 }, SelfBondageLevel: 8 }, // a4 - Arms crossed up
						{ Property: { Difficulty: 3 }, SelfBondageLevel: 8 }, // a5 - Arms crossed down (behind back)
						{ Property: { Difficulty: 4 }, SelfBondageLevel: 8 }, // a6- Arms crossed up (behind back)
						{ Property: { Difficulty: 4 }, SelfBondageLevel: 8 }, // a7- Arm sheath 
						{ Property: { Difficulty: 4 }, SelfBondageLevel: 8 }, // a8- Arm sheath (behind back)





					],
				},
				{
					Name: "CrotchPanel", Key: "c",
					Options: [
						{}, // c0 - No crotch panel
						{ 	Property: {
							Difficulty: 1,
							Block: ["ItemPelvis", "ItemVulva", "ItemVulvaPiercings", "ItemButt"],
							Hide: ["ItemVulva", "ItemVulvaPiercings"],
							HideItem: ["ItemButtAnalBeads2"],
						},
					}, // a1 - Crotch panel




					],
				},
				{
					Name: "Shorts", Key: "s",
					Options: [
						{}, // s0 - No shorts
						{ 	Property: {
							Difficulty: 1,
							Block: ["ItemPelvis", "ItemVulva", "ItemVulvaPiercings", "ItemButt"],
							Hide: ["ItemVulva", "ItemVulvaPiercings"],
							HideItem: ["ItemButtAnalBeads2"],
						},
					}, // s1 - Shorts



					],
				},
				{
					Name: "ArmLoop", Key: "al",
					Options: [
						{}, // al0 - No arm loop
						{ Property: { Difficulty: 2 }, SelfBondageLevel: 8 }, // al1 - Middle arm loop
						{ Property: { Difficulty: 3 }, SelfBondageLevel: 8 }, // al2 - Low arm loop
						{ Property: { Difficulty: 3 }, SelfBondageLevel: 8 }, // al3 - High arm loop
						{ Property: { Difficulty: 3 }, SelfBondageLevel: 8 }, // al4 - Side arm loops
					




					],
				},
				{
					Name: "BodyStraps", Key: "b",
					Options: [
						{}, // b0 - No body straps
						{ Property: { Difficulty: 2 }, SelfBondageLevel: 8 }, // b1 - Basic body straps
						
					




					],
				},
				{
					Name: "CrotchStraps", Key: "d",
					Options: [
						{}, // d0 - No crotch straps
						{ Property: { Difficulty: 2 }, SelfBondageLevel: 8 }, // d1 - Single crotch strap
						
					




					],
				},
			]
		},
	}
	}, // ItemArms
	ItemHood: {
		KirugumiMask: {
			Archetype: ExtendedArchetype.MODULAR,
			Config: {
				ChatSetting: ModularItemChatSetting.PER_MODULE,
				Modules: [
					{
						Name: "Eyes", Key: "e",
						Options: [{}, {}, {}, {}], // All options are merely cosmetic
					},
					{
						Name: "Mouth", Key: "m",
						Options: [{}, {}, {}, {}], // All options are merely cosmetic,
					},
					{
						Name: "Blush", Key: "b",
						Options: [{}, {}, {}, {}], // All options are merely cosmetic,
					},
					{
						Name: "Brows", Key: "br",
						Options: [{}, {}, {}, {}], // All options are merely cosmetic,
					},
				],
			},
		}, // KirugumiMask
	}, // ItemHood
	ItemDevices: {
		Crib: {
			Archetype: ExtendedArchetype.MODULAR,
			Config: {
				Modules: [
					{
						Name: "Gate", Key: "g",
						Options: [
							{}, // g0 - Gate open
							{ Property: { Difficulty: 15 } }, // g1 - Gate closed
						],
					},
					{
						Name: "Plushies", Key: "p",
						Options: [
							{}, // p0 - No plushies
							{}, // p1 - Plushies
						],
					},
				],
			},
		}, // Crib
	}, // ItemDevices
};

/**
 *
 * An object containing the extended item definition for an asset.
 * @typedef ExtendedItemAssetConfig
 * @type {object}
 * @property {ExtendedArchetype} Archetype - The extended item archetype that this asset uses.
 * @property {ModularItemConfig} Config - The specific configuration for the item (type will vary based on the item's
 * archetype)
 *
 * An object containing extended item definitions for a group. Maps asset names within the group to their extended item
 * configuration
 * @typedef ExtendedItemGroupConfig
 * @type {object.<string, ExtendedItemAssetConfig>}
 * @see {@link ExtendedItemAssetConfig}
 *
 * An object containing extended item configurations keyed by group name.
 * @typedef ExtendedItemConfig
 * @type {object.<string, ExtendedItemGroupConfig>}
 * @see {@link ExtendedItemAssetConfig}
 */
