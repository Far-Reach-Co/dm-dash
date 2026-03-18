export type HttpError = Error & {
  status: number;
  code?: string | number;
};

export function createHttpError(
  status: number,
  message: string,
  extra?: Partial<HttpError>,
): HttpError {
  const err = new Error(message) as HttpError;
  err.status = status;
  if (extra) {
    Object.assign(err, extra);
  }
  return err;
}

export function badRequestError(message: string, extra?: Partial<HttpError>) {
  return createHttpError(400, message, extra);
}

export function unauthorizedError(
  message = "User is not logged in",
  extra?: Partial<HttpError>,
) {
  return createHttpError(401, message, extra);
}

export function forbiddenError(message = "Forbidden", extra?: Partial<HttpError>) {
  return createHttpError(403, message, extra);
}

export function notFoundError(message: string, extra?: Partial<HttpError>) {
  return createHttpError(404, message, extra);
}

export function conflictError(message: string, extra?: Partial<HttpError>) {
  return createHttpError(409, message, extra);
}

export function paymentRequiredError(
  message: string,
  extra?: Partial<HttpError>,
) {
  return createHttpError(402, message, extra);
}

export function payloadTooLargeError(
  message: string,
  extra?: Partial<HttpError>,
) {
  return createHttpError(413, message, extra);
}

export function serviceUnavailableError(
  message: string,
  extra?: Partial<HttpError>,
) {
  return createHttpError(503, message, extra);
}

export function isHttpError(value: unknown): value is HttpError {
  return value instanceof Error && typeof (value as HttpError).status === "number";
}

function getNormalizedStatus(value: unknown): number | null {
  if (!value || typeof value !== "object") return null;
  const status = Number((value as { status?: unknown }).status);
  if (!Number.isInteger(status) || status < 400 || status > 599) {
    return null;
  }
  return status;
}

function getNormalizedMessage(
  value: unknown,
  fallbackMessage: string,
): string {
  if (value instanceof Error && value.message) return value.message;
  if (!value || typeof value !== "object") return fallbackMessage;
  const message = (value as { message?: unknown }).message;
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  return fallbackMessage;
}

function getNormalizedCode(value: unknown): string | number | undefined {
  if (!value || typeof value !== "object") return undefined;
  const code = (value as { code?: unknown }).code;
  if (typeof code === "string" || typeof code === "number") {
    return code;
  }
  return undefined;
}

export function toHttpError(
  value: unknown,
  fallback: { status?: number; message?: string } = {},
): HttpError {
  if (isHttpError(value)) return value;

  const status = getNormalizedStatus(value) ?? fallback.status ?? 500;
  const message = getNormalizedMessage(
    value,
    fallback.message || "There was an Error",
  );
  const code = getNormalizedCode(value);
  const error = createHttpError(
    status,
    message,
    typeof code === "undefined" ? undefined : { code },
  );
  if (value instanceof Error && value.stack) {
    error.stack = value.stack;
  }
  return error;
}
