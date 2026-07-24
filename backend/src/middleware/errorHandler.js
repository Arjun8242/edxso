/**
 * Global error handling middleware.
 * Must be registered LAST via app.use(errorHandler).
 */
export default function errorHandler(err, req, res, next) {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // PostgreSQL duplicate key violation (unique constraint)
  if (err.code === "23505") {
    statusCode = 409;
    message = "Duplicate entry: a record with this data already exists";
  }

  // PostgreSQL foreign key violation
  if (err.code === "23503") {
    statusCode = 400;
    message = "Referenced record does not exist";
  }

  // PostgreSQL check constraint violation
  if (err.code === "23514") {
    statusCode = 400;
    message = "Value out of allowed range (scores must be 0-100)";
  }

  // JSON parse error
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON in request body";
  }

  // Log unexpected errors to console
  if (!err.isOperational) {
    console.error("❌ Unexpected Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
    },
  });
}
