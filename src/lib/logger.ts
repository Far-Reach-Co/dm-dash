import pino from "pino";
import { isProd } from "../config";

const logger = pino({
  level: isProd ? "info" : "debug",
  transport: isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true },
      },
});

export default logger;
