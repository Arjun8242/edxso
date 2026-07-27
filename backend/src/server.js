import "dotenv/config";
import express from "express";
import cors from "cors";
import initDb from "./config/initDb.js";
import errorHandler from "./middleware/errorHandler.js";

import candidatesRouter from "./routes/candidates.js";
import evaluationsRouter from "./routes/evaluations.js";
import compareRouter from "./routes/compare.js";
import dashboardRouter from "./routes/dashboard.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/candidates", candidatesRouter);
app.use("/api/evaluations", evaluationsRouter);
app.use("/api/compare", compareRouter);
app.use("/api/dashboard-summary", dashboardRouter);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Candidate Engine API is running" });
});

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
});

app.use(errorHandler);

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
