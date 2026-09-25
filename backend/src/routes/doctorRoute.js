import express from "express";
import { addDoctor, loginDoctor, logoutDoctor, getAllDoctors, getDoctorDashboard, generatePrescription, updateDoctor, deleteDoctor, getPatientDetails, updateDoctorUnavailableSlots, updateDoctorProfile } from "../controllers/doctorController.js"
import { authAdmin, authDoctor } from "../middleware/authMiddleware.js"
import upload from "../middleware/multer.js";

const router = express.Router();
router.post("/add-doctor", authAdmin, upload.array("images", 5), addDoctor);
router.post("/login", loginDoctor);
router.post("/logout", authDoctor, logoutDoctor);
router.get("/all", getAllDoctors);
router.get("/dashboard", authDoctor, getDoctorDashboard);
router.get("/patient/:id", authDoctor, getPatientDetails);
router.post("/prescription", authDoctor, generatePrescription);
router.patch("/unavailable-slots", authDoctor, updateDoctorUnavailableSlots);
router.put("/profile/update", authDoctor, upload.array("images", 5), updateDoctorProfile);
router.put("/:id", authAdmin, upload.array("images", 5), updateDoctor);
router.delete("/:id", authAdmin, deleteDoctor);

export default router;