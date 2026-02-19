function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

function resolveServerEnv(): "dev" | "prod" | "test" {
  const env = (process.env.SERVER_ENV || "dev").trim().toLowerCase();
  if (env === "dev" || env === "prod" || env === "test") {
    return env;
  }
  throw new Error("SERVER_ENV must be one of: dev, prod, test");
}

export const SECRET_KEY = getRequiredEnv("SECRET_KEY");
export const SERVER_ENV = resolveServerEnv();
export const isProd = SERVER_ENV === "prod";
