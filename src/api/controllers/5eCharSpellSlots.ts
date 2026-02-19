import {
  edit5eCharSpellSlotInfoQuery,
  get5eCharSpellSlotInfoQuery,
} from "../queries/5eCharSpellSlots";
import { Request, Response, NextFunction } from "express";
import { requireSheetEditAccess } from "./accessControl";

async function edit5eCharSpellSlotInfo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const spellSlotData = await get5eCharSpellSlotInfoQuery(req.params.id);
    const spellSlot = spellSlotData.rows[0];
    if (!spellSlot) throw { status: 404, message: "Spell slot info not found" };
    await requireSheetEditAccess(req, spellSlot.general_id);

    const data = await edit5eCharSpellSlotInfoQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export { edit5eCharSpellSlotInfo };
