import { edit5eCharSpellSlotInfoQuery } from "../queries/5eCharSpellSlots";
import { Request, Response, NextFunction } from "express";

async function edit5eCharSpellSlotInfo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await edit5eCharSpellSlotInfoQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export { edit5eCharSpellSlotInfo };
