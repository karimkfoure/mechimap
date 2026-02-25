import { defaultCamera, presets, ratioMap } from "../core/constants.js";
import { hexToRgba } from "../core/helpers.js";
import { inputs } from "../core/inputs.js";
import { state } from "../core/state.js";
import { setInputValue, setStatus } from "../core/ui-state.js";
import { applyCafeStyles, updateCafeSource } from "./cafe-layers.js";
import {
  applyBaseLabelStyles,
  applyComponentColors,
  applyLayerVisibility,
  applyMapCanvasFilter
} from "./map-style.js";

const globalFilterInputKeys = ["mapBrightness", "mapContrast", "mapSaturation", "mapGrayscale", "mapHue"];
const componentStyleInputKeys = [
  "bgColor",
  "waterColor",
  "waterOpacity",
  "parkColor",
  "parkOpacity",
  "landuseColor",
  "landuseOpacity",
  "roadMajorColor",
  "roadMajorOpacity",
  "roadMinorColor",
  "roadMinorOpacity",
  "buildingColor",
  "buildingOpacity",
  "boundaryColor",
  "boundaryOpacity"
];
const baseLabelInputKeys = [
  "baseLabelColor",
  "baseLabelOpacity",
  "baseLabelHaloColor",
  "baseLabelHaloWidth",
  "baseLabelSizeScale",
  "baseLabelTransform"
];
const atmosphereInputKeys = [
  "tintColor",
  "tintOpacity",
  "vignetteOpacity",
  "grainOpacity",
  "frameColor",
  "frameWidth",
  "frameRadius",
  "frameShadow"
];
const presetManagedInputKeys = [
  ...new Set(
    Object.values(presets)
      .flatMap((preset) => Object.keys(preset))
      .filter((key) => Boolean(inputs[key]))
  )
];

function resetInputToDefault(element) {
  if (!element) {
    return;
  }

  if (element.tagName === "SELECT") {
    const defaultOption = [...element.options].find((option) => option.defaultSelected) || element.options[0];
    if (defaultOption) {
      element.value = defaultOption.value;
    }
    return;
  }

  if (element.type === "checkbox") {
    element.checked = element.defaultChecked;
    return;
  }

  element.value = element.defaultValue;
}

function resetInputsToDefaults(keys) {
  for (const key of keys) {
    resetInputToDefault(inputs[key]);
  }
}

export function applyAtmosphereStyles() {
  document.documentElement.style.setProperty("--tint-color", inputs.tintColor.value);
  document.documentElement.style.setProperty("--tint-opacity", String(Number(inputs.tintOpacity.value) / 100));
  document.documentElement.style.setProperty("--vignette-opacity", String(Number(inputs.vignetteOpacity.value) / 100));
  document.documentElement.style.setProperty("--grain-opacity", String(Number(inputs.grainOpacity.value) / 100));

  document.documentElement.style.setProperty("--frame-color", inputs.frameColor.value);
  document.documentElement.style.setProperty("--frame-width", `${inputs.frameWidth.value}px`);
  document.documentElement.style.setProperty("--frame-radius", `${inputs.frameRadius.value}px`);
  document.documentElement.style.setProperty("--frame-shadow", `${inputs.frameShadow.value}px`);
}

export function applyPosterStyles() {
  const showPoster = inputs.showPoster.checked;
  inputs.posterOverlay.classList.toggle("is-visible", showPoster);

  inputs.posterTitleNode.textContent = inputs.posterTitle.value.trim() || "Bike & Coffee Club";
  inputs.posterSubtitleNode.textContent = inputs.posterSubtitle.value.trim();
  inputs.posterOverlay.setAttribute("data-position", inputs.posterPosition.value);

  document.documentElement.style.setProperty("--poster-color", inputs.posterColor.value);
  document.documentElement.style.setProperty("--poster-size", `${inputs.posterSize.value}px`);
  document.documentElement.style.setProperty("--poster-subtitle-size", `${inputs.posterSubtitleSize.value}px`);
  document.documentElement.style.setProperty("--poster-padding", `${inputs.posterPadding.value}px`);

  const bg = hexToRgba(inputs.posterBgColor.value, Number(inputs.posterBgOpacity.value) / 100);
  document.documentElement.style.setProperty("--poster-bg", bg);
}

export function applyCanvasLayout() {
  const padding = Number(inputs.canvasPadding.value);
  document.documentElement.style.setProperty("--canvas-padding", `${padding}px`);

  const ratio = ratioMap[inputs.canvasRatio.value];
  if (!ratio) {
    inputs.mapFrame.style.width = "100%";
    inputs.mapFrame.style.height = "100%";
    state.map?.resize();
    return;
  }

  const bounds = inputs.mapWrap.getBoundingClientRect();
  const availableWidth = Math.max(bounds.width - padding * 2, 100);
  const availableHeight = Math.max(bounds.height - padding * 2, 100);

  let width = availableWidth;
  let height = width / ratio;

  if (height > availableHeight) {
    height = availableHeight;
    width = height * ratio;
  }

  inputs.mapFrame.style.width = `${Math.floor(width)}px`;
  inputs.mapFrame.style.height = `${Math.floor(height)}px`;
  state.map?.resize();
}

export function applyManualView() {
  if (!state.mapReady) {
    return;
  }

  const lat = Number(inputs.centerLat.value);
  const lng = Number(inputs.centerLng.value);
  const zoom = Number(inputs.zoomInput.value);
  const pitch = Number(inputs.pitchInput.value);
  const bearing = Number(inputs.bearingInput.value);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(zoom)) {
    setStatus("Lat/Lng/Zoom invalidos.");
    return;
  }

  state.map.jumpTo({
    center: [lng, lat],
    zoom,
    pitch,
    bearing
  });
}

export function resetCamera() {
  state.map.jumpTo({
    center: defaultCamera.center,
    zoom: defaultCamera.zoom,
    pitch: defaultCamera.pitch,
    bearing: defaultCamera.bearing
  });
  inputs.pitchInput.value = "0";
  inputs.bearingInput.value = "0";
}

export function applyAllStyleControls() {
  applyLayerVisibility();
  applyComponentColors();
  applyMapCanvasFilter();
  applyBaseLabelStyles();
  applyAtmosphereStyles();
  applyPosterStyles();
  applyCanvasLayout();
  applyCafeStyles();
}

export function applyPreset(presetName, switchBasemap) {
  const preset = presets[presetName];
  if (!preset) {
    return;
  }

  resetInputsToDefaults(presetManagedInputKeys);
  state.componentStyleOverridesEnabled = true;
  state.baseLabelStyleOverridesEnabled = true;

  for (const [key, value] of Object.entries(preset)) {
    if (inputs[key]) {
      setInputValue(inputs[key], value);
    }
  }

  if (preset.basemapSelect && preset.basemapSelect !== state.currentBasemap) {
    switchBasemap(preset.basemapSelect, { preserveStyleOverrides: true });
  } else {
    applyAllStyleControls();
    updateCafeSource(false);
  }

  setStatus(`Preset aplicado: ${presetName}.`);
}

export function resetGlobalFilters() {
  resetInputsToDefaults(globalFilterInputKeys);
  applyMapCanvasFilter();
}

export function resetStyleConflictsForBasemapSwitch() {
  resetInputsToDefaults(componentStyleInputKeys);
  resetInputsToDefaults(baseLabelInputKeys);
  resetInputsToDefaults(globalFilterInputKeys);
  resetInputsToDefaults(atmosphereInputKeys);
  state.componentStyleOverridesEnabled = false;
  state.baseLabelStyleOverridesEnabled = false;

  applyMapCanvasFilter();
  applyAtmosphereStyles();
}
