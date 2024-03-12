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

export function humanFileSize(
  bytes: number,
  si: boolean = true,
  dp: number = 1
) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + "B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + units[u];
}

export function convertURLsToLinks(text: string) {
  const urlRegex =
    /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  return text.replace(urlRegex, function (url: string) {
    return `<a href="${url}" rel="noopener noreferrer" target="_blank">${url}</a>`;
  });
}
