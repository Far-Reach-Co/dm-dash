"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markdownToChat = markdownToChat;
const BASE_URL = "https://farreachco.com";
function markdownToChat(md) {
    return (md
        .replace(/\[([^\]]+)\]\(\/([^)]*)\)/g, `$1 - ${BASE_URL}/$2`)
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1 - $2")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/(\*{1,3}|_{1,3})(.+?)\1/g, "$2")
        .replace(/`([^`]+)`/g, "$1"));
}
