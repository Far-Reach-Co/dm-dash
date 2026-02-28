export function createSvgIcon(svgMarkup) {
  const template = document.createElement("template");
  template.innerHTML = String(svgMarkup || "").trim();
  const node = template.content.firstElementChild;
  if (!(node instanceof SVGElement)) {
    return document.createTextNode("");
  }
  node.setAttribute("aria-hidden", "true");
  return node;
}

export function createSvgIconFactoryMap(svgMarkupByKey) {
  const entries = Object.entries(svgMarkupByKey || {});
  const templateByKey = new Map(
    entries.map(([key, markup]) => [key, createSvgIcon(markup)]),
  );

  return Object.freeze(
    Object.fromEntries(
      entries.map(([key]) => [
        key,
        () => templateByKey.get(key).cloneNode(true),
      ]),
    ),
  );
}
