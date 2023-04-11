const express = require("express");
const {
  getClocks,
  addClock,
  removeClock,
  editClock,
} = require("./controllers/clocks.js");
const {
  getProject,
  getProjects,
  addProject,
  removeProject,
  editProject,
} = require("./controllers/projects.js");
const {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  verifyJwt,
  editUser,
  resetPassword,
  requestResetEmail,
} = require("./controllers/users.js");
const {
  getCalendars,
  addCalendar,
  removeCalendar,
  editCalendar,
} = require("./controllers/calendars.js");
const {
  getMonths,
  addMonth,
  removeMonth,
  editMonth,
} = require("./controllers/months.js");
const {
  getDays,
  addDay,
  removeDay,
  editDay,
} = require("./controllers/days.js");
const {
  getLocation,
  getLocations,
  getSubLocations,
  addLocation,
  removeLocation,
  editLocation,
} = require("./controllers/locations.js");
const {
  getNotes,
  addNote,
  getNotesByLocation,
  getNotesByCharacter,
  removeNote,
  editNote,
  getNotesByItem,
  getNotesByLore,
} = require("./controllers/notes.js");
const {
  getEvents,
  addEvent,
  getEventsByLocation,
  getEventsByCharacter,
  removeEvent,
  editEvent,
  getEventsByItem,
  getEventsByLore,
} = require("./controllers/events.js");
const {
  getCounters,
  addCounter,
  removeCounter,
  editCounter,
} = require("./controllers/counters.js");
const {
  getCharacter,
  getCharacters,
  getCharactersByLocation,
  addCharacter,
  removeCharacter,
  editCharacter,
} = require("./controllers/characters.js");
const {
  getItem,
  getItems,
  getItemsByLocation,
  getItemsByCharacter,
  addItem,
  removeItem,
  editItem,
} = require("./controllers/items.js");
const {
  getProjectInviteByUUID,
  addProjectInvite,
  removeProjectInvite,
} = require("./controllers/projectInvites.js");
const {
  getProjectUserByUserAndProject,
  getProjectUsersByProject,
  addProjectUser,
  removeProjectUser,
  editProjectUser,
} = require("./controllers/projectUsers.js");
const {
  getSignedUrlForDownload,
  uploadToAws,
  removeImage,
  getImage,
} = require("./controllers/s3.js");
// for uploading files
const multer = require("multer");
const {
  getLore,
  getLores,
  addLore,
  removeLore,
  editLore,
} = require("./controllers/lores.js");
const {
  getLoreRelation,
  getLoreRelationsByLore,
  getLoreRelationsByLocation,
  getLoreRelationsByCharacter,
  getLoreRelationsByItem,
  addLoreRelation,
  removeLoreRelation,
  editLoreRelation,
} = require("./controllers/loreRelations.js");
const {
  get5eCharsByUser,
  add5eChar,
  remove5eChar,
  edit5eCharGeneral,
  edit5eCharPro,
  edit5eCharBack,
  get5eCharGeneral,
} = require("./controllers/5eCharGeneral.js");
const {
  get5eCharOtherProLangsByGeneral,
  add5eCharOtherProLang,
  remove5eCharOtherProLang,
  edit5eCharOtherProLang,
} = require("./controllers/5eCharOtherProLang.js");
const {
  get5eCharAttacksByGeneral,
  add5eCharAttack,
  remove5eCharAttack,
  edit5eCharAttack,
} = require("./controllers/5eCharAttacks.js");
const {
  get5eCharEquipmentsByGeneral,
  add5eCharEquipment,
  remove5eCharEquipment,
  edit5eCharEquipment,
} = require("./controllers/5eCharEquipment.js");
const {
  get5eCharFeatsByGeneral,
  add5eCharFeat,
  remove5eCharFeat,
  edit5eCharFeat,
} = require("./controllers/5eCharFeats.js");
const {
  edit5eCharSpellSlotInfo,
} = require("./controllers/5eCharSpellSlots.js");
const {
  get5eCharSpellsByType,
  add5eCharSpell,
  remove5eCharSpell,
  edit5eCharSpell,
} = require("./controllers/5eCharSpells.js");
const {
  getProjectPlayersByProject,
  addProjectPlayer,
  removeProjectPlayer,
  editProjectPlayer,
  getProjectPlayersByPlayer,
} = require("./controllers/projectPlayers.js");
const {
  getTableImages,
  addTableImage,
  removeTableImage,
  editTableImage,
} = require("./controllers/tableImages.js");
const {
  getTableViews,
  removeTableView,
  editTableView,
  addTableView,
  getTableView,
} = require("./controllers/tableViews.js");
const upload = multer({ dest: "file_uploads/" });

var router = express.Router();

// s3
router.get("/get_image/:id", getImage);
router.post("/signed_URL_download", getSignedUrlForDownload);
router.post("/file_upload", upload.single("file"), uploadToAws);
router.delete("/remove_image/:project_id/:image_id", removeImage);

// table views
router.get("/get_table_views/:project_id", getTableViews);
router.get("/get_table_view/:id", getTableView);
router.post("/add_table_view", addTableView);
router.delete("/remove_table_view/:id", removeTableView);
router.post("/edit_table_view/:id", editTableView);

// table images
router.get("/get_table_images/:project_id", getTableImages);
router.post("/add_table_image", addTableImage);
router.delete("/remove_table_image/:id", removeTableImage);
router.post("/edit_table_image/:id", editTableImage);

// project players
router.get(
  "/get_project_players_by_project/:project_id",
  getProjectPlayersByProject
);
router.get(
  "/get_project_players_by_player/:player_id",
  getProjectPlayersByPlayer
);
router.post("/add_project_player", addProjectPlayer);
router.delete("/remove_project_player/:id", removeProjectPlayer);
router.post("/edit_project_player/:id", editProjectPlayer);

// project users
router.get(
  "/get_project_user_by_user_and_project/:project_id",
  getProjectUserByUserAndProject
);
router.get(
  "/get_project_users_by_project/:project_id",
  getProjectUsersByProject
);
router.post("/add_project_user", addProjectUser);
router.delete("/remove_project_user/:id", removeProjectUser);
router.post("/edit_project_user/:id", editProjectUser);

// project invites
router.get("/get_project_invite_by_uuid/:uuid", getProjectInviteByUUID);
router.post("/add_project_invite", addProjectInvite);
router.delete("/remove_project_invite/:id", removeProjectInvite);

// 5e characters general, proficiencies, background, spell slots
router.get("/get_5e_characters_by_user", get5eCharsByUser);
router.get("/get_5e_character_general/:id", get5eCharGeneral);
router.post("/add_5e_character", add5eChar);
router.delete("/remove_5e_character/:id", remove5eChar);
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

// events
router.get("/get_events/:project_id/:limit/:offset", getEvents);
router.get("/get_events_by_location/:location_id", getEventsByLocation);
router.get("/get_events_by_character/:character_id", getEventsByCharacter);
router.get("/get_events_by_item/:item_id", getEventsByItem);
router.get("/get_events_by_lore/:lore_id", getEventsByLore);
router.post("/add_event", addEvent);
router.delete("/remove_event/:id", removeEvent);
router.post("/edit_event/:id", editEvent);

// notes
router.get("/get_notes/:project_id/:limit/:offset", getNotes);
router.get("/get_notes/:project_id/:limit/:offset/:keyword", getNotes);
router.get("/get_notes_by_location/:location_id", getNotesByLocation);
router.get("/get_notes_by_character/:character_id", getNotesByCharacter);
router.get("/get_notes_by_item/:item_id", getNotesByItem);
router.get("/get_notes_by_lore/:lore_id", getNotesByLore);
router.post("/add_note", addNote);
router.delete("/remove_note/:id", removeNote);
router.post("/edit_note/:id", editNote);

// lore relations
router.get("/get_lore_relation/:id", getLoreRelation);
router.get("/get_lore_relations_by_lore/:type/:id", getLoreRelationsByLore);
router.get(
  "/get_lore_relations_by_location/:location_id",
  getLoreRelationsByLocation
);
router.get(
  "/get_lore_relations_by_character/:character_id",
  getLoreRelationsByCharacter
);
router.get("/get_lore_relations_by_item/:item_id", getLoreRelationsByItem);
router.post("/add_lore_relation", addLoreRelation);
router.delete("/remove_lore_relation/:id", removeLoreRelation);
router.post("/edit_lore_relation/:id", editLoreRelation);

// lores
router.get("/get_lore/:id", getLore);
router.get("/get_lores/:project_id/:limit/:offset", getLores);
router.get("/get_lores_filter/:project_id/:limit/:offset/:filter", getLores);
router.get("/get_lores_keyword/:project_id/:limit/:offset/:keyword", getLores);
router.get(
  "/get_lores_filter_keyword/:project_id/:limit/:offset/:filter/:keyword",
  getLores
);
router.post("/add_lore", addLore);
router.delete("/remove_lore/:id", removeLore);
router.post("/edit_lore/:id", editLore);

// items
router.get("/get_item/:id", getItem);
router.get("/get_items/:project_id/:limit/:offset", getItems);
router.get("/get_items_filter/:project_id/:limit/:offset/:filter", getItems);
router.get("/get_items_keyword/:project_id/:limit/:offset/:keyword", getItems);
router.get(
  "/get_items_filter_keyword/:project_id/:limit/:offset/:filter/:keyword",
  getItems
);
router.get("/get_items_by_location/:location_id", getItemsByLocation);
router.get("/get_items_by_character/:character_id", getItemsByCharacter);
router.post("/add_item", addItem);
router.delete("/remove_item/:id", removeItem);
router.post("/edit_item/:id", editItem);

// characters
router.get("/get_character/:id", getCharacter);
router.get("/get_characters/:project_id/:limit/:offset", getCharacters);
router.get(
  "/get_characters_filter/:project_id/:limit/:offset/:filter",
  getCharacters
);
router.get(
  "/get_characters_keyword/:project_id/:limit/:offset/:keyword",
  getCharacters
);
router.get(
  "/get_characters_filter_keyword/:project_id/:limit/:offset/:filter/:keyword",
  getCharacters
);
router.get("/get_characters_by_location/:location_id", getCharactersByLocation);
router.post("/add_character", addCharacter);
router.delete("/remove_character/:id", removeCharacter);
router.post("/edit_character/:id", editCharacter);

// locations
router.get("/get_location/:id", getLocation);
router.get("/get_locations/:project_id/:limit/:offset", getLocations);
router.get(
  "/get_locations_filter/:project_id/:limit/:offset/:filter",
  getLocations
);
router.get(
  "/get_locations_keyword/:project_id/:limit/:offset/:keyword",
  getLocations
);
router.get(
  "/get_locations_filter_keyword/:project_id/:limit/:offset/:filter/:keyword",
  getLocations
);
router.get("/get_sublocations/:parent_location_id", getSubLocations);
router.post("/add_location", addLocation);
router.delete("/remove_location/:id", removeLocation);
router.post("/edit_location/:id", editLocation);

// counters
router.get("/get_counters/:project_id", getCounters);
router.post("/add_counter", addCounter);
router.delete("/remove_counter/:id", removeCounter);
router.post("/edit_counter/:id", editCounter);

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
router.post("/add_calendar", addCalendar);
router.delete("/remove_calendar/:id", removeCalendar);
router.post("/edit_calendar/:id", editCalendar);

// clocks
router.get("/get_clocks/:project_id", getClocks);
router.post("/add_clock", addClock);
router.delete("/remove_clock/:id", removeClock);
router.post("/edit_clock/:id", editClock);

// projects
router.get("/get_project/:id", getProject);
router.get("/get_projects", getProjects);
router.post("/add_project", addProject);
router.delete("/remove_project/:id", removeProject);
router.post("/edit_project/:id", editProject);

// Auth and Users
// router.get("/users", getAllUsers);
// router.get("/get_user", getUserByToken);
router.get("/get_user_by_id/:id", getUserById); // needs security
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify_jwt", verifyJwt);
router.post("/request_reset_email", requestResetEmail);

// sub heading user
router.post("/user/edit_user", editUser);
router.post("/user/reset_password", resetPassword);

module.exports = router;