import { Router, raw } from "express";
import { verifyKeyMiddleware } from "discord-interactions";
import { BOT_PUBLIC_KEY } from "../../config";
import {
  getCommands,
  interactionsController,
} from "../controllers/discordBot.js";

const router = Router();

router.get("/bot/get_all_commands", getCommands);
router.post(
  "/bot/interactions",
  raw({ type: "application/json" }),
  verifyKeyMiddleware(BOT_PUBLIC_KEY || ""),
  interactionsController,
);

export default router;
