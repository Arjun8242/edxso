import { Router } from "express";
import { compareCandidates } from "../controllers/compareController.js";

const router = Router();

router.get("/", compareCandidates);

export default router;
