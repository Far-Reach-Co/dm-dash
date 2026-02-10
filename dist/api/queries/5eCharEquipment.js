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
exports.add5eCharEquipmentQuery = add5eCharEquipmentQuery;
exports.get5eCharEquipmentsByGeneralQuery = get5eCharEquipmentsByGeneralQuery;
exports.get5eCharEquipmentQuery = get5eCharEquipmentQuery;
exports.remove5eCharEquipmentQuery = remove5eCharEquipmentQuery;
exports.edit5eCharEquipmentQuery = edit5eCharEquipmentQuery;
exports.duplicate5eCharEquipmentsQuery = duplicate5eCharEquipmentsQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
const utils_1 = require("./utils");
function add5eCharEquipmentQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."dnd_5e_character_equipment" (general_id, title, description, quantity, weight) values($1,$2,$3,$4,$5) returning *`,
            values: [
                data.general_id,
                data.title,
                data.description,
                data.quantity,
                data.weight,
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function duplicate5eCharEquipmentsQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const tableName = "dnd_5e_character_equipment";
        const columnNames = yield (0, utils_1.columnNamesQuery)(tableName);
        const columnStr = columnNames.join(", ");
        const selectStr = columnNames.map(col => {
            if (col === "general_id")
                return "$2";
            return col;
        }).join(", ");
        const query = {
            text: `
      INSERT INTO public."${tableName}" (${columnStr})
      SELECT ${selectStr}
      FROM ${tableName}
      WHERE general_id = $1
    `,
            values: [
                data.oldGeneralId,
                data.newGeneralId
            ]
        };
        yield dbconfig_1.default.query(query);
    });
}
function get5eCharEquipmentQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_equipment" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function get5eCharEquipmentsByGeneralQuery(generalId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."dnd_5e_character_equipment" where general_id = $1 order by id`,
            values: [generalId]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function remove5eCharEquipmentQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."dnd_5e_character_equipment" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function edit5eCharEquipmentQuery(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = (0, utils_1.buildUpdateQuery)("dnd_5e_character_equipment", data, id);
        return yield dbconfig_1.default.query(query);
    });
}
