import { Router } from "express";
import { createNote, getNotesByCandidate } from "../controllers/noteController.js";

const router = Router();

router.post("/:candidate_id", createNote);
router.get("/:candidate_id", getNotesByCandidate);

export default router;
