import AppError from "../utils/AppError.js";

/**
 * Validates a single candidate object for creation.
 * Throws AppError if any field is invalid.
 */
export function validateCandidate(data) {
  // name is required
  if (data.name === undefined || data.name === null) {
    throw new AppError("Missing required field: name", 400, "MISSING_FIELD", "name");
  }
  if (typeof data.name !== "string" || data.name.trim().length === 0) {
    throw new AppError("'name' must be a non-empty string", 400, "INVALID_INPUT", "name");
  }

  if (data.college !== undefined && data.college !== null) {
    if (typeof data.college !== "string") {
      throw new AppError("'college' must be a string", 400, "INVALID_INPUT", "college");
    }
  }

  // All 5 score fields are required and must be numbers 0–100 (float allowed per PRD §4.1)
  const scoreFields = ["assignment_score", "video_score", "ats_score", "github_score", "communication_score"];
  const missingScores = scoreFields.filter((field) => data[field] === undefined || data[field] === null);
  if (missingScores.length > 0) {
    throw new AppError(`Missing required fields: ${missingScores.join(", ")}`, 400, "MISSING_FIELD", missingScores[0]);
  }

  for (const field of scoreFields) {
    const value = data[field];
    if (typeof value !== "number" || isNaN(value) || value < 0 || value > 100) {
      throw new AppError(
        `'${field}' must be a number between 0 and 100 (received: ${value})`,
        400,
        "INVALID_SCORE",
        field
      );
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
    throw new AppError(`Missing required evaluation fields: ${missing.join(", ")}`, 400, "MISSING_FIELD", missing[0]);
  }

  for (const field of required) {
    const value = data[field];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 100) {
      throw new AppError(
        `'${field}' must be an integer between 0 and 100 (received: ${value})`,
        400,
        "INVALID_SCORE",
        field
      );
    }
  }
}

/**
 * Validates a note object.
 * Throws AppError if any field is invalid.
 */
export function validateNote(data) {
  if (!data.reviewer || typeof data.reviewer !== "string" || data.reviewer.trim().length === 0) {
    throw new AppError("'reviewer' must be a non-empty string", 400, "INVALID_INPUT", "reviewer");
  }

  if (!data.note || typeof data.note !== "string" || data.note.trim().length === 0) {
    throw new AppError("'note' must be a non-empty string", 400, "INVALID_INPUT", "note");
  }
}

// ── Operator-based filter fields (PRD §6.2) ──────────────────────────
// Supports: field=value, field>value, field<value, field>=value, field<=value
const FILTERABLE_SCORE_FIELDS = [
  "assignment_score",
  "video_score",
  "ats_score",
  "github_score",
  "communication_score",
  "priority_score",
];

const ALLOWED_QUERY_PARAMS = new Set([
  "page", "page_size", "sort_by", "order",
  "status", "priority_bucket", "college",
  ...FILTERABLE_SCORE_FIELDS,
]);

/**
 * Parse operator-based filter value.
 * Accepts: "70", ">70", "<70", ">=70", "<=70"
 * Returns { operator: string, value: number } or null if not a filter.
 */
function parseFilterOperator(raw) {
  if (raw === undefined || raw === null) return null;
  const str = String(raw).trim();

  const match = str.match(/^(>=|<=|>|<)?(\d+(?:\.\d+)?)$/);
  if (!match) return null;

  const operator = match[1] || "=";
  const value = parseFloat(match[2]);
  if (isNaN(value) || value < 0 || value > 100) return null;

  return { operator, value };
}

/**
 * Validates and sanitizes query parameters for GET /candidates.
 * PRD §6.2: page/page_size pagination, operator-based numeric filters,
 * exact match for status/college, sort_by/order.
 * Rejects unknown query params with 400.
 */
export function validateQueryParams(query) {
  const result = {};

  // Reject unknown query params per PRD §6.2
  for (const key of Object.keys(query)) {
    if (!ALLOWED_QUERY_PARAMS.has(key)) {
      throw new AppError(
        `Unknown query parameter: '${key}'. Allowed parameters: ${[...ALLOWED_QUERY_PARAMS].join(", ")}`,
        400,
        "UNKNOWN_PARAM",
        key
      );
    }
  }

  // ── Pagination (PRD §6.2: page / page_size) ──
  if (query.page_size !== undefined) {
    const pageSize = parseInt(query.page_size, 10);
    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      throw new AppError("'page_size' must be an integer between 1 and 100", 400, "INVALID_INPUT", "page_size");
    }
    result.page_size = pageSize;
  } else {
    result.page_size = 20;
  }

  if (query.page !== undefined) {
    const page = parseInt(query.page, 10);
    if (isNaN(page) || page < 1) {
      throw new AppError("'page' must be a positive integer starting from 1", 400, "INVALID_INPUT", "page");
    }
    result.page = page;
  } else {
    result.page = 1;
  }

  // ── Operator-based numeric filters (PRD §6.2) ──
  result.filters = [];
  for (const field of FILTERABLE_SCORE_FIELDS) {
    if (query[field] !== undefined) {
      const parsed = parseFilterOperator(query[field]);
      if (!parsed) {
        throw new AppError(
          `Invalid filter value for '${field}'. Use: value, >value, <value, >=value, <=value (e.g., assignment_score>70)`,
          400,
          "INVALID_FILTER",
          field
        );
      }

      const sqlOp = parsed.operator === "=" ? "=" : parsed.operator;
      result.filters.push({ field, operator: sqlOp, value: parsed.value });
    }
  }

  // ── Exact-match filters ──
  if (query.status !== undefined) {
    const allowed = ["pending", "reviewed", "shortlisted"];
    if (!allowed.includes(query.status)) {
      throw new AppError(`'status' must be one of: ${allowed.join(", ")}`, 400, "INVALID_INPUT", "status");
    }
    result.status = query.status;
  }

  if (query.priority_bucket !== undefined) {
    const allowed = ["P0", "P1", "P2", "P3"];
    if (!allowed.includes(query.priority_bucket)) {
      throw new AppError(`'priority_bucket' must be one of: ${allowed.join(", ")}`, 400, "INVALID_INPUT", "priority_bucket");
    }
    result.priority_bucket = query.priority_bucket;
  }

  if (query.college !== undefined) {
    result.college = query.college.trim();
  }

  // ── Sorting ──
  const allowedSortFields = ["priority_score", "assignment_score", "created_at", "name"];
  if (query.sort_by !== undefined) {
    if (!allowedSortFields.includes(query.sort_by)) {
      throw new AppError(`'sort_by' must be one of: ${allowedSortFields.join(", ")}`, 400, "INVALID_INPUT", "sort_by");
    }
    result.sort_by = query.sort_by;
  } else {
    result.sort_by = "priority_score";
  }

  if (query.order !== undefined) {
    const val = query.order.toLowerCase();
    if (val !== "asc" && val !== "desc") {
      throw new AppError("'order' must be 'asc' or 'desc'", 400, "INVALID_INPUT", "order");
    }
    result.order = val;
  } else {
    result.order = "desc";
  }

  return result;
}
