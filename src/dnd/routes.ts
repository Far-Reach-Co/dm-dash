import { Router } from "express";
import { registerSrdContentRoutes } from "./registerSrdContentRoutes";
import { registerSrdSpellRoutes } from "./registerSrdSpellRoutes";
import { registerSrdMonsterRoutes } from "./registerSrdMonsterRoutes";
import { registerSrdSearchRoute } from "./registerSrdSearchRoute";
import { registerSrdCommandEventRoute } from "./registerSrdCommandEventRoute";

const router = Router();

registerSrdContentRoutes(router);
registerSrdSpellRoutes(router);
registerSrdMonsterRoutes(router);
registerSrdSearchRoute(router);
registerSrdCommandEventRoute(router);

export default router;
