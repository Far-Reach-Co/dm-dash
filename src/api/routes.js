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
const { getSignedUrlForDownload, uploadToAws } = require("./controllers/s3.js");
// for uploading files
const multer = require("multer");
const {
  getLore,
  getLores,
  addLore,
  removeLore,
  editLore,
} = require("./controllers/lores.js");
const { getLoreRelation, getLoreRelationsByLore, getLoreRelationsByLocation, getLoreRelationsByCharacter, getLoreRelationsByItem, addLoreRelation, removeLoreRelation, editLoreRelation } = require("./controllers/loreRelations.js");
const upload = multer({ dest: "file_uploads/" });

var router = express.Router();

// s3
router.post("/signed_URL_download", getSignedUrlForDownload);
router.post("/file_upload", upload.single("file"), uploadToAws);

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
router.get("/get_lore_relations_by_location/:location_id", getLoreRelationsByLocation);
router.get("/get_lore_relations_by_character/:character_id", getLoreRelationsByCharacter);
router.get("/get_lore_relations_by_item/:item_id", getLoreRelationsByItem);
router.post("/add_lore_relation", addLoreRelation);
router.delete("/remove_lore_relation/:id", removeLoreRelation);
router.post("/edit_lore_relation/:id", editLoreRelation);

// lores
router.get("/get_lore/:id", getLore)
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

// users
// router.get("/users", getAllUsers);
// router.get("/get_user", getUserByToken);
// router.get("/get_user_by_id/:id", getUserById);
router.post("/register", registerUser); // needs verification and google login
router.post("/login", loginUser);
router.get("/verify_jwt", verifyJwt);
router.post("/edit_user/:id", editUser);
router.post("/reset_password", resetPassword);
router.post("/request_reset_email", requestResetEmail);

module.exports = router;
