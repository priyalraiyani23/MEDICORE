import express from "express";
import { getBills, createBill, getAllBills, payBill, generateCombinedBill, getBillingDashboard } from "../controllers/billController.js";
import { authUser, authAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", authAdmin, getBillingDashboard); // Admin: dashboard stats
router.get("/", authUser, getBills);                  // Patient: own bills
router.get("/all", authAdmin, getAllBills);            // Admin: all bills with patient info
router.post("/", authUser, createBill);
router.post("/generate-combined", authAdmin, generateCombinedBill); // Admin: Generate combined bill
router.patch("/:id/pay", authUser, payBill);          // Patient: pay online

export default router;
