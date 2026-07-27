import { Router } from "express";
import { createCandidate, getCandidates, getCandidateById, updateCandidateById } from "../controllers/candidateController.js";
import { createNote, getNotesByCandidate } from "../controllers/noteController.js";

const router = Router();

// Candidate CRUD
router.post("/", createCandidate);
router.get("/", getCandidates);
router.get("/:id", getCandidateById);
router.patch("/:id", updateCandidateById);

// Notes nested under candidates (PRD §6.7)
router.post("/:id/notes", createNote);
router.get("/:id/notes", getNotesByCandidate);

export default router;
