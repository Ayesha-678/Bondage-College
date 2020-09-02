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
let ItemColorPickerBackup = null;
let ItemColorPickerIndices = [];
let ItemColorExitListeners = [];
let ItemColorBackup;

function ItemColorLoad(c, item) {
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
}

function ItemColorDraw(c, group, x, y, width, height) {
	const item = InventoryGet(c, group);
	if (!item) {
		return;
	}
	ItemColorStateBuild(c, item, x, y, width, height);

	const headerButtonSize = ItemColorConfig.headerButtonSize;
	DrawButton(ItemColorState.cancelButtonX, y, headerButtonSize, headerButtonSize, "", "#fff", "Icons/Cancel.png", TextGet("Cancel"));
	DrawButton(ItemColorState.saveButtonX, y, headerButtonSize, headerButtonSize, "", "#fff", "Icons/Accept.png", TextGet("Accept"));

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
		if (layerGroup.layers.length === 1) {
			const layer = layerGroup.layers[0];
			const layerColor = colors[layer.ColorIndex];
			const buttonColor = layerColor.startsWith("#") ? layerColor : "#fff";
			DrawButton(x, groupY, groupButtonWidth, buttonHeight, layer.Name || ItemColorItem.Asset.Description, "#fff");
			DrawButton(colorDisplayButtonX, groupY, colorDisplayWidth, buttonHeight, layerColor, buttonColor);
			DrawButton(colorPickerButtonX, groupY, colorPickerButtonWidth, buttonHeight, "", "#fff", "Icons/Color.png");
		} else {
			let currentColors;
			let layerText;
			const layerPage = ItemColorLayerPages[layerGroup.name];
			if (layerPage === 0) {
				currentColors = layerGroup.layers.map(layer => colors[layer.ColorIndex]);
				layerText = layerGroup.name + ": All";
			} else {
				const layer = layerGroup.layers[layerPage - 1];
				currentColors = colors[layer.ColorIndex];
				layerText = layerGroup.name + ": " + layer.Name;
			}
			let buttonColorText = ItemColorGetColorButtonText(currentColors);
			const buttonColor = buttonColorText.startsWith("#") ? buttonColorText : "#fff";
			DrawBackNextButton(x, groupY, groupButtonWidth, buttonHeight, layerText, "#fff", null, () => "Previous", () => "Next");
			DrawButton(colorDisplayButtonX, groupY, colorDisplayWidth, buttonHeight, buttonColorText, buttonColor);
			DrawButton(colorPickerButtonX, groupY, colorPickerButtonWidth, buttonHeight, "", "#fff", "Icons/Color.png");
		}
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

function ItemColorExit() {
	switch (ItemColorCurrentMode) {
		case ItemColorMode.COLOR_PICKER:
			return ItemColorPickerCancel();
		case ItemColorMode.DEFAULT:
		default:
			Object.assign(ItemColorItem, AppearanceItemParse(ItemColorBackup));
			CharacterLoadCanvas(ItemColorCharacter);
			ItemColorExitListeners.forEach(listener => listener());
	}
}

function ItemColorSaveClick() {
	switch (ItemColorCurrentMode) {
		case ItemColorMode.COLOR_PICKER:
			return ItemColorCloseColorPicker();
		case ItemColorMode.DEFAULT:
		default:
			return ItemColorExitListeners.forEach(listener => listener());
	}
}

function ItemColorPickerCancel() {
	Object.assign(ItemColorItem, AppearanceItemParse(ItemColorPickerBackup));
	CharacterLoadCanvas(ItemColorCharacter);
	ItemColorCloseColorPicker();
}

function ItemColorCloseColorPicker() {
	ElementRemove("InputColor");
	ColorPickerHide();
	ItemColorCurrentMode = ItemColorMode.DEFAULT;
}

function ItemColorGetColorIndices(layerGroup) {
	if (layerGroup.layers.length === 1) {
		return [layerGroup[0].ColorIndex];
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
	const groupMap = item.Asset.Layer
		.filter(layer => !layer.CopyLayerColor && layer.AllowColorize)
		.reduce((groupLookup, layer) => {
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

	let colors;
	if (Array.isArray(item.Color)) {
		colors = item.Color;
	} else {
		const colorStr = typeof item.Color === "string" ? item.Color : "Default";
		colors = [];
		for (let i = 0; i < item.Asset.ColorableLayerCount; i++) {
			colors.push(colorStr);
		}
	}

	const colorPickerButtonWidth = ItemColorConfig.colorPickerButtonWidth;
	const buttonSpacing = ItemColorConfig.buttonSpacing;
	const colorDisplayWidth = ItemColorConfig.colorDisplayWidth;
	const buttonHeight = ItemColorConfig.buttonSize;
	const headerButtonSize = ItemColorConfig.headerButtonSize;

	const cancelButtonX = x + width - 2 * headerButtonSize - buttonSpacing;
	const saveButtonX = x + width - headerButtonSize;
	const colorPickerButtonX = x + width - colorPickerButtonWidth;
	const colorDisplayButtonX = colorPickerButtonX - buttonSpacing - colorDisplayWidth;
	const contentY = y + ItemColorConfig.headerButtonSize + buttonSpacing;
	const groupButtonWidth = colorDisplayButtonX - buttonSpacing - x;
	const pageSize = Math.floor((height - headerButtonSize - buttonSpacing) / (buttonHeight + buttonSpacing));
	const colorInputWidth = Math.min(300, width - 3 * (headerButtonSize + buttonSpacing));
	const colorInputX = x + 0.5 * colorInputWidth;
	const colorInputY = y + 0.5 * headerButtonSize;

	ItemColorState = {
		layerGroups,
		colors,
		cancelButtonX,
		saveButtonX,
		colorPickerButtonX,
		colorDisplayButtonX,
		contentY,
		groupButtonWidth,
		pageSize,
		colorInputWidth,
		colorInputX,
		colorInputY,
	};
}

function ItemColorGetColorButtonText(color) {
	if (typeof color === "string") {
		return color;
	} else if (Array.isArray(color)) {
		const initialColor = color[0];
		return color.some(c => c !== initialColor) ? "Many" : initialColor;
	}
	return "Default";
}

function ItemColorOnExit(callback) {
	ItemColorExitListeners.push(callback);
}
