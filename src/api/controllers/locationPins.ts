import { Request, Response, NextFunction } from "express";
import {
  addLocationPinQuery,
  getLocationPinByIdQuery,
  getLocationPinsByTableViewQuery,
  removeLocationPinQuery,
  updateLocationPinQuery,
} from "../queries/locationPins.js";
import {
  getTableViewQuery,
} from "../queries/tableViews.js";
import {
  assertTableCapability,
  requireTablePermission,
} from "../../lib/tableAuthz";

async function getTableViewById(tableViewId: number) {
  const data = await getTableViewQuery(tableViewId);
  const tableView = data.rows[0];
  if (!tableView) {
    const err: any = new Error("Table view not found");
    err.status = 404;
    throw err;
  }
  return tableView;
}

async function getLocationPinsByTableView(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tableViewId = Number(req.params.table_view_id);
    const tableView = await getTableViewById(tableViewId);
    await requireTablePermission(req, tableView, "view");
    const pins = await getLocationPinsByTableViewQuery(tableViewId);
    res.send(pins.rows);
  } catch (err) {
    next(err);
  }
}

async function addLocationPin(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = {
      table_view_id: Number(req.body.table_view_id),
      canvas_object_id: req.body.canvas_object_id,
      title: req.body.title,
      description: req.body.description ?? "",
      image_id: req.body.image_id ? Number(req.body.image_id) : null,
      portal_table_view_ids: Array.isArray(req.body.portal_table_view_ids)
        ? req.body.portal_table_view_ids.map(Number).filter(Boolean)
        : [],
    };

    if (!payload.canvas_object_id) {
      const err: any = new Error("canvas_object_id is required");
      err.status = 400;
      throw err;
    }
    if (!payload.title) {
      const err: any = new Error("title is required");
      err.status = 400;
      throw err;
    }

    const tableView = await getTableViewById(payload.table_view_id);
    const auth = await requireTablePermission(req, tableView, "edit");
    assertTableCapability(auth, "canManagePins");

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
    const pinId = Number(req.params.id);
    const pinData = await getLocationPinByIdQuery(pinId);
    const pin = pinData.rows[0];
    if (!pin) {
      const err: any = new Error("Location pin not found");
      err.status = 404;
      throw err;
    }

    const tableView = await getTableViewById(pin.table_view_id);
    const auth = await requireTablePermission(req, tableView, "edit");
    assertTableCapability(auth, "canManagePins");

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
    const pinId = Number(req.params.id);
    const pinData = await getLocationPinByIdQuery(pinId);
    const pin = pinData.rows[0];
    if (!pin) {
      const err: any = new Error("Location pin not found");
      err.status = 404;
      throw err;
    }

    const tableView = await getTableViewById(pin.table_view_id);
    const auth = await requireTablePermission(req, tableView, "edit");
    assertTableCapability(auth, "canManagePins");

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
