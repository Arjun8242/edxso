import { Router } from "express";
import { createEvaluation } from "../controllers/evaluationController.js";

const router = Router();

router.post("/:candidate_id", createEvaluation);

export default router;
