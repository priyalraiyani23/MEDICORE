import express from "express";
import { loginAdmin, logoutAdmin, getDoctorsList, editDoctor, deleteDoctor, addPatient, getPatientsList, editPatient, deletePatient, toggleDoctorAvailability, updateUnavailableSlots, addStaff, getStaffList, editStaff, deleteStaff } from "../controllers/adminController.js";
import { authAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/logout", authAdmin, logoutAdmin);
router.get("/doctors", authAdmin, getDoctorsList);
router.put("/doctor/:id", authAdmin, upload.array("images", 5), editDoctor);
router.delete("/doctor/:id", authAdmin, deleteDoctor);
router.patch("/doctor/:id/availability", authAdmin, toggleDoctorAvailability);
router.patch("/doctor/:id/unavailable-slots", authAdmin, updateUnavailableSlots);

router.post("/patient", authAdmin, upload.single("image"), addPatient);
router.get("/patients", authAdmin, getPatientsList);
router.put("/patient/:id", authAdmin, upload.single("image"), editPatient);
router.delete("/patient/:id", authAdmin, deletePatient);

router.post("/staff", authAdmin, addStaff);
router.get("/staff", authAdmin, getStaffList);
router.put("/staff/:id", authAdmin, editStaff);
router.delete("/staff/:id", authAdmin, deleteStaff);

export default router;
