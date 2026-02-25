const defaultMyMapsUrl =
  "https://www.google.com/maps/d/u/0/viewer?mid=1fMXnq7tJ3ToCsxz8NBltdYgiO5ldsyg&ll=-31.420478598270606%2C-64.18262452047118&z=13";

const inputs = {
  sourceLink: document.getElementById("sourceLink"),
  status: document.getElementById("status"),
  reloadDataBtn: document.getElementById("reloadDataBtn"),
  layerFilter: document.getElementById("layerFilter"),

  basemapSelect: document.getElementById("basemapSelect"),
  tileOpacity: document.getElementById("tileOpacity"),
  tileBrightness: document.getElementById("tileBrightness"),
  tileContrast: document.getElementById("tileContrast"),
  tileSaturation: document.getElementById("tileSaturation"),
  tileGrayscale: document.getElementById("tileGrayscale"),
  tileSepia: document.getElementById("tileSepia"),
  tileHue: document.getElementById("tileHue"),
  resetBaseBtn: document.getElementById("resetBaseBtn"),

  markerColor: document.getElementById("markerColor"),
  markerStroke: document.getElementById("markerStroke"),
  markerRadius: document.getElementById("markerRadius"),
  markerOpacity: document.getElementById("markerOpacity"),
  strokeWeight: document.getElementById("strokeWeight"),
  haloColor: document.getElementById("haloColor"),
  haloSize: document.getElementById("haloSize"),
  haloOpacity: document.getElementById("haloOpacity"),
  jitterMeters: document.getElementById("jitterMeters"),
  showMarkerShadow: document.getElementById("showMarkerShadow"),

  showLabels: document.getElementById("showLabels"),
  labelMode: document.getElementById("labelMode"),
  labelFont: document.getElementById("labelFont"),
  labelColor: document.getElementById("labelColor"),
  labelSize: document.getElementById("labelSize"),
  labelWeight: document.getElementById("labelWeight"),
  labelLetterSpacing: document.getElementById("labelLetterSpacing"),
  labelOffsetY: document.getElementById("labelOffsetY"),
  labelTransform: document.getElementById("labelTransform"),
  labelBgColor: document.getElementById("labelBgColor"),
  labelBgOpacity: document.getElementById("labelBgOpacity"),
  labelPadding: document.getElementById("labelPadding"),
  labelRadius: document.getElementById("labelRadius"),

  tintColor: document.getElementById("tintColor"),
  tintOpacity: document.getElementById("tintOpacity"),
  vignetteOpacity: document.getElementById("vignetteOpacity"),
  grainOpacity: document.getElementById("grainOpacity"),
  frameColor: document.getElementById("frameColor"),
  frameWidth: document.getElementById("frameWidth"),
  frameRadius: document.getElementById("frameRadius"),
  frameShadow: document.getElementById("frameShadow"),

  showPoster: document.getElementById("showPoster"),
  posterTitle: document.getElementById("posterTitle"),
  posterSubtitle: document.getElementById("posterSubtitle"),
  posterPosition: document.getElementById("posterPosition"),
  posterColor: document.getElementById("posterColor"),
  posterSize: document.getElementById("posterSize"),
  posterSubtitleSize: document.getElementById("posterSubtitleSize"),
  posterBgColor: document.getElementById("posterBgColor"),
  posterBgOpacity: document.getElementById("posterBgOpacity"),
  posterPadding: document.getElementById("posterPadding"),

  canvasRatio: document.getElementById("canvasRatio"),
  canvasPadding: document.getElementById("canvasPadding"),
  fitPadding: document.getElementById("fitPadding"),
  centerLat: document.getElementById("centerLat"),
  centerLng: document.getElementById("centerLng"),
  zoomInput: document.getElementById("zoomInput"),
  applyViewBtn: document.getElementById("applyViewBtn"),
  fitBtn: document.getElementById("fitBtn"),
  togglePanelBtn: document.getElementById("togglePanelBtn"),

  mapWrap: document.getElementById("mapWrap"),
  mapFrame: document.getElementById("mapFrame"),
  mapTint: document.getElementById("mapTint"),
  mapVignette: document.getElementById("mapVignette"),
  mapGrain: document.getElementById("mapGrain"),

  posterOverlay: document.getElementById("posterOverlay"),
  posterTitleNode: document.getElementById("posterTitleNode"),
  posterSubtitleNode: document.getElementById("posterSubtitleNode"),

  loadingOverlay: document.getElementById("loadingOverlay"),
  loadingText: document.getElementById("loadingText")
};

const baseLayersConfig = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  },
  lightNoLabels: {
    url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  },
  voyager: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  },
  tonerLite: {
    url: "https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png",
    attribution: 'Map tiles by Stamen Design, CC BY 3.0 | Data by OpenStreetMap contributors'
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }
};

const ratioMap = {
  fill: null,
  "1:1": 1,
  "4:5": 4 / 5,
  "3:4": 3 / 4,
  "16:9": 16 / 9,
  "9:16": 9 / 16
};

const map = L.map("map", {
  zoomControl: false,
  attributionControl: true
}).setView([-31.42048, -64.18262], 13);

L.control.zoom({ position: "bottomright" }).addTo(map);

let currentTile = null;
let markerLayer = L.layerGroup().addTo(map);
let haloLayer = L.layerGroup().addTo(map);
let allPoints = [];
let points = [];
let loadingCount = 0;

function setStatus(message) {
  inputs.status.textContent = message;
}

function setLoading(isLoading, message = "Cargando cafeterias...") {
  if (isLoading) {
    loadingCount += 1;
    if (message) {
      inputs.loadingText.textContent = message;
    }
    inputs.loadingOverlay.classList.remove("is-hidden");
    return;
  }

  loadingCount = Math.max(loadingCount - 1, 0);
  if (loadingCount === 0) {
    inputs.loadingOverlay.classList.add("is-hidden");
  }
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return `rgba(255,255,255,${alpha})`;
  }

  const int = Number.parseInt(normalized, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hashSeed(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function jitterPoint(point, meters) {
  if (!meters) {
    return { lat: point.lat, lng: point.lng };
  }

  const seed = hashSeed(`${point.name}|${point.lat}|${point.lng}`);
  const seed2 = hashSeed(`${point.lng}|${point.lat}|${point.name}`);
  const angle = ((seed % 360) * Math.PI) / 180;
  const distance = ((seed2 % 1000) / 1000) * meters;

  const dx = Math.cos(angle) * distance;
  const dy = Math.sin(angle) * distance;

  const dLat = dy / 111320;
  const dLng = dx / (111320 * Math.cos((point.lat * Math.PI) / 180));

  return {
    lat: point.lat + dLat,
    lng: point.lng + dLng
  };
}

function labelForPoint(point, index) {
  if (inputs.labelMode.value === "index") {
    return String(index + 1);
  }
  if (inputs.labelMode.value === "indexName") {
    return `${index + 1}. ${point.name}`;
  }
  return point.name;
}

function setBaseLayer(name) {
  if (!baseLayersConfig[name]) {
    return;
  }

  if (currentTile) {
    map.removeLayer(currentTile);
  }

  currentTile = L.tileLayer(baseLayersConfig[name].url, {
    maxZoom: 20,
    subdomains: "abcd",
    attribution: baseLayersConfig[name].attribution,
    opacity: Number(inputs.tileOpacity.value) / 100
  });

  currentTile.addTo(map);
}

function applyTileFilters() {
  const filter = [
    `brightness(${inputs.tileBrightness.value}%)`,
    `contrast(${inputs.tileContrast.value}%)`,
    `saturate(${inputs.tileSaturation.value}%)`,
    `grayscale(${inputs.tileGrayscale.value}%)`,
    `sepia(${inputs.tileSepia.value}%)`,
    `hue-rotate(${inputs.tileHue.value}deg)`
  ].join(" ");

  document.documentElement.style.setProperty("--tile-filter", filter);
  if (currentTile) {
    currentTile.setOpacity(Number(inputs.tileOpacity.value) / 100);
  }
}

function applyLabelStyles() {
  const bgAlpha = Number(inputs.labelBgOpacity.value) / 100;
  document.documentElement.style.setProperty("--label-size", `${inputs.labelSize.value}px`);
  document.documentElement.style.setProperty("--label-color", inputs.labelColor.value);
  document.documentElement.style.setProperty("--label-weight", inputs.labelWeight.value);
  document.documentElement.style.setProperty("--label-spacing", `${inputs.labelLetterSpacing.value}px`);
  document.documentElement.style.setProperty("--label-font", `"${inputs.labelFont.value}", sans-serif`);
  document.documentElement.style.setProperty("--label-transform", inputs.labelTransform.value);
  document.documentElement.style.setProperty("--label-bg", hexToRgba(inputs.labelBgColor.value, bgAlpha));
  document.documentElement.style.setProperty("--label-padding", `${inputs.labelPadding.value}px`);
  document.documentElement.style.setProperty("--label-radius", `${inputs.labelRadius.value}px`);
}

function applyAtmosphereStyles() {
  document.documentElement.style.setProperty("--tint-color", inputs.tintColor.value);
  document.documentElement.style.setProperty("--tint-opacity", String(Number(inputs.tintOpacity.value) / 100));
  document.documentElement.style.setProperty("--vignette-opacity", String(Number(inputs.vignetteOpacity.value) / 100));
  document.documentElement.style.setProperty("--grain-opacity", String(Number(inputs.grainOpacity.value) / 100));

  document.documentElement.style.setProperty("--frame-color", inputs.frameColor.value);
  document.documentElement.style.setProperty("--frame-width", `${inputs.frameWidth.value}px`);
  document.documentElement.style.setProperty("--frame-radius", `${inputs.frameRadius.value}px`);
  document.documentElement.style.setProperty("--frame-shadow", `${inputs.frameShadow.value}px`);

  document.documentElement.style.setProperty(
    "--marker-shadow",
    inputs.showMarkerShadow.checked ? "drop-shadow(0 3px 8px rgba(7, 12, 23, 0.28))" : "none"
  );
}

function applyPosterStyles() {
  const showPoster = inputs.showPoster.checked;
  inputs.posterOverlay.classList.toggle("is-visible", showPoster);

  inputs.posterTitleNode.textContent = inputs.posterTitle.value.trim() || "Bike & Coffee Club";
  inputs.posterSubtitleNode.textContent = inputs.posterSubtitle.value.trim();
  inputs.posterOverlay.setAttribute("data-position", inputs.posterPosition.value);

  document.documentElement.style.setProperty("--poster-color", inputs.posterColor.value);
  document.documentElement.style.setProperty("--poster-size", `${inputs.posterSize.value}px`);
  document.documentElement.style.setProperty("--poster-subtitle-size", `${inputs.posterSubtitleSize.value}px`);
  document.documentElement.style.setProperty("--poster-padding", `${inputs.posterPadding.value}px`);

  const posterBg = hexToRgba(inputs.posterBgColor.value, Number(inputs.posterBgOpacity.value) / 100);
  document.documentElement.style.setProperty("--poster-bg", posterBg);
}

function applyCanvasLayout() {
  const padding = Number(inputs.canvasPadding.value);
  document.documentElement.style.setProperty("--canvas-padding", `${padding}px`);

  const ratio = ratioMap[inputs.canvasRatio.value];
  if (!ratio) {
    inputs.mapFrame.style.width = "100%";
    inputs.mapFrame.style.height = "100%";
    map.invalidateSize();
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
  map.invalidateSize();
}

function renderMarkers() {
  markerLayer.clearLayers();
  haloLayer.clearLayers();

  if (!points.length) {
    return;
  }

  applyLabelStyles();

  const fillColor = inputs.markerColor.value;
  const strokeColor = inputs.markerStroke.value;
  const radius = Number(inputs.markerRadius.value);
  const fillOpacity = Number(inputs.markerOpacity.value) / 100;
  const weight = Number(inputs.strokeWeight.value);

  const haloColor = inputs.haloColor.value;
  const haloSize = Number(inputs.haloSize.value);
  const haloOpacity = Number(inputs.haloOpacity.value) / 100;
  const jitterMeters = Number(inputs.jitterMeters.value);

  const labelsEnabled = inputs.showLabels.checked;
  const labelOffsetY = Number(inputs.labelOffsetY.value);

  points.forEach((point, index) => {
    const pos = jitterPoint(point, jitterMeters);

    if (haloSize > 0 && haloOpacity > 0) {
      L.circleMarker([pos.lat, pos.lng], {
        radius: radius + haloSize,
        fillColor: haloColor,
        color: haloColor,
        weight: 0,
        opacity: 0,
        fillOpacity: haloOpacity
      }).addTo(haloLayer);
    }

    const marker = L.circleMarker([pos.lat, pos.lng], {
      className: "marker-core",
      radius,
      fillColor,
      color: strokeColor,
      weight,
      opacity: 1,
      fillOpacity
    }).addTo(markerLayer);

    if (labelsEnabled) {
      marker.bindTooltip(labelForPoint(point, index), {
        permanent: true,
        direction: "top",
        offset: [0, labelOffsetY - radius],
        className: "cafe-label"
      });
    }
  });
}

function fitToData() {
  if (!points.length) {
    return;
  }

  const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng]));
  const padding = Number(inputs.fitPadding.value);
  map.fitBounds(bounds, { padding: [padding, padding], maxZoom: 16 });

  const center = map.getCenter();
  inputs.centerLat.value = center.lat.toFixed(6);
  inputs.centerLng.value = center.lng.toFixed(6);
  inputs.zoomInput.value = String(map.getZoom());
}

function normalizeMarker(raw, fallbackName = "Cafe") {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const parsedLat = Number(raw.lat);
  const parsedLng = Number(raw.lng);

  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
    return null;
  }

  const name = String(raw.name ?? fallbackName).trim() || fallbackName;
  const layer = String(raw.layer ?? raw.folder ?? "").trim();

  return { name, lat: parsedLat, lng: parsedLng, layer };
}

function parseKML(xmlString) {
  const xml = new DOMParser().parseFromString(xmlString, "application/xml");
  const parseError = xml.querySelector("parsererror");

  if (parseError) {
    throw new Error("KML invalido");
  }

  const placemarks = [...xml.querySelectorAll("Placemark")];
  const parsed = [];

  function resolveLayerName(placemark) {
    let current = placemark.parentElement;

    while (current) {
      if (current.localName === "Folder") {
        const folderName = [...current.children].find((child) => child.localName === "name");
        const value = folderName?.textContent?.trim();
        if (value) {
          return value;
        }
      }
      current = current.parentElement;
    }

    return "";
  }

  for (const placemark of placemarks) {
    const coordNode = placemark.querySelector("Point > coordinates");
    if (!coordNode || !coordNode.textContent) {
      continue;
    }

    const firstCoordTuple = coordNode.textContent.trim().split(/\s+/)[0];
    const rawCoords = firstCoordTuple.split(",");

    const lng = Number(rawCoords[0]);
    const lat = Number(rawCoords[1]);

    const nameNode = placemark.querySelector("name");
    const name = (nameNode?.textContent || "Cafe").trim() || "Cafe";
    const layer = resolveLayerName(placemark);

    const point = normalizeMarker({ name, lat, lng, layer });
    if (point) {
      parsed.push(point);
    }
  }

  return parsed;
}

function extractMidFromMyMapsUrl(rawInput) {
  const value = rawInput.trim();
  if (!value) {
    return "";
  }

  if (/^[A-Za-z0-9_-]{10,}$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    return url.searchParams.get("mid") || "";
  } catch {
    return "";
  }
}

function buildMyMapsKmlUrl(rawInput) {
  const mid = extractMidFromMyMapsUrl(rawInput);
  if (!mid) {
    throw new Error("No se encontro MID en la URL fija de My Maps.");
  }

  return `https://www.google.com/maps/d/kml?mid=${encodeURIComponent(mid)}&forcekml=1`;
}

async function fetchText(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}

async function loadPointsFromMyMaps(rawInput) {
  const kmlUrl = buildMyMapsKmlUrl(rawInput);
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(kmlUrl)}`;
  const candidates = [
    { url: kmlUrl, label: "directo" },
    { url: proxyUrl, label: "proxy" }
  ];

  let lastError = null;

  for (const candidate of candidates) {
    try {
      const text = await fetchText(candidate.url);
      if (!text.includes("<kml") && !text.includes("<Placemark")) {
        throw new Error("Respuesta no parece KML");
      }
      const loadedPoints = parseKML(text);
      return { loadedPoints, sourceUrl: kmlUrl, mode: candidate.label };
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `No se pudo descargar el KML desde My Maps. Verifica que el mapa sea publico. ${lastError?.message || ""}`.trim()
  );
}

function getLayerNames(fromPoints) {
  const names = new Set();
  for (const point of fromPoints) {
    if (point.layer) {
      names.add(point.layer);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

function syncLayerFilterOptions(fromPoints) {
  const layerNames = getLayerNames(fromPoints);
  const previousValue = inputs.layerFilter.value;

  inputs.layerFilter.innerHTML = "";
  inputs.layerFilter.append(new Option("Todos", ""));
  for (const layerName of layerNames) {
    inputs.layerFilter.append(new Option(layerName, layerName));
  }

  if (layerNames.includes(previousValue)) {
    inputs.layerFilter.value = previousValue;
  } else {
    inputs.layerFilter.value = "";
  }
}

function applyLayerFilter() {
  const selectedLayer = inputs.layerFilter.value;
  if (!selectedLayer) {
    points = [...allPoints];
  } else {
    points = allPoints.filter((point) => point.layer === selectedLayer);
  }

  renderMarkers();
  fitToData();

  const layerLabel = selectedLayer ? `Layer activo: ${selectedLayer}.` : "Mostrando todas las capas.";
  setStatus(`${layerLabel} Total visible: ${points.length}.`);
}

function updatePoints(newPoints, sourceLabel) {
  if (!newPoints.length) {
    setStatus(`No se encontraron puntos validos en ${sourceLabel}.`);
    return;
  }

  const unique = new Map();
  for (const point of newPoints) {
    const key = `${point.name}-${point.lat.toFixed(6)}-${point.lng.toFixed(6)}`;
    unique.set(key, point);
  }

  allPoints = [...unique.values()];
  syncLayerFilterOptions(allPoints);
  applyLayerFilter();

  const activeLayerLabel = inputs.layerFilter.value ? ` (layer: ${inputs.layerFilter.value})` : "";
  setStatus(`Cargados ${allPoints.length} markers desde ${sourceLabel}${activeLayerLabel}.`);
}

async function loadDefaultMapData() {
  setLoading(true, "Descargando KML de Google My Maps...");
  setStatus("Descargando cafeterias desde My Maps...");

  try {
    const { loadedPoints, sourceUrl, mode } = await loadPointsFromMyMaps(defaultMyMapsUrl);
    updatePoints(loadedPoints, `My Maps (${mode})`);
    setStatus(`Cargados ${allPoints.length} markers desde My Maps. Fuente: ${sourceUrl}`);
  } catch (error) {
    allPoints = [];
    points = [];
    markerLayer.clearLayers();
    haloLayer.clearLayers();
    syncLayerFilterOptions(allPoints);
    setStatus(`Error importando My Maps: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

function applyManualView() {
  const lat = Number(inputs.centerLat.value);
  const lng = Number(inputs.centerLng.value);
  const zoom = Number(inputs.zoomInput.value);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(zoom)) {
    setStatus("Lat/Lng/Zoom invalidos.");
    return;
  }

  map.setView([lat, lng], zoom);
}

function resetBaseStyles() {
  inputs.tileOpacity.value = "100";
  inputs.tileBrightness.value = "100";
  inputs.tileContrast.value = "100";
  inputs.tileSaturation.value = "100";
  inputs.tileGrayscale.value = "0";
  inputs.tileSepia.value = "0";
  inputs.tileHue.value = "0";
  applyTileFilters();
}

function bindEvents() {
  inputs.reloadDataBtn.addEventListener("click", async () => {
    await loadDefaultMapData();
  });

  inputs.layerFilter.addEventListener("change", applyLayerFilter);

  inputs.basemapSelect.addEventListener("change", () => {
    setBaseLayer(inputs.basemapSelect.value);
    applyTileFilters();
  });

  [
    inputs.tileOpacity,
    inputs.tileBrightness,
    inputs.tileContrast,
    inputs.tileSaturation,
    inputs.tileGrayscale,
    inputs.tileSepia,
    inputs.tileHue
  ].forEach((input) => {
    input.addEventListener("input", applyTileFilters);
    input.addEventListener("change", applyTileFilters);
  });

  inputs.resetBaseBtn.addEventListener("click", resetBaseStyles);

  [
    inputs.markerColor,
    inputs.markerStroke,
    inputs.markerRadius,
    inputs.markerOpacity,
    inputs.strokeWeight,
    inputs.haloColor,
    inputs.haloSize,
    inputs.haloOpacity,
    inputs.jitterMeters,
    inputs.showMarkerShadow,
    inputs.showLabels,
    inputs.labelMode,
    inputs.labelFont,
    inputs.labelColor,
    inputs.labelSize,
    inputs.labelWeight,
    inputs.labelLetterSpacing,
    inputs.labelOffsetY,
    inputs.labelTransform,
    inputs.labelBgColor,
    inputs.labelBgOpacity,
    inputs.labelPadding,
    inputs.labelRadius
  ].forEach((input) => {
    input.addEventListener("input", renderMarkers);
    input.addEventListener("change", renderMarkers);
  });

  [
    inputs.tintColor,
    inputs.tintOpacity,
    inputs.vignetteOpacity,
    inputs.grainOpacity,
    inputs.frameColor,
    inputs.frameWidth,
    inputs.frameRadius,
    inputs.frameShadow,
    inputs.showMarkerShadow
  ].forEach((input) => {
    input.addEventListener("input", applyAtmosphereStyles);
    input.addEventListener("change", applyAtmosphereStyles);
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
  ].forEach((input) => {
    input.addEventListener("input", applyPosterStyles);
    input.addEventListener("change", applyPosterStyles);
  });

  [inputs.canvasRatio, inputs.canvasPadding].forEach((input) => {
    input.addEventListener("input", applyCanvasLayout);
    input.addEventListener("change", applyCanvasLayout);
  });

  inputs.applyViewBtn.addEventListener("click", applyManualView);
  inputs.fitBtn.addEventListener("click", fitToData);

  inputs.togglePanelBtn.addEventListener("click", () => {
    document.getElementById("appShell").classList.toggle("panel-hidden");
    setTimeout(() => {
      applyCanvasLayout();
      map.invalidateSize();
    }, 120);
  });

  map.on("moveend", () => {
    const center = map.getCenter();
    inputs.centerLat.value = center.lat.toFixed(6);
    inputs.centerLng.value = center.lng.toFixed(6);
    inputs.zoomInput.value = String(map.getZoom());
  });

  window.addEventListener("resize", applyCanvasLayout);
}

async function init() {
  inputs.sourceLink.href = defaultMyMapsUrl;
  inputs.sourceLink.textContent = "Abrir fuente";

  setBaseLayer(inputs.basemapSelect.value);
  bindEvents();

  applyTileFilters();
  applyAtmosphereStyles();
  applyPosterStyles();
  applyCanvasLayout();

  renderMarkers();
  await loadDefaultMapData();
}

void init();
