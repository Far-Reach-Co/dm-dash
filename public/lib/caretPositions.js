export function setCaretStartAfter(node) {
  const range = document.createRange();
  const selection = window.getSelection();

  // Position the range right after the given node
  console.log("start node: ", node);
  range.setStartAfter(node, 0);
  range.collapse(true);

  // Clear and set the selection
  selection.removeAllRanges();
  selection.addRange(range);
}
