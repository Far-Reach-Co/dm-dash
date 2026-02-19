import {
  add5eCharSpellQuery,
  get5eCharSpellQuery,
  get5eCharSpellsByTypeQuery,
  remove5eCharSpellQuery,
  edit5eCharSpellQuery,
} from "../queries/5eCharSpells";
import { Request, Response, NextFunction } from "express";
import { requireSheetEditAccess, requireSheetViewAccess } from "./accessControl";

interface add5eCharSpellRequest extends Request {
  body: {
    general_id: number | string;
    title: string;
    description: string;
    type: string;
  };
}

async function add5eCharSpell(
  req: add5eCharSpellRequest,
  res: Response,
  next: NextFunction
) {
  try {
    await requireSheetEditAccess(req, req.body.general_id);
    const data = await add5eCharSpellQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function get5eCharSpellsByType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await requireSheetViewAccess(req, req.params.general_id);
    const data = await get5eCharSpellsByTypeQuery(
      req.params.general_id,
      req.params.type
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function remove5eCharSpell(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const spellData = await get5eCharSpellQuery(req.params.id);
    const spell = spellData.rows[0];
    if (!spell) throw { status: 404, message: "Spell not found" };
    await requireSheetEditAccess(req, spell.general_id);

    await remove5eCharSpellQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharSpell(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const spellData = await get5eCharSpellQuery(req.params.id);
    const spell = spellData.rows[0];
    if (!spell) throw { status: 404, message: "Spell not found" };
    await requireSheetEditAccess(req, spell.general_id);

    // If the "id" field is found, throw an error
    if (req.body.hasOwnProperty("id")) {
      throw new Error('Request body cannot contain the "id" field');
    }
    if (req.body.hasOwnProperty("general_id")) {
      throw new Error('Request body cannot contain the "general_id" field');
    }
    const data = await edit5eCharSpellQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  get5eCharSpellsByType,
  add5eCharSpell,
  remove5eCharSpell,
  edit5eCharSpell,
};
