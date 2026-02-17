"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHttpError = createHttpError;
exports.badRequestError = badRequestError;
exports.forbiddenError = forbiddenError;
exports.notFoundError = notFoundError;
function createHttpError(status, message, extra) {
    const err = new Error(message);
    err.status = status;
    if (extra) {
        Object.assign(err, extra);
    }
    return err;
}
function badRequestError(message, extra) {
    return createHttpError(400, message, extra);
}
function forbiddenError(message = "Forbidden", extra) {
    return createHttpError(403, message, extra);
}
function notFoundError(message, extra) {
    return createHttpError(404, message, extra);
}
