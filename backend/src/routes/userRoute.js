import express from "express";
import { getUserProfile, updateUserProfile, getPatientDashboard, getPrescriptions, getPatientReports } from "../controllers/userController.js";
import { authUser } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/profile", authUser, getUserProfile);
router.put("/profile", authUser, upload.single('image'), updateUserProfile);
router.get("/dashboard", authUser, getPatientDashboard);
router.get("/prescriptions", authUser, getPrescriptions);
router.get("/reports", authUser, getPatientReports);

export default router;
