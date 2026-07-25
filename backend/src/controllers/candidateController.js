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
      throw new AppError("Request body must contain at least one candidate", 400);
    }

    // Validate all candidates before inserting any
    input.forEach((candidate, index) => {
      try {
        validateCandidate(candidate);
      } catch (err) {
        throw new AppError(`Candidate at index ${index}: ${err.message}`, 400);
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
          c.college.trim(),
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
 * List candidates with cursor-based sliding-window pagination,
 * filtering, and sorting.
 */
export async function getCandidates(req, res, next) {
  try {
    const params = validateQueryParams(req.query);
    const values = [];
    const conditions = [];
    let paramIndex = 1;

    // Cursor-based pagination (sliding window)
    if (params.cursor !== undefined) {
      if (params.order === "desc") {
        conditions.push(`id < $${paramIndex}`);
      } else {
        conditions.push(`id > $${paramIndex}`);
      }
      values.push(params.cursor);
      paramIndex++;
    }

    // Filters
    if (params.min_assignment_score !== undefined) {
      conditions.push(`assignment_score >= $${paramIndex}`);
      values.push(params.min_assignment_score);
      paramIndex++;
    }

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

    // Fetch one extra to determine if there are more results
    const limitClause = `LIMIT $${paramIndex}`;
    values.push(params.limit + 1);

    const query = `SELECT * FROM candidates ${whereClause} ${sortClause} ${limitClause}`;
    const result = await pool.query(query, values);

    const hasMore = result.rows.length > params.limit;
    const data = hasMore ? result.rows.slice(0, params.limit) : result.rows;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

    res.json({
      success: true,
      data,
      pagination: {
        limit: params.limit,
        next_cursor: nextCursor,
        has_more: hasMore,
        returned: data.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/candidates/:id
 * Get a single candidate with their evaluations and notes.
 */
export async function getCandidateById(req, res, next) {
  try {
    const { id } = req.params;
    const candidateId = parseInt(id, 10);

    if (isNaN(candidateId)) {
      throw new AppError("Candidate ID must be a valid integer", 400);
    }

    const candidateResult = await pool.query("SELECT * FROM candidates WHERE id = $1", [candidateId]);

    if (candidateResult.rows.length === 0) {
      throw new AppError(`Candidate with id ${candidateId} not found`, 404);
    }

    const evaluationsResult = await pool.query(
      "SELECT * FROM evaluations WHERE candidate_id = $1 ORDER BY created_at DESC",
      [candidateId]
    );

    const notesResult = await pool.query(
      "SELECT * FROM notes WHERE candidate_id = $1 ORDER BY timestamp DESC",
      [candidateId]
    );

    res.json({
      success: true,
      data: {
        ...candidateResult.rows[0],
        evaluations: evaluationsResult.rows,
        notes: notesResult.rows,
      },
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
      throw new AppError("Candidate ID must be a valid integer", 400);
    }

    const existing = await pool.query("SELECT * FROM candidates WHERE id = $1", [candidateId]);
    if (existing.rows.length === 0) {
      throw new AppError(`Candidate with id ${candidateId} not found`, 404);
    }

    const current = existing.rows[0];
    const b = req.body;

    const assignment_score = b.assignment_score !== undefined ? b.assignment_score : (b.assignmentScore !== undefined ? b.assignmentScore : current.assignment_score);
    const video_score = b.video_score !== undefined ? b.video_score : (b.videoScore !== undefined ? b.videoScore : current.video_score);
    const ats_score = b.ats_score !== undefined ? b.ats_score : (b.atsScore !== undefined ? b.atsScore : current.ats_score);
    const github_score = b.github_score !== undefined ? b.github_score : (b.githubScore !== undefined ? b.githubScore : current.github_score);
    const communication_score = b.communication_score !== undefined ? b.communication_score : (b.communicationScore !== undefined ? b.communicationScore : current.communication_score);
    const status = b.status || current.status;

    const { score, bucket } = calculatePriority({
      assignment_score,
      video_score,
      ats_score,
      github_score,
      communication_score,
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
