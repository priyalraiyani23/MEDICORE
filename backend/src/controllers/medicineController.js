import medicineModel from "../models/medicineModel.js";

// GET /api/medicines
export const getMedicines = async (req, res) => {
  try {
    const medicines = await medicineModel.find({});
    res.json({ success: true, medicines });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/medicines
export const addMedicine = async (req, res) => {
  try {
    const { name, category, description, price, stock, manufacturer, expiryDate } = req.body;
    if (!name || !price || !category) {
      return res.json({ success: false, message: "Name, category, and price are required" });
    }
    const newMedicine = new medicineModel({ name, category, description, price, stock, manufacturer, expiryDate });
    await newMedicine.save();
    res.json({ success: true, message: "Medicine added successfully", medicine: newMedicine });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// PUT /api/medicines/:id/stock
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined) {
      return res.json({ success: false, message: "Stock quantity is required" });
    }

    const medicine = await medicineModel.findByIdAndUpdate(id, { stock }, { new: true });
    
    if (!medicine) {
      return res.json({ success: false, message: "Medicine not found" });
    }

    res.json({ success: true, message: "Stock updated successfully", medicine });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// DELETE /api/medicines/:id
export const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await medicineModel.findByIdAndDelete(id);
    
    if (!medicine) {
      return res.json({ success: false, message: "Medicine not found" });
    }

    res.json({ success: true, message: "Medicine deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/medicines/dashboard
export const getPharmacyDashboard = async (req, res) => {
  try {
    const medicines = await medicineModel.find({});
    
    const totalMedicines = medicines.length;
    const lowStock = medicines.filter(m => m.stock < 10).length; // assume < 10 is low
    const expired = medicines.filter(m => m.expiryDate && new Date(m.expiryDate) < new Date()).length;
    
    const prescriptionModel = (await import("../models/prescriptionModel.js")).default;
    
    // Today's Prescriptions
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const todaysPrescriptions = await prescriptionModel.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    // Issued Medicines (Prescriptions that are dispensed today)
    const issuedMedicines = await prescriptionModel.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      isDispensed: true
    });
    
    res.json({
      success: true,
      data: {
        totalMedicines,
        lowStock,
        expired,
        todaysPrescriptions,
        issuedMedicines
      }
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
