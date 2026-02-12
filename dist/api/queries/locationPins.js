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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocationPinsByTableViewQuery = getLocationPinsByTableViewQuery;
exports.addLocationPinQuery = addLocationPinQuery;
exports.removeLocationPinQuery = removeLocationPinQuery;
exports.updateLocationPinQuery = updateLocationPinQuery;
exports.getLocationPinByIdQuery = getLocationPinByIdQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
const utils_1 = require("./utils");
function getLocationPinsByTableViewQuery(tableViewId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `
      SELECT
        lp.*,
        COALESCE(
          json_agg(
            json_build_object('id', attached.id, 'uuid', attached.uuid, 'title', attached.title)
          ) FILTER (WHERE attached.id IS NOT NULL),
          '[]'
        ) AS attachments
      FROM public."LocationPin" lp
      LEFT JOIN LATERAL (
        SELECT id, uuid, title
        FROM public."TableView"
        WHERE id = ANY(lp.portal_table_view_ids)
      ) attached ON true
      WHERE lp.table_view_id = $1
      GROUP BY lp.id
      ORDER BY lp.created_at DESC
    `,
            values: [tableViewId],
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getLocationPinByIdQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `
      SELECT *
      FROM public."LocationPin"
      WHERE id = $1
    `,
            values: [id],
        };
        return yield dbconfig_1.default.query(query);
    });
}
function addLocationPinQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const query = {
            text: `
      INSERT INTO public."LocationPin"
        (table_view_id, canvas_object_id, title, description, image_id, portal_table_view_ids)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
            values: [
                data.table_view_id,
                data.canvas_object_id,
                data.title,
                (_a = data.description) !== null && _a !== void 0 ? _a : "",
                (_b = data.image_id) !== null && _b !== void 0 ? _b : null,
                (_c = data.portal_table_view_ids) !== null && _c !== void 0 ? _c : [],
            ],
        };
        return yield dbconfig_1.default.query(query);
    });
}
function removeLocationPinQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `
      DELETE FROM public."LocationPin"
      WHERE id = $1
    `,
            values: [id],
        };
        return yield dbconfig_1.default.query(query);
    });
}
function updateLocationPinQuery(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = Object.assign(Object.assign({}, data), { updated_at: new Date().toISOString() });
        const query = (0, utils_1.buildUpdateQuery)("LocationPin", payload, id);
        return yield dbconfig_1.default.query(query);
    });
}
