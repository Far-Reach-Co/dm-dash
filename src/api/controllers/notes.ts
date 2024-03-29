import {
  addNoteQuery,
  getNotesQuery,
  getNoteQuery,
  getNotesByLocationQuery,
  getNotesByCharacterQuery,
  getNotesByItemQuery,
  removeNoteQuery,
  editNoteQuery,
  getNotesByLoreQuery,
} from "../queries/notes.js";
import { Request, Response, NextFunction } from "express";

async function addNote(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    req.body.user_id = req.session.user;
    const data = await addNoteQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getNotes(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    const data = await getNotesQuery(
      req.session.user,
      req.params.project_id,
      req.params.limit,
      req.params.offset,
      req.params.keyword
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getNotesByLocation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    const data = await getNotesByLocationQuery(
      req.session.user,
      req.params.location_id
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getNotesByCharacter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    const data = await getNotesByCharacterQuery(
      req.session.user,
      req.params.character_id
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getNotesByItem(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    const data = await getNotesByItemQuery(
      req.session.user,
      req.params.item_id
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getNotesByLore(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    const data = await getNotesByLoreQuery(
      req.session.user,
      req.params.lore_id
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeNote(req: Request, res: Response, next: NextFunction) {
  try {
    await removeNoteQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editNote(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editNoteQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  getNotes,
  getNotesByLocation,
  addNote,
  removeNote,
  editNote,
  getNotesByCharacter,
  getNotesByItem,
  getNotesByLore,
};
