import { inputs } from "../core/inputs.js";
import { state } from "../core/state.js";
import { applyCafeStyles, fitToData, updateCafeSource } from "./cafe-layers.js";
import { loadDefaultMapData, applyLayerFilter } from "./data-source.js";
import {
  applyBaseLabelStyles,
  applyComponentColors,
  applyLayerVisibility,
  applyMapCanvasFilter
} from "./map-style.js";
import {
  applyAtmosphereStyles,
  applyCanvasLayout,
  applyManualView,
  applyPosterStyles,
  resetCamera,
  resetGlobalFilters
} from "./studio-ui.js";

export function bindEvents({ switchBasemap, applyPreset }) {
  inputs.reloadDataBtn.addEventListener("click", async () => {
    await loadDefaultMapData();
  });

  inputs.layerFilter.addEventListener("change", applyLayerFilter);

  inputs.applyPresetBtn.addEventListener("click", () => {
    applyPreset(inputs.presetSelect.value);
  });

  inputs.basemapSelect.addEventListener("change", () => {
    switchBasemap(inputs.basemapSelect.value);
  });

  [
    inputs.showWater,
    inputs.showParks,
    inputs.showLanduse,
    inputs.showRoadsMajor,
    inputs.showRoadsMinor,
    inputs.showBuildings,
    inputs.showBoundaries,
    inputs.showRoadLabels,
    inputs.showPlaceLabels,
    inputs.showPoiLabels,
    inputs.showWaterLabels
  ].forEach((el) => {
    el.addEventListener("change", applyLayerVisibility);
  });

  [
    inputs.bgColor,
    inputs.waterColor,
    inputs.waterOpacity,
    inputs.parkColor,
    inputs.parkOpacity,
    inputs.landuseColor,
    inputs.landuseOpacity,
    inputs.roadMajorColor,
    inputs.roadMajorOpacity,
    inputs.roadMinorColor,
    inputs.roadMinorOpacity,
    inputs.buildingColor,
    inputs.buildingOpacity,
    inputs.boundaryColor,
    inputs.boundaryOpacity
  ].forEach((el) => {
    el.addEventListener("input", applyComponentColors);
    el.addEventListener("change", applyComponentColors);
  });

  [inputs.mapBrightness, inputs.mapContrast, inputs.mapSaturation, inputs.mapGrayscale, inputs.mapHue].forEach((el) => {
    el.addEventListener("input", applyMapCanvasFilter);
    el.addEventListener("change", applyMapCanvasFilter);
  });

  inputs.resetGlobalFiltersBtn.addEventListener("click", resetGlobalFilters);

  [
    inputs.baseLabelColor,
    inputs.baseLabelOpacity,
    inputs.baseLabelHaloColor,
    inputs.baseLabelHaloWidth,
    inputs.baseLabelSizeScale,
    inputs.baseLabelTransform
  ].forEach((el) => {
    el.addEventListener("input", applyBaseLabelStyles);
    el.addEventListener("change", applyBaseLabelStyles);
  });

  [
    inputs.markerColor,
    inputs.markerStroke,
    inputs.markerRadius,
    inputs.markerOpacity,
    inputs.strokeWeight,
    inputs.haloColor,
    inputs.haloSize,
    inputs.haloOpacity,
    inputs.shadowColor,
    inputs.shadowOpacity,
    inputs.shadowBlur,
    inputs.shadowOffsetX,
    inputs.shadowOffsetY,
    inputs.showLabels,
    inputs.labelColor,
    inputs.labelSize,
    inputs.labelHaloColor,
    inputs.labelHaloWidth,
    inputs.labelLetterSpacing,
    inputs.labelOffsetY
  ].forEach((el) => {
    el.addEventListener("input", applyCafeStyles);
    el.addEventListener("change", applyCafeStyles);
  });

  [inputs.jitterMeters, inputs.labelMode, inputs.labelTransform].forEach((el) => {
    el.addEventListener("input", () => updateCafeSource(false));
    el.addEventListener("change", () => updateCafeSource(false));
  });

  [
    inputs.tintColor,
    inputs.tintOpacity,
    inputs.vignetteOpacity,
    inputs.grainOpacity,
    inputs.frameColor,
    inputs.frameWidth,
    inputs.frameRadius,
    inputs.frameShadow
  ].forEach((el) => {
    el.addEventListener("input", applyAtmosphereStyles);
    el.addEventListener("change", applyAtmosphereStyles);
  });

  [
    inputs.showPoster,
    inputs.posterTitle,
    inputs.posterSubtitle,
    inputs.posterPosition,
    inputs.posterColor,
    inputs.posterSize,
    inputs.posterSubtitleSize,
    inputs.posterBgColor,
    inputs.posterBgOpacity,
    inputs.posterPadding
  ].forEach((el) => {
    el.addEventListener("input", applyPosterStyles);
    el.addEventListener("change", applyPosterStyles);
  });

  [inputs.canvasRatio, inputs.canvasPadding].forEach((el) => {
    el.addEventListener("input", applyCanvasLayout);
    el.addEventListener("change", applyCanvasLayout);
  });

  inputs.fitPadding.addEventListener("input", () => fitToData());
  inputs.fitPadding.addEventListener("change", () => fitToData());

  inputs.pitchInput.addEventListener("input", () => {
    if (state.mapReady) {
      state.map.setPitch(Number(inputs.pitchInput.value));
    }
  });

  inputs.bearingInput.addEventListener("input", () => {
    if (state.mapReady) {
      state.map.setBearing(Number(inputs.bearingInput.value));
    }
  });

  inputs.applyViewBtn.addEventListener("click", applyManualView);
  inputs.fitBtn.addEventListener("click", fitToData);
  inputs.resetCameraBtn.addEventListener("click", resetCamera);

  inputs.togglePanelBtn.addEventListener("click", () => {
    inputs.appShell.classList.toggle("panel-hidden");
    setTimeout(() => {
      applyCanvasLayout();
      state.map?.resize();
    }, 120);
  });

  window.addEventListener("resize", () => {
    applyCanvasLayout();
  });
}
