import {
  add5eCharAttackQuery,
  get5eCharAttackQuery,
  get5eCharAttacksByGeneralQuery,
  remove5eCharAttackQuery,
  edit5eCharAttackQuery,
} from "../queries/5eCharAttacks";
import { Request, Response, NextFunction } from "express";
import { requireSheetEditAccess, requireSheetViewAccess } from "./accessControl";

interface add5eCharAttackRequest extends Request {
  body: {
    general_id: number | string;
    title: string;
  };
}

async function add5eCharAttack(
  req: add5eCharAttackRequest,
  res: Response,
  next: NextFunction
) {
  try {
    await requireSheetEditAccess(req, req.body.general_id);
    const data = await add5eCharAttackQuery({
      general_id: req.body.general_id,
      title: req.body.title,
    });
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function get5eCharAttacksByGeneral(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await requireSheetViewAccess(req, req.params.general_id);
    const data = await get5eCharAttacksByGeneralQuery(req.params.general_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function remove5eCharAttack(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const attackData = await get5eCharAttackQuery(req.params.id);
    const attack = attackData.rows[0];
    if (!attack) throw { status: 404, message: "Attack not found" };
    await requireSheetEditAccess(req, attack.general_id);

    await remove5eCharAttackQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharAttack(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const attackData = await get5eCharAttackQuery(req.params.id);
    const attack = attackData.rows[0];
    if (!attack) throw { status: 404, message: "Attack not found" };
    await requireSheetEditAccess(req, attack.general_id);

    // If the "id" field is found, throw an error
    if (req.body.hasOwnProperty("id")) {
      throw new Error('Request body cannot contain the "id" field');
    }
    if (req.body.hasOwnProperty("general_id")) {
      throw new Error('Request body cannot contain the "general_id" field');
    }
    const data = await edit5eCharAttackQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  get5eCharAttacksByGeneral,
  add5eCharAttack,
  remove5eCharAttack,
  edit5eCharAttack,
};
