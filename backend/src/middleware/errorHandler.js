/**
 * Global error handling middleware.
 * Must be registered LAST via app.use(errorHandler).
 */
export default function errorHandler(err, req, res, next) {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let code = err.code || "INTERNAL_ERROR";
  let field = err.field || null;

  // PostgreSQL duplicate key violation (unique constraint)
  if (err.code === "23505") {
    statusCode = 409;
    code = "DUPLICATE_ENTRY";
    message = "Duplicate entry: a record with this data already exists";
    field = null;
  }

  // PostgreSQL foreign key violation
  if (err.code === "23503") {
    statusCode = 400;
    code = "FOREIGN_KEY_VIOLATION";
    message = "Referenced record does not exist";
    field = null;
  }

  // PostgreSQL check constraint violation
  if (err.code === "23514") {
    statusCode = 400;
    code = "CHECK_CONSTRAINT_VIOLATION";
    message = "Value out of allowed range (scores must be 0-100)";
    field = null;
  }

  // JSON parse error
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    code = "INVALID_JSON";
    message = "Invalid JSON in request body";
    field = null;
  }

  // Log unexpected errors to console
  if (!err.isOperational) {
    console.error("❌ Unexpected Error:", err);
  }

  const errorResponse = { code, message };
  if (field) {
    errorResponse.field = field;
  }

  res.status(statusCode).json({
    error: errorResponse,
  });
}
