const express = require("express");
const {
  getClocks,
  addClock,
  removeClock,
  editClock,
} = require("./controllers/clocks.js");
const {
  getProjects,
  addProject,
  removeProject,
  editProject,
} = require("./controllers/projects.js");
const {
  getUserByToken,
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  verifyJwt,
  editUser,
  // resetPassword,
  // requestResetEmail
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
  removeNote,
  editNote,
} = require("./controllers/notes.js");

var router = express.Router();

// notes
router.get("/get_notes/:type/:project_id", getNotes);
router.get("/get_notes_by_location/:location_id", getNotesByLocation);
router.post("/add_note", addNote);
router.delete("/remove_note/:id", removeNote);
router.post("/edit_note/:id", editNote);

// locations
router.get("/get_location/:id", getLocation);
router.get("/get_locations/:project_id", getLocations);
router.get("/get_sublocations/:parent_location_id", getSubLocations);
router.post("/add_location", addLocation);
router.delete("/remove_location/:id", removeLocation);
router.post("/edit_location/:id", editLocation);

// clocks
router.get("/get_clocks/:project_id", getClocks);
router.post("/add_clock", addClock);
router.delete("/remove_clock/:id", removeClock);
router.post("/edit_clock/:id", editClock);

// calendars
router.get("/get_calendars/:project_id", getCalendars);
router.post("/add_calendar", addCalendar);
router.delete("/remove_calendar/:id", removeCalendar);
router.post("/edit_calendar/:id", editCalendar);

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

// projects
router.get("/get_projects/:id", getProjects);
router.post("/add_project", addProject);
router.delete("/remove_project/:id", removeProject);
router.post("/edit_project/:id", editProject);

// users
router.get("/users", getAllUsers);
router.get("/get_user", getUserByToken);
router.get("/get_user_by_id/:id", getUserById);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify_jwt", verifyJwt);
router.post("/edit_user", editUser);
// router.post('/reset_password', resetPassword)
// router.post('/request_reset_email', requestResetEmail)

module.exports = router;
