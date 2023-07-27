"use strict";
exports.__esModule = true;
var express_1 = require("express");
var clocks_js_1 = require("./controllers/clocks.js");
var projects_js_1 = require("./controllers/projects.js");
var users_js_1 = require("./controllers/users.js");
var calendars_js_1 = require("./controllers/calendars.js");
var months_js_1 = require("./controllers/months.js");
var days_js_1 = require("./controllers/days.js");
var locations_js_1 = require("./controllers/locations.js");
var notes_js_1 = require("./controllers/notes.js");
var events_js_1 = require("./controllers/events.js");
var counters_js_1 = require("./controllers/counters.js");
var characters_js_1 = require("./controllers/characters.js");
var items_js_1 = require("./controllers/items.js");
var projectInvites_js_1 = require("./controllers/projectInvites.js");
var projectUsers_js_1 = require("./controllers/projectUsers.js");
var s3_js_1 = require("./controllers/s3.js");
var multer = require("multer");
var lores_js_1 = require("./controllers/lores.js");
var loreRelations_js_1 = require("./controllers/loreRelations.js");
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
var upload = multer({ dest: "file_uploads/" });
var router = (0, express_1.Router)();
router.get("/get_image/:id", s3_js_1.getImage);
router.post("/signed_URL_download", s3_js_1.getSignedUrlForDownload);
router.post("/file_upload", upload.single("file"), s3_js_1.uploadToAws);
router.post("/edit_image/:id", s3_js_1.editImage);
router["delete"]("/remove_image/:project_id/:image_id", s3_js_1.removeImage);
router.get("/get_table_views/:project_id", tableViews_js_1.getTableViews);
router.get("/get_table_view/:id", tableViews_js_1.getTableView);
router.post("/add_table_view", tableViews_js_1.addTableView);
router["delete"]("/remove_table_view/:id", tableViews_js_1.removeTableView);
router.post("/edit_table_view/:id", tableViews_js_1.editTableView);
router.get("/get_table_images/:project_id", tableImages_js_1.getTableImages);
router.post("/add_table_image", tableImages_js_1.addTableImage);
router["delete"]("/remove_table_image/:id", tableImages_js_1.removeTableImage);
router.post("/edit_table_image/:id", tableImages_js_1.editTableImage);
router.get("/get_project_players_by_project/:project_id", projectPlayers_js_1.getProjectPlayersByProject);
router.get("/get_project_players_by_player/:player_id", projectPlayers_js_1.getProjectPlayersByPlayer);
router.post("/add_project_player", projectPlayers_js_1.addProjectPlayer);
router["delete"]("/remove_project_player/:id", projectPlayers_js_1.removeProjectPlayer);
router.post("/edit_project_player/:id", projectPlayers_js_1.editProjectPlayer);
router.get("/get_project_user_by_user_and_project/:project_id", projectUsers_js_1.getProjectUserByUserAndProject);
router.get("/get_project_users_by_project/:project_id", projectUsers_js_1.getProjectUsersByProject);
router.post("/add_project_user", projectUsers_js_1.addProjectUser);
router["delete"]("/remove_project_user/:id", projectUsers_js_1.removeProjectUser);
router.post("/edit_project_user/:id", projectUsers_js_1.editProjectUser);
router.get("/get_player_user_by_user_and_player/:player_id", playerUsers_js_1.getPlayerUserByUserAndPlayer);
router.get("/get_player_users_by_player/:player_id", playerUsers_js_1.getPlayerUsersByPlayer);
router.post("/add_player_user", playerUsers_js_1.addPlayerUser);
router["delete"]("/remove_player_user/:id", playerUsers_js_1.removePlayerUser);
router.post("/edit_player_user/:id", playerUsers_js_1.editPlayerUser);
router["delete"]("/remove_player_user_by_user_and_player/:player_id", playerUsers_js_1.removePlayerUserByUserAndPlayer);
router.get("/get_player_invite_by_uuid/:uuid", playerInvites_js_1.getPlayerInviteByUUID);
router.get("/get_player_invite_by_player/:player_id", playerInvites_js_1.getPlayerInviteByPlayer);
router.post("/add_player_invite", playerInvites_js_1.addPlayerInvite);
router["delete"]("/remove_player_invite/:id", playerInvites_js_1.removePlayerInvite);
router.get("/get_project_invite_by_uuid/:uuid", projectInvites_js_1.getProjectInviteByUUID);
router.post("/add_project_invite", projectInvites_js_1.addProjectInvite);
router["delete"]("/remove_project_invite/:id", projectInvites_js_1.removeProjectInvite);
router.get("/get_5e_characters_by_user", _5eCharGeneral_js_1.get5eCharsByUser);
router.get("/get_5e_character_general/:id", _5eCharGeneral_js_1.get5eCharGeneral);
router.post("/add_5e_character", _5eCharGeneral_js_1.add5eChar);
router["delete"]("/remove_5e_character/:id", _5eCharGeneral_js_1.remove5eChar);
router.post("/edit_5e_character_general/:id", _5eCharGeneral_js_1.edit5eCharGeneral);
router.post("/edit_5e_character_proficiencies/:id", _5eCharGeneral_js_1.edit5eCharPro);
router.post("/edit_5e_character_background/:id", _5eCharGeneral_js_1.edit5eCharBack);
router.post("/edit_5e_character_spell_slots/:id", _5eCharSpellSlots_js_1.edit5eCharSpellSlotInfo);
router.get("/get_5e_character_attacks/:general_id", _5eCharAttacks_js_1.get5eCharAttacksByGeneral);
router.post("/add_5e_character_attack", _5eCharAttacks_js_1.add5eCharAttack);
router["delete"]("/remove_5e_character_attack/:id", _5eCharAttacks_js_1.remove5eCharAttack);
router.post("/edit_5e_character_attack/:id", _5eCharAttacks_js_1.edit5eCharAttack);
router.get("/get_5e_character_spells/:general_id/:type", _5eCharSpells_js_1.get5eCharSpellsByType);
router.post("/add_5e_character_spell", _5eCharSpells_js_1.add5eCharSpell);
router["delete"]("/remove_5e_character_spell/:id", _5eCharSpells_js_1.remove5eCharSpell);
router.post("/edit_5e_character_spell/:id", _5eCharSpells_js_1.edit5eCharSpell);
router.get("/get_5e_character_feats/:general_id", _5eCharFeats_js_1.get5eCharFeatsByGeneral);
router.post("/add_5e_character_feat", _5eCharFeats_js_1.add5eCharFeat);
router["delete"]("/remove_5e_character_feat/:id", _5eCharFeats_js_1.remove5eCharFeat);
router.post("/edit_5e_character_feat/:id", _5eCharFeats_js_1.edit5eCharFeat);
router.get("/get_5e_character_equipments/:general_id", _5eCharEquipment_js_1.get5eCharEquipmentsByGeneral);
router.post("/add_5e_character_equipment", _5eCharEquipment_js_1.add5eCharEquipment);
router["delete"]("/remove_5e_character_equipment/:id", _5eCharEquipment_js_1.remove5eCharEquipment);
router.post("/edit_5e_character_equipment/:id", _5eCharEquipment_js_1.edit5eCharEquipment);
router.get("/get_5e_character_other_pro_langs/:general_id", _5eCharOtherProLang_js_1.get5eCharOtherProLangsByGeneral);
router.post("/add_5e_character_other_pro_lang", _5eCharOtherProLang_js_1.add5eCharOtherProLang);
router["delete"]("/remove_5e_character_other_pro_lang/:id", _5eCharOtherProLang_js_1.remove5eCharOtherProLang);
router.post("/edit_5e_character_other_pro_lang/:id", _5eCharOtherProLang_js_1.edit5eCharOtherProLang);
router.get("/get_events/:project_id/:limit/:offset", events_js_1.getEvents);
router.get("/get_events_by_location/:location_id", events_js_1.getEventsByLocation);
router.get("/get_events_by_character/:character_id", events_js_1.getEventsByCharacter);
router.get("/get_events_by_item/:item_id", events_js_1.getEventsByItem);
router.get("/get_events_by_lore/:lore_id", events_js_1.getEventsByLore);
router.post("/add_event", events_js_1.addEvent);
router["delete"]("/remove_event/:id", events_js_1.removeEvent);
router.post("/edit_event/:id", events_js_1.editEvent);
router.get("/get_notes/:project_id/:limit/:offset", notes_js_1.getNotes);
router.get("/get_notes/:project_id/:limit/:offset/:keyword", notes_js_1.getNotes);
router.get("/get_notes_by_location/:location_id", notes_js_1.getNotesByLocation);
router.get("/get_notes_by_character/:character_id", notes_js_1.getNotesByCharacter);
router.get("/get_notes_by_item/:item_id", notes_js_1.getNotesByItem);
router.get("/get_notes_by_lore/:lore_id", notes_js_1.getNotesByLore);
router.post("/add_note", notes_js_1.addNote);
router["delete"]("/remove_note/:id", notes_js_1.removeNote);
router.post("/edit_note/:id", notes_js_1.editNote);
router.get("/get_lore_relation/:id", loreRelations_js_1.getLoreRelation);
router.get("/get_lore_relations_by_lore/:type/:id", loreRelations_js_1.getLoreRelationsByLore);
router.get("/get_lore_relations_by_location/:location_id", loreRelations_js_1.getLoreRelationsByLocation);
router.get("/get_lore_relations_by_character/:character_id", loreRelations_js_1.getLoreRelationsByCharacter);
router.get("/get_lore_relations_by_item/:item_id", loreRelations_js_1.getLoreRelationsByItem);
router.post("/add_lore_relation", loreRelations_js_1.addLoreRelation);
router["delete"]("/remove_lore_relation/:id", loreRelations_js_1.removeLoreRelation);
router.post("/edit_lore_relation/:id", loreRelations_js_1.editLoreRelation);
router.get("/get_lore/:id", lores_js_1.getLore);
router.get("/get_lores/:project_id/:limit/:offset", lores_js_1.getLores);
router.get("/get_lores_filter/:project_id/:limit/:offset/:filter", lores_js_1.getLores);
router.get("/get_lores_keyword/:project_id/:limit/:offset/:keyword", lores_js_1.getLores);
router.get("/get_lores_filter_keyword/:project_id/:limit/:offset/:filter/:keyword", lores_js_1.getLores);
router.post("/add_lore", lores_js_1.addLore);
router["delete"]("/remove_lore/:id", lores_js_1.removeLore);
router.post("/edit_lore/:id", lores_js_1.editLore);
router.get("/get_item/:id", items_js_1.getItem);
router.get("/get_items/:project_id/:limit/:offset", items_js_1.getItems);
router.get("/get_items_filter/:project_id/:limit/:offset/:filter", items_js_1.getItems);
router.get("/get_items_keyword/:project_id/:limit/:offset/:keyword", items_js_1.getItems);
router.get("/get_items_filter_keyword/:project_id/:limit/:offset/:filter/:keyword", items_js_1.getItems);
router.get("/get_items_by_location/:location_id", items_js_1.getItemsByLocation);
router.get("/get_items_by_character/:character_id", items_js_1.getItemsByCharacter);
router.post("/add_item", items_js_1.addItem);
router["delete"]("/remove_item/:id", items_js_1.removeItem);
router.post("/edit_item/:id", items_js_1.editItem);
router.get("/get_character/:id", characters_js_1.getCharacter);
router.get("/get_characters/:project_id/:limit/:offset", characters_js_1.getCharacters);
router.get("/get_characters_filter/:project_id/:limit/:offset/:filter", characters_js_1.getCharacters);
router.get("/get_characters_keyword/:project_id/:limit/:offset/:keyword", characters_js_1.getCharacters);
router.get("/get_characters_filter_keyword/:project_id/:limit/:offset/:filter/:keyword", characters_js_1.getCharacters);
router.get("/get_characters_by_location/:location_id", characters_js_1.getCharactersByLocation);
router.post("/add_character", characters_js_1.addCharacter);
router["delete"]("/remove_character/:id", characters_js_1.removeCharacter);
router.post("/edit_character/:id", characters_js_1.editCharacter);
router.get("/get_location/:id", locations_js_1.getLocation);
router.get("/get_locations/:project_id/:limit/:offset", locations_js_1.getLocations);
router.get("/get_locations_filter/:project_id/:limit/:offset/:filter", locations_js_1.getLocations);
router.get("/get_locations_keyword/:project_id/:limit/:offset/:keyword", locations_js_1.getLocations);
router.get("/get_locations_filter_keyword/:project_id/:limit/:offset/:filter/:keyword", locations_js_1.getLocations);
router.get("/get_sublocations/:parent_location_id", locations_js_1.getSubLocations);
router.post("/add_location", locations_js_1.addLocation);
router["delete"]("/remove_location/:id", locations_js_1.removeLocation);
router.post("/edit_location/:id", locations_js_1.editLocation);
router.get("/get_counters/:project_id", counters_js_1.getCounters);
router.post("/add_counter", counters_js_1.addCounter);
router["delete"]("/remove_counter/:id", counters_js_1.removeCounter);
router.post("/edit_counter/:id", counters_js_1.editCounter);
router.get("/get_months/:calendar_id", months_js_1.getMonths);
router.post("/add_month", months_js_1.addMonth);
router["delete"]("/remove_month/:id", months_js_1.removeMonth);
router.post("/edit_month/:id", months_js_1.editMonth);
router.get("/get_days/:calendar_id", days_js_1.getDays);
router.post("/add_day", days_js_1.addDay);
router["delete"]("/remove_day/:id", days_js_1.removeDay);
router.post("/edit_day/:id", days_js_1.editDay);
router.get("/get_calendars/:project_id", calendars_js_1.getCalendars);
router.post("/add_calendar", calendars_js_1.addCalendar);
router["delete"]("/remove_calendar/:id", calendars_js_1.removeCalendar);
router.post("/edit_calendar/:id", calendars_js_1.editCalendar);
router.get("/get_clocks/:project_id", clocks_js_1.getClocks);
router.post("/add_clock", clocks_js_1.addClock);
router["delete"]("/remove_clock/:id", clocks_js_1.removeClock);
router.post("/edit_clock/:id", clocks_js_1.editClock);
router.get("/get_project/:id", projects_js_1.getProject);
router.get("/get_projects", projects_js_1.getProjects);
router.post("/add_project", projects_js_1.addProject);
router["delete"]("/remove_project/:id", projects_js_1.removeProject);
router.post("/edit_project/:id", projects_js_1.editProject);
router.get("/get_user", users_js_1.getUserBySession);
router.get("/get_user_by_id/:id", users_js_1.getUserById);
router.post("/register", users_js_1.registerUser);
router.post("/login", users_js_1.loginUser);
router.get("/verify_jwt", users_js_1.verifyJwt);
router.post("/request_reset_email", users_js_1.requestResetEmail);
router.post("/user/edit_user", users_js_1.editUser);
router.post("/user/reset_password", users_js_1.resetPassword);
module.exports = router;
