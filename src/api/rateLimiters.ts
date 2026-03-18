import { rateLimit } from "express-rate-limit";

function isHighFrequencySheetEndpoint(path: string) {
  return path.startsWith("/sheets/");
}

function isStripeWebhookEndpoint(path: string) {
  return path === "/stripe/webhook";
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  // Character sheet UIs fire many API calls rapidly (autosave, quick refreshes).
  // Use a dedicated limiter for those endpoints instead of sharing the global bucket.
  skip: (req) =>
    isHighFrequencySheetEndpoint(req.path || "") ||
    isStripeWebhookEndpoint(req.path || ""),
  message: {
    message: "Too many requests, please try again later",
  },
});

export const sheetApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 600, // allow bursty autosave/update traffic for sheet editing
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userKey = req.session?.user
      ? `user:${req.session.user}`
      : `ip:${req.ip}`;
    return `${userKey}:sheet-api`;
  },
  message: {
    message: "Too many sheet requests, please wait a moment and try again",
  },
});

export const guestSandboxStartLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many guest sandbox requests, please try again shortly",
  },
});

export const publicJoinRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userKey = req.session?.user
      ? `user:${req.session.user}`
      : `ip:${req.ip}`;
    return `${userKey}:project:${req.params.project_id || "unknown"}`;
  },
  message: {
    message: "Too many join requests for this wyrld, please try again shortly",
  },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    message:
      "Too many accounts created from this IP, please try again after an hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    message:
      "Too many login attempts from this IP, please try again after an hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const requestResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    message:
      "Too many reset requests from this IP, please try again after an hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
