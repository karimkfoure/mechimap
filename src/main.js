import { defaultMyMapsUrl, styleUrls } from "./core/constants.js";
import { inputs } from "./core/inputs.js";
import { state } from "./core/state.js";
import { setLoading } from "./core/ui-state.js";
import { ensureCafeLayers, updateCafeSource } from "./modules/cafe-layers.js";
import { loadDefaultMapData } from "./modules/data-source.js";
import { bindEvents } from "./modules/events.js";
import {
  applyBaseLabelStyles,
  applyComponentColors,
  applyLayerVisibility,
  applyMapCanvasFilter,
  captureBaseLabelSizes,
  classifyMapLayers
} from "./modules/map-style.js";
import { initMap } from "./modules/map-init.js";
import {
  applyAllStyleControls,
  applyAtmosphereStyles,
  applyCanvasLayout,
  applyPosterStyles,
  applyPreset
} from "./modules/studio-ui.js";

let styleSwitchTimeoutId = null;
let pendingBasemapKey = null;
let styleReadyCheckId = null;

function clearStyleSwitchTimeout() {
  if (styleSwitchTimeoutId) {
    clearTimeout(styleSwitchTimeoutId);
    styleSwitchTimeoutId = null;
  }
}

function clearStyleReadyCheck() {
  if (styleReadyCheckId) {
    clearInterval(styleReadyCheckId);
    styleReadyCheckId = null;
  }
}

function finishStyleSwitch() {
  if (!state.styleSwitching) {
    return;
  }

  state.styleSwitching = false;
  clearStyleSwitchTimeout();
  clearStyleReadyCheck();
  setLoading(false);
}

function scheduleStyleSwitchFailsafe() {
  clearStyleSwitchTimeout();
  styleSwitchTimeoutId = setTimeout(() => {
    finishStyleSwitch();
  }, 15000);
}

function scheduleStyleReadyCheck() {
  clearStyleReadyCheck();
  styleReadyCheckId = setInterval(() => {
    if (!state.map || state.styleReady) {
      return;
    }
    if (!state.map.isStyleLoaded()) {
      return;
    }
    onStyleReady();
  }, 120);
}

function startQueuedBasemapSwitch() {
  if (!pendingBasemapKey || !state.map) {
    return;
  }

  const styleKey = pendingBasemapKey;
  pendingBasemapKey = null;
  state.styleReady = false;

  if (!state.styleSwitching) {
    state.styleSwitching = true;
    setLoading(true, "Cambiando estilo base...");
  }

  scheduleStyleSwitchFailsafe();
  state.map.setStyle(styleUrls[styleKey]);
  scheduleStyleReadyCheck();
}

function onStyleReady() {
  clearStyleReadyCheck();
  state.styleReady = true;
  classifyMapLayers();
  captureBaseLabelSizes();
  ensureCafeLayers();
  updateCafeSource(false);
  applyAllStyleControls();

  if (pendingBasemapKey) {
    startQueuedBasemapSwitch();
    return;
  }

  finishStyleSwitch();
}

function switchBasemap(styleKey) {
  if (!styleUrls[styleKey]) {
    return;
  }
  if (styleKey === state.currentBasemap && !pendingBasemapKey && !state.styleSwitching) {
    return;
  }

  state.currentBasemap = styleKey;
  pendingBasemapKey = styleKey;

  if (!state.styleSwitching) {
    startQueuedBasemapSwitch();
  }
}

function init() {
  inputs.sourceLink.href = defaultMyMapsUrl;
  inputs.sourceLink.textContent = "Abrir fuente";

  bindEvents({
    switchBasemap,
    applyPreset: (presetName) => applyPreset(presetName, switchBasemap)
  });

  applyLayerVisibility();
  applyComponentColors();
  applyBaseLabelStyles();
  applyMapCanvasFilter();
  applyAtmosphereStyles();
  applyPosterStyles();

  initMap({
    onStyleReady,
    onInitialLoad: async () => {
      applyCanvasLayout();
      await loadDefaultMapData();
    }
  });

  scheduleStyleReadyCheck();
}

init();
