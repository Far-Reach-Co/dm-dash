import { get5eCharGeneralQuery } from "../queries/5eCharGeneral.js";
import { getPlayerInviteByPlayerQuery } from "../queries/playerInvites.js";
import {
  addPlayerUserQuery,
  getPlayerUserQuery,
  getPlayerUserByUserAndPlayerQuery,
  getPlayerUsersByPlayerQuery,
  removePlayerUserQuery,
  editPlayerUserQuery,
  removePlayerUsersByPlayerQuery,
} from "../queries/playerUsers.js";
import { User, getUserByIdQuery } from "../queries/users.js";
import { Request, Response, NextFunction } from "express";
import { logEventAsync, EventType } from "../../lib/eventLogger";
import { requireApiUser, requireSheetOwnerAccess } from "./accessControl";

async function addPlayerUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireApiUser(req);

    req.body.user_id = userId;
    // check to make sure this user isn't the owner already
    const charData = await get5eCharGeneralQuery(req.body.player_id);
    if (!charData.rows[0]) throw { status: 404, message: "Character not found" };
    if (charData.rows[0].user_id == userId) {
      throw { message: "User is owner" };
    }
    const inviteData = await getPlayerInviteByPlayerQuery(req.body.player_id);
    if (!inviteData.rows.length) {
      throw { status: 403, message: "Player invite required" };
    }

    const data = await addPlayerUserQuery(req.body);
    const playerUser = data.rows[0];
    // Log player user creation event
    logEventAsync({
      userId,
      eventType: EventType.PLAYER_USER_CREATED,
      eventData: {
        playerUserId: playerUser.id,
        playerId: req.body.player_id,
      },
      req,
    });
    res.status(201).json(playerUser);
  } catch (err) {
    next(err);
  }
}

async function getPlayerUserByUserAndPlayer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    const data = await getPlayerUserByUserAndPlayerQuery(
      req.session.user,
      req.params.player_id
    );
    res.status(200).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

interface GetPlayerUsersByPlayerReturnUser extends User {
  player_user_id: number;
  is_editor: boolean;
}

async function getPlayerUsersByPlayer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await requireSheetOwnerAccess(req, req.params.player_id);
    const PlayerUsersData = await getPlayerUsersByPlayerQuery(
      req.params.player_id
    );

    const usersList = [];

    for (const PlayerUser of PlayerUsersData.rows) {
      const userData = await getUserByIdQuery(PlayerUser.user_id);
      const user = userData.rows[0];
      (user as GetPlayerUsersByPlayerReturnUser).player_user_id = PlayerUser.id;
      (user as GetPlayerUsersByPlayerReturnUser).is_editor =
        PlayerUser.is_editor;
      usersList.push(user);
    }

    res.status(200).json(usersList);
  } catch (err) {
    next(err);
  }
}

async function removePlayerUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const playerUserData = await getPlayerUserQuery(req.params.id);
    const playerUser = playerUserData.rows[0];
    if (!playerUser) throw { status: 404, message: "Player user not found" };
    await requireSheetOwnerAccess(req, playerUser.player_id);
    await removePlayerUserQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function removePlayerUserByUserAndPlayer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    const playerUserData = await getPlayerUserByUserAndPlayerQuery(
      req.session.user,
      req.params.player_id
    );
    await removePlayerUserQuery(playerUserData.rows[0].id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function removePlayerUsersByPlayer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await requireSheetOwnerAccess(req, req.params.player_id);
    await removePlayerUsersByPlayerQuery(req.params.player_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editPlayerUser(req: Request, res: Response, next: NextFunction) {
  try {
    const playerUserData = await getPlayerUserQuery(req.params.id);
    const playerUser = playerUserData.rows[0];
    if (!playerUser) throw { status: 404, message: "Player user not found" };
    await requireSheetOwnerAccess(req, playerUser.player_id);
    const data = await editPlayerUserQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  addPlayerUser,
  getPlayerUserByUserAndPlayer,
  getPlayerUsersByPlayer,
  removePlayerUser,
  removePlayerUserByUserAndPlayer,
  removePlayerUsersByPlayer,
  editPlayerUser,
};
