import { Router, Request, Response, NextFunction } from "express";
import { editUserQuery, getUserByIdQuery } from "../api/queries/users";
import { verifyEmailPreferencesToken } from "../lib/emailPreferences";

const router = Router();

function parseCheckbox(value: unknown): boolean {
  if (Array.isArray(value)) return parseCheckbox(value[value.length - 1]);
  return value === true || value === "true" || value === "on" || value === "1";
}

function readToken(req: Request): string | null {
  if (typeof req.query.token === "string") return req.query.token;
  if (req.body && typeof req.body.token === "string") return req.body.token;
  return null;
}

async function renderPreferencesPage(
  res: Response,
  params: {
    token: string;
    userId: string;
    saved?: boolean;
    unsubscribed?: boolean;
    error?: string;
  },
) {
  const { token, userId, saved, unsubscribed, error } = params;
  const userData = await getUserByIdQuery(userId);
  const user = userData.rows[0];
  if (!user) {
    return res.status(404).render("email-preferences", {
      token,
      user: null,
      saved: false,
      unsubscribed: false,
      error: "User not found for this email token.",
    });
  }

  return res.render("email-preferences", {
    token,
    user,
    saved: Boolean(saved),
    unsubscribed: Boolean(unsubscribed),
    error: error || "",
  });
}

async function unsubscribeAllByToken(token: string) {
  const payload = verifyEmailPreferencesToken(token);
  if (!payload) return null;

  await editUserQuery(payload.userId, {
    email_unsubscribed_all: true,
    email_unsubscribed_at: new Date().toISOString(),
  });

  return payload;
}

router.get(
  "/email/preferences",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = readToken(req);
      if (!token) {
        return res.status(400).render("email-preferences", {
          token: "",
          user: null,
          saved: false,
          unsubscribed: false,
          error: "Missing email preferences token.",
        });
      }

      const payload = verifyEmailPreferencesToken(token);
      if (!payload) {
        return res.status(400).render("email-preferences", {
          token,
          user: null,
          saved: false,
          unsubscribed: false,
          error: "Invalid or expired email preferences token.",
        });
      }

      return await renderPreferencesPage(res, {
        token,
        userId: payload.userId,
        saved: req.query.saved === "1",
        unsubscribed: req.query.unsubscribed === "1",
      });
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  "/email/preferences",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = readToken(req);
      if (!token) {
        return res.status(400).render("email-preferences", {
          token: "",
          user: null,
          saved: false,
          unsubscribed: false,
          error: "Missing email preferences token.",
        });
      }

      const payload = verifyEmailPreferencesToken(token);
      if (!payload) {
        return res.status(400).render("email-preferences", {
          token,
          user: null,
          saved: false,
          unsubscribed: false,
          error: "Invalid or expired email preferences token.",
        });
      }

      const emailUnsubscribedAll = parseCheckbox(req.body.email_unsubscribed_all);
      await editUserQuery(payload.userId, {
        notify_wyrld_join: parseCheckbox(req.body.notify_wyrld_join),
        notify_sheet_link: parseCheckbox(req.body.notify_sheet_link),
        notify_product_updates: parseCheckbox(req.body.notify_product_updates),
        email_unsubscribed_all: emailUnsubscribedAll,
        email_unsubscribed_at: emailUnsubscribedAll ? new Date().toISOString() : null,
      });

      return await renderPreferencesPage(res, {
        token,
        userId: payload.userId,
        saved: true,
      });
    } catch (err) {
      return next(err);
    }
  },
);

router.get(
  "/email/unsubscribe",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = readToken(req);
      if (!token) {
        return res.status(400).send("Missing unsubscribe token.");
      }

      const payload = await unsubscribeAllByToken(token);
      if (!payload) {
        return res.status(400).send("Invalid or expired unsubscribe token.");
      }

      return res.redirect(
        `/email/preferences?token=${encodeURIComponent(token)}&unsubscribed=1`,
      );
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  "/email/unsubscribe",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = readToken(req);
      if (!token) {
        return res.status(400).send("Missing unsubscribe token.");
      }

      const payload = await unsubscribeAllByToken(token);
      if (!payload) {
        return res.status(400).send("Invalid or expired unsubscribe token.");
      }

      return res.status(200).send("You have been unsubscribed.");
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
