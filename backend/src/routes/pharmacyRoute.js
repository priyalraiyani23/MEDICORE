import express from "express";
import { getMedicines, addMedicine, updateStock, deleteMedicine, getPharmacyDashboard } from "../controllers/medicineController.js";
import { authAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", authAdmin, getPharmacyDashboard);
router.get("/", getMedicines);
router.post("/", authAdmin, addMedicine);
router.put("/:id/stock", authAdmin, updateStock);
router.delete("/:id", authAdmin, deleteMedicine);

export default router;
