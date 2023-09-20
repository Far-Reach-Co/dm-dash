export default function collectTextNodes(element, textNodes) {
  if (element.nodeType === Node.TEXT_NODE) {
    textNodes.push(element);
  } else {
    for (var i = 0; i < element.childNodes.length; i++) {
      collectTextNodes(element.childNodes[i], textNodes);
    }
  }
}
