import pool from "../config/db.js";
import AppError from "../utils/AppError.js";
import { calculatePriority } from "../utils/priorityEngine.js";
import { validateCandidate, validateQueryParams } from "../middleware/validate.js";

/**
 * POST /api/candidates
 * Create one or more candidates (single object or array).
 */
export async function createCandidate(req, res, next) {
  try {
    const input = Array.isArray(req.body) ? req.body : [req.body];

    if (input.length === 0) {
      throw new AppError("Request body must contain at least one candidate", 400, "EMPTY_BODY");
    }

    // Validate all candidates before inserting any (all-or-nothing per PRD §6.1)
    input.forEach((candidate, index) => {
      try {
        validateCandidate(candidate);
      } catch (err) {
        throw new AppError(`Candidate at index ${index}: ${err.message}`, 400, err.code, err.field);
      }
    });

    const created = [];

    for (const c of input) {
      const { score, bucket } = calculatePriority(c);

      const result = await pool.query(
        `INSERT INTO candidates (name, college, assignment_score, video_score, ats_score, github_score, communication_score, priority_score, priority_bucket, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          c.name.trim(),
          c.college ? c.college.trim() : null,
          c.assignment_score,
          c.video_score,
          c.ats_score,
          c.github_score,
          c.communication_score,
          score,
          bucket,
          c.status || "pending",
        ]
      );

      created.push(result.rows[0]);
    }

    res.status(201).json({
      success: true,
      message: `${created.length} candidate(s) created`,
      data: Array.isArray(req.body) ? created : created[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/candidates
 * List candidates with page/page_size pagination,
 * operator-based filtering, and sorting.
 * PRD §6.2
 */
export async function getCandidates(req, res, next) {
  try {
    const params = validateQueryParams(req.query);
    const values = [];
    const conditions = [];
    let paramIndex = 1;

    // ── Operator-based numeric filters (PRD §6.2) ──
    for (const filter of params.filters) {
      conditions.push(`${filter.field} ${filter.operator} $${paramIndex}`);
      values.push(filter.value);
      paramIndex++;
    }

    // ── Exact-match filters ──
    if (params.status) {
      conditions.push(`status = $${paramIndex}`);
      values.push(params.status);
      paramIndex++;
    }

    if (params.priority_bucket) {
      conditions.push(`priority_bucket = $${paramIndex}`);
      values.push(params.priority_bucket);
      paramIndex++;
    }

    if (params.college) {
      conditions.push(`college ILIKE $${paramIndex}`);
      values.push(`%${params.college}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sortClause = `ORDER BY ${params.sort_by} ${params.order.toUpperCase()}, id ${params.order.toUpperCase()}`;

    // ── Total count (PRD §6.2: "Response includes total count") ──
    const countQuery = `SELECT COUNT(*) AS total FROM candidates ${whereClause}`;
    const countResult = await pool.query(countQuery, values.slice(0, paramIndex - 1));
    const total = parseInt(countResult.rows[0].total, 10);

    // ── Page/page_size pagination (PRD §6.2) ──
    const offset = (params.page - 1) * params.page_size;
    const limitClause = `LIMIT $${paramIndex}`;
    values.push(params.page_size);
    paramIndex++;

    const offsetClause = `OFFSET $${paramIndex}`;
    values.push(offset);

    const query = `SELECT * FROM candidates ${whereClause} ${sortClause} ${limitClause} ${offsetClause}`;
    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: params.page,
        page_size: params.page_size,
        total_pages: Math.ceil(total / params.page_size),
        has_more: offset + result.rows.length < total,
        returned: result.rows.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/candidates/:id
 * Get a single candidate, optionally with evaluations and notes.
 * PRD §6.3: "Returns candidate + optionally embedded latest evaluation
 *            and notes (via ?include=evaluations,notes)"
 */
export async function getCandidateById(req, res, next) {
  try {
    const { id } = req.params;
    const candidateId = parseInt(id, 10);

    if (isNaN(candidateId)) {
      throw new AppError("Candidate ID must be a valid integer", 400, "INVALID_INPUT", "id");
    }

    const candidateResult = await pool.query("SELECT * FROM candidates WHERE id = $1", [candidateId]);

    if (candidateResult.rows.length === 0) {
      throw new AppError(`Candidate with id ${candidateId} not found`, 404, "NOT_FOUND", "id");
    }

    const data = { ...candidateResult.rows[0] };

    // Parse ?include= param (PRD §6.3)
    const include = req.query.include
      ? req.query.include.split(",").map((s) => s.trim().toLowerCase())
      : [];

    if (include.includes("evaluations")) {
      const evaluationsResult = await pool.query(
        "SELECT * FROM evaluations WHERE candidate_id = $1 ORDER BY created_at DESC",
        [candidateId]
      );
      data.evaluations = evaluationsResult.rows;
    }

    if (include.includes("notes")) {
      const notesResult = await pool.query(
        "SELECT * FROM notes WHERE candidate_id = $1 ORDER BY timestamp DESC",
        [candidateId]
      );
      data.notes = notesResult.rows;
    }

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/candidates/:id
 * Update scores or status for a candidate and recalculate priority.
 */
export async function updateCandidateById(req, res, next) {
  try {
    const candidateId = parseInt(req.params.id, 10);
    if (isNaN(candidateId)) {
      throw new AppError("Candidate ID must be a valid integer", 400, "INVALID_INPUT", "id");
    }

    const existing = await pool.query("SELECT * FROM candidates WHERE id = $1", [candidateId]);
    if (existing.rows.length === 0) {
      throw new AppError(`Candidate with id ${candidateId} not found`, 404, "NOT_FOUND", "id");
    }

    const current = existing.rows[0];
    const b = req.body;

    const assignment_score = b.assignment_score !== undefined ? b.assignment_score : (b.assignmentScore !== undefined ? b.assignmentScore : current.assignment_score);
    const video_score = b.video_score !== undefined ? b.video_score : (b.videoScore !== undefined ? b.videoScore : current.video_score);
    const ats_score = b.ats_score !== undefined ? b.ats_score : (b.atsScore !== undefined ? b.atsScore : current.ats_score);
    const github_score = b.github_score !== undefined ? b.github_score : (b.githubScore !== undefined ? b.githubScore : current.github_score);
    const communication_score = b.communication_score !== undefined ? b.communication_score : (b.communicationScore !== undefined ? b.communicationScore : current.communication_score);
    const status = b.status || current.status;

    // Ensure numeric conversion from NUMERIC columns
    const { score, bucket } = calculatePriority({
      assignment_score: Number(assignment_score),
      video_score: Number(video_score),
      ats_score: Number(ats_score),
      github_score: Number(github_score),
      communication_score: Number(communication_score),
    });

    const updateResult = await pool.query(
      `UPDATE candidates
       SET assignment_score = $1,
           video_score = $2,
           ats_score = $3,
           github_score = $4,
           communication_score = $5,
           priority_score = $6,
           priority_bucket = $7,
           status = $8
       WHERE id = $9
       RETURNING *`,
      [assignment_score, video_score, ats_score, github_score, communication_score, score, bucket, status, candidateId]
    );

    res.json({
      success: true,
      data: updateResult.rows[0],
    });
  } catch (err) {
    next(err);
  }
}
