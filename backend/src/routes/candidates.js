import { Router } from "express";
import { createCandidate, getCandidates, getCandidateById, updateCandidateById } from "../controllers/candidateController.js";

const router = Router();

router.post("/", createCandidate);
router.get("/", getCandidates);
router.get("/:id", getCandidateById);
router.patch("/:id", updateCandidateById);

export default router;
