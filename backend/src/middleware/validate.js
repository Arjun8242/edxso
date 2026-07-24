import AppError from "../utils/AppError.js";

/**
 * Validates a single candidate object for creation.
 * Throws AppError if any field is invalid.
 */
export function validateCandidate(data) {
  const required = ["name", "college", "assignment_score", "video_score", "ats_score", "github_score", "communication_score"];
  const missing = required.filter((field) => data[field] === undefined || data[field] === null);

  if (missing.length > 0) {
    throw new AppError(`Missing required fields: ${missing.join(", ")}`, 400);
  }

  if (typeof data.name !== "string" || data.name.trim().length === 0) {
    throw new AppError("'name' must be a non-empty string", 400);
  }

  if (typeof data.college !== "string" || data.college.trim().length === 0) {
    throw new AppError("'college' must be a non-empty string", 400);
  }

  const scoreFields = ["assignment_score", "video_score", "ats_score", "github_score", "communication_score"];
  for (const field of scoreFields) {
    const value = data[field];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 100) {
      throw new AppError(`'${field}' must be an integer between 0 and 100 (received: ${value})`, 400);
    }
  }
}

/**
 * Validates evaluation fields.
 * Throws AppError if any field is invalid.
 */
export function validateEvaluation(data) {
  const required = [
    "ui_quality", "state_handling", "edge_case_thinking",
    "architecture_understanding", "communication", "confidence",
    "accessibility_awareness",
  ];
  const missing = required.filter((field) => data[field] === undefined || data[field] === null);

  if (missing.length > 0) {
    throw new AppError(`Missing required evaluation fields: ${missing.join(", ")}`, 400);
  }

  for (const field of required) {
    const value = data[field];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 100) {
      throw new AppError(`'${field}' must be an integer between 0 and 100 (received: ${value})`, 400);
    }
  }
}

/**
 * Validates a note object.
 * Throws AppError if any field is invalid.
 */
export function validateNote(data) {
  if (!data.reviewer || typeof data.reviewer !== "string" || data.reviewer.trim().length === 0) {
    throw new AppError("'reviewer' must be a non-empty string", 400);
  }

  if (!data.note || typeof data.note !== "string" || data.note.trim().length === 0) {
    throw new AppError("'note' must be a non-empty string", 400);
  }
}

/**
 * Validates and sanitizes query parameters for GET /candidates.
 * Returns parsed and safe values.
 */
export function validateQueryParams(query) {
  const result = {};

  // Pagination
  if (query.cursor !== undefined) {
    const cursor = parseInt(query.cursor, 10);
    if (isNaN(cursor) || cursor < 0) {
      throw new AppError("'cursor' must be a non-negative integer", 400);
    }
    result.cursor = cursor;
  }

  if (query.limit !== undefined) {
    const limit = parseInt(query.limit, 10);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new AppError("'limit' must be an integer between 1 and 100", 400);
    }
    result.limit = limit;
  } else {
    result.limit = 20;
  }

  // Filtering
  if (query.min_assignment_score !== undefined) {
    const val = parseInt(query.min_assignment_score, 10);
    if (isNaN(val) || val < 0 || val > 100) {
      throw new AppError("'min_assignment_score' must be an integer between 0 and 100", 400);
    }
    result.min_assignment_score = val;
  }

  if (query.status !== undefined) {
    const allowed = ["pending", "reviewed", "shortlisted"];
    if (!allowed.includes(query.status)) {
      throw new AppError(`'status' must be one of: ${allowed.join(", ")}`, 400);
    }
    result.status = query.status;
  }

  if (query.priority_bucket !== undefined) {
    const allowed = ["P0", "P1", "P2", "P3"];
    if (!allowed.includes(query.priority_bucket)) {
      throw new AppError(`'priority_bucket' must be one of: ${allowed.join(", ")}`, 400);
    }
    result.priority_bucket = query.priority_bucket;
  }

  if (query.college !== undefined) {
    result.college = query.college.trim();
  }

  // Sorting
  const allowedSortFields = ["priority_score", "assignment_score", "created_at", "name"];
  if (query.sort_by !== undefined) {
    if (!allowedSortFields.includes(query.sort_by)) {
      throw new AppError(`'sort_by' must be one of: ${allowedSortFields.join(", ")}`, 400);
    }
    result.sort_by = query.sort_by;
  } else {
    result.sort_by = "priority_score";
  }

  if (query.order !== undefined) {
    const val = query.order.toLowerCase();
    if (val !== "asc" && val !== "desc") {
      throw new AppError("'order' must be 'asc' or 'desc'", 400);
    }
    result.order = val;
  } else {
    result.order = "desc";
  }

  return result;
}
