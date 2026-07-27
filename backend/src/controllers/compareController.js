import pool from "../config/db.js";
import AppError from "../utils/AppError.js";

/**
 * GET /api/compare?ids=1,2,3
 * Returns a comparative view of selected candidates (2–10 IDs).
 * PRD §6.5: Returns all raw scores, priority_score/bucket,
 * and latest evaluation side-by-side per candidate.
 */
export async function compareCandidates(req, res, next) {
  try {
    const { ids } = req.query;

    if (!ids || typeof ids !== "string" || ids.trim().length === 0) {
      throw new AppError("'ids' query parameter is required (e.g., ?ids=1,2,3)", 400, "MISSING_PARAM", "ids");
    }

    const idArray = ids.split(",").map((id) => {
      const parsed = parseInt(id.trim(), 10);
      if (isNaN(parsed)) {
        throw new AppError(`Invalid id '${id.trim()}' — all IDs must be integers`, 400, "INVALID_INPUT", "ids");
      }
      return parsed;
    });

    // PRD §6.5: Cap at max 10
    if (idArray.length < 2 || idArray.length > 10) {
      throw new AppError("You must compare between 2 and 10 candidates", 400, "INVALID_INPUT", "ids");
    }

    // Check for duplicate IDs
    const uniqueIds = [...new Set(idArray)];
    if (uniqueIds.length !== idArray.length) {
      throw new AppError("Duplicate candidate IDs are not allowed", 400, "INVALID_INPUT", "ids");
    }

    // Build parameterized query
    const placeholders = idArray.map((_, i) => `$${i + 1}`).join(", ");
    const result = await pool.query(
      `SELECT * FROM candidates WHERE id IN (${placeholders}) ORDER BY priority_score DESC`,
      idArray
    );

    // Check all requested candidates were found (PRD §6.5: 404 listing which IDs are missing)
    if (result.rows.length !== idArray.length) {
      const foundIds = result.rows.map((r) => r.id);
      const missingIds = idArray.filter((id) => !foundIds.includes(id));
      throw new AppError(`Candidate(s) not found: ${missingIds.join(", ")}`, 404, "NOT_FOUND", "ids");
    }

    // Fetch latest evaluation per candidate (PRD §6.5)
    const evalPlaceholders = idArray.map((_, i) => `$${i + 1}`).join(", ");
    const evalResult = await pool.query(
      `SELECT DISTINCT ON (candidate_id) *
       FROM evaluations
       WHERE candidate_id IN (${evalPlaceholders})
       ORDER BY candidate_id, created_at DESC`,
      idArray
    );

    // Map evaluations by candidate_id
    const evalMap = {};
    for (const row of evalResult.rows) {
      evalMap[row.candidate_id] = row;
    }

    // Attach latest evaluation to each candidate
    const candidatesWithEval = result.rows.map((c) => ({
      ...c,
      latest_evaluation: evalMap[c.id] || null,
    }));

    // Build comparison metrics
    const scoreFields = ["assignment_score", "video_score", "ats_score", "github_score", "communication_score", "priority_score"];
    const comparison = {};

    for (const field of scoreFields) {
      const values = result.rows.map((c) => parseFloat(c[field]));
      comparison[field] = {
        max: Math.max(...values),
        min: Math.min(...values),
        avg: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
      };
    }

    res.json({
      success: true,
      data: {
        candidates: candidatesWithEval,
        comparison,
      },
    });
  } catch (err) {
    next(err);
  }
}
