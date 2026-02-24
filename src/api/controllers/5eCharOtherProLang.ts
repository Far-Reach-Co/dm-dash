import { Request, Response, NextFunction } from "express";
import {
  add5eCharOtherProLangQuery,
  get5eCharOtherProLangQuery,
  get5eCharOtherProLangsByGeneralQuery,
  remove5eCharOtherProLangQuery,
  edit5eCharOtherProLangQuery,
} from "../queries/5eCharOtherProLang";
import { requireSheetEditAccess, requireSheetViewAccess } from "./accessControl";

interface add5eCharOtherProLangRequest extends Request {
  body: {
    general_id: number | string;
    type: string;
  };
}

async function add5eCharOtherProLang(
  req: add5eCharOtherProLangRequest,
  res: Response,
  next: NextFunction
) {
  try {
    await requireSheetEditAccess(req, req.body.general_id);
    const data = await add5eCharOtherProLangQuery({
      general_id: req.body.general_id,
      type: req.body.type,
    });
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function get5eCharOtherProLangsByGeneral(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await requireSheetViewAccess(req, req.params.general_id);
    const data = await get5eCharOtherProLangsByGeneralQuery(
      req.params.general_id
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function remove5eCharOtherProLang(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const generalId = req.query.general_id as string | undefined;
    if (!generalId) throw { status: 400, message: "Missing general_id" };
    await requireSheetEditAccess(req, generalId);
    const otherProLangData = await get5eCharOtherProLangQuery(req.params.id, generalId);
    const otherProLang = otherProLangData.rows[0];
    if (!otherProLang)
      throw { status: 404, message: "Proficiency/language not found" };

    await remove5eCharOtherProLangQuery(req.params.id, generalId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharOtherProLang(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const generalId = req.query.general_id as string | undefined;
    if (!generalId) throw { status: 400, message: "Missing general_id" };
    await requireSheetEditAccess(req, generalId);
    const otherProLangData = await get5eCharOtherProLangQuery(req.params.id, generalId);
    const otherProLang = otherProLangData.rows[0];
    if (!otherProLang)
      throw { status: 404, message: "Proficiency/language not found" };

    // If the "id" field is found, throw an error
    if (req.body.hasOwnProperty("id")) {
      throw new Error('Request body cannot contain the "id" field');
    }
    if (req.body.hasOwnProperty("general_id")) {
      throw new Error('Request body cannot contain the "general_id" field');
    }
    const data = await edit5eCharOtherProLangQuery(req.params.id, generalId, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  get5eCharOtherProLangsByGeneral,
  add5eCharOtherProLang,
  remove5eCharOtherProLang,
  edit5eCharOtherProLang,
};
