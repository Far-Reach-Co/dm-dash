"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app_1 = require("./app");
const setupRedisAdapter_js_1 = require("./setupRedisAdapter.js");
const setupSocketHandlers_1 = require("./setupSocketHandlers");
function main() {
    (0, setupSocketHandlers_1.default)(app_1.io);
    (0, setupRedisAdapter_js_1.default)(app_1.io).catch(console.error);
    const PORT = 4000;
    app_1.server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}
main();
