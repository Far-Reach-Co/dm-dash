import { Router } from "express";
import {
  addProjectPlayer,
  removeProjectPlayer,
  getProjectPlayersByPlayer,
} from "../controllers/projectPlayers.js";
import {
  addPlayerUser,
  getPlayerUserByUserAndPlayer,
  removePlayerUser,
  removePlayerUserByUserAndPlayer,
  removePlayerUsersByPlayer,
} from "../controllers/playerUsers.js";
import {
  addPlayerInvite,
  getPlayerInviteByPlayer,
  getPlayerInviteByUUID,
  removePlayerInvite,
} from "../controllers/playerInvites.js";

const router = Router();

router.get(
  "/get_project_players_by_player/:player_id",
  getProjectPlayersByPlayer,
);
router.post("/add_project_player", addProjectPlayer);
router.delete("/remove_project_player/:id", removeProjectPlayer);

router.get(
  "/get_player_user_by_user_and_player/:player_id",
  getPlayerUserByUserAndPlayer,
);
router.post("/add_player_user", addPlayerUser);
router.delete("/remove_player_user/:id", removePlayerUser);
router.delete(
  "/remove_player_user_by_user_and_player/:player_id",
  removePlayerUserByUserAndPlayer,
);
router.delete(
  "/remove_player_users_by_player/:player_id",
  removePlayerUsersByPlayer,
);

router.get("/get_player_invite_by_uuid/:uuid", getPlayerInviteByUUID);
router.get("/get_player_invite_by_player/:player_id", getPlayerInviteByPlayer);
router.post("/add_player_invite", addPlayerInvite);
router.delete("/remove_player_invite/:id", removePlayerInvite);

export default router;
