import "dotenv/config";
import express from "express";
import initDb from "./config/initDb.js";
import errorHandler from "./middleware/errorHandler.js";

// Route imports
import candidatesRouter from "./routes/candidates.js";
import evaluationsRouter from "./routes/evaluations.js";
import compareRouter from "./routes/compare.js";
import dashboardRouter from "./routes/dashboard.js";
import notesRouter from "./routes/notes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
app.use(express.json({ limit: "1mb" }));

// ---------- Routes ----------
app.use("/api/candidates", candidatesRouter);
app.use("/api/evaluations", evaluationsRouter);
app.use("/api/compare", compareRouter);
app.use("/api/dashboard-summary", dashboardRouter);
app.use("/api/notes", notesRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Candidate Engine API is running" });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      statusCode: 404,
    },
  });
});

// ---------- Global Error Handler (must be last) ----------
app.use(errorHandler);

// ---------- Start Server ----------
async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`\n🚀 Candidate Engine API running on http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health`);
      console.log(`   Candidates:   http://localhost:${PORT}/api/candidates`);
      console.log(`   Dashboard:    http://localhost:${PORT}/api/dashboard-summary\n`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
