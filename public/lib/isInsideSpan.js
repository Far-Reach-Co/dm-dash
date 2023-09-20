export default function isInsideSpan(node) {
  var parent = node.parentNode;
  while (parent) {
    if (parent.tagName === "SPAN") {
      return true;
    }
    parent = parent.parentNode;
  }
  return false;
}
