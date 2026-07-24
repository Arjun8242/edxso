import pool from "../config/db.js";
import AppError from "../utils/AppError.js";
import { calculatePriority } from "../utils/priorityEngine.js";
import { validateEvaluation } from "../middleware/validate.js";

/**
 * POST /api/evaluations/:candidate_id
 * Submit an evaluation for a candidate.
 * Automatically recalculates priority score and updates status to 'reviewed'.
 */
export async function createEvaluation(req, res, next) {
  try {
    const candidateId = parseInt(req.params.candidate_id, 10);

    if (isNaN(candidateId)) {
      throw new AppError("candidate_id must be a valid integer", 400);
    }

    // Check candidate exists
    const candidateResult = await pool.query("SELECT * FROM candidates WHERE id = $1", [candidateId]);

    if (candidateResult.rows.length === 0) {
      throw new AppError(`Candidate with id ${candidateId} not found`, 404);
    }

    // Validate evaluation data
    validateEvaluation(req.body);

    const {
      ui_quality,
      state_handling,
      edge_case_thinking,
      architecture_understanding,
      communication,
      confidence,
      accessibility_awareness,
    } = req.body;

    // Insert evaluation
    const evalResult = await pool.query(
      `INSERT INTO evaluations
        (candidate_id, ui_quality, state_handling, edge_case_thinking, architecture_understanding, communication, confidence, accessibility_awareness)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [candidateId, ui_quality, state_handling, edge_case_thinking, architecture_understanding, communication, confidence, accessibility_awareness]
    );

    // Recalculate priority score using the candidate's existing scores
    const candidate = candidateResult.rows[0];
    const { score, bucket } = calculatePriority({
      assignment_score: candidate.assignment_score,
      video_score: candidate.video_score,
      ats_score: candidate.ats_score,
      github_score: candidate.github_score,
      communication_score: candidate.communication_score,
    });

    // Update candidate's priority and status
    const updatedCandidate = await pool.query(
      `UPDATE candidates
       SET priority_score = $1, priority_bucket = $2, status = 'reviewed'
       WHERE id = $3
       RETURNING *`,
      [score, bucket, candidateId]
    );

    res.status(201).json({
      success: true,
      message: "Evaluation submitted and priority recalculated",
      data: {
        candidate: updatedCandidate.rows[0],
        evaluation: evalResult.rows[0],
      },
    });
  } catch (err) {
    next(err);
  }
}
