"use strict";
exports.__esModule = true;
var express_1 = require("express");
var projects_js_1 = require("./controllers/projects.js");
var users_js_1 = require("./controllers/users.js");
var calendars_js_1 = require("./controllers/calendars.js");
var months_js_1 = require("./controllers/months.js");
var days_js_1 = require("./controllers/days.js");
var projectInvites_js_1 = require("./controllers/projectInvites.js");
var projectUsers_js_1 = require("./controllers/projectUsers.js");
var s3_js_1 = require("./controllers/s3.js");
var multer = require("multer");
var _5eCharGeneral_js_1 = require("./controllers/5eCharGeneral.js");
var _5eCharOtherProLang_js_1 = require("./controllers/5eCharOtherProLang.js");
var _5eCharAttacks_js_1 = require("./controllers/5eCharAttacks.js");
var _5eCharEquipment_js_1 = require("./controllers/5eCharEquipment.js");
var _5eCharFeats_js_1 = require("./controllers/5eCharFeats.js");
var _5eCharSpellSlots_js_1 = require("./controllers/5eCharSpellSlots.js");
var _5eCharSpells_js_1 = require("./controllers/5eCharSpells.js");
var projectPlayers_js_1 = require("./controllers/projectPlayers.js");
var tableImages_js_1 = require("./controllers/tableImages.js");
var tableViews_js_1 = require("./controllers/tableViews.js");
var playerInvites_js_1 = require("./controllers/playerInvites.js");
var playerUsers_js_1 = require("./controllers/playerUsers.js");
var express_validator_1 = require("express-validator");
var tableFolders_js_1 = require("./controllers/tableFolders.js");
var sanitizeHtml = require("sanitize-html");
var upload = multer({ dest: "file_uploads/" });
var router = (0, express_1.Router)();
router.get("/get_image/:id", s3_js_1.getImage);
router.post("/signed_URL_download", s3_js_1.getSignedUrlForDownload);
router.post("/new_image_for_project", upload.single("file"), s3_js_1.newImageForProject);
router.post("/new_image_for_user", upload.single("file"), s3_js_1.newImageForUser);
router.post("/edit_image_name/:id", (0, express_validator_1.body)("original_name")
    .trim()
    .customSanitizer(function (val) { return sanitizeHtml(val); }), s3_js_1.editImageName);
router["delete"]("/remove_image_by_table_user/:image_id/:table_id", s3_js_1.removeImageByTableUser);
router["delete"]("/remove_image_by_project/:image_id/:project_id", s3_js_1.removeImageByProject);
router.post("/add_table_folder_by_user", (0, express_validator_1.body)("title")
    .trim()
    .customSanitizer(function (val) { return sanitizeHtml(val); }), tableFolders_js_1.addTableFolderByUser);
router.post("/add_table_folder_by_project", (0, express_validator_1.body)("title")
    .trim()
    .customSanitizer(function (val) { return sanitizeHtml(val); }), tableFolders_js_1.addTableFolderByProject);
router.get("/get_table_folders_by_user", tableFolders_js_1.getTableFoldersByUser);
router.get("/get_table_folders_by_project/:project_id", tableFolders_js_1.getTableFoldersByProject);
router["delete"]("/remove_table_folder/:id", tableFolders_js_1.removeTableFolder);
router.post("/edit_table_folder_title/:id", (0, express_validator_1.body)("title")
    .trim()
    .customSanitizer(function (val) { return sanitizeHtml(val); }), tableFolders_js_1.editTableFolderTitle);
router.get("/get_table_views_by_project/:project_id", tableViews_js_1.getTableViewsByProject);
router.get("/get_table_views_by_user", tableViews_js_1.getTableViewsByUser);
router.get("/get_table_view/:id", tableViews_js_1.getTableView);
router.get("/get_table_view_by_uuid/:uuid", tableViews_js_1.getTableViewByUUID);
router.post("/add_table_view_by_project/:project_id", tableViews_js_1.addTableViewByProject);
router.post("/add_table_view_by_user", tableViews_js_1.addTableViewByUser);
router["delete"]("/remove_table_view/:id", tableViews_js_1.removeTableView);
router.post("/edit_table_view_data/:id", tableViews_js_1.editTableViewData);
router.post("/edit_table_view_title/:id", (0, express_validator_1.body)("title")
    .trim()
    .customSanitizer(function (val) { return sanitizeHtml(val); }), tableViews_js_1.editTableViewTitle);
router.get("/get_table_images_by_table_project/:table_id", tableImages_js_1.getTableImagesByTableProject);
router.get("/get_table_images_by_table_user/:table_id", tableImages_js_1.getTableImagesByTableUser);
router.post("/add_table_image_by_project", tableImages_js_1.addTableImageByProject);
router.post("/add_table_image_by_user", tableImages_js_1.addTableImageByUser);
router["delete"]("/remove_table_image/:id", tableImages_js_1.removeTableImage);
router.get("/get_project_players_by_player/:player_id", projectPlayers_js_1.getProjectPlayersByPlayer);
router.post("/add_project_player", projectPlayers_js_1.addProjectPlayer);
router["delete"]("/remove_project_player/:id", projectPlayers_js_1.removeProjectPlayer);
router["delete"]("/remove_project_user/:id", projectUsers_js_1.removeProjectUser);
router.post("/edit_project_user_is_editor/:id", projectUsers_js_1.editProjectUserIsEditor);
router.get("/get_player_user_by_user_and_player/:player_id", playerUsers_js_1.getPlayerUserByUserAndPlayer);
router.post("/add_player_user", playerUsers_js_1.addPlayerUser);
router["delete"]("/remove_player_user/:id", playerUsers_js_1.removePlayerUser);
router["delete"]("/remove_player_user_by_user_and_player/:player_id", playerUsers_js_1.removePlayerUserByUserAndPlayer);
router["delete"]("/remove_player_users_by_player/:player_id", playerUsers_js_1.removePlayerUsersByPlayer);
router.get("/get_player_invite_by_uuid/:uuid", playerInvites_js_1.getPlayerInviteByUUID);
router.get("/get_player_invite_by_player/:player_id", playerInvites_js_1.getPlayerInviteByPlayer);
router.post("/add_player_invite", playerInvites_js_1.addPlayerInvite);
router["delete"]("/remove_player_invite/:id", playerInvites_js_1.removePlayerInvite);
router.post("/add_project_invite", projectInvites_js_1.addProjectInvite);
router["delete"]("/remove_project_invite/:id", projectInvites_js_1.removeProjectInvite);
router.get("/get_5e_characters_by_user", _5eCharGeneral_js_1.get5eCharsByUser);
router.get("/get_5e_character_general/:id", _5eCharGeneral_js_1.get5eCharGeneral);
router.post("/add_5e_character", (0, express_validator_1.body)("name")
    .trim()
    .customSanitizer(function (val) { return sanitizeHtml(val); }), _5eCharGeneral_js_1.add5eChar);
router["delete"]("/remove_5e_character/:id", _5eCharGeneral_js_1.remove5eChar);
router.post("/edit_5e_character_general/:id", (0, express_validator_1.body)().customSanitizer(function (value) {
    if (typeof value === "object" && value !== null) {
        for (var key in value) {
            if (typeof value[key] === "string") {
                value[key] = sanitizeHtml(value[key].trim());
            }
        }
    }
    return value;
}), _5eCharGeneral_js_1.edit5eCharGeneral);
router.post("/edit_5e_character_proficiencies/:id", (0, express_validator_1.body)().customSanitizer(function (value) {
    if (typeof value === "object" && value !== null) {
        for (var key in value) {
            if (typeof value[key] === "string") {
                value[key] = sanitizeHtml(value[key].trim());
            }
        }
    }
    return value;
}), _5eCharGeneral_js_1.edit5eCharPro);
router.post("/edit_5e_character_background/:id", (0, express_validator_1.body)().customSanitizer(function (value) {
    if (typeof value === "object" && value !== null) {
        for (var key in value) {
            if (typeof value[key] === "string") {
                value[key] = sanitizeHtml(value[key].trim());
            }
        }
    }
    return value;
}), _5eCharGeneral_js_1.edit5eCharBack);
router.post("/edit_5e_character_spell_slots/:id", (0, express_validator_1.body)().customSanitizer(function (value) {
    if (typeof value === "object" && value !== null) {
        for (var key in value) {
            if (typeof value[key] === "string") {
                value[key] = sanitizeHtml(value[key].trim());
            }
        }
    }
    return value;
}), _5eCharSpellSlots_js_1.edit5eCharSpellSlotInfo);
router.get("/get_5e_character_attacks/:general_id", _5eCharAttacks_js_1.get5eCharAttacksByGeneral);
router.post("/add_5e_character_attack", (0, express_validator_1.body)().customSanitizer(function (value) {
    if (typeof value === "object" && value !== null) {
        for (var key in value) {
            if (typeof value[key] === "string") {
                value[key] = sanitizeHtml(value[key].trim());
            }
        }
    }
    return value;
}), _5eCharAttacks_js_1.add5eCharAttack);
router["delete"]("/remove_5e_character_attack/:id", _5eCharAttacks_js_1.remove5eCharAttack);
router.post("/edit_5e_character_attack/:id", (0, express_validator_1.body)().customSanitizer(function (value) {
    if (typeof value === "object" && value !== null) {
        for (var key in value) {
            if (typeof value[key] === "string") {
                value[key] = sanitizeHtml(value[key].trim());
            }
        }
    }
    return value;
}), _5eCharAttacks_js_1.edit5eCharAttack);
router.get("/get_5e_character_spells/:general_id/:type", _5eCharSpells_js_1.get5eCharSpellsByType);
router.post("/add_5e_character_spell", _5eCharSpells_js_1.add5eCharSpell);
router["delete"]("/remove_5e_character_spell/:id", (0, express_validator_1.body)().customSanitizer(function (value) {
    if (typeof value === "object" && value !== null) {
        for (var key in value) {
            if (typeof value[key] === "string") {
                value[key] = sanitizeHtml(value[key].trim());
            }
        }
    }
    return value;
}), _5eCharSpells_js_1.remove5eCharSpell);
router.post("/edit_5e_character_spell/:id", _5eCharSpells_js_1.edit5eCharSpell);
router.get("/get_5e_character_feats/:general_id", _5eCharFeats_js_1.get5eCharFeatsByGeneral);
router.post("/add_5e_character_feat", (0, express_validator_1.body)().customSanitizer(function (value) {
    if (typeof value === "object" && value !== null) {
        for (var key in value) {
            if (typeof value[key] === "string") {
                value[key] = sanitizeHtml(value[key].trim());
            }
        }
    }
    return value;
}), _5eCharFeats_js_1.add5eCharFeat);
router["delete"]("/remove_5e_character_feat/:id", _5eCharFeats_js_1.remove5eCharFeat);
router.post("/edit_5e_character_feat/:id", (0, express_validator_1.body)().customSanitizer(function (value) {
    if (typeof value === "object" && value !== null) {
        for (var key in value) {
            if (typeof value[key] === "string") {
                value[key] = sanitizeHtml(value[key].trim());
            }
        }
    }
    return value;
}), _5eCharFeats_js_1.edit5eCharFeat);
router.get("/get_5e_character_equipments/:general_id", _5eCharEquipment_js_1.get5eCharEquipmentsByGeneral);
router.post("/add_5e_character_equipment", (0, express_validator_1.body)().customSanitizer(function (value) {
    if (typeof value === "object" && value !== null) {
        for (var key in value) {
            if (typeof value[key] === "string") {
                value[key] = sanitizeHtml(value[key].trim());
            }
        }
    }
    return value;
}), _5eCharEquipment_js_1.add5eCharEquipment);
router["delete"]("/remove_5e_character_equipment/:id", _5eCharEquipment_js_1.remove5eCharEquipment);
router.post("/edit_5e_character_equipment/:id", _5eCharEquipment_js_1.edit5eCharEquipment);
router.get("/get_5e_character_other_pro_langs/:general_id", _5eCharOtherProLang_js_1.get5eCharOtherProLangsByGeneral);
router.post("/add_5e_character_other_pro_lang", _5eCharOtherProLang_js_1.add5eCharOtherProLang);
router["delete"]("/remove_5e_character_other_pro_lang/:id", _5eCharOtherProLang_js_1.remove5eCharOtherProLang);
router.post("/edit_5e_character_other_pro_lang/:id", (0, express_validator_1.body)().customSanitizer(function (value) {
    if (typeof value === "object" && value !== null) {
        for (var key in value) {
            if (typeof value[key] === "string") {
                value[key] = sanitizeHtml(value[key].trim());
            }
        }
    }
    return value;
}), _5eCharOtherProLang_js_1.edit5eCharOtherProLang);
router.get("/get_months/:calendar_id", months_js_1.getMonths);
router.post("/add_month", (0, express_validator_1.body)("title")
    .trim()
    .customSanitizer(function (val) { return sanitizeHtml(val); }), months_js_1.addMonth);
router["delete"]("/remove_month/:id", months_js_1.removeMonth);
router.post("/edit_month/:id", (0, express_validator_1.body)("title")
    .trim()
    .customSanitizer(function (val) { return sanitizeHtml(val); }), months_js_1.editMonth);
router.get("/get_days/:calendar_id", days_js_1.getDays);
router.post("/add_day", (0, express_validator_1.body)("title")
    .trim()
    .customSanitizer(function (val) { return sanitizeHtml(val); }), days_js_1.addDay);
router["delete"]("/remove_day/:id", days_js_1.removeDay);
router.post("/edit_day/:id", (0, express_validator_1.body)("title")
    .trim()
    .customSanitizer(function (val) { return sanitizeHtml(val); }), days_js_1.editDay);
router.get("/get_calendars/:project_id", calendars_js_1.getCalendars);
router.get("/get_calendar/:id", calendars_js_1.getCalendar);
router.post("/add_calendar", (0, express_validator_1.body)("title")
    .trim()
    .customSanitizer(function (val) { return sanitizeHtml(val); }), calendars_js_1.addCalendar);
router["delete"]("/remove_calendar/:id", calendars_js_1.removeCalendar);
router.post("/edit_calendar/:id", (0, express_validator_1.body)("title")
    .trim()
    .customSanitizer(function (val) { return sanitizeHtml(val); }), calendars_js_1.editCalendar);
router.get("/get_project/:id", projects_js_1.getProject);
router.get("/get_projects", projects_js_1.getProjects);
router.post("/add_project", (0, express_validator_1.body)("title")
    .trim()
    .customSanitizer(function (val) { return sanitizeHtml(val); }), projects_js_1.addProject);
router["delete"]("/remove_project/:id", projects_js_1.removeProject);
router.post("/edit_project/:id", (0, express_validator_1.body)("title")
    .trim()
    .customSanitizer(function (val) { return sanitizeHtml(val); }), projects_js_1.editProject);
router.get("/get_user", users_js_1.getUserBySession);
router.post("/register", (0, express_validator_1.body)("email").isEmail().withMessage("Invalid email format").normalizeEmail(), (0, express_validator_1.body)("username")
    .trim()
    .customSanitizer(function (val) { return sanitizeHtml(val); }), users_js_1.registerUser);
router.post("/login", users_js_1.loginUser);
router.post("/request_reset_email", users_js_1.requestResetEmail);
router.post("/user/reset_password", users_js_1.resetPassword);
router.post("/update_username", (0, express_validator_1.body)("username")
    .trim()
    .customSanitizer(function (val) { return sanitizeHtml(val); }), users_js_1.editUsername);
router.post("/update_email", (0, express_validator_1.body)("email").isEmail().withMessage("Invalid email format").normalizeEmail(), users_js_1.editEmail);
module.exports = router;
