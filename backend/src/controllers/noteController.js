import pool from "../config/db.js";
import AppError from "../utils/AppError.js";
import { validateNote } from "../middleware/validate.js";

/**
 * POST /api/notes/:candidate_id
 * Add a reviewer note for a candidate.
 */
export async function createNote(req, res, next) {
  try {
    const candidateId = parseInt(req.params.candidate_id, 10);

    if (isNaN(candidateId)) {
      throw new AppError("candidate_id must be a valid integer", 400);
    }

    // Check candidate exists
    const candidateResult = await pool.query("SELECT id FROM candidates WHERE id = $1", [candidateId]);

    if (candidateResult.rows.length === 0) {
      throw new AppError(`Candidate with id ${candidateId} not found`, 404);
    }

    // Validate note
    validateNote(req.body);

    const { reviewer, note } = req.body;

    const result = await pool.query(
      `INSERT INTO notes (candidate_id, reviewer, note)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [candidateId, reviewer.trim(), note.trim()]
    );

    res.status(201).json({
      success: true,
      message: "Note added",
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/notes/:candidate_id
 * Get all reviewer notes for a candidate, newest first.
 */
export async function getNotesByCandidate(req, res, next) {
  try {
    const candidateId = parseInt(req.params.candidate_id, 10);

    if (isNaN(candidateId)) {
      throw new AppError("candidate_id must be a valid integer", 400);
    }

    // Check candidate exists
    const candidateResult = await pool.query("SELECT id FROM candidates WHERE id = $1", [candidateId]);

    if (candidateResult.rows.length === 0) {
      throw new AppError(`Candidate with id ${candidateId} not found`, 404);
    }

    const result = await pool.query(
      "SELECT * FROM notes WHERE candidate_id = $1 ORDER BY timestamp DESC",
      [candidateId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
}
