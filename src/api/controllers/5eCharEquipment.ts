import {
  add5eCharEquipmentQuery,
  get5eCharEquipmentQuery,
  get5eCharEquipmentsByGeneralQuery,
  remove5eCharEquipmentQuery,
  edit5eCharEquipmentQuery,
} from "../queries/5eCharEquipment";
import { Request, Response, NextFunction } from "express";
import { requireSheetEditAccess, requireSheetViewAccess } from "./accessControl";

interface add5eCharEquipmentRequest extends Request {
  body: {
    general_id: number | string;
    title: string;
    description: string;
    quantity: number;
    weight: number;
  };
}

async function add5eCharEquipment(
  req: add5eCharEquipmentRequest,
  res: Response,
  next: NextFunction
) {
  try {
    await requireSheetEditAccess(req, req.body.general_id);
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
    await requireSheetViewAccess(req, req.params.general_id);
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
    const generalId = req.query.general_id as string | undefined;
    if (!generalId) throw { status: 400, message: "Missing general_id" };
    await requireSheetEditAccess(req, generalId);
    const equipmentData = await get5eCharEquipmentQuery(req.params.id, generalId);
    const equipment = equipmentData.rows[0];
    if (!equipment) throw { status: 404, message: "Equipment not found" };

    await remove5eCharEquipmentQuery(req.params.id, generalId);
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
    const generalId = req.query.general_id as string | undefined;
    if (!generalId) throw { status: 400, message: "Missing general_id" };
    await requireSheetEditAccess(req, generalId);
    const equipmentData = await get5eCharEquipmentQuery(req.params.id, generalId);
    const equipment = equipmentData.rows[0];
    if (!equipment) throw { status: 404, message: "Equipment not found" };

    // If the "id" field is found, throw an error
    if (req.body.hasOwnProperty("id")) {
      throw new Error('Request body cannot contain the "id" field');
    }
    if (req.body.hasOwnProperty("general_id")) {
      throw new Error('Request body cannot contain the "general_id" field');
    }
    const data = await edit5eCharEquipmentQuery(req.params.id, generalId, req.body);
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
