export class HttpError extends Error {
  constructor(statusCode, message, extra = {}) {
    super(message);
    this.statusCode = statusCode;
    this.extra = extra;
  }
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate resource already exists",
      details: err.keyValue,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid identifier" });
  }

  const statusCode =
    err.statusCode || (err.name === "ValidationError" ? 400 : 500);

  if (statusCode >= 500) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  return res.status(statusCode).json({
    message: err.message,
    ...(err.extra || {}),
    ...(err.errors ? { errors: err.errors } : {}),
  });
};
