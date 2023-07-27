import {
  addPlayerUserQuery,
  getPlayerUserQuery,
  getPlayerUserByUserAndPlayerQuery,
  getPlayerUsersByPlayerQuery,
  removePlayerUserQuery,
  editPlayerUserQuery,
  removePlayerUsersByPlayerQuery,
} from "../queries/playerUsers.js";
import { UserModel, getUserByIdQuery } from "../queries/users.js";
import { Request, Response, NextFunction } from "express";

async function addPlayerUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");

    req.body.user_id = req.session.user;
    const data = await addPlayerUserQuery(req.body);
    res.status(201).json(data.rows[0]);
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

interface GetPlayerUsersByPlayerReturnUserModel extends UserModel {
  player_user_id: number;
  is_editor: boolean;
}

async function getPlayerUsersByPlayer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const PlayerUsersData = await getPlayerUsersByPlayerQuery(
      req.params.player_id
    );

    const usersList = [];

    for (const PlayerUser of PlayerUsersData.rows) {
      const userData = await getUserByIdQuery(PlayerUser.user_id);
      const user = userData.rows[0];
      (user as GetPlayerUsersByPlayerReturnUserModel).player_user_id =
        PlayerUser.id;
      (user as GetPlayerUsersByPlayerReturnUserModel).is_editor =
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
    if (!req.session.user) throw new Error("User is not logged in");
    await removePlayerUsersByPlayerQuery(req.params.player_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editPlayerUser(req: Request, res: Response, next: NextFunction) {
  try {
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
