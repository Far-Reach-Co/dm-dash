import {
  addEventQuery,
  getEventsQuery,
  getEventQuery,
  getEventsByLocationQuery,
  getEventsByCharacterQuery,
  getEventsByItemQuery,
  removeEventQuery,
  editEventQuery,
  getEventsByLoreQuery,
} from "../queries/events";
import { Request, Response, NextFunction } from "express";

async function addEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await addEventQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getEventsQuery({
      projectId: req.params.project_id,
      limit: req.params.limit,
      offset: req.params.offset,
    });

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getEventsByLocation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getEventsByLocationQuery(req.params.location_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getEventsByCharacter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getEventsByCharacterQuery(req.params.character_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getEventsByItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getEventsByItemQuery(req.params.item_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getEventsByLore(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getEventsByLoreQuery(req.params.lore_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeEvent(req: Request, res: Response, next: NextFunction) {
  try {
    await removeEventQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editEventQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  getEvents,
  getEventsByLocation,
  addEvent,
  removeEvent,
  editEvent,
  getEventsByCharacter,
  getEventsByItem,
  getEventsByLore,
};
