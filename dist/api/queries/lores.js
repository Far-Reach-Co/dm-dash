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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.editLoreQuery = exports.removeLoreQuery = exports.getLoresWithKeywordAndFilterQuery = exports.getLoresWithKeywordQuery = exports.getLoresWithFilterQuery = exports.getLoreQuery = exports.getLoresQuery = exports.addLoreQuery = void 0;
var dbconfig_1 = require("../dbconfig");
function addLoreQuery(data) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = {
                        text: "insert into public.\"Lore\" (project_id, title, description, type, image_id) values($1,$2,$3,$4,$5) returning *",
                        values: [
                            data.project_id,
                            data.title,
                            data.description,
                            data.type,
                            data.image_id
                        ]
                    };
                    return [4, dbconfig_1["default"].query(query)];
                case 1: return [2, _a.sent()];
            }
        });
    });
}
exports.addLoreQuery = addLoreQuery;
function getLoreQuery(id) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = {
                        text: "select * from public.\"Lore\" where id = $1",
                        values: [id]
                    };
                    return [4, dbconfig_1["default"].query(query)];
                case 1: return [2, _a.sent()];
            }
        });
    });
}
exports.getLoreQuery = getLoreQuery;
function getLoresWithKeywordAndFilterQuery(_a) {
    var projectId = _a.projectId, limit = _a.limit, offset = _a.offset, keyword = _a.keyword, filter = _a.filter;
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = {
                        text: "select * from public.\"Lore\" where project_id = $1 and position($4 in lower(title))>0 and type = $5 order by title asc limit $2 offset $3",
                        values: [projectId, limit, offset, keyword, filter]
                    };
                    return [4, dbconfig_1["default"].query(query)];
                case 1: return [2, _b.sent()];
            }
        });
    });
}
exports.getLoresWithKeywordAndFilterQuery = getLoresWithKeywordAndFilterQuery;
function getLoresWithKeywordQuery(_a) {
    var projectId = _a.projectId, limit = _a.limit, offset = _a.offset, keyword = _a.keyword;
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = {
                        text: "select * from public.\"Lore\" where project_id = $1 and position($4 in lower(title))>0 order by title asc limit $2 offset $3",
                        values: [projectId, limit, offset, keyword]
                    };
                    return [4, dbconfig_1["default"].query(query)];
                case 1: return [2, _b.sent()];
            }
        });
    });
}
exports.getLoresWithKeywordQuery = getLoresWithKeywordQuery;
function getLoresWithFilterQuery(_a) {
    var projectId = _a.projectId, limit = _a.limit, offset = _a.offset, filter = _a.filter;
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = {
                        text: "select * from public.\"Lore\" where project_id = $1 and type = $4 order by title asc limit $2 offset $3",
                        values: [projectId, limit, offset, filter]
                    };
                    return [4, dbconfig_1["default"].query(query)];
                case 1: return [2, _b.sent()];
            }
        });
    });
}
exports.getLoresWithFilterQuery = getLoresWithFilterQuery;
function getLoresQuery(_a) {
    var projectId = _a.projectId, limit = _a.limit, offset = _a.offset;
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = {
                        text: "select * from public.\"Lore\" where project_id = $1 order by title asc limit $2 offset $3",
                        values: [projectId, limit, offset]
                    };
                    return [4, dbconfig_1["default"].query(query)];
                case 1: return [2, _b.sent()];
            }
        });
    });
}
exports.getLoresQuery = getLoresQuery;
function removeLoreQuery(id) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = {
                        text: "delete from public.\"Lore\" where id = $1",
                        values: [id]
                    };
                    return [4, dbconfig_1["default"].query(query)];
                case 1: return [2, _a.sent()];
            }
        });
    });
}
exports.removeLoreQuery = removeLoreQuery;
function editLoreQuery(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var edits, values, iterator, _i, _a, _b, key, value, query;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    edits = "";
                    values = [];
                    iterator = 1;
                    for (_i = 0, _a = Object.entries(data); _i < _a.length; _i++) {
                        _b = _a[_i], key = _b[0], value = _b[1];
                        edits += "".concat(key, " = $").concat(iterator, ", ");
                        values.push(value);
                        iterator++;
                    }
                    edits = edits.slice(0, -2);
                    values.push(id);
                    query = {
                        text: "update public.\"Lore\" set ".concat(edits, " where id = $").concat(iterator, " returning *"),
                        values: values
                    };
                    return [4, dbconfig_1["default"].query(query)];
                case 1: return [2, _c.sent()];
            }
        });
    });
}
exports.editLoreQuery = editLoreQuery;
