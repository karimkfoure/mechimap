import { inputs } from "../core/inputs.js";
import { setLoading, setStatus } from "../core/ui-state.js";
import { state } from "../core/state.js";

const exportScale = 2;
const exportMimeType = "image/png";

function parsePixelValue(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getRoundedRadius(radius, width, height) {
  return Math.max(0, Math.min(radius, width / 2, height / 2));
}

function buildRoundedRectPath(ctx, x, y, width, height, radius) {
  const safeRadius = getRoundedRadius(radius, width, height);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}

function getTransformMatrix(transformValue) {
  if (!transformValue || transformValue === "none") {
    return new DOMMatrixReadOnly();
  }

  return new DOMMatrixReadOnly(transformValue);
}

function applyArtTransform(ctx, rect, transformValue, draw) {
  const matrix = getTransformMatrix(transformValue);

  ctx.save();
  buildRoundedRectPath(ctx, rect.x, rect.y, rect.width, rect.height, rect.radius);
  ctx.clip();
  ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
  ctx.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
  ctx.translate(-rect.width / 2, -rect.height / 2);
  draw();
  ctx.restore();
}

function createGrainPattern(ctx) {
  const tile = document.createElement("canvas");
  tile.width = 8;
  tile.height = 8;
  const tileCtx = tile.getContext("2d");

  if (!tileCtx) {
    return null;
  }

  tileCtx.fillStyle = "rgba(0, 0, 0, 0.22)";
  tileCtx.beginPath();
  tileCtx.arc(2, 3, 0.8, 0, Math.PI * 2);
  tileCtx.fill();

  tileCtx.fillStyle = "rgba(0, 0, 0, 0.18)";
  tileCtx.beginPath();
  tileCtx.arc(6, 6, 0.8, 0, Math.PI * 2);
  tileCtx.fill();

  return ctx.createPattern(tile, "repeat");
}

function drawVignette(ctx, rect, opacity) {
  if (opacity <= 0) {
    return;
  }

  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const outerRadius = Math.max(rect.width, rect.height) * 0.7;
  const innerRadius = Math.max(rect.width, rect.height) * 0.31;
  const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);

  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(0.44, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 1)");

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = gradient;
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.restore();
}

function drawGrain(ctx, rect, opacity) {
  if (opacity <= 0) {
    return;
  }

  const pattern = createGrainPattern(ctx);

  if (!pattern) {
    return;
  }

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = pattern;
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.restore();
}

function getPosterLines(ctx, text, maxWidth) {
  const cleanText = text.trim();

  if (!cleanText) {
    return [];
  }

  const words = cleanText.split(/\s+/);
  const lines = [];
  let currentLine = words.shift() || "";

  for (const word of words) {
    const nextLine = `${currentLine} ${word}`;
    if (ctx.measureText(nextLine).width <= maxWidth) {
      currentLine = nextLine;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;
  }

  lines.push(currentLine);
  return lines;
}

function drawPoster(ctx, frameRect) {
  const posterRect = inputs.posterOverlay.getBoundingClientRect();
  if (!posterRect.width || !posterRect.height) {
    return;
  }

  const style = getComputedStyle(inputs.posterOverlay);
  const titleStyle = getComputedStyle(inputs.posterTitleNode);
  const subtitleStyle = getComputedStyle(inputs.posterSubtitleNode);
  const x = posterRect.left - frameRect.left;
  const y = posterRect.top - frameRect.top;
  const width = posterRect.width;
  const height = posterRect.height;
  const padding = parsePixelValue(style.paddingTop);
  const radius = 12;
  const titleFontSize = parsePixelValue(titleStyle.fontSize);
  const subtitleFontSize = parsePixelValue(subtitleStyle.fontSize);
  const titleLineHeight = Math.max(titleFontSize, parsePixelValue(titleStyle.lineHeight) || titleFontSize);
  const subtitleLineHeight = Math.max(subtitleFontSize, parsePixelValue(subtitleStyle.lineHeight) || subtitleFontSize);
  const maxTextWidth = Math.max(width - padding * 2, 10);
  const textAlign = style.textAlign === "right" ? "right" : style.textAlign === "center" ? "center" : "left";
  const textX = textAlign === "right" ? x + width - padding : textAlign === "center" ? x + width / 2 : x + padding;
  const titleY = y + padding + titleFontSize * 0.82;

  buildRoundedRectPath(ctx, x, y, width, height, radius);
  ctx.save();
  ctx.fillStyle = style.backgroundColor;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.textAlign = textAlign;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = titleStyle.color;
  ctx.font = `${titleStyle.fontStyle} ${titleStyle.fontWeight} ${titleStyle.fontSize} ${titleStyle.fontFamily}`;

  const titleLines = getPosterLines(ctx, inputs.posterTitleNode.textContent || "", maxTextWidth);
  titleLines.forEach((line, index) => {
    ctx.fillText(line, textX, titleY + titleLineHeight * index, maxTextWidth);
  });

  ctx.fillStyle = subtitleStyle.color;
  ctx.font = `${subtitleStyle.fontStyle} ${subtitleStyle.fontWeight} ${subtitleStyle.fontSize} ${subtitleStyle.fontFamily}`;

  const subtitleLines = getPosterLines(ctx, inputs.posterSubtitleNode.textContent || "", maxTextWidth);
  const subtitleStartY = titleY + titleLineHeight * titleLines.length + subtitleFontSize * 0.75;
  subtitleLines.forEach((line, index) => {
    ctx.fillText(line, textX, subtitleStartY + subtitleLineHeight * index, maxTextWidth);
  });
  ctx.restore();
}

function waitForNextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

async function waitForMapSettled() {
  if (!state.map) {
    return;
  }

  await new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutId);
      resolve();
    };
    const timeoutId = window.setTimeout(finish, 1200);

    if (state.map.loaded() && !state.map.isMoving()) {
      finish();
      return;
    }

    state.map.once("idle", finish);
    state.map.triggerRepaint();
  });

  await waitForNextFrame();
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("No se pudo generar el blob PNG."));
    }, exportMimeType);
  });
}

function buildFilename() {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `coffeemap-${year}${month}${day}-${hours}${minutes}${seconds}.png`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function drawMapFrame(ctx, exportCanvas) {
  const frameRect = inputs.mapFrame.getBoundingClientRect();
  const mapCanvas = state.map?.getCanvas();

  if (!mapCanvas || !frameRect.width || !frameRect.height) {
    throw new Error("El mapa todavia no esta listo para exportar.");
  }

  const frameStyle = getComputedStyle(inputs.mapFrame);
  const mapStyle = getComputedStyle(inputs.map);
  const tintStyle = getComputedStyle(document.getElementById("mapTint"));
  const vignetteStyle = getComputedStyle(document.getElementById("mapVignette"));
  const grainStyle = getComputedStyle(document.getElementById("mapGrain"));
  const frameWidth = parsePixelValue(frameStyle.borderTopWidth);
  const frameRadius = parsePixelValue(frameStyle.borderTopLeftRadius);
  const innerRadius = Math.max(0, frameRadius - frameWidth);
  const innerRect = {
    x: frameWidth,
    y: frameWidth,
    width: Math.max(frameRect.width - frameWidth * 2, 1),
    height: Math.max(frameRect.height - frameWidth * 2, 1),
    radius: innerRadius
  };

  ctx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
  ctx.save();
  ctx.scale(exportScale, exportScale);

  buildRoundedRectPath(ctx, 0, 0, frameRect.width, frameRect.height, frameRadius);
  ctx.save();
  ctx.shadowColor = "rgba(10, 14, 22, 0.3)";
  ctx.shadowBlur = parsePixelValue(frameStyle.getPropertyValue("--frame-shadow")) || 0;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = frameStyle.backgroundColor;
  ctx.fill();
  ctx.restore();

  applyArtTransform(ctx, innerRect, mapStyle.transform, () => {
    ctx.save();
    ctx.filter = mapCanvas.style.filter || getComputedStyle(mapCanvas).filter || "none";
    ctx.drawImage(mapCanvas, 0, 0, innerRect.width, innerRect.height);
    ctx.restore();
  });

  applyArtTransform(ctx, innerRect, tintStyle.transform || mapStyle.transform, () => {
    ctx.save();
    ctx.globalAlpha = Number.parseFloat(tintStyle.opacity) || 0;
    ctx.fillStyle = tintStyle.backgroundColor;
    ctx.fillRect(0, 0, innerRect.width, innerRect.height);
    ctx.restore();
  });

  applyArtTransform(ctx, innerRect, vignetteStyle.transform || mapStyle.transform, () => {
    drawVignette(ctx, { x: 0, y: 0, width: innerRect.width, height: innerRect.height }, Number.parseFloat(vignetteStyle.opacity) || 0);
  });

  applyArtTransform(ctx, innerRect, grainStyle.transform || mapStyle.transform, () => {
    drawGrain(ctx, { x: 0, y: 0, width: innerRect.width, height: innerRect.height }, Number.parseFloat(grainStyle.opacity) || 0);
  });

  if (inputs.posterOverlay.classList.contains("is-visible")) {
    drawPoster(ctx, frameRect);
  }

  if (frameWidth > 0) {
    buildRoundedRectPath(ctx, frameWidth / 2, frameWidth / 2, frameRect.width - frameWidth, frameRect.height - frameWidth, Math.max(0, frameRadius - frameWidth / 2));
    ctx.lineWidth = frameWidth;
    ctx.strokeStyle = frameStyle.borderTopColor;
    ctx.stroke();
  }

  ctx.restore();
}

export async function exportViewportPng() {
  if (!state.mapReady || !state.styleReady || !state.map) {
    setStatus("Esperando que el mapa termine de cargar para exportar.");
    return;
  }

  const button = inputs.downloadViewportBtn;
  const frameRect = inputs.mapFrame.getBoundingClientRect();
  if (!frameRect.width || !frameRect.height) {
    setStatus("No hay viewport visible para exportar.");
    return;
  }

  button.disabled = true;
  setLoading(true, "Exportando PNG...");

  try {
    await document.fonts.ready;
    await waitForMapSettled();

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = Math.max(1, Math.round(frameRect.width * exportScale));
    exportCanvas.height = Math.max(1, Math.round(frameRect.height * exportScale));

    const ctx = exportCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("No se pudo crear el contexto de exportacion.");
    }

    drawMapFrame(ctx, exportCanvas);

    const blob = await canvasToBlob(exportCanvas);
    const filename = buildFilename();
    downloadBlob(blob, filename);
    setStatus(`PNG exportado (${exportCanvas.width}x${exportCanvas.height}).`);
  } catch (error) {
    console.error(error);
    setStatus(error instanceof Error ? error.message : "No se pudo exportar el PNG.");
  } finally {
    button.disabled = false;
    setLoading(false);
  }
}
