"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupRedisAdapter;
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("redis");
const redisConfig_js_1 = require("./lib/redisConfig.js");
function setupRedisAdapter(io) {
    return __awaiter(this, void 0, void 0, function* () {
        const pubClient = (0, redis_1.createClient)({ url: (0, redisConfig_js_1.getRedisUrl)() });
        const subClient = pubClient.duplicate();
        yield pubClient.connect();
        yield subClient.connect();
        io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
    });
}
