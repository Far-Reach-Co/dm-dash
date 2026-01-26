"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitAtIndex = splitAtIndex;
exports.toTitleCase = toTitleCase;
exports.humanFileSize = humanFileSize;
exports.convertURLsToLinks = convertURLsToLinks;
function splitAtIndex(value, index) {
    return [value.substring(0, index), value.substring(index)];
}
function toTitleCase(str) {
    return str
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
function humanFileSize(bytes, si = true, dp = 1) {
    const thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + "B";
    }
    const units = si
        ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    let u = -1;
    const r = Math.pow(10, dp);
    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1);
    return bytes.toFixed(dp) + units[u];
}
function convertURLsToLinks(text) {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    return text.replace(urlRegex, function (url) {
        return `<br><a href="${url}" rel="noopener noreferrer" target="_blank">${url}</a><br>`;
    });
}
