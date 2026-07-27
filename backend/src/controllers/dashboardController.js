import pool from "../config/db.js";

/**
 * GET /api/dashboard-summary
 * PRD §6.6: Returns total_candidates, reviewed_count,
 * shortlisted_count, pending_count, and breakdown by priority bucket.
 */
export async function getDashboardSummary(req, res, next) {
  try {
    // Total candidates
    const totalResult = await pool.query("SELECT COUNT(*) AS count FROM candidates");

    // Counts by status
    const statusResult = await pool.query(`
      SELECT
        status,
        COUNT(*) AS count
      FROM candidates
      GROUP BY status
    `);

    // Counts by priority bucket
    const bucketResult = await pool.query(`
      SELECT
        priority_bucket,
        COUNT(*) AS count
      FROM candidates
      GROUP BY priority_bucket
      ORDER BY priority_bucket
    `);

    // Build status map
    const statusMap = { pending: 0, reviewed: 0, shortlisted: 0 };
    for (const row of statusResult.rows) {
      statusMap[row.status] = parseInt(row.count, 10);
    }

    // Build priority bucket map
    const bucketMap = { P0: 0, P1: 0, P2: 0, P3: 0 };
    for (const row of bucketResult.rows) {
      bucketMap[row.priority_bucket] = parseInt(row.count, 10);
    }

    // PRD §6.6: Keys must be total_candidates, reviewed_count, shortlisted_count, pending_count
    res.json({
      success: true,
      data: {
        total_candidates: parseInt(totalResult.rows[0].count, 10),
        reviewed_count: statusMap.reviewed,
        shortlisted_count: statusMap.shortlisted,
        pending_count: statusMap.pending,
        by_priority: bucketMap,
      },
    });
  } catch (err) {
    next(err);
  }
}
