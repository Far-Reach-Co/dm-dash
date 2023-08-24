import { Router } from "express";
import {
  getProject,
  getProjects,
  addProject,
  removeProject,
  editProjectTitle,
} from "./controllers/projects.js";
import {
  registerUser,
  loginUser,
  resetPassword,
  requestResetEmail,
  getUserBySession,
  editEmail,
  editUsername,
} from "./controllers/users.js";
import {
  getCalendars,
  addCalendar,
  removeCalendar,
  editCalendar,
  getCalendar,
} from "./controllers/calendars.js";
import {
  getMonths,
  addMonth,
  removeMonth,
  editMonth,
} from "./controllers/months.js";
import { getDays, addDay, removeDay, editDay } from "./controllers/days.js";
import {
  addProjectInvite,
  removeProjectInvite,
} from "./controllers/projectInvites.js";
import {
  removeProjectUser,
  editProjectUserIsEditor,
} from "./controllers/projectUsers.js";
import {
  getImage,
  removeImageByTableUser,
  removeImageByProject,
  newImageForProject,
  newImageForUser,
  editImageName,
  getSignedUrlsForDownloads,
} from "./controllers/s3.js";
// for uploading files
import multer = require("multer");
import {
  get5eCharsByUser,
  add5eChar,
  remove5eChar,
  edit5eCharGeneral,
  edit5eCharPro,
  edit5eCharBack,
  get5eCharGeneral,
} from "./controllers/5eCharGeneral.js";
import {
  get5eCharOtherProLangsByGeneral,
  add5eCharOtherProLang,
  remove5eCharOtherProLang,
  edit5eCharOtherProLang,
} from "./controllers/5eCharOtherProLang.js";
import {
  get5eCharAttacksByGeneral,
  add5eCharAttack,
  remove5eCharAttack,
  edit5eCharAttack,
} from "./controllers/5eCharAttacks.js";
import {
  get5eCharEquipmentsByGeneral,
  add5eCharEquipment,
  remove5eCharEquipment,
  edit5eCharEquipment,
} from "./controllers/5eCharEquipment.js";
import {
  get5eCharFeatsByGeneral,
  add5eCharFeat,
  remove5eCharFeat,
  edit5eCharFeat,
} from "./controllers/5eCharFeats.js";
import { edit5eCharSpellSlotInfo } from "./controllers/5eCharSpellSlots.js";
import {
  get5eCharSpellsByType,
  add5eCharSpell,
  remove5eCharSpell,
  edit5eCharSpell,
} from "./controllers/5eCharSpells.js";
import {
  addProjectPlayer,
  removeProjectPlayer,
  getProjectPlayersByPlayer,
} from "./controllers/projectPlayers.js";
import {
  removeTableImage,
  editTableImage,
  getTableImagesByTableUser,
  addTableImageByProject,
  addTableImageByUser,
  getTableImagesByTableProject,
} from "./controllers/tableImages.js";
import {
  getTableViewsByProject,
  removeTableView,
  getTableView,
  addTableViewByUser,
  getTableViewByUUID,
  getTableViewsByUser,
  addTableViewByProject,
  editTableViewData,
  editTableViewTitle,
} from "./controllers/tableViews.js";
import {
  addPlayerInvite,
  getPlayerInviteByPlayer,
  getPlayerInviteByUUID,
  removePlayerInvite,
} from "./controllers/playerInvites.js";
import {
  addPlayerUser,
  getPlayerUserByUserAndPlayer,
  removePlayerUser,
  removePlayerUserByUserAndPlayer,
  removePlayerUsersByPlayer,
} from "./controllers/playerUsers.js";
import { body } from "express-validator";
import {
  addTableFolderByProject,
  addTableFolderByUser,
  editTableFolderTitle,
  getTableFoldersByProject,
  getTableFoldersByUser,
  removeTableFolder,
} from "./controllers/tableFolders.js";
import { verifyKeyMiddleware } from "discord-interactions";
import { rateLimit } from "express-rate-limit";
import {
  createCommands,
  deleteCommand,
  getCommands,
  interactionsController,
} from "./controllers/discordBot.js";
const sanitizeHtml = require("sanitize-html");
const upload = multer({ dest: "file_uploads/" });
const csrf = require("csurf");

//csrf use
const csrfMiddleware = csrf();

var router = Router();

// discord bot
router.get("/bot/get_all_commands", getCommands);
router.get("/bot/create_command", createCommands);
router.get("/bot/delete_command/:id", deleteCommand);
router.post("/bot/interactions", interactionsController);

// s3
router.get("/get_image/:id", getImage);
router.post("/signed_URL_download_multi", getSignedUrlsForDownloads);
router.post(
  "/new_image_for_project",
  upload.single("file"),
  newImageForProject
);
router.post("/new_image_for_user", upload.single("file"), newImageForUser);
router.post(
  "/edit_image_name/:id",
  body("original_name")
    .trim()
    .customSanitizer((val) => sanitizeHtml(val)),
  editImageName
);
router.delete(
  "/remove_image_by_table_user/:image_id/:table_id",
  removeImageByTableUser
);
router.delete(
  "/remove_image_by_project/:image_id/:project_id",
  removeImageByProject
);

// table folders
router.post(
  "/add_table_folder_by_user",
  body("title")
    .trim()
    .customSanitizer((val) => sanitizeHtml(val)),
  addTableFolderByUser
);
router.post(
  "/add_table_folder_by_project",
  body("title")
    .trim()
    .customSanitizer((val) => sanitizeHtml(val)),
  addTableFolderByProject
);
router.get("/get_table_folders_by_user", getTableFoldersByUser);
router.get(
  "/get_table_folders_by_project/:project_id",
  getTableFoldersByProject
);
router.delete("/remove_table_folder/:id", removeTableFolder);
router.post(
  "/edit_table_folder_title/:id",
  body("title")
    .trim()
    .customSanitizer((val) => sanitizeHtml(val)),
  editTableFolderTitle
);

// table views
router.get("/get_table_views_by_project/:project_id", getTableViewsByProject);
router.get("/get_table_views_by_user", getTableViewsByUser);
router.get("/get_table_view/:id", getTableView);
router.get("/get_table_view_by_uuid/:uuid", getTableViewByUUID);
router.post("/add_table_view_by_project/:project_id", addTableViewByProject);
router.post("/add_table_view_by_user", addTableViewByUser);
router.delete("/remove_table_view/:id", removeTableView);
router.post("/edit_table_view_data/:id", editTableViewData);
router.post(
  "/edit_table_view_title/:id",
  body("title")
    .trim()
    .customSanitizer((val) => sanitizeHtml(val)),
  editTableViewTitle
);

// table images
router.get(
  "/get_table_images_by_table_project/:table_id",
  getTableImagesByTableProject
);
router.get(
  "/get_table_images_by_table_user/:table_id",
  getTableImagesByTableUser
);
router.post("/add_table_image_by_project", addTableImageByProject);
router.post("/add_table_image_by_user", addTableImageByUser);
router.delete("/remove_table_image/:id", removeTableImage);

// project players
router.get(
  "/get_project_players_by_player/:player_id",
  getProjectPlayersByPlayer
);
router.post("/add_project_player", addProjectPlayer);
router.delete("/remove_project_player/:id", removeProjectPlayer);

// player users
router.get(
  "/get_player_user_by_user_and_player/:player_id",
  getPlayerUserByUserAndPlayer
);
router.post("/add_player_user", addPlayerUser);
router.delete("/remove_player_user/:id", removePlayerUser);
router.delete(
  "/remove_player_user_by_user_and_player/:player_id",
  removePlayerUserByUserAndPlayer
);
router.delete(
  "/remove_player_users_by_player/:player_id",
  removePlayerUsersByPlayer
);

// player invites
router.get("/get_player_invite_by_uuid/:uuid", getPlayerInviteByUUID);
router.get("/get_player_invite_by_player/:player_id", getPlayerInviteByPlayer);
router.post("/add_player_invite", addPlayerInvite);
router.delete("/remove_player_invite/:id", removePlayerInvite);

// 5e characters general, proficiencies, background, spell slots
router.get("/get_5e_characters_by_user", get5eCharsByUser);
router.get("/get_5e_character_general/:id", get5eCharGeneral);
router.post(
  "/add_5e_character",
  body("name")
    .trim()
    .customSanitizer((val) => sanitizeHtml(val)),
  add5eChar
);
router.delete("/remove_5e_character/:id", remove5eChar);
router.post(
  "/edit_5e_character_general/:id",
  body().customSanitizer((value) => {
    if (typeof value === "object" && value !== null) {
      // Loop over all properties of the object and sanitize them if they're strings
      for (let key in value) {
        if (typeof value[key] === "string") {
          value[key] = sanitizeHtml(value[key].trim());
        }
      }
    }
    return value;
  }),
  edit5eCharGeneral
);
router.post(
  "/edit_5e_character_proficiencies/:id",
  body().customSanitizer((value) => {
    if (typeof value === "object" && value !== null) {
      // Loop over all properties of the object and sanitize them if they're strings
      for (let key in value) {
        if (typeof value[key] === "string") {
          value[key] = sanitizeHtml(value[key].trim());
        }
      }
    }
    return value;
  }),
  edit5eCharPro
);
router.post(
  "/edit_5e_character_background/:id",
  body().customSanitizer((value) => {
    if (typeof value === "object" && value !== null) {
      // Loop over all properties of the object and sanitize them if they're strings
      for (let key in value) {
        if (typeof value[key] === "string") {
          value[key] = sanitizeHtml(value[key].trim());
        }
      }
    }
    return value;
  }),
  edit5eCharBack
);
router.post(
  "/edit_5e_character_spell_slots/:id",
  body().customSanitizer((value) => {
    if (typeof value === "object" && value !== null) {
      // Loop over all properties of the object and sanitize them if they're strings
      for (let key in value) {
        if (typeof value[key] === "string") {
          value[key] = sanitizeHtml(value[key].trim());
        }
      }
    }
    return value;
  }),
  edit5eCharSpellSlotInfo
);

// 5e characters attacks
router.get("/get_5e_character_attacks/:general_id", get5eCharAttacksByGeneral);
router.post(
  "/add_5e_character_attack",
  body().customSanitizer((value) => {
    if (typeof value === "object" && value !== null) {
      // Loop over all properties of the object and sanitize them if they're strings
      for (let key in value) {
        if (typeof value[key] === "string") {
          value[key] = sanitizeHtml(value[key].trim());
        }
      }
    }
    return value;
  }),
  add5eCharAttack
);
router.delete("/remove_5e_character_attack/:id", remove5eCharAttack);
router.post(
  "/edit_5e_character_attack/:id",
  body().customSanitizer((value) => {
    if (typeof value === "object" && value !== null) {
      // Loop over all properties of the object and sanitize them if they're strings
      for (let key in value) {
        if (typeof value[key] === "string") {
          value[key] = sanitizeHtml(value[key].trim());
        }
      }
    }
    return value;
  }),
  edit5eCharAttack
);

// 5e characters spells
router.get("/get_5e_character_spells/:general_id/:type", get5eCharSpellsByType);
router.post("/add_5e_character_spell", add5eCharSpell);
router.delete(
  "/remove_5e_character_spell/:id",
  body().customSanitizer((value) => {
    if (typeof value === "object" && value !== null) {
      // Loop over all properties of the object and sanitize them if they're strings
      for (let key in value) {
        if (typeof value[key] === "string") {
          value[key] = sanitizeHtml(value[key].trim());
        }
      }
    }
    return value;
  }),
  remove5eCharSpell
);
router.post("/edit_5e_character_spell/:id", edit5eCharSpell);

// 5e characters feats/traits
router.get("/get_5e_character_feats/:general_id", get5eCharFeatsByGeneral);
router.post(
  "/add_5e_character_feat",
  body().customSanitizer((value) => {
    if (typeof value === "object" && value !== null) {
      // Loop over all properties of the object and sanitize them if they're strings
      for (let key in value) {
        if (typeof value[key] === "string") {
          value[key] = sanitizeHtml(value[key].trim());
        }
      }
    }
    return value;
  }),
  add5eCharFeat
);
router.delete("/remove_5e_character_feat/:id", remove5eCharFeat);
router.post(
  "/edit_5e_character_feat/:id",
  body().customSanitizer((value) => {
    if (typeof value === "object" && value !== null) {
      // Loop over all properties of the object and sanitize them if they're strings
      for (let key in value) {
        if (typeof value[key] === "string") {
          value[key] = sanitizeHtml(value[key].trim());
        }
      }
    }
    return value;
  }),
  edit5eCharFeat
);

// 5e characters equipments
router.get(
  "/get_5e_character_equipments/:general_id",
  get5eCharEquipmentsByGeneral
);
router.post(
  "/add_5e_character_equipment",
  body().customSanitizer((value) => {
    if (typeof value === "object" && value !== null) {
      // Loop over all properties of the object and sanitize them if they're strings
      for (let key in value) {
        if (typeof value[key] === "string") {
          value[key] = sanitizeHtml(value[key].trim());
        }
      }
    }
    return value;
  }),
  add5eCharEquipment
);
router.delete("/remove_5e_character_equipment/:id", remove5eCharEquipment);
router.post("/edit_5e_character_equipment/:id", edit5eCharEquipment);

// 5e characters other proficiencies and languages
router.get(
  "/get_5e_character_other_pro_langs/:general_id",
  get5eCharOtherProLangsByGeneral
);
router.post("/add_5e_character_other_pro_lang", add5eCharOtherProLang);
router.delete(
  "/remove_5e_character_other_pro_lang/:id",
  remove5eCharOtherProLang
);
router.post(
  "/edit_5e_character_other_pro_lang/:id",
  body().customSanitizer((value) => {
    if (typeof value === "object" && value !== null) {
      // Loop over all properties of the object and sanitize them if they're strings
      for (let key in value) {
        if (typeof value[key] === "string") {
          value[key] = sanitizeHtml(value[key].trim());
        }
      }
    }
    return value;
  }),
  edit5eCharOtherProLang
);

// months
router.get("/get_months/:calendar_id", getMonths);
router.post(
  "/add_month",
  body("title")
    .trim()
    .customSanitizer((val) => sanitizeHtml(val)),
  addMonth
);
router.delete("/remove_month/:id", removeMonth);
router.post(
  "/edit_month/:id",
  body("title")
    .trim()
    .customSanitizer((val) => sanitizeHtml(val)),
  editMonth
);

// days
router.get("/get_days/:calendar_id", getDays);
router.post(
  "/add_day",
  body("title")
    .trim()
    .customSanitizer((val) => sanitizeHtml(val)),
  addDay
);
router.delete("/remove_day/:id", removeDay);
router.post(
  "/edit_day/:id",
  body("title")
    .trim()
    .customSanitizer((val) => sanitizeHtml(val)),
  editDay
);

// calendars
router.get("/get_calendars/:project_id", getCalendars);
router.get("/get_calendar/:id", getCalendar);
router.post(
  "/add_calendar",
  body("title")
    .trim()
    .customSanitizer((val) => sanitizeHtml(val)),
  addCalendar
);
router.delete("/remove_calendar/:id", removeCalendar);
router.post(
  "/edit_calendar/:id",
  body("title")
    .trim()
    .customSanitizer((val) => sanitizeHtml(val)),
  editCalendar
);

// project users
router.delete("/remove_project_user/:id", removeProjectUser);
router.post("/edit_project_user_is_editor/:id", editProjectUserIsEditor);

// project invites
router.post("/add_project_invite", addProjectInvite);
router.delete("/remove_project_invite/:id", removeProjectInvite);

// projects
router.get("/get_project/:id", getProject);
router.get("/get_projects", getProjects);
router.post(
  "/add_project",
  body("title")
    .trim()
    .customSanitizer((val) => sanitizeHtml(val)),
  addProject
);
router.delete("/remove_project/:id", removeProject);
router.post(
  "/edit_project_title/:id",
  body("title")
    .trim()
    .customSanitizer((val) => sanitizeHtml(val)),
  editProjectTitle
);

// Auth and Users
// setup rate limiters
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    message:
      "Too many accounts created from this IP, please try again after an hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    message:
      "Too many login attempts from this IP, please try again after an hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const requestResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    message:
      "Too many reset requests from this IP, please try again after an hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/get_user", getUserBySession);
router.post(
  "/register",
  csrfMiddleware,
  registerLimiter,
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("username")
    .trim()
    .customSanitizer((val) => sanitizeHtml(val)),
  registerUser
);
router.post("/login", csrfMiddleware, loginLimiter, loginUser);
router.post(
  "/request_reset_email",
  csrfMiddleware,
  requestResetLimiter,
  requestResetEmail
);
router.post("/user/reset_password", csrfMiddleware, resetPassword);
router.post(
  "/update_username",
  csrfMiddleware,
  body("username")
    .trim()
    .customSanitizer((val) => sanitizeHtml(val)),
  editUsername
);
router.post(
  "/update_email",
  csrfMiddleware,
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  editEmail
);

module.exports = router;
