import { inputs } from "./inputs.js";
import { state } from "./state.js";

export function setStatus(message) {
  inputs.status.textContent = message;
}

export function setLoading(isLoading, message = "Procesando...") {
  if (isLoading) {
    state.loadingCount += 1;
    inputs.loadingText.textContent = message;
    inputs.loadingOverlay.classList.remove("is-hidden");
    return;
  }

  state.loadingCount = Math.max(state.loadingCount - 1, 0);
  if (state.loadingCount === 0) {
    inputs.loadingOverlay.classList.add("is-hidden");
  }
}

export function setInputValue(element, value) {
  if (!element) {
    return;
  }

  if (element.type === "checkbox") {
    element.checked = Boolean(value);
    return;
  }

  element.value = String(value);
}
