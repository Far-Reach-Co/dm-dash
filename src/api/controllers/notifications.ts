import { NextFunction, Request, Response } from "express";
import { requireApiUser } from "./accessControl";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../lib/notifications";

function parseBoundedInt(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(parsed)));
}

async function getNotifications(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const limit = parseBoundedInt(req.query.limit, 20, 1, 100);
    const offset = parseBoundedInt(req.query.offset, 0, 0, Number.MAX_SAFE_INTEGER);
    const [notificationsData, unreadCount] = await Promise.all([
      listNotifications({ userId, limit, offset }),
      getUnreadNotificationCount(userId),
    ]);
    res.status(200).send({
      notifications: notificationsData.rows,
      unread_count: unreadCount,
      limit,
      offset,
    });
  } catch (err) {
    next(err);
  }
}

async function getUnreadNotificationsCount(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const unreadCount = await getUnreadNotificationCount(userId);
    res.status(200).send({ unread_count: unreadCount });
  } catch (err) {
    next(err);
  }
}

async function markNotificationAsRead(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const data = await markNotificationRead({
      id: req.params.id,
      userId,
    });
    if (!data.rows[0]) throw { status: 404, message: "Notification not found" };
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function markAllNotificationsAsRead(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const data = await markAllNotificationsRead(userId);
    res.status(200).send({ updated: data.rows.length });
  } catch (err) {
    next(err);
  }
}

export {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
