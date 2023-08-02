import {
  add5eCharEquipmentQuery,
  get5eCharEquipmentQuery,
  get5eCharEquipmentsByGeneralQuery,
  remove5eCharEquipmentQuery,
  edit5eCharEquipmentQuery,
} from "../queries/5eCharEquipment";
import { Request, Response, NextFunction } from "express";

async function add5eCharEquipment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await add5eCharEquipmentQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function get5eCharEquipmentsByGeneral(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await get5eCharEquipmentsByGeneralQuery(req.params.general_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function remove5eCharEquipment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await remove5eCharEquipmentQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharEquipment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // If the "id" field is found, throw an error
    if (req.body.hasOwnProperty("id")) {
      throw new Error('Request body cannot contain the "id" field');
    }
    if (req.body.hasOwnProperty("general_id")) {
      throw new Error('Request body cannot contain the "general_id" field');
    }
    const data = await edit5eCharEquipmentQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  get5eCharEquipmentsByGeneral,
  add5eCharEquipment,
  remove5eCharEquipment,
  edit5eCharEquipment,
};
