import { inputs } from "../core/inputs.js";
import { state } from "../core/state.js";
import { cloneValue, scaleTextSizeValue } from "../core/helpers.js";

export function classifyMapLayers() {
  const groups = {
    background: new Set(),
    water: new Set(),
    parks: new Set(),
    landuse: new Set(),
    roadsMajor: new Set(),
    roadsMinor: new Set(),
    buildings: new Set(),
    boundaries: new Set(),
    labelsRoad: new Set(),
    labelsPlace: new Set(),
    labelsPoi: new Set(),
    labelsWater: new Set()
  };

  const style = state.map.getStyle();
  const layers = style?.layers || [];

  for (const layer of layers) {
    if (!layer || layer.id.startsWith("cafes-")) {
      continue;
    }

    const id = layer.id.toLowerCase();
    const type = layer.type;
    const sourceLayer = String(layer["source-layer"] || "").toLowerCase();

    if (type === "background") {
      groups.background.add(layer.id);
      continue;
    }

    const isWater = id.includes("water") || sourceLayer.includes("water");
    const isPark =
      id.includes("park") || id.includes("landcover") || id.includes("grass") || id.includes("wood") || sourceLayer === "park";
    const isLanduse = id.includes("landuse") || sourceLayer === "landuse";
    const isBuilding = id.includes("building") || sourceLayer === "building";
    const isBoundary = id.includes("boundary") || sourceLayer === "boundary";

    const isRoadLike =
      type === "line" &&
      (id.includes("road") ||
        id.includes("highway") ||
        id.includes("motorway") ||
        id.includes("trunk") ||
        sourceLayer.includes("transportation"));

    if (isWater && (type === "fill" || type === "line")) {
      groups.water.add(layer.id);
    }

    if (isPark && type === "fill") {
      groups.parks.add(layer.id);
    }

    if (isLanduse && type === "fill") {
      groups.landuse.add(layer.id);
    }

    if (isBuilding && (type === "fill" || type === "line")) {
      groups.buildings.add(layer.id);
    }

    if (isBoundary && type === "line") {
      groups.boundaries.add(layer.id);
    }

    if (isRoadLike) {
      const isMajor = /(motorway|trunk|primary|secondary|tertiary|major)/.test(id);
      if (isMajor) {
        groups.roadsMajor.add(layer.id);
      } else {
        groups.roadsMinor.add(layer.id);
      }
    }

    if (type === "symbol") {
      if (id.includes("highway-name") || id.includes("road_shield") || id.includes("road_oneway")) {
        groups.labelsRoad.add(layer.id);
      } else if (id.includes("water_name") || id.includes("waterway")) {
        groups.labelsWater.add(layer.id);
      } else if (id.includes("poi") || id.includes("airport") || id.includes("transit")) {
        groups.labelsPoi.add(layer.id);
      } else if (
        id.includes("label_") ||
        id.includes("place") ||
        id.includes("city") ||
        id.includes("town") ||
        id.includes("village") ||
        id.includes("country") ||
        id.includes("state")
      ) {
        groups.labelsPlace.add(layer.id);
      }
    }
  }

  state.layerGroups = Object.fromEntries(
    Object.entries(groups).map(([key, value]) => [key, [...value]])
  );
}

export function captureBaseLabelSizes() {
  state.baseLabelSizes.clear();
  const ids = [
    ...state.layerGroups.labelsRoad,
    ...state.layerGroups.labelsPlace,
    ...state.layerGroups.labelsPoi,
    ...state.layerGroups.labelsWater
  ];

  for (const id of ids) {
    const textSize = state.map.getLayoutProperty(id, "text-size");
    if (textSize != null) {
      state.baseLabelSizes.set(id, cloneValue(textSize));
    }
  }
}

export function safeSetPaint(id, property, value) {
  try {
    state.map.setPaintProperty(id, property, value);
  } catch {
    // ignore layers without that paint property
  }
}

export function safeSetLayout(id, property, value) {
  try {
    state.map.setLayoutProperty(id, property, value);
  } catch {
    // ignore layers without that layout property
  }
}

function setGroupVisibility(groupKey, isVisible) {
  const ids = state.layerGroups[groupKey] || [];
  for (const id of ids) {
    safeSetLayout(id, "visibility", isVisible ? "visible" : "none");
  }
}

export function applyLayerVisibility() {
  if (!state.styleReady) {
    return;
  }

  setGroupVisibility("water", inputs.showWater.checked);
  setGroupVisibility("parks", inputs.showParks.checked);
  setGroupVisibility("landuse", inputs.showLanduse.checked);
  setGroupVisibility("roadsMajor", inputs.showRoadsMajor.checked);
  setGroupVisibility("roadsMinor", inputs.showRoadsMinor.checked);
  setGroupVisibility("buildings", inputs.showBuildings.checked);
  setGroupVisibility("boundaries", inputs.showBoundaries.checked);
  setGroupVisibility("labelsRoad", inputs.showRoadLabels.checked);
  setGroupVisibility("labelsPlace", inputs.showPlaceLabels.checked);
  setGroupVisibility("labelsPoi", inputs.showPoiLabels.checked);
  setGroupVisibility("labelsWater", inputs.showWaterLabels.checked);
}

export function applyComponentColors() {
  if (!state.styleReady) {
    return;
  }

  for (const id of state.layerGroups.background) {
    safeSetPaint(id, "background-color", inputs.bgColor.value);
  }

  for (const id of state.layerGroups.water) {
    const layer = state.map.getLayer(id);
    if (!layer) {
      continue;
    }

    if (layer.type === "fill") {
      safeSetPaint(id, "fill-color", inputs.waterColor.value);
      safeSetPaint(id, "fill-opacity", Number(inputs.waterOpacity.value) / 100);
    }

    if (layer.type === "line") {
      safeSetPaint(id, "line-color", inputs.waterColor.value);
      safeSetPaint(id, "line-opacity", Number(inputs.waterOpacity.value) / 100);
    }
  }

  for (const id of state.layerGroups.parks) {
    safeSetPaint(id, "fill-color", inputs.parkColor.value);
    safeSetPaint(id, "fill-opacity", Number(inputs.parkOpacity.value) / 100);
  }

  for (const id of state.layerGroups.landuse) {
    safeSetPaint(id, "fill-color", inputs.landuseColor.value);
    safeSetPaint(id, "fill-opacity", Number(inputs.landuseOpacity.value) / 100);
  }

  for (const id of state.layerGroups.roadsMajor) {
    safeSetPaint(id, "line-color", inputs.roadMajorColor.value);
    safeSetPaint(id, "line-opacity", Number(inputs.roadMajorOpacity.value) / 100);
  }

  for (const id of state.layerGroups.roadsMinor) {
    safeSetPaint(id, "line-color", inputs.roadMinorColor.value);
    safeSetPaint(id, "line-opacity", Number(inputs.roadMinorOpacity.value) / 100);
  }

  for (const id of state.layerGroups.buildings) {
    safeSetPaint(id, "fill-color", inputs.buildingColor.value);
    safeSetPaint(id, "fill-opacity", Number(inputs.buildingOpacity.value) / 100);
    safeSetPaint(id, "line-color", inputs.buildingColor.value);
    safeSetPaint(id, "line-opacity", Number(inputs.buildingOpacity.value) / 100);
  }

  for (const id of state.layerGroups.boundaries) {
    safeSetPaint(id, "line-color", inputs.boundaryColor.value);
    safeSetPaint(id, "line-opacity", Number(inputs.boundaryOpacity.value) / 100);
  }
}

export function applyMapCanvasFilter() {
  const filter = [
    `brightness(${inputs.mapBrightness.value}%)`,
    `contrast(${inputs.mapContrast.value}%)`,
    `saturate(${inputs.mapSaturation.value}%)`,
    `grayscale(${inputs.mapGrayscale.value}%)`,
    `hue-rotate(${inputs.mapHue.value}deg)`
  ].join(" ");

  document.documentElement.style.setProperty("--map-filter", filter);
}

export function applyBaseLabelStyles() {
  if (!state.styleReady) {
    return;
  }

  const ids = [
    ...state.layerGroups.labelsRoad,
    ...state.layerGroups.labelsPlace,
    ...state.layerGroups.labelsPoi,
    ...state.layerGroups.labelsWater
  ];

  const labelOpacity = Number(inputs.baseLabelOpacity.value) / 100;
  const haloWidth = Number(inputs.baseLabelHaloWidth.value);
  const scale = Number(inputs.baseLabelSizeScale.value) / 100;

  for (const id of ids) {
    safeSetPaint(id, "text-color", inputs.baseLabelColor.value);
    safeSetPaint(id, "text-opacity", labelOpacity);
    safeSetPaint(id, "text-halo-color", inputs.baseLabelHaloColor.value);
    safeSetPaint(id, "text-halo-width", haloWidth);
    safeSetLayout(id, "text-transform", inputs.baseLabelTransform.value);

    if (state.baseLabelSizes.has(id)) {
      const base = cloneValue(state.baseLabelSizes.get(id));
      const scaled = scaleTextSizeValue(base, scale);
      if (scaled != null) {
        safeSetLayout(id, "text-size", scaled);
      }
    }
  }
}
