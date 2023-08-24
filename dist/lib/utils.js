"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitAtIndex = void 0;
function splitAtIndex(value, index) {
    return [value.substring(0, index), value.substring(index)];
}
exports.splitAtIndex = splitAtIndex;
