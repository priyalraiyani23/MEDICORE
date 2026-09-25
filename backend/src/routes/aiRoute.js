import express from "express";
import { symptomChecker, reportSummary, chat } from "../controllers/aiController.js";

const router = express.Router();

router.post("/symptom-checker", symptomChecker);
router.post("/report-summary", reportSummary);
router.post("/chat", chat);

export default router;
