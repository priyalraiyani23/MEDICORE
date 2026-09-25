import express from "express";
import { getReports, addReport, createTest, uploadReportResult, getPendingTests, updateTestStatus } from "../controllers/reportController.js";
import { authStaff } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/", authStaff(['laboratory']), getReports);
router.post("/", authStaff(['laboratory']), addReport);
router.get("/pending", authStaff(['laboratory']), getPendingTests);
router.post("/test", authStaff(['laboratory']), createTest);
router.put("/test/:id/upload", authStaff(['laboratory']), upload.single("fileUrl"), uploadReportResult);
router.patch("/test/:id/status", authStaff(['laboratory']), updateTestStatus);

export default router;
