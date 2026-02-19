import {
  add5eCharFeatQuery,
  get5eCharFeatQuery,
  get5eCharFeatsByGeneralQuery,
  remove5eCharFeatQuery,
  edit5eCharFeatQuery,
} from "../queries/5eCharFeats";
import { Request, Response, NextFunction } from "express";
import { requireSheetEditAccess, requireSheetViewAccess } from "./accessControl";

interface add5eCharFeatRequest extends Request {
  body: {
    general_id: number | string;
    title: string;
    description: string;
    type: string;
  };
}

async function add5eCharFeat(
  req: add5eCharFeatRequest,
  res: Response,
  next: NextFunction
) {
  try {
    await requireSheetEditAccess(req, req.body.general_id);
    const data = await add5eCharFeatQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function get5eCharFeatsByGeneral(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await requireSheetViewAccess(req, req.params.general_id);
    const data = await get5eCharFeatsByGeneralQuery(req.params.general_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function remove5eCharFeat(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const featData = await get5eCharFeatQuery(req.params.id);
    const feat = featData.rows[0];
    if (!feat) throw { status: 404, message: "Feat not found" };
    await requireSheetEditAccess(req, feat.general_id);

    await remove5eCharFeatQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharFeat(req: Request, res: Response, next: NextFunction) {
  try {
    const featData = await get5eCharFeatQuery(req.params.id);
    const feat = featData.rows[0];
    if (!feat) throw { status: 404, message: "Feat not found" };
    await requireSheetEditAccess(req, feat.general_id);

    // If the "id" field is found, throw an error
    if (req.body.hasOwnProperty("id")) {
      throw new Error('Request body cannot contain the "id" field');
    }
    if (req.body.hasOwnProperty("general_id")) {
      throw new Error('Request body cannot contain the "general_id" field');
    }
    const data = await edit5eCharFeatQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  get5eCharFeatsByGeneral,
  add5eCharFeat,
  remove5eCharFeat,
  edit5eCharFeat,
};
