import { Router } from "express";
import { createCandidate, getCandidates, getCandidateById } from "../controllers/candidateController.js";

const router = Router();

router.post("/", createCandidate);
router.get("/", getCandidates);
router.get("/:id", getCandidateById);

export default router;
