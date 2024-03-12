export default function createElement(
  element,
  attributes,
  inner,
  eventListeners
) {
  if (typeof element === "undefined") {
    return false;
  }

  var el = document.createElement(element);

  if (typeof attributes === "object") {
    for (var attribute in attributes) {
      el.setAttribute(attribute, attributes[attribute]);
    }
  }

  if (inner) {
    // If inner is a string that looks like a tag HTML, set it as innerHTML only for chat box on vtt right now
    if (typeof inner === "string" && inner.trim().startsWith("<a")) {
      el.innerHTML = inner;
    } else {
      // Handle non-HTML strings and elements as before
      if (!Array.isArray(inner)) {
        inner = [inner];
      }
      for (var k = 0; k < inner.length; k++) {
        if (inner[k].tagName) {
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
