"use strict";

const ItemColorConfig = {
	buttonSpacing: 26,
	buttonSize: 65,
	headerButtonSize: 90,
	colorPickerButtonWidth: 65,
	colorDisplayWidth: 160,
	colorInputHeight: 45,
};

const ItemColorMode = {
	DEFAULT: "Default",
	COLOR_PICKER: "ColorPicker",
};

let ItemColorCharacter;
let ItemColorItem;
let ItemColorCurrentMode = ItemColorMode.DEFAULT;
let ItemColorStateKey;
let ItemColorState;
let ItemColorPage;
let ItemColorLayerPages = {};
let ItemColorPickerBackup;
let ItemColorPickerIndices = [];
let ItemColorExitListeners = [];
let ItemColorBackup;
let ItemColorText = new TextCache("Screens/Character/ItemColor/ItemColor.csv");
let ItemColorLayerNames;
let ItemColorGroupNames;

function ItemColorLoad(c, item, x, y, width, height) {
	ItemColorCharacter = c;
	ItemColorItem = item;
	ItemColorCurrentMode = ItemColorMode.DEFAULT;
	ItemColorStateKey = null;
	ItemColorState = null;
	ItemColorPage = 0;
	ItemColorLayerPages = {};
	ItemColorPickerBackup = null;
	ItemColorPickerIndices = [];
	ItemColorExitListeners = [];
	ItemColorBackup = AppearanceItemStringify(item);
	ItemColorStateBuild(c, item, x, y, width, height);
	if (ItemColorState.simpleMode) {
		ItemColorOpenPicker(ItemColorState.layerGroups[0]);
	}
	ItemColorLayerNames = new TextCache(`Assets/${c.AssetFamily}/LayerNames.csv`);
	ItemColorGroupNames = new TextCache(`Assets/${c.AssetFamily}/ColorGroups.csv`);
}

function ItemColorDraw(c, group, x, y, width, height) {
	const item = InventoryGet(c, group);
	if (!item) {
		return;
	}
	ItemColorStateBuild(c, item, x, y, width, height);

	const headerButtonSize = ItemColorConfig.headerButtonSize;
	if (ItemColorCurrentMode === ItemColorMode.DEFAULT && ItemColorState.pageCount > 1) {
		DrawButton(ItemColorState.paginationButtonX, y, headerButtonSize, headerButtonSize, "", "#fff", "Icons/Next.png", ItemColorText.get("Next"));
	}
	DrawButton(
		ItemColorState.cancelButtonX, y, headerButtonSize, headerButtonSize, "", "#fff", "Icons/Cancel.png",
		ItemColorText.get("Cancel"),
	);
	DrawButton(
		ItemColorState.saveButtonX, y, headerButtonSize, headerButtonSize, "", "#fff", "Icons/Accept.png",
		ItemColorText.get("Accept"),
	);

	const contentY = ItemColorState.contentY;

	switch (ItemColorCurrentMode) {
		case ItemColorMode.COLOR_PICKER:
			ElementPosition(
				"InputColor",
				ItemColorState.colorInputX,
				ItemColorState.colorInputY,
				ItemColorState.colorInputWidth,
				ItemColorConfig.colorInputHeight,
			);
			return ColorPickerDraw(
				x, contentY, width, y + height - contentY, document.getElementById("InputColor"), ItemColorOnPickerChange);
		default:
			return ItemColorDrawDefault(x, contentY);
	}
}

function ItemColorDrawDefault(x, y) {
	const colorPickerButtonWidth = ItemColorConfig.colorPickerButtonWidth;
	const buttonSpacing = ItemColorConfig.buttonSpacing;
	const colorDisplayWidth = ItemColorConfig.colorDisplayWidth;
	const buttonHeight = ItemColorConfig.buttonSize;
	const colorPickerButtonX = ItemColorState.colorPickerButtonX;
	const colorDisplayButtonX = ItemColorState.colorDisplayButtonX;
	const groupButtonWidth = ItemColorState.groupButtonWidth;
	const pageStart = ItemColorPage * ItemColorState.pageSize;
	const layerGroups = ItemColorState.layerGroups.slice(pageStart, pageStart + ItemColorState.pageSize);
	const colors = ItemColorState.colors;

	layerGroups.forEach((layerGroup, i) => {
		const groupY = y + (i * (buttonHeight + buttonSpacing));
		const asset = ItemColorItem.Asset;
		let groupName, buttonText, buttonColor;
		let isBackNextButton = false;
		if (layerGroup.name === null) {
			groupName = ItemColorText.get("WholeItem");
			buttonText = ItemColorGetColorButtonText(colors);
			buttonColor = buttonText.startsWith("#") ? buttonText : "#fff";
		} else if (layerGroup.layers.length === 1) {
			groupName = ItemColorLayerNames.get(asset.Group.Name + asset.Name + layerGroup.name);
			buttonText = colors[layerGroup.layers[0].ColorIndex];
			buttonColor = buttonText.startsWith("#") ? buttonText : "#fff";
		} else {
			let currentColors;
			const layerPage = ItemColorLayerPages[layerGroup.name];
			const layerGroupName = ItemColorGroupNames.get(layerGroup.name);
			if (layerPage === 0) {
				currentColors = layerGroup.layers.map(layer => colors[layer.ColorIndex]);
				groupName = layerGroupName + ": " + ItemColorText.get("All");
			} else {
				const layer = layerGroup.layers[layerPage - 1];
				currentColors = colors[layer.ColorIndex];
				groupName = layerGroupName + ": " + ItemColorLayerNames.get(asset.Group.Name + asset.Name + layer.Name);
			}
			buttonText = ItemColorGetColorButtonText(currentColors);
			buttonColor = buttonText.startsWith("#") ? buttonText : "#fff";
			isBackNextButton = true;
		}
		if (isBackNextButton) {
			DrawBackNextButton(x, groupY, groupButtonWidth, buttonHeight, groupName, "#fff", null, () => "Previous", () => "Next");
		} else {
			DrawButton(x, groupY, groupButtonWidth, buttonHeight, groupName, "#fff");
		}
		DrawButton(colorDisplayButtonX, groupY, colorDisplayWidth, buttonHeight, buttonText, buttonColor);
		DrawButton(colorPickerButtonX, groupY, colorPickerButtonWidth, buttonHeight, "", "#fff", "Icons/Color.png");
	});
}

const ItemColorOnPickerChange = CommonDebounce((color) => {
	const newColors = ItemColorState.colors.slice();
	ItemColorPickerIndices.forEach(i => newColors[i] = color);
	ItemColorItem.Color = newColors;
	CharacterLoadCanvas(ItemColorCharacter);
});

function ItemColorClick(c, group, x, y, width, height) {
	const item = InventoryGet(c, group);
	if (!item) {
		return;
	}
	ItemColorStateBuild(c, item, x, y, width, height);

	const headerButtonSize = ItemColorConfig.headerButtonSize;

	if (MouseIn(ItemColorState.cancelButtonX, y, headerButtonSize, headerButtonSize)) {
		return ItemColorExit();
	}

	if (MouseIn(ItemColorState.saveButtonX, y, headerButtonSize, headerButtonSize)) {
		return ItemColorSaveClick();
	}

	if (
		ItemColorCurrentMode === ItemColorMode.DEFAULT &&
		ItemColorState.pageCount > 1 &&
		MouseIn(ItemColorState.paginationButtonX, y, headerButtonSize, headerButtonSize)
	) {
		return ItemColorPaginationClick();
	}

	if (ItemColorCurrentMode === ItemColorMode.DEFAULT) {
		return ItemColorClickDefault(x, ItemColorState.contentY, width);
	}
}

function ItemColorClickDefault(x, y, width) {
	const pageStart = ItemColorPage * ItemColorState.pageSize;
	const layerGroups = ItemColorState.layerGroups.slice(pageStart, pageStart + ItemColorState.pageSize);
	const colorPickerButtonWidth = ItemColorConfig.colorPickerButtonWidth;
	const colorDisplayWidth = ItemColorConfig.colorDisplayWidth;
	const colorPickerButtonX = ItemColorState.colorPickerButtonX;
	const colorDisplayButtonX = ItemColorState.colorDisplayButtonX;
	const groupButtonWidth = ItemColorState.groupButtonWidth;
	const buttonHeight = ItemColorConfig.buttonSize;
	const rowHeight = buttonHeight + ItemColorConfig.buttonSpacing;
	const clickZoneHeight = layerGroups.length * (rowHeight);

	if (!MouseIn(x, y, width, clickZoneHeight)) {
		return;
	}

	layerGroups.some((layerGroup, i) => {
		if (MouseYIn(y + i * rowHeight, buttonHeight)) {
			if (MouseXIn(colorPickerButtonX, colorPickerButtonWidth)) {
				// Color picker button
				ItemColorOpenPicker(layerGroup);
			} else if (MouseXIn(colorDisplayButtonX, colorDisplayWidth)) {
				// Cycle through the color schema
				ItemColorNextColor(layerGroup);
			} else if (layerGroup.layers.length > 1) {
				if (MouseXIn(x, groupButtonWidth / 2)) {
					// Previous layer button
					ItemColorPreviousLayer(layerGroup);
				} else if (MouseXIn(x + groupButtonWidth / 2, x + groupButtonWidth)) {
					// Next layer button
					ItemColorNextLayer(layerGroup);
				}
			}
			return true;
		}
	});
}

function ItemColorPaginationClick() {
	ItemColorPage = (ItemColorPage + 1) % ItemColorState.pageCount;
}

function ItemColorExit() {
	switch (ItemColorCurrentMode) {
		case ItemColorMode.COLOR_PICKER:
			return ItemColorPickerCancel();
		case ItemColorMode.DEFAULT:
		default:
			Object.assign(ItemColorItem, AppearanceItemParse(ItemColorBackup));
			CharacterLoadCanvas(ItemColorCharacter);
			ItemColorFireExit(false);
	}
}

function ItemColorSaveClick() {
	switch (ItemColorCurrentMode) {
		case ItemColorMode.COLOR_PICKER:
			return ItemColorCloseColorPicker(true);
		case ItemColorMode.DEFAULT:
		default:
			ItemColorFireExit(true);
	}
}

function ItemColorPickerCancel() {
	Object.assign(ItemColorItem, AppearanceItemParse(ItemColorPickerBackup));
	CharacterLoadCanvas(ItemColorCharacter);
	ItemColorCloseColorPicker(false);
}

function ItemColorCloseColorPicker(save) {
	ElementRemove("InputColor");
	ColorPickerHide();
	if (ItemColorState.simpleMode) {
		ItemColorFireExit(save);
	} else {
		ItemColorCurrentMode = ItemColorMode.DEFAULT;
	}
}

function ItemColorGetColorIndices(layerGroup) {
	if (layerGroup.name === null) {
		return ItemColorState.colors.map((c, i) => i);
	} else if (layerGroup.layers.length === 1) {
		return [layerGroup.layers[0].ColorIndex];
	} else {
		const layerPage = ItemColorLayerPages[layerGroup.name];
		if (layerPage === 0) {
			return layerGroup.layers.map(layer => layer.ColorIndex);
		} else if (layerPage <= layerGroup.layers.length) {
			return [layerGroup.layers[layerPage - 1].ColorIndex];
		}
	}
	return [];
}

function ItemColorOpenPicker(layerGroup) {
	ItemColorCurrentMode = ItemColorMode.COLOR_PICKER;
	ItemColorPickerBackup = AppearanceItemStringify(ItemColorItem);
	ItemColorPickerIndices = ItemColorGetColorIndices(layerGroup);
	const groupColors = ItemColorState.colors.filter((c, i) => ItemColorPickerIndices.includes(i));
	const colorText = ItemColorGetColorButtonText(groupColors);
	ElementCreateInput("InputColor", "text", colorText.startsWith("#") ? colorText : "#", "7");
}

function ItemColorNextColor(layerGroup) {
	const colorIndicesToSet = ItemColorGetColorIndices(layerGroup);
	const groupColors = ItemColorState.colors.filter((c, i) => colorIndicesToSet.includes(i));
	const colorText = ItemColorGetColorButtonText(groupColors);
	const schema = ItemColorItem.Asset.Group.ColorSchema;
	const nextIndex = (schema.indexOf(colorText) + 1) % schema.length;
	const nextColor = schema[nextIndex];
	const newColors = ItemColorState.colors.slice();
	colorIndicesToSet.forEach(i => newColors[i] = nextColor);
	ItemColorItem.Color = newColors;
	CharacterLoadCanvas(ItemColorCharacter);
}

function ItemColorNextLayer(layerGroup) {
	const currentPage = ItemColorLayerPages[layerGroup.name];
	ItemColorLayerPages[layerGroup.name] = (currentPage + 1) % (layerGroup.layers.length + 1);
}

function ItemColorPreviousLayer(layerGroup) {
	const currentPage = ItemColorLayerPages[layerGroup.name];
	const totalPages = layerGroup.layers.length + 1;
	ItemColorLayerPages[layerGroup.name] = (currentPage + totalPages - 1) % totalPages;
}

function ItemColorStateBuild(c, item, x, y, width, height) {
	ItemColorCharacter = c;
	ItemColorItem = item;
	const itemKey = AppearanceItemStringify({ item, x, y, width, height });
	if (ItemColorState && ItemColorStateKey === itemKey) {
		return;
	}

	ItemColorStateKey = itemKey;
	const colorableLayers = item.Asset.Layer.filter(layer => !layer.CopyLayerColor && layer.AllowColorize);
	const groupMap = colorableLayers.reduce((groupLookup, layer) => {
		const groupKey = layer.ColorGroup || layer.Name;
		(groupLookup[groupKey] || (groupLookup[groupKey] = [])).push(layer);
		return groupLookup;
	}, {});

	const layerGroups = Object.keys(groupMap)
		.map(key => {
			ItemColorLayerPages[key] = ItemColorLayerPages[key] || 0;
			return {
				name: key,
				layers: groupMap[key],
				colorIndex: groupMap[key].reduce((min, layer) => Math.min(min, layer.ColorIndex), Infinity),
			};
		})
		.sort((g1, g2) => g1.colorIndex = g2.colorIndex);
	layerGroups.unshift({ name: null, layers: [], colorIndex: -1 });

	let colors;
	if (Array.isArray(item.Color)) {
		colors = item.Color;
		for (let i = colors.length; i < item.Asset.ColorableLayerCount; i++) {
			colors.push("Default");
		}
	} else {
		const colorStr = typeof item.Color === "string" ? item.Color : "Default";
		colors = [];
		for (let i = 0; i < item.Asset.ColorableLayerCount; i++) {
			colors.push(colorStr);
		}
	}

	const simpleMode = colorableLayers.length === 1;

	const colorPickerButtonWidth = ItemColorConfig.colorPickerButtonWidth;
	const buttonSpacing = ItemColorConfig.buttonSpacing;
	const colorDisplayWidth = ItemColorConfig.colorDisplayWidth;
	const buttonHeight = ItemColorConfig.buttonSize;
	const headerButtonSize = ItemColorConfig.headerButtonSize;

	const paginationButtonX = x + width - 3 * headerButtonSize - 2 * buttonSpacing;
	const cancelButtonX = x + width - 2 * headerButtonSize - buttonSpacing;
	const saveButtonX = x + width - headerButtonSize;
	const colorPickerButtonX = x + width - colorPickerButtonWidth;
	const colorDisplayButtonX = colorPickerButtonX - buttonSpacing - colorDisplayWidth;
	const contentY = y + ItemColorConfig.headerButtonSize + buttonSpacing;
	const groupButtonWidth = colorDisplayButtonX - buttonSpacing - x;
	const pageSize = Math.floor((height - headerButtonSize - buttonSpacing) / (buttonHeight + buttonSpacing));
	const pageCount = Math.ceil(layerGroups.length / pageSize);
	const colorInputWidth = Math.min(300, width - 3 * (headerButtonSize + buttonSpacing));
	const colorInputX = x + 0.5 * colorInputWidth;
	const colorInputY = y + 0.5 * headerButtonSize;

	ItemColorState = {
		layerGroups,
		colors,
		simpleMode,
		paginationButtonX,
		cancelButtonX,
		saveButtonX,
		colorPickerButtonX,
		colorDisplayButtonX,
		contentY,
		groupButtonWidth,
		pageSize,
		pageCount,
		colorInputWidth,
		colorInputX,
		colorInputY,
	};
}

function ItemColorGetColorButtonText(color) {
	let text = color;
	if (Array.isArray(color)) {
		const initialColor = color[0];
		text = color.some(c => c !== initialColor) ? "Many" : initialColor;
	} else if (typeof color !== "string") {
		text = "Default";
	}
	return ItemColorText.get(text);
}

function ItemColorOnExit(callback) {
	ItemColorExitListeners.push(callback);
}

function ItemColorFireExit(save) {
	ItemColorExitListeners.forEach(listener => listener(ItemColorCharacter, ItemColorItem, save));
	ItemColorLayerNames = null;
	ItemColorGroupNames = null;
}
