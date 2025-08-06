"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const setupApp_1 = require("./setupApp");
const setupRedisAdapter_js_1 = require("./setupRedisAdapter.js");
const setupSocket_1 = require("./setupSocket");
function main() {
    const io = (0, setupSocket_1.default)(setupApp_1.server);
    (0, setupRedisAdapter_js_1.default)(io).catch(console.error);
    const PORT = 4000;
    setupApp_1.server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}
main();
