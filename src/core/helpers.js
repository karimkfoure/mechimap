export function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) {
    return `rgba(255,255,255,${alpha})`;
  }

  const intValue = Number.parseInt(clean, 16);
  const r = (intValue >> 16) & 255;
  const g = (intValue >> 8) & 255;
  const b = intValue & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function scaleRounded(value, scale) {
  return Number((value * scale).toFixed(2));
}

function scaleTextSizeOutput(value, scale) {
  if (typeof value === "number") {
    return scaleRounded(value, scale);
  }

  if (Array.isArray(value)) {
    const scaled = scaleTextSizeValue(value, scale);
    if (scaled != null) {
      return scaled;
    }
  }

  return cloneValue(value);
}

export function scaleTextSizeValue(value, scale) {
  if (typeof value === "number") {
    return scaleRounded(value, scale);
  }

  if (Array.isArray(value)) {
    const operator = value[0];
    const scaled = cloneValue(value);

    if (operator === "step") {
      if (scaled.length > 2) {
        scaled[2] = scaleTextSizeOutput(scaled[2], scale);
      }
      for (let i = 4; i < scaled.length; i += 2) {
        scaled[i] = scaleTextSizeOutput(scaled[i], scale);
      }
      return scaled;
    }

    if (operator === "interpolate") {
      for (let i = 4; i < scaled.length; i += 2) {
        scaled[i] = scaleTextSizeOutput(scaled[i], scale);
      }
      return scaled;
    }

    return null;
  }

  if (value && typeof value === "object" && Array.isArray(value.stops)) {
    const scaled = cloneValue(value);
    scaled.stops = scaled.stops.map((stopPair) => {
      if (!Array.isArray(stopPair) || stopPair.length < 2) {
        return stopPair;
      }
      return [stopPair[0], scaleTextSizeOutput(stopPair[1], scale)];
    });
    return scaled;
  }

  return null;
}

export function hashSeed(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}
