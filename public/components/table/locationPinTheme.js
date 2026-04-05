export const LOCATION_PIN_STYLE = Object.freeze({
  fill: "rgba(246, 211, 101, 0.95)",
  stroke: "#e74c3c",
  strokeWidth: 4,
  strokeLineJoin: "round",
});

export const LOCATION_PIN_SELECTED_STYLE = Object.freeze({
  stroke: "#ff9a8f",
  strokeWidth: 6,
  strokeLineJoin: "round",
  shadow: {
    color: "rgba(231, 76, 60, 0.3)",
    blur: 14,
    offsetX: 0,
    offsetY: 0,
  },
});

export function applyBaseLocationPinStyle(object) {
  if (!object) return;
  object.set({
    fill: LOCATION_PIN_STYLE.fill,
    stroke: LOCATION_PIN_STYLE.stroke,
    strokeWidth: LOCATION_PIN_STYLE.strokeWidth,
    strokeLineJoin: LOCATION_PIN_STYLE.strokeLineJoin,
    shadow: null,
  });
}

export function applySelectedLocationPinStyle(object) {
  if (!object) return;
  object.set({
    fill: LOCATION_PIN_STYLE.fill,
    stroke: LOCATION_PIN_SELECTED_STYLE.stroke,
    strokeWidth: LOCATION_PIN_SELECTED_STYLE.strokeWidth,
    strokeLineJoin: LOCATION_PIN_SELECTED_STYLE.strokeLineJoin,
    shadow: LOCATION_PIN_SELECTED_STYLE.shadow,
  });
}
