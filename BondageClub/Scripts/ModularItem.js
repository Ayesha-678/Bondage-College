"use strict";

/**
 * ModularItem.js
 * --------------
 * This file contains utilities related to modular extended items (for example the High Security Straitjacket). It is
 * generally not necessary to call functions in this file directly - these are called from Asset.js when an item is
 * first registered.
 *
 * A modular item is a typed item, but each type may be comprised of several independent "modules". For example, the
 * High Security Straitjacket has 3 different modules: crotch panel (c), arms (a), and crotch straps (s), and each
 * module can be configured independently. The resulting type then uses an abbreviated format which represents the
 * module values comprising that type. Each module contains a number of options that may be chosen for that module.
 *
 * For example "c0a1s2" - represents the type where the crotch panel module uses option 0, the arms module uses option
 * 1, and the crotch straps module uses option 2. The properties of the type will be derived from a combination of the
 * properties of each of the type's module options. For example, difficulty will be calculated by adding the base
 * difficulty of the item together with the sum of the difficulties for each of its module options.
 */

/**
 * The keyword used for the base menu on modular items
 * @const {string}
 */
const ModularItemBase = "Base";

/**
 * A lookup for the modular item configurations for each registered modular item
 * @const {object.<string, ModularItemData>>}
 * @see {@link ModularItemData}
 */
const ModularItemDataLookup = {};

/**
 * An enum encapsulating the possible chatroom message settings for modular items
 * - PER_MODULE - The item has one chatroom message per module (messages for individual options within a module are all
 * the same)
 * - PER_OPTION - The item has one chatroom message per option (for finer granularity - each individual option within a
 * module can have its own chatroom message)
 * @enum {string}
 */
const ModularItemChatSetting = {
	PER_MODULE: "perModule",
	PER_OPTION: "perOption",
};

/**
 * Registers a modular extended item. This automatically creates the item's load, draw and click functions. It will
 * also generate the asset's AllowType array, as AllowType arrays on modular items can get long due to the
 * multiplicative nature of the item's types.
 * @param {Asset} asset - The asset being registered
 * @param {ModularItemConfig} config - The item's modular item configuration
 * @returns {void} - Nothing
 */
function ModularItemRegister(asset, config) {
	const data = ModularItemCreateModularData(asset, config);
	ModularItemCreateLoadFunction(data);
	ModularItemCreateDrawFunction(data);
	ModularItemCreateClickFunction(data);
	ModularItemGenerateAllowType(asset, data);
}

/**
 * Creates an asset's extended item load function
 * @param {ModularItemData} data - The modular item data for the asset
 * @returns {void} - Nothing
 */
function ModularItemCreateLoadFunction(data) {
	const loadFunctionName = `${data.functionPrefix}Load`;
	window[loadFunctionName] = function () {
		if (!DialogFocusItem.Property) {
			const C = CharacterGetCurrent();
			const currentModuleValues = ModularItemParseCurrent(data);
			DialogFocusItem.Property = ModularItemMergeModuleValues(data, currentModuleValues);
			CharacterRefresh(C);
			ChatRoomCharacterItemUpdate(C, data.asset.Group.Name);
		}
		DialogExtendedMessage = DialogFindPlayer(`${data.dialogSelectPrefix}${ModularItemBase}`);
	};
}

/**
 * Creates an asset's extended item draw function
 * @param {ModularItemData} data - The modular item data for the asset
 * @returns {void} - Nothing
 */
function ModularItemCreateDrawFunction(data) {
	const drawFunctionName = `${data.functionPrefix}Draw`;
	window[drawFunctionName] = function () {
		const currentModule = data.currentModule || ModularItemBase;
		const drawFunction = data.drawFunctions[currentModule];
		return drawFunction();
	};
}

/**
 * Creates an asset's extended item click function
 * @param {ModularItemData} data - The modular item data for the asset
 * @returns {void} - Nothing
 */
function ModularItemCreateClickFunction(data) {
	const clickFunctionName = `${data.functionPrefix}Click`;
	window[clickFunctionName] = function () {
		const currentModule = data.currentModule || ModularItemBase;
		const clickFunction = data.clickFunctions[currentModule];
		return clickFunction();
	};
}

/**
 * Generates an asset's extended item click function
 * @param {Asset} asset - The asset to generate modular item data for
 * @param {ModularItemConfig} config - The item's extended item configuration
 * @returns {ModularItemData} - The generated modular item data for the asset
 */
function ModularItemCreateModularData(asset, { Modules, ChatSetting }) {
	const key = `${asset.Group.Name}${asset.Name}`;
	const data = ModularItemDataLookup[key] = {
		asset,
		chatSetting: ChatSetting || ModularItemChatSetting.PER_OPTION,
		key,
		functionPrefix: `Inventory${key}`,
		dialogSelectPrefix: `${key}Select`,
		dialogModulePrefix: `${key}Module`,
		dialogOptionPrefix: `${key}Option`,
		chatMessagePrefix: `${key}Set`,
		modules: Modules,
		currentModule: ModularItemBase,
		pages: {
			[ModularItemBase]: 0,
		},
	};
	data.drawFunctions = { [ModularItemBase]: ModularItemCreateDrawBaseFunction(data) };
	data.clickFunctions = { [ModularItemBase]: ModularItemCreateClickBaseFunction(data) };
	Modules.forEach(module => {
		data.pages[module.Name] = 0;
		data.drawFunctions[module.Name] = () => ModularItemDrawModule(module, data);
		data.clickFunctions[module.Name] = () => ModularItemClickModule(module, data);
	});
	return data;
}

/**
 * Creates a modular item's base draw function (for the module selection screen)
 * @param {ModularItemData} data - The modular item data for the asset
 * @returns {void} - Nothing
 */
function ModularItemCreateDrawBaseFunction(data) {
	return () => {
		const currentModuleValues = ModularItemParseCurrent(data);
		const buttonDefinitions = data.modules.map((module, i) => ([
			`${AssetGetInventoryPath(data.asset)}/${module.Key}${currentModuleValues[i]}.png`,
			`${data.dialogModulePrefix}${module.Name}`,
		]));
		return ModularItemDrawCommon(buttonDefinitions, data);
	};
}

/**
 * Maps a modular item option to a button definition for rendering the option's button.
 * @param {ModularItemOption} option - The option to draw a button for
 * @param {number} i - The option's index within its parent module
 * @param {ModularItemModule} module - A reference to the option's parent module
 * @param {ModularItemData} data - The modular item's data
 * @returns {ModularItemButtonDefinition} - A button definition array representing the provided option
 */
function ModularItemMapOptionToButtonDefinition(option, i, module, { asset, dialogOptionPrefix }) {
	const C = CharacterGetCurrent();
	const failLockCheck = DialogFocusItem.Property.LockedBy && !DialogCanUnlock(C, DialogFocusItem);
	const failSkillCheck = option.SelfBondage && C.ID === 0 && SkillGetLevelReal(C, "SelfBondage") < option.SelfBondage;
	const optionName = `${module.Key}${i}`;
	return [
		`${AssetGetInventoryPath(asset)}/${optionName}.png`,
		`${dialogOptionPrefix}${optionName}`,
		(failLockCheck || failSkillCheck) ? "#ffc0cb" : "#fff",
	];
}

/**
 * Draws a module screen from the provided button definitions and modular item data.
 * @param {ModularItemButtonDefinition[]} buttonDefinitions - A list of button definitions to draw
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemDrawCommon(buttonDefinitions, { asset }) {
	DrawAssetPreview(1387, 55, asset);
	DrawText(DialogExtendedMessage, 1500, 375, "#fff", "808080");

	buttonDefinitions.forEach((buttonDefinition, i) => {
		var x = 1200 + (i % 2 * 387);
		var y = 450 + (Math.floor(i / 2) * 300);
		DrawPreviewBox(x, y, buttonDefinition[0], "", { Background: buttonDefinition[2], Hover: true });
		DrawText(DialogFindPlayer(buttonDefinition[1]), x + 113, y - 20, "#fff", "#808080");
	});
}

/**
 * Draws the extended item screen for a given module.
 * @param {ModularItemModule} module - The module whose screen to draw
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemDrawModule(module, data) {
	const buttonDefinitions = module.Options.map((option, i) => ModularItemMapOptionToButtonDefinition(option, i, module, data));
	ModularItemDrawCommon(buttonDefinitions, data);
}

/**
 * Generates a click function for a modular item's module selection screen
 * @param {ModularItemData} data - The modular item's data
 * @returns {function(): void} - A click handler for the modular item's module selection screen
 */
function ModularItemCreateClickBaseFunction(data) {
	return () => {
		ModularItemClickCommon(
			() => DialogFocusItem = null,
			i => {
				const module = data.modules[i];
				if (module) ModularItemModuleTransition(module.Name, data);
			},
		);
	};
}

/**
 * A generic click handler for a module's screen
 * @param {ModularItemModule} module - The module whose screen we are currently in
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemClickModule(module, data) {
	ModularItemClickCommon(
		() => ModularItemModuleTransition(ModularItemBase, data),
		i => {
			const selected = module.Options[i];
			if (selected) ModularItemSetType(module, i, data);
		},
	);
}

/**
 * A common click handler for modular item screens. Note that pagination is not currently handled, but will be added
 * in the future.
 * @param {function(): void} exitCallback - A callback to be called when the exit button has been clicked
 * @param {function(): void} itemCallback - A callback to be called when an item has been clicked
 * @returns {void} - Nothing
 */
function ModularItemClickCommon(exitCallback, itemCallback) {
	// Exit button
	if (MouseIn(1885, 25, 90, 90)) {
		return exitCallback();
	}

	for (let i = 0; i < 4; i++) {
		var x = 1200 + (i % 2 * 387);
		var y = 450 + (Math.floor(i / 2) * 300);
		if (MouseIn(x, y, 225, 225)) {
			return itemCallback(i);
		}
	}
}

/**
 * Transitions between pages within a modular item's extended item menu
 * @param {string} newModule - The name of the new module to transition to
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemModuleTransition(newModule, data) {
	data.currentModule = newModule;
	DialogExtendedMessage = DialogFindPlayer(data.dialogSelectPrefix + newModule);
}

function ModularItemParseCurrent({ asset, modules }) {
	const type = (DialogFocusItem.Property && DialogFocusItem.Property.Type) || ModularItemConstructType(modules);
	return modules.map(module => {
		const index = type.indexOf(module.Key);
		if (index !== -1) {
			const match = type.substring(index + module.Key.length).match(/^\d+/);
			if (match) {
				return Number(match[0]);
			}
		}
		console.warn(`[${asset.Group.Name}:${asset.Name}] Module ${module.Key} not found in type "${type}"`);
		return 0;
	});
}

/**
 * Merges all of the selected module options for a modular item into a single Property object to set on the item
 * @param {ModularItemData} data - The modular item's data
 * @param {number[]} moduleValues - The numeric values representing the current options for each module
 * @returns {object} - A property object created from combining each module of the modular item
 */
function ModularItemMergeModuleValues({ asset, modules }, moduleValues) {
	const options = modules.map((module, i) => module.Options[moduleValues[i] || 0]);
	return options.reduce((property, componentProperty) => {
		property.Difficulty += (componentProperty.Difficulty || 0);
		if (componentProperty.Block) ModularItemAddToArray(property.Block, componentProperty.Block);
		if (componentProperty.Hide) ModularItemAddToArray(property.Hide, componentProperty.Hide);
		if (componentProperty.HideItem) ModularItemAddToArray(property.HideItem, componentProperty.HideItem);
		return property;
	}, {
		Type: ModularItemConstructType(modules, moduleValues),
		Difficulty: asset.Difficulty,
		Block: asset.Block || [],
		Hide: asset.Hide || [],
		HideItem: asset.HideItem || [],
	});
}

/**
 * Generates the type string for a modular item from its modules and their current values.
 * @param {ModularItemModule[]} modules - The modules array for the modular item
 * @param {number[]} values - The numeric values representing the current options for each module
 * @returns {string} - A string type generated from the selected option values for each module
 */
function ModularItemConstructType(modules, values) {
	values = values || [];
	let type = "";
	modules.forEach((module, i) => {
		type += module.Key;
		type += (values[i] || 0);
	});
	return type;
}

/**
 * Sets a modular item's type based on a change in a module's option selection.
 * @param {ModularItemModule} module - The module that changed
 * @param {number} index - The index of the newly chosen option within the module
 * @param {ModularItemData} data - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemSetType(module, index, data) {
	const C = CharacterGetCurrent();
	DialogFocusItem = InventoryGet(C, C.FocusGroup.Name);
	const option = module.Options[index];

	// Lock check - cannot change type if you can't unlock the item
	if (DialogFocusItem.Property.LockedBy && !DialogCanUnlock(C, DialogFocusItem)) {
		DialogExtendedMessage = DialogFindPlayer("CantChangeWhileLocked");
		return;
	}

	// Self bondage requirement check
	if (option.SelfBondage && C.ID === 0 && SkillGetLevelReal(C, "SelfBondage") < option.SelfBondage) {
		DialogExtendedMessage = DialogFindPlayer("RequireSelfBondage" + option.SelfBondage);
		return;
	}

	const currentModuleValues = ModularItemParseCurrent(data);
	const moduleIndex = data.modules.indexOf(module);
	let changed = false;
	const newModuleValues = currentModuleValues.map((value, i) => {
		if (i === moduleIndex && index !== value) {
			changed = true;
			return index;
		}
		return value;
	});

	if (changed) {
		const groupName = data.asset.Group.Name;
		Object.assign(DialogFocusItem.Property, ModularItemMergeModuleValues(data, newModuleValues));
		CharacterRefresh(C);
		ChatRoomCharacterItemUpdate(C, groupName);

		if (ServerPlayerIsInChatRoom()) {
			ModularItemChatRoomMessage(module, index, data);
		} else if (C.ID === 0) {
			DialogMenuButtonBuild(C);
		} else {
			C.CurrentDialog = DialogFind(C, data.key + DialogFocusItem.Property.Type, groupName);
		}
	}

	ModularItemModuleTransition(ModularItemBase, data);
}

/**
 * Publishes the chatroom message for a modular item when one of its modules has changed.
 * @param {ModularItemModule} module - The module that changed
 * @param {number} index - The index of the newly chosen option within the module
 * @param {ModularItemData} - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemChatRoomMessage(module, index, { chatSetting, chatMessagePrefix }) {
	const C = CharacterGetCurrent();
	let msg = chatMessagePrefix;
	switch (chatSetting) {
		case ModularItemChatSetting.PER_OPTION:
			msg += `${module.Key}${index}`;
			break;
		case ModularItemChatSetting.PER_MODULE:
			msg += module.Name;
			break;
	}
	var dictionary = [
		{ Tag: "SourceCharacter", Text: Player.Name, MemberNumber: Player.MemberNumber },
		{ Tag: "DestinationCharacter", Text: C.Name, MemberNumber: C.MemberNumber },
	];
	ChatRoomPublishCustomAction(msg, false, dictionary);
}

function ModularItemAddToArray(dest, src) {
	src.forEach(item => {
		if (!dest.includes(item)) dest.push(item);
	});
}

/**
 * Generates and sets the AllowType property on an asset based on its modular item data.
 * @param {Asset} asset - The asset to modify
 * @param {ModularItemData} - The modular item's data
 * @returns {void} - Nothing
 */
function ModularItemGenerateAllowType(asset, { modules }) {
	let allowType = [""];
	modules.forEach((module) => {
		let newAllowType = [];
		module.Options.forEach((option, i) => {
			const newTypes = allowType.map(type => `${type}${module.Key}${i}`);
			newAllowType = newAllowType.concat(newTypes);
		});
		allowType = newAllowType;
	});
	asset.AllowType = allowType;
}

/**
 * An object defining all of the required configuration for registering a modular item
 * @typedef ModularItemConfig
 * @type {object}
 * @property {ModularItemModule[]} Modules - The module definitions for the item
 * @property {ModularItemChatSetting} ChatSetting - The item's chatroom message setting. Determines the level of
 * granularity for chatroom messages when the item's module values change.
 *
 * An object describing a single module for a modular item.
 * @typedef ModularItemModule
 * @type {object}
 * @property {string} Name - The name of this module - this is usually a human-readable string describing what the
 * module represents (e.g. Straps). It is used for display text keys, and should be unique across all of the modules
 * for the item.
 * @property {string} Key - The unique key for this module - this is used as a prefix to designate option names. Each
 * options in the module will be named with the module's key, followed by the index of the option within the module's
 * Options array
 * @property {ModularItemOption[]} Options - The list of option definitions that can be chosen within this module.
 *
 * An object describing a single option within a module for a modular item.
 * @typedef ModularItemOption
 * @type {object}
 * @property {number} [Difficulty] - The additional difficulty associated with this option - defaults to 0
 * @property {number} [SelfBondage] - The self bondage level required to select this option if using it on oneself -
 * defaults to 0
 * @property {string[]} [Block] - A list of groups that this option blocks - defaults to []
 * @property {string[]} [Hide] - A list of groups that this option hides - defaults to []
 * @property {string[]} [HideItem] - A list of items that this option hides
 *
 * An object containing modular item configuration for an asset. Contains all of the necessary information for the
 * item's load, draw & click handlers.
 * @typedef ModularItemData
 * @type {object}
 * @property {Asset} asset - A reference to the asset that this configuration is tied to
 * @property {ModularItemChatSetting} chatSetting - The item's chatroom message setting. Determines the level of
 * granularity for chatroom messages when the item's module values change.
 * @property {string} key - The identifying key for the asset, in the format "<GroupName><AssetName>"
 * @property {string} dialogSelectPrefix - The dialogue prefix for the player prompt that is displayed on each module's
 * menu screen
 * @property {string} dialogModulePrefix - The dialogue prefix for the name of each module
 * @property {string} dialogOptionPrefix - The dialogue prefix for the name of each option
 * @property {string} chatMessagePrefix - The dialogue prefix that will be used for each of the item's chatroom
 * messages
 * @property {ModularItemModule[]} modules - The module definitions for the modular item
 * @property {object.<string, number>} pages - A lookup for the current page in the extended item menu for each of the
 * item's modules
 * @property {object.<string, function>} drawFunctions - A lookup for the draw functions for each of the item's modules
 * @property {object.<string, function>} clickFunctions - A lookup for the click functions for each of the item's
 * modules
 *
 * A 3-tuple (or 2-tuple) containing data for drawing a button in a modular item screen. A button definition takes the
 * format:
 * ```
 * [imageUrl, textKey, background]
 * ```
 * The imageUrl is the URL for the image that should be drawn in the button.
 * The textKey is the CSV key for the text that should be displayed in the button.
 * The background is an optional CSS color string defining the background color for the button.
 * @typedef ModularItemButtonDefinition
 * @type {string[]}
 */
