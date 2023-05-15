const {
  addLoreRelationQuery,
  getLoreRelationQuery,
  removeLoreRelationQuery,
  editLoreRelationQuery,
  getLoreRelationsByLoreQuery,
  getLoreRelationsByLocationQuery,
  getLoreRelationsByCharacterQuery,
  getLoreRelationsByItemQuery,
} = require("../queries/loreRelations.js");
import { Request, Response, NextFunction } from "express";

async function addLoreRelation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await addLoreRelationQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getLoreRelation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getLoreRelationQuery(req.params.id);
    res.status(200).json(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getLoreRelationsByLore(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getLoreRelationsByLoreQuery(
      req.params.id,
      req.params.type
    );
    res.status(200).json(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getLoreRelationsByLocation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getLoreRelationsByLocationQuery(req.params.location_id);
    res.status(200).json(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getLoreRelationsByCharacter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getLoreRelationsByCharacterQuery(
      req.params.character_id
    );
    res.status(200).json(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getLoreRelationsByItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getLoreRelationsByItemQuery(req.params.item_id);
    res.status(200).json(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeLoreRelation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await removeLoreRelationQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editLoreRelation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await editLoreRelationQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  addLoreRelation,
  removeLoreRelation,
  editLoreRelation,
  getLoreRelation,
  getLoreRelationsByLore,
  getLoreRelationsByLocation,
  getLoreRelationsByCharacter,
  getLoreRelationsByItem,
};
