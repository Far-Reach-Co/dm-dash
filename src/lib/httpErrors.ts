export type HttpError = Error & {
  status: number;
  code?: string;
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

export function forbiddenError(message = "Forbidden", extra?: Partial<HttpError>) {
  return createHttpError(403, message, extra);
}

export function notFoundError(message: string, extra?: Partial<HttpError>) {
  return createHttpError(404, message, extra);
}
