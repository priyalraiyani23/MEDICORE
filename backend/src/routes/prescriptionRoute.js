import express from "express";
import { getPatientPrescriptions, markDispensed, getAllPrescriptions, createPrescription } from "../controllers/prescriptionController.js";
import { authUser, authAdmin, authDoctor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-prescriptions", authUser, getPatientPrescriptions);
router.get("/all", authAdmin, getAllPrescriptions); // For Admin
router.post("/create", authDoctor, createPrescription); // For Doctor
router.post("/dispense", authAdmin, markDispensed); // Admin only

export default router;
