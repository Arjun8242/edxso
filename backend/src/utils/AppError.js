/**
 * Custom application error class for structured error handling.
 * Operational errors (isOperational = true) are expected errors
 * like validation failures or not-found — safe to send to the client.
 */
export default class AppError extends Error {
  constructor(message, statusCode, code = null, field = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
