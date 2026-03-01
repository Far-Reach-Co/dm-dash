const isNilChild = (value) => {
  // Treat falsey-control children as "no child" for ergonomic conditional render.
  return value === null || typeof value === "undefined" || value === false;
};

const normalizeChildren = (inner) => {
  // Accept either single child or nested child arrays.
  if (isNilChild(inner)) return [];
  return Array.isArray(inner) ? inner.flat(Infinity) : [inner];
};

const applyAttribute = (el, key, value) => {
  if (key === "className") {
    // Align with JS property naming while writing proper HTML attribute.
    if (value === null || typeof value === "undefined" || value === false) return;
    el.setAttribute("class", String(value));
    return;
  }

  if (key === "style" && value && typeof value === "object") {
    // Object style syntax: { color: "red" }.
    Object.assign(el.style, value);
    return;
  }

  if (key === "dataset" && value && typeof value === "object") {
    // Dataset object syntax: { foo: "bar" } -> data-foo="bar".
    for (const dataKey in value) {
      const dataValue = value[dataKey];
      if (dataValue === null || typeof dataValue === "undefined") continue;
      el.dataset[dataKey] = String(dataValue);
    }
    return;
  }

  if (typeof value === "boolean") {
    // HTML boolean attribute semantics.
    if (value) {
      el.setAttribute(key, "");
    } else if (typeof el.removeAttribute === "function") {
      el.removeAttribute(key);
    }
    return;
  }

  if (value === null || typeof value === "undefined") return;
  el.setAttribute(key, String(value));
};

const applyAttributes = (el, attributes) => {
  if (typeof attributes !== "object" || attributes === null) return;
  for (const attribute in attributes) {
    applyAttribute(el, attribute, attributes[attribute]);
  }
};

const appendChildren = (el, inner, options = {}) => {
  const allowHtml = !!options.allowHtml;
  const children = normalizeChildren(inner);

  for (const child of children) {
    if (isNilChild(child)) continue;

    if (typeof child === "string" && allowHtml) {
      // Opt-in raw HTML insertion for advanced cases only.
      if (typeof el.insertAdjacentHTML === "function") {
        el.insertAdjacentHTML("beforeend", child);
      } else {
        el.innerHTML += child;
      }
      continue;
    }

    if (child instanceof Node) {
      el.appendChild(child);
      continue;
    }

    el.appendChild(document.createTextNode(String(child)));
  }
};

const attachEventListeners = (el, eventListeners) => {
  if (!eventListeners) return;

  // Support one listener object or an array of listener objects.
  const listeners = Array.isArray(eventListeners)
    ? eventListeners
    : [eventListeners];

  for (const listener of listeners) {
    if (!listener || typeof listener !== "object") continue;
    if (typeof listener.type !== "string" || typeof listener.event !== "function") {
      continue;
    }
    el.addEventListener(listener.type, listener.event, listener.options);
  }
};

const createElement = (element, attributes, inner, eventListeners, options = {}) => {
  if (typeof element !== "string" || !element.trim()) {
    throw new Error("createElement requires a non-empty element tag string");
  }

  const el = document.createElement(element);
  applyAttributes(el, attributes);
  appendChildren(el, inner, options);
  attachEventListeners(el, eventListeners);
  return el;
};

export default createElement;
export { createElement };
