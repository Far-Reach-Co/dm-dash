import { Router } from "express";
import {
  add5eChar,
  remove5eChar,
  duplicate5eChar,
} from "../controllers/5eCharGeneral.js";
import { applySheetOps, getSheet } from "../controllers/sheets.js";
import {
  getMonths,
  addMonth,
  removeMonth,
  editMonth,
} from "../controllers/months.js";
import { getDays, addDay, removeDay, editDay } from "../controllers/days.js";
import {
  getCalendars,
  addCalendar,
  removeCalendar,
  editCalendar,
  getCalendar,
} from "../controllers/calendars.js";
import { sheetApiLimiter } from "../rateLimiters.js";

const router = Router();

router.get("/sheets/:id", sheetApiLimiter, getSheet);
router.post("/sheets/:id/ops", sheetApiLimiter, applySheetOps);
router.post("/add_5e_character", add5eChar);
router.delete("/remove_5e_character/:id", remove5eChar);
router.post("/duplicate_5e_character", duplicate5eChar);

router.get("/get_months/:calendar_id", getMonths);
router.post("/add_month", addMonth);
router.delete("/remove_month/:id", removeMonth);
router.post("/edit_month/:id", editMonth);

router.get("/get_days/:calendar_id", getDays);
router.post("/add_day", addDay);
router.delete("/remove_day/:id", removeDay);
router.post("/edit_day/:id", editDay);

router.get("/get_calendars/:project_id", getCalendars);
router.get("/get_calendar/:id", getCalendar);
router.post("/add_calendar", addCalendar);
router.delete("/remove_calendar/:id", removeCalendar);
router.post("/edit_calendar/:id", editCalendar);

export default router;
