import { Request, Response, NextFunction } from "express";
import {
  addLocationPinQuery,
  getLocationPinByIdQuery,
  getLocationPinsByTableViewQuery,
  removeLocationPinQuery,
  updateLocationPinQuery,
} from "../queries/locationPins.js";
import {
  assertTableCapability,
} from "../../lib/tableAuthz";
import {
  badRequestError,
  notFoundError,
  parsePositiveInt,
  requireTablePermissionById,
} from "./tableResourceUtils";

async function getLocationPinsByTableView(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tableViewId = parsePositiveInt(req.params.table_view_id, "table_view_id");
    await requireTablePermissionById(req, tableViewId, "view");
    const pins = await getLocationPinsByTableViewQuery(tableViewId);
    res.send(pins.rows);
  } catch (err) {
    next(err);
  }
}

async function addLocationPin(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = {
      table_view_id: parsePositiveInt(req.body.table_view_id, "table_view_id"),
      canvas_object_id: req.body.canvas_object_id,
      title: req.body.title,
      description: req.body.description ?? "",
      image_id: req.body.image_id ? Number(req.body.image_id) : null,
      portal_table_view_ids: Array.isArray(req.body.portal_table_view_ids)
        ? req.body.portal_table_view_ids.map(Number).filter(Boolean)
        : [],
    };

    if (!payload.canvas_object_id) {
      throw badRequestError("canvas_object_id is required");
    }
    if (!payload.title) {
      throw badRequestError("title is required");
    }

    await requireTablePermissionById(
      req,
      payload.table_view_id,
      "edit",
      "canManagePins",
    );

    const data = await addLocationPinQuery(payload);
    res.status(201).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function removeLocationPin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const pinId = parsePositiveInt(req.params.id, "id");
    const pinData = await getLocationPinByIdQuery(pinId);
    const pin = pinData.rows[0];
    if (!pin) {
      throw notFoundError("Location pin not found");
    }

    await requireTablePermissionById(req, pin.table_view_id, "edit", "canManagePins");

    await removeLocationPinQuery(pinId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function updateLocationPin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const pinId = parsePositiveInt(req.params.id, "id");
    const pinData = await getLocationPinByIdQuery(pinId);
    const pin = pinData.rows[0];
    if (!pin) {
      throw notFoundError("Location pin not found");
    }

    const { auth } = await requireTablePermissionById(
      req,
      pin.table_view_id,
      "edit",
      "canManagePins",
    );

    const payload: Partial<typeof pin> = {};
    if (typeof req.body.canvas_object_id !== "undefined")
      payload.canvas_object_id = req.body.canvas_object_id;
    if (typeof req.body.title !== "undefined") payload.title = req.body.title;
    if (typeof req.body.description !== "undefined")
      payload.description = req.body.description;
    if (typeof req.body.image_id !== "undefined") {
      payload.image_id = req.body.image_id ? Number(req.body.image_id) : null;
    }
    if (Array.isArray(req.body.portal_table_view_ids)) {
      assertTableCapability(auth, "canUsePinPortals");
      const portalIds = (req.body.portal_table_view_ids as Array<
        string | number
      >).map((value) => Number(value));
      payload.portal_table_view_ids = portalIds.filter(
        (id) => !Number.isNaN(id),
      );
    }

    const data = await updateLocationPinQuery(pinId, payload);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  getLocationPinsByTableView,
  addLocationPin,
  removeLocationPin,
  updateLocationPin,
};
