export default function createElement(
  element,
  attributes,
  inner,
  eventListeners,
  options = {}
) {
  if (typeof element === "undefined") {
    return false;
  }

  var el = document.createElement(element);
  var allowHtml = !!options.allowHtml;

  if (typeof attributes === "object") {
    for (var attribute in attributes) {
      el.setAttribute(attribute, attributes[attribute]);
    }
  }

  if (inner) {
    if (typeof inner === "string" && allowHtml) {
      // Explicit opt-in: caller is responsible for trusted/sanitized HTML.
      el.innerHTML = inner;
    } else {
      if (!Array.isArray(inner)) {
        inner = [inner];
      }
      for (var k = 0; k < inner.length; k++) {
        if (inner[k] instanceof Node) {
          el.appendChild(inner[k]);
        } else {
          el.appendChild(document.createTextNode(inner[k]));
        }
      }
    }
  }

  if (eventListeners) {
    if (!Array.isArray(eventListeners)) {
      eventListeners = [eventListeners];
    }
    for (var event of eventListeners) {
      el.addEventListener(event.type, event.event);
    }
  }

  return el;
}
