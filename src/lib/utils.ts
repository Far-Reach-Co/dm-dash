// helper function to split at index
export function splitAtIndex(value: string, index: number) {
  return [value.substring(0, index), value.substring(index)];
}

export function toTitleCase(str: string) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
