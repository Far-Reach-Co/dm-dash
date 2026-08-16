import { isProd, SECRET_KEY } from "./config";
// Init express and create http server + socket io
import express, { Request, Response, NextFunction } from "express";
import http from "http";
const app = express();
const server = http.createServer(app);

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import { createClient } from "redis";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import logger from "./lib/logger.js";
import { createHttpError, toHttpError } from "./lib/httpErrors";
import RedisSessionStore from "./lib/redisSessionStore.js";
import { getRedisUrl } from "./lib/redisConfig.js";

import apiRoutes from "./api/routes.js";
import routes from "./routes.js";
import dndRoutes from "./dnd/routes.js";

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // for inline scripts - ideally migrate to nonces later
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com",
          "https://static.cloudflareinsights.com",
        ],
        scriptSrcAttr: ["'unsafe-inline'"], // for onclick handlers - ideally remove these later
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://*.amazonaws.com", "https://*.cloudfront.net", "https://www.dnd5eapi.co"],
        connectSrc: [
          "'self'",
          "https://www.google.com",
          "https://www.google-analytics.com",
          "https://cloudflareinsights.com",
          "wss://*.farreachco.com",
          ...(isProd ? [] : ["ws://localhost:*", "wss://localhost:*"]),
        ],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: isProd ? [] : null,
      },
    },
  })
);

// CORS - allow specific origins
app.use(
  cors({
    origin: [
      "https://farreachco.com",
      "https://www.farreachco.com",
      "https://radio.farreachco.com",
      /\.farreachco\.com$/,
      "https://5ebot.com",
      "https://www.5ebot.com",
    ],
    credentials: true,
  })
);

// Compression
app.use(compression());

// Structured request logging
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => {
      const headerId = req.headers["x-request-id"];
      if (typeof headerId === "string" && headerId.length > 0) {
        return headerId;
      }
      return randomUUID();
    },
    customProps: (req) => ({ requestId: req.id }),
  }),
);
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.id) res.setHeader("x-request-id", String(req.id));
  next();
});

app.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).type("text/plain").send("ok\n");
});

// Set view engine to EJS
app.set("view engine", "ejs");

// fixing "413 Request Entity Too Large" errors
app.use(
  bodyParser.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      if (!buf?.length) return;
      const requestWithRawBody = req as Request & { rawBody?: Buffer };
      requestWithRawBody.rawBody = Buffer.from(buf);
    },
  }),
);
app.use(
  bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// Cookie parser for csrf cookies
app.use(cookieParser());

// Static
app.use(express.static("public"));

// allow first proxy if there is one
app.set("trust proxy", 1);
// sessions
const sessionRedisClient = createClient({ url: getRedisUrl() });
sessionRedisClient.on("error", (err) => {
  logger.error({ err }, "Redis session client error");
});
sessionRedisClient.connect().catch((err) => {
  logger.error({ err }, "Failed to connect Redis session client");
});

const redisSessionStore = new RedisSessionStore({
  client: sessionRedisClient,
  prefix: "frc:sess:",
  ttlSeconds: 30 * 24 * 60 * 60,
});

const sessionMiddleware = isProd
  ? session({
      store: redisSessionStore,
      secret: SECRET_KEY,
      name: "frc_session",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: "none",
        domain: ".farreachco.com", // allows all subdomains
        secure: true,
      },
    })
  : session({
      store: redisSessionStore,
      secret: SECRET_KEY,
      name: "frcsession",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: "lax",
        secure: false,
      },
    });

app.use(sessionMiddleware);

// Routes
// private
app.use("/api", apiRoutes);
// public
app.use("/", routes);
// dnd pages
app.use("/dnd", dndRoutes);
// not found
app.use((req: Request, res: Response) => {
  res.status(404).render("404", { auth: req.session.user });
});

//Error
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  let normalizedError = toHttpError(error);

  if (normalizedError.code === "EBADCSRFTOKEN") {
    normalizedError = createHttpError(403, "Form has expired or was tampered with.", {
      code: "EBADCSRFTOKEN",
    });
  } else if (String(normalizedError.code || "") === "23505") {
    normalizedError = createHttpError(400, "This email has already been registered", {
      code: normalizedError.code,
    });
  }

  logger.error(
    {
      err: normalizedError,
      url: req.url,
      method: req.method,
      requestId: req.id,
    },
    "Request error",
  );
  res.status(normalizedError.status);
  res.json({
    error: {
      message: normalizedError.message,
    },
  });
});

export { app, server, sessionMiddleware };
