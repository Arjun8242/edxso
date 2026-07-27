import pool from "../config/db.js";

export async function getDashboardSummary(req, res, next) {
  try {

    const totalResult = await pool.query("SELECT COUNT(*) AS count FROM candidates");

    const statusResult = await pool.query(`
      SELECT
        status,
        COUNT(*) AS count
      FROM candidates
      GROUP BY status
    `);

    const bucketResult = await pool.query(`
      SELECT
        priority_bucket,
        COUNT(*) AS count
      FROM candidates
      GROUP BY priority_bucket
      ORDER BY priority_bucket
    `);

    const statusMap = { pending: 0, reviewed: 0, shortlisted: 0 };
    for (const row of statusResult.rows) {
      statusMap[row.status] = parseInt(row.count, 10);
    }

    const bucketMap = { P0: 0, P1: 0, P2: 0, P3: 0 };
    for (const row of bucketResult.rows) {
      bucketMap[row.priority_bucket] = parseInt(row.count, 10);
    }

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
