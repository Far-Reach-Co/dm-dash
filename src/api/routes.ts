import { Router, raw } from "express";
import {
  getProject,
  getProjects,
  addProject,
  removeProject,
  editProjectTitle,
  editProjectBannerImage,
} from "./controllers/projects.js";
import {
  registerUser,
  loginUser,
  resetPassword,
  requestResetEmail,
  getUserBySession,
  editEmail,
  editUsername,
  editEmailPreferences,
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
  removeImageByUser,
  newImageForProject,
  newImageForUser,
  editImageName,
  getSignedUrlsHandler,
  editImageNotes,
} from "./controllers/s3.js";
import {
  getLibraryImagesByUser,
  getLibraryImagesByProject,
  getLibraryImagesByUserInFolder,
  getLibraryImagesByProjectInFolder,
  getLibraryImageCountsByUser,
  getLibraryImageCountsByProject,
} from "./controllers/library.js";
// for uploading files
import {
  get5eCharsByUser,
  add5eChar,
  remove5eChar,
  edit5eCharGeneral,
  edit5eCharPro,
  edit5eCharBack,
  get5eCharGeneral,
  duplicate5eChar,
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
  addTableImageByProject,
  addTableImageByUser,
  getTableImagesWithSignedUrlsByTableProject,
  getTableImagesWithSignedUrlsByTableUser,
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
  editTableView,
} from "./controllers/tableViews.js";
import {
  getLocationPinsByTableView,
  addLocationPin,
  removeLocationPin,
  updateLocationPin,
} from "./controllers/locationPins.js";
import {
  editGuestSandboxData,
  getGuestSandboxImageCounts,
  getGuestSandboxImages,
  getGuestSandboxView,
  startGuestSandbox,
} from "./controllers/guestSandbox.js";
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
import {
  add5eCharClass,
  edit5eCharClass,
  get5eCharClassesByGeneral,
  remove5eCharClass,
} from "./controllers/5eCharClasses.js";
import {
  addRecordByProject,
  addRecordByUser,
  editRecord,
  getRecord,
  getRecordsByProject,
  getRecordsByUser,
  removeRecord,
} from "./controllers/record.js";
import {
  getRecordsByProjectQuery,
  getRecordsByUserQuery,
} from "./queries/record.js";

// multer
import multer from "multer";
import {
  addRecordImage,
  getRecordImage,
  getRecordImagesByImage,
  getRecordImagesByRecord,
  removeRecordImageByImage,
} from "./controllers/recordImage.js";
const upload = multer({ dest: "file_uploads/" });

// CSRF validation middleware (token generation is in routes.ts)
import { csrfProtection } from "../routes.js";

var router = Router();

// Global API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again later",
  },
});
router.use(apiLimiter);

const guestSandboxStartLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many guest sandbox requests, please try again shortly",
  },
});

// discord bot
router.get("/bot/get_all_commands", getCommands);
// router.get("/bot/create_command", createCommands);
// router.get("/bot/delete_command/:id", deleteCommand);
router.post(
  "/bot/interactions",
  raw({ type: "application/json" }),
  verifyKeyMiddleware(process.env.BOT_PUBLIC_KEY as string),
  interactionsController
);

// s3
router.get("/get_image/:id", getImage);
router.post("/signed_URL_download_multi", getSignedUrlsHandler);
router.post(
  "/new_image_for_project",
  upload.single("file"),
  newImageForProject
);
router.post("/new_image_for_user", upload.single("file"), newImageForUser);
router.post("/edit_image_name/:id", editImageName);
router.post("/edit_image_notes/:id", editImageNotes);
router.delete(
  "/remove_image_by_table_user/:image_id/:table_id",
  removeImageByTableUser
);
router.delete(
  "/remove_image_by_project/:image_id/:project_id",
  removeImageByProject
);
router.delete("/remove_image_by_user/:image_id", removeImageByUser);

// library
router.get("/get_library_images_by_user", getLibraryImagesByUser);
router.get(
  "/get_library_images_by_project/:project_id",
  getLibraryImagesByProject
);
router.get("/get_library_image_counts_by_user", getLibraryImageCountsByUser);
router.get(
  "/get_library_image_counts_by_project/:project_id",
  getLibraryImageCountsByProject
);
router.get(
  "/get_library_images_by_user_in_folder/:folder_id",
  getLibraryImagesByUserInFolder
);
router.get(
  "/get_library_images_by_project_in_folder/:project_id/:folder_id",
  getLibraryImagesByProjectInFolder
);

// records
router.post("/add_record_by_user", addRecordByUser);
router.post("/add_record_by_project/:project_id", addRecordByProject);
router.get("/get_record/:id", getRecord);
router.get("/get_records_by_user", getRecordsByUser);
router.get("/get_records_by_project/:project_id", getRecordsByProject);
router.post("/edit_record/:id", editRecord);
router.delete("/remove_record/:id", removeRecord);

// record image
router.post("/add_record_image", addRecordImage);
router.get("/get_record_image/:id", getRecordImage);
router.get("/get_record_images_by_record/:record_id", getRecordImagesByRecord);
router.get("/get_record_images_by_image/:image_id", getRecordImagesByImage);
router.delete(
  "/remove_record_image_by_image/:image_id",
  removeRecordImageByImage
);

// table folders
router.post("/add_table_folder_by_user", addTableFolderByUser);
router.post("/add_table_folder_by_project", addTableFolderByProject);
router.get("/get_table_folders_by_user", getTableFoldersByUser);
router.get(
  "/get_table_folders_by_project/:project_id",
  getTableFoldersByProject
);
router.delete("/remove_table_folder/:id", removeTableFolder);
router.post("/edit_table_folder_title/:id", editTableFolderTitle);

// table views
router.get("/get_table_views_by_project/:project_id", getTableViewsByProject);
router.get("/get_table_views_by_user", getTableViewsByUser);
router.get("/get_table_view/:id", getTableView);
router.get("/get_table_view_by_uuid/:uuid", getTableViewByUUID);
router.post("/add_table_view_by_project/:project_id", addTableViewByProject);
router.post("/add_table_view_by_user", addTableViewByUser);
router.delete("/remove_table_view/:id", removeTableView);
router.post("/edit_table_view_data/:id", editTableViewData);
router.post("/edit_table_view/:id", editTableView);
router.post(
  "/start_guest_sandbox",
  guestSandboxStartLimiter,
  startGuestSandbox,
);
router.get("/get_guest_sandbox/:uuid", getGuestSandboxView);
router.post("/edit_guest_sandbox_data/:uuid", editGuestSandboxData);
router.get("/get_guest_sandbox_images/:uuid", getGuestSandboxImages);
router.get(
  "/get_guest_sandbox_image_counts/:uuid",
  getGuestSandboxImageCounts,
);
router.get("/get_location_pins/:table_view_id", getLocationPinsByTableView);
router.post("/add_location_pin", addLocationPin);
router.delete("/remove_location_pin/:id", removeLocationPin);
router.post("/edit_location_pin/:id", updateLocationPin);

// table images
router.get(
  "/get_table_images_with_urls_by_table_project/:table_id",
  getTableImagesWithSignedUrlsByTableProject
);
router.get(
  "/get_table_images_with_urls_by_table_user/:table_id",
  getTableImagesWithSignedUrlsByTableUser
);
router.post("/add_table_image_by_project", addTableImageByProject);
router.post("/add_table_image_by_user", addTableImageByUser);
// router.delete("/remove_table_image/:id", removeTableImage);
router.post("/edit_table_image/:id", editTableImage);

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
router.post("/add_5e_character", add5eChar);
router.delete("/remove_5e_character/:id", remove5eChar);
router.post("/duplicate_5e_character", duplicate5eChar);
router.post("/edit_5e_character_general/:id", edit5eCharGeneral);
router.post("/edit_5e_character_proficiencies/:id", edit5eCharPro);
router.post("/edit_5e_character_background/:id", edit5eCharBack);
router.post("/edit_5e_character_spell_slots/:id", edit5eCharSpellSlotInfo);

// 5e characters attacks
router.get("/get_5e_character_attacks/:general_id", get5eCharAttacksByGeneral);
router.post("/add_5e_character_attack", add5eCharAttack);
router.delete("/remove_5e_character_attack/:id", remove5eCharAttack);
router.post("/edit_5e_character_attack/:id", edit5eCharAttack);

// 5e characters spells
router.get("/get_5e_character_spells/:general_id/:type", get5eCharSpellsByType);
router.post("/add_5e_character_spell", add5eCharSpell);
router.delete("/remove_5e_character_spell/:id", remove5eCharSpell);
router.post("/edit_5e_character_spell/:id", edit5eCharSpell);

// 5e characters feats/traits
router.get("/get_5e_character_feats/:general_id", get5eCharFeatsByGeneral);
router.post("/add_5e_character_feat", add5eCharFeat);
router.delete("/remove_5e_character_feat/:id", remove5eCharFeat);
router.post("/edit_5e_character_feat/:id", edit5eCharFeat);

// 5e characters equipments
router.get(
  "/get_5e_character_equipments/:general_id",
  get5eCharEquipmentsByGeneral
);
router.post("/add_5e_character_equipment", add5eCharEquipment);
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
router.post("/edit_5e_character_other_pro_lang/:id", edit5eCharOtherProLang);

// 5e characters classes
router.get("/get_5e_character_classes/:general_id", get5eCharClassesByGeneral);
router.post("/add_5e_character_class", add5eCharClass);
router.delete("/remove_5e_character_class/:id", remove5eCharClass);
router.post("/edit_5e_character_class/:id", edit5eCharClass);

// months
router.get("/get_months/:calendar_id", getMonths);
router.post("/add_month", addMonth);
router.delete("/remove_month/:id", removeMonth);
router.post("/edit_month/:id", editMonth);

// days
router.get("/get_days/:calendar_id", getDays);
router.post("/add_day", addDay);
router.delete("/remove_day/:id", removeDay);
router.post("/edit_day/:id", editDay);

// calendars
router.get("/get_calendars/:project_id", getCalendars);
router.get("/get_calendar/:id", getCalendar);
router.post("/add_calendar", addCalendar);
router.delete("/remove_calendar/:id", removeCalendar);
router.post("/edit_calendar/:id", editCalendar);

// project users
router.delete("/remove_project_user/:id", removeProjectUser);
router.post("/edit_project_user_is_editor/:id", editProjectUserIsEditor);

// project invites
router.post("/add_project_invite", addProjectInvite);
router.delete("/remove_project_invite/:id", removeProjectInvite);

// projects
router.get("/get_project/:id", getProject);
router.get("/get_projects", getProjects);
router.post("/add_project", addProject);
router.delete("/remove_project/:id", removeProject);
router.post("/edit_project_title/:id", editProjectTitle);
router.post("/edit_project_banner_image/:id", editProjectBannerImage);

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
  csrfProtection,
  registerLimiter,
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  registerUser
);
router.post("/login", csrfProtection, loginLimiter, loginUser);
router.post(
  "/request_reset_email",
  csrfProtection,
  requestResetLimiter,
  requestResetEmail
);
router.post("/user/reset_password", csrfProtection, resetPassword);
router.post("/update_username", csrfProtection, editUsername);
router.post(
  "/update_email",
  csrfProtection,
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  editEmail
);
router.post("/update_email_preferences", csrfProtection, editEmailPreferences);

export default router;
