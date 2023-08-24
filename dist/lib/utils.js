"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTitleCase = exports.splitAtIndex = void 0;
function splitAtIndex(value, index) {
    return [value.substring(0, index), value.substring(index)];
}
exports.splitAtIndex = splitAtIndex;
function toTitleCase(str) {
    return str
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
exports.toTitleCase = toTitleCase;
