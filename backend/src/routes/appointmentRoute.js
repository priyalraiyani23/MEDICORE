import express from "express";
import { 
    bookAppointment, 
    getUserAppointments, 
    cancelAppointment, 
    acceptAppointment, 
    rejectAppointment, 
    completeAppointment,
    createRazorpayOrder,
    verifyRazorpayPayment,
    deleteAppointment,
    getAllAppointments,
    updateAppointmentStatus
} from "../controllers/appointmentController.js";
import { authUser, authDoctor, authAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.get("/all", authAdmin, getAllAppointments);
router.patch("/status", authAdmin, updateAppointmentStatus);

// Patient routes
router.post("/book", authUser, bookAppointment);
router.get("/my-appointments", authUser, getUserAppointments);
router.post("/cancel", authUser, cancelAppointment);
router.post("/pay-online", authUser, createRazorpayOrder);
router.post("/verify-payment", authUser, verifyRazorpayPayment);
router.delete("/delete/:appointmentId", authUser, deleteAppointment);

// Doctor routes
router.post("/accept", authDoctor, acceptAppointment);
router.post("/reject", authDoctor, rejectAppointment);
router.post("/complete", authDoctor, completeAppointment);

export default router;
