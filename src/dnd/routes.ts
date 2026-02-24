import { Router } from "express";
import { registerSrdContentRoutes } from "./registerSrdContentRoutes";
import { registerSrdSpellRoutes } from "./registerSrdSpellRoutes";
import { registerSrdMonsterRoutes } from "./registerSrdMonsterRoutes";
import { registerSrdSearchRoute } from "./registerSrdSearchRoute";

const router = Router();

registerSrdContentRoutes(router);
registerSrdSpellRoutes(router);
registerSrdMonsterRoutes(router);
registerSrdSearchRoute(router);

export default router;
