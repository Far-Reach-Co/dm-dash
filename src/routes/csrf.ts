import { Request, Response, NextFunction } from "express";
import Tokens from "csrf";
import { createHttpError } from "../lib/httpErrors";

const tokens = new Tokens();
const CSRF_COOKIE = "_csrf_secret";
const isProd = process.env.SERVER_ENV === "prod";

// Middleware to generate CSRF token (for GET routes that render forms)
export const csrfMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Get or create secret from cookie
  let secret = req.cookies[CSRF_COOKIE];
  if (!secret) {
    secret = tokens.secretSync();
    res.cookie(CSRF_COOKIE, secret, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
    });
  }
  // Generate token and make available to templates
  const token = tokens.create(secret);
  res.locals.csrfToken = token;
  next();
};

// Middleware to validate CSRF token (for POST routes)
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const secret = req.cookies[CSRF_COOKIE];
  const token = req.body?._csrf || req.headers["x-csrf-token"];

  if (!secret || !token || !tokens.verify(secret, token)) {
    const err = createHttpError(403, "Invalid CSRF token", {
      code: "EBADCSRFTOKEN",
    });
    return next(err);
  }
  next();
};
