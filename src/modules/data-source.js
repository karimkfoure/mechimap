import { defaultMyMapsUrl } from "../core/constants.js";
import { inputs } from "../core/inputs.js";
import { state } from "../core/state.js";
import { setLoading, setStatus } from "../core/ui-state.js";
import { applyCafeStyles, updateCafeSource } from "./cafe-layers.js";

function normalizeMarker(raw, fallbackName = "Cafe") {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const lat = Number(raw.lat);
  const lng = Number(raw.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const name = String(raw.name ?? fallbackName).trim() || fallbackName;
  const layer = String(raw.layer ?? raw.folder ?? "").trim();

  return { name, lat, lng, layer };
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

    const firstTuple = coordNode.textContent.trim().split(/\s+/)[0];
    const rawCoords = firstTuple.split(",");
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
    throw new Error("No se encontro MID en URL de My Maps.");
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
    { url: kmlUrl, mode: "directo" },
    { url: proxyUrl, mode: "proxy" }
  ];

  let lastError = null;

  for (const candidate of candidates) {
    try {
      const text = await fetchText(candidate.url);
      if (!text.includes("<kml") && !text.includes("<Placemark")) {
        throw new Error("Respuesta no parece KML");
      }

      const loadedPoints = parseKML(text);
      return { loadedPoints, sourceUrl: kmlUrl, mode: candidate.mode };
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `No se pudo descargar KML. Verifica mapa publico. ${lastError?.message || ""}`.trim()
  );
}

function getLayerNames(points) {
  const names = new Set();
  for (const point of points) {
    if (point.layer) {
      names.add(point.layer);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

function syncLayerFilterOptions() {
  const layerNames = getLayerNames(state.allPoints);
  const previous = inputs.layerFilter.value;

  inputs.layerFilter.innerHTML = "";
  inputs.layerFilter.append(new Option("Todos", ""));

  for (const layerName of layerNames) {
    inputs.layerFilter.append(new Option(layerName, layerName));
  }

  inputs.layerFilter.value = layerNames.includes(previous) ? previous : "";
}

export function applyLayerFilter(options = {}) {
  const shouldFit = options.shouldFit ?? true;
  const selected = inputs.layerFilter.value;
  if (!selected) {
    state.points = [...state.allPoints];
  } else {
    state.points = state.allPoints.filter((point) => point.layer === selected);
  }

  updateCafeSource(shouldFit);
  applyCafeStyles();

  const label = selected ? `Layer activo: ${selected}.` : "Mostrando todas las capas.";
  setStatus(`${label} Cafes visibles: ${state.points.length}.`);
}

function updatePoints(points, sourceLabel, options = {}) {
  if (!points.length) {
    state.allPoints = [];
    state.points = [];
    syncLayerFilterOptions();
    updateCafeSource(false);
    setStatus(`No se encontraron puntos validos en ${sourceLabel}.`);
    return;
  }

  const unique = new Map();
  for (const point of points) {
    const key = `${point.name}-${point.lat.toFixed(6)}-${point.lng.toFixed(6)}`;
    unique.set(key, point);
  }

  state.allPoints = [...unique.values()];
  syncLayerFilterOptions();
  applyLayerFilter(options);

  setStatus(`Cargados ${state.allPoints.length} cafes desde ${sourceLabel}.`);
}

export async function loadDefaultMapData(options = {}) {
  setLoading(true, "Descargando cafeterias desde My Maps...");

  try {
    const { loadedPoints, sourceUrl, mode } = await loadPointsFromMyMaps(defaultMyMapsUrl);
    updatePoints(loadedPoints, `My Maps (${mode})`, options);
    setStatus(`Cargados ${state.allPoints.length} cafes. Fuente: ${sourceUrl}`);
  } catch (error) {
    state.allPoints = [];
    state.points = [];
    syncLayerFilterOptions();
    updateCafeSource(false);
    setStatus(`Error importando My Maps: ${error.message}`);
  } finally {
    setLoading(false);
  }
}
