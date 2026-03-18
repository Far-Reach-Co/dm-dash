import { Router } from "express";
import authRoutes from "./routes/auth.js";
import billingAdminRoutes from "./routes/billingAdmin.js";
import discordRoutes from "./routes/discord.js";
import assetsRoutes from "./routes/assets.js";
import tablesRoutes from "./routes/tables.js";
import playersRoutes from "./routes/players.js";
import sheetsAndCalendarsRoutes from "./routes/sheetsAndCalendars.js";
import projectsRoutes from "./routes/projects.js";
import { apiLimiter } from "./rateLimiters.js";

const router = Router();

router.use(apiLimiter);
router.use(billingAdminRoutes);
router.use(discordRoutes);
router.use(assetsRoutes);
router.use(tablesRoutes);
router.use(playersRoutes);
router.use(sheetsAndCalendarsRoutes);
router.use(projectsRoutes);
router.use(authRoutes);

export default router;
