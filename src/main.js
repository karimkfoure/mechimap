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

function clearStyleSwitchTimeout() {
  if (styleSwitchTimeoutId) {
    clearTimeout(styleSwitchTimeoutId);
    styleSwitchTimeoutId = null;
  }
}

function finishStyleSwitch() {
  if (!state.styleSwitching) {
    return;
  }

  state.styleSwitching = false;
  clearStyleSwitchTimeout();
  setLoading(false);
}

function scheduleStyleSwitchFailsafe() {
  clearStyleSwitchTimeout();
  styleSwitchTimeoutId = setTimeout(() => {
    finishStyleSwitch();
  }, 15000);
}

function onStyleReady() {
  state.styleReady = true;
  classifyMapLayers();
  captureBaseLabelSizes();
  ensureCafeLayers();
  updateCafeSource(false);
  applyAllStyleControls();
  finishStyleSwitch();
}

function switchBasemap(styleKey) {
  if (!styleUrls[styleKey]) {
    return;
  }
  if (styleKey === state.currentBasemap) {
    return;
  }

  state.currentBasemap = styleKey;
  state.styleReady = false;
  if (!state.styleSwitching) {
    state.styleSwitching = true;
    setLoading(true, "Cambiando estilo base...");
  }
  scheduleStyleSwitchFailsafe();
  state.map.setStyle(styleUrls[styleKey]);
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
}

init();
