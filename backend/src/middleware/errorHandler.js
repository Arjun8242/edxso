export default function errorHandler(err, req, res, next) {

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let code = err.code || "INTERNAL_ERROR";
  let field = err.field || null;

  if (err.code === "23505") {
    statusCode = 409;
    code = "DUPLICATE_ENTRY";
    message = "Duplicate entry: a record with this data already exists";
    field = null;
  }

  if (err.code === "23503") {
    statusCode = 400;
    code = "FOREIGN_KEY_VIOLATION";
    message = "Referenced record does not exist";
    field = null;
  }

  if (err.code === "23514") {
    statusCode = 400;
    code = "CHECK_CONSTRAINT_VIOLATION";
    message = "Value out of allowed range (scores must be 0-100)";
    field = null;
  }

  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    code = "INVALID_JSON";
    message = "Invalid JSON in request body";
    field = null;
  }

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
