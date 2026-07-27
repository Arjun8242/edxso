import pool from "../config/db.js";
import AppError from "../utils/AppError.js";

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

    if (idArray.length < 2 || idArray.length > 10) {
      throw new AppError("You must compare between 2 and 10 candidates", 400, "INVALID_INPUT", "ids");
    }

    const uniqueIds = [...new Set(idArray)];
    if (uniqueIds.length !== idArray.length) {
      throw new AppError("Duplicate candidate IDs are not allowed", 400, "INVALID_INPUT", "ids");
    }

    const placeholders = idArray.map((_, i) => `$${i + 1}`).join(", ");
    const result = await pool.query(
      `SELECT * FROM candidates WHERE id IN (${placeholders}) ORDER BY priority_score DESC`,
      idArray
    );

    if (result.rows.length !== idArray.length) {
      const foundIds = result.rows.map((r) => r.id);
      const missingIds = idArray.filter((id) => !foundIds.includes(id));
      throw new AppError(`Candidate(s) not found: ${missingIds.join(", ")}`, 404, "NOT_FOUND", "ids");
    }

    const evalPlaceholders = idArray.map((_, i) => `$${i + 1}`).join(", ");
    const evalResult = await pool.query(
      `SELECT DISTINCT ON (candidate_id) *
       FROM evaluations
       WHERE candidate_id IN (${evalPlaceholders})
       ORDER BY candidate_id, created_at DESC`,
      idArray
    );

    const evalMap = {};
    for (const row of evalResult.rows) {
      evalMap[row.candidate_id] = row;
    }

    const candidatesWithEval = result.rows.map((c) => ({
      ...c,
      latest_evaluation: evalMap[c.id] || null,
    }));

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
