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
exports.addTableImageByProjectQuery = addTableImageByProjectQuery;
exports.addTableImageByUserQuery = addTableImageByUserQuery;
exports.getTableImagesByProjectQuery = getTableImagesByProjectQuery;
exports.getTableImagesByUserQuery = getTableImagesByUserQuery;
exports.getTableImagesByFolderQuery = getTableImagesByFolderQuery;
exports.getTableImageQuery = getTableImageQuery;
exports.removeTableImageQuery = removeTableImageQuery;
exports.editTableImageQuery = editTableImageQuery;
exports.getTableImagesWithImageByProjectQuery = getTableImagesWithImageByProjectQuery;
exports.getTableImagesWithImageByUserQuery = getTableImagesWithImageByUserQuery;
exports.getTableImageCountByUserQuery = getTableImageCountByUserQuery;
exports.getTableImageCountByProjectQuery = getTableImageCountByProjectQuery;
exports.getTableImagesWithImageByUserPaginatedQuery = getTableImagesWithImageByUserPaginatedQuery;
exports.getTableImagesWithImageByProjectPaginatedQuery = getTableImagesWithImageByProjectPaginatedQuery;
exports.getTableImagesWithImageByUserInFolderQuery = getTableImagesWithImageByUserInFolderQuery;
exports.getTableImagesWithImageByProjectInFolderQuery = getTableImagesWithImageByProjectInFolderQuery;
exports.getTableImageCountsByUserQuery = getTableImageCountsByUserQuery;
exports.getTableImageCountsByProjectQuery = getTableImageCountsByProjectQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
const utils_1 = require("./utils");
function addTableImageByProjectQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."TableImage" (project_id, image_id, folder_id) values($1,$2,$3) returning *`,
            values: [
                data.project_id,
                data.image_id,
                data.folder_id
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function addTableImageByUserQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `insert into public."TableImage" (user_id, image_id, folder_id) values($1,$2,$3) returning *`,
            values: [
                data.user_id,
                data.image_id,
                data.folder_id
            ]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableImageQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableImage" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableImagesByFolderQuery(folder_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableImage" where folder_id = $1`,
            values: [folder_id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableImagesByProjectQuery(project_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableImage" where project_id = $1`,
            values: [project_id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableImagesByUserQuery(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `select * from public."TableImage" where user_id = $1`,
            values: [user_id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableImagesWithImageByProjectQuery(project_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `
      SELECT ti.*, i.original_name, i.size, i.file_name, i.notes, i.created_at, ri.record_id, r.title, r.description
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      LEFT JOIN public."RecordImage" ri ON i.id = ri.image_id
      LEFT JOIN public."Record" r ON ri.record_id = r.id
      WHERE ti.project_id = $1 AND i.is_blocked = false
    `,
            values: [project_id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableImagesWithImageByUserQuery(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `
      SELECT ti.*, i.original_name, i.size, i.file_name, i.notes, i.created_at, ri.record_id, r.title AS record_title, r.description AS record_desc
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      LEFT JOIN public."RecordImage" ri ON i.id = ri.image_id
      LEFT JOIN public."Record" r ON ri.record_id = r.id
      WHERE ti.user_id = $1 AND i.is_blocked = false
    `,
            values: [user_id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function removeTableImageQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `delete from public."TableImage" where id = $1`,
            values: [id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function editTableImageQuery(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = (0, utils_1.buildUpdateQuery)("TableImage", data, id);
        return yield dbconfig_1.default.query(query);
    });
}
function getTableImageCountByUserQuery(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `SELECT COUNT(*) FROM public."TableImage" WHERE user_id = $1`,
            values: [user_id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableImageCountByProjectQuery(project_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `SELECT COUNT(*) FROM public."TableImage" WHERE project_id = $1`,
            values: [project_id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableImagesWithImageByUserPaginatedQuery(user_id, limit, offset) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `
      SELECT ti.*, i.original_name, i.size, i.file_name, i.notes, i.created_at, ri.record_id, r.title AS record_title, r.description AS record_desc
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      LEFT JOIN public."RecordImage" ri ON i.id = ri.image_id
      LEFT JOIN public."Record" r ON ri.record_id = r.id
      WHERE ti.user_id = $1 AND i.is_blocked = false
      ORDER BY i.original_name ASC
      LIMIT $2 OFFSET $3
    `,
            values: [user_id, limit, offset]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableImagesWithImageByProjectPaginatedQuery(project_id, limit, offset) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `
      SELECT ti.*, i.original_name, i.size, i.file_name, i.notes, i.created_at, ri.record_id, r.title, r.description
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      LEFT JOIN public."RecordImage" ri ON i.id = ri.image_id
      LEFT JOIN public."Record" r ON ri.record_id = r.id
      WHERE ti.project_id = $1 AND i.is_blocked = false
      ORDER BY i.original_name ASC
      LIMIT $2 OFFSET $3
    `,
            values: [project_id, limit, offset]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableImagesWithImageByUserInFolderQuery(user_id, folder_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `
      SELECT ti.*, i.original_name, i.size, i.file_name, i.notes, i.created_at, ri.record_id, r.title AS record_title, r.description AS record_desc
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      LEFT JOIN public."RecordImage" ri ON i.id = ri.image_id
      LEFT JOIN public."Record" r ON ri.record_id = r.id
      WHERE ti.user_id = $1 AND i.is_blocked = false
        AND ti.folder_id IS NOT DISTINCT FROM $2
      ORDER BY i.original_name ASC
    `,
            values: [user_id, folder_id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableImageCountsByUserQuery(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `
      SELECT ti.folder_id, COUNT(*)::int AS count
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      WHERE ti.user_id = $1 AND i.is_blocked = false
      GROUP BY ti.folder_id
    `,
            values: [user_id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableImageCountsByProjectQuery(project_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `
      SELECT ti.folder_id, COUNT(*)::int AS count
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      WHERE ti.project_id = $1 AND i.is_blocked = false
      GROUP BY ti.folder_id
    `,
            values: [project_id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getTableImagesWithImageByProjectInFolderQuery(project_id, folder_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `
      SELECT ti.*, i.original_name, i.size, i.file_name, i.notes, i.created_at, ri.record_id, r.title, r.description
      FROM public."TableImage" ti
      JOIN public."Image" i ON ti.image_id = i.id
      LEFT JOIN public."RecordImage" ri ON i.id = ri.image_id
      LEFT JOIN public."Record" r ON ri.record_id = r.id
      WHERE ti.project_id = $1 AND i.is_blocked = false
        AND ti.folder_id IS NOT DISTINCT FROM $2
      ORDER BY i.original_name ASC
    `,
            values: [project_id, folder_id]
        };
        return yield dbconfig_1.default.query(query);
    });
}
