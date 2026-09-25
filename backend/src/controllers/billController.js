import billModel from "../models/billModel.js";

// GET /api/bills — patient sees own bills
export const getBills = async (req, res) => {
  try {
    const filter = {};
    if (req.user) {
      filter.patientId = req.user._id;
    }
    const bills = await billModel.find(filter).populate("appointmentId").sort({ createdAt: -1 });
    res.json({ success: true, bills });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/bills/all — admin sees all bills with patient info
export const getAllBills = async (req, res) => {
  try {
    const bills = await billModel
      .find({})
      .populate("patientId", "name email phone")
      .populate("appointmentId")
      .sort({ createdAt: -1 });
    res.json({ success: true, bills });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// PATCH /api/bills/:id/pay — patient pays bill online
export const payBill = async (req, res) => {
  try {
    const bill = await billModel.findById(req.params.id);
    if (!bill) return res.json({ success: false, message: "Bill not found" });
    if (bill.status === "paid") return res.json({ success: false, message: "Bill already paid" });
    // Verify this bill belongs to the requesting user
    if (bill.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    bill.status = "paid";
    bill.paymentMethod = "online";
    await bill.save();
    res.json({ success: true, message: "Payment successful", bill });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/bills
export const createBill = async (req, res) => {
  try {
    const { patientId, appointmentId, items, discount = 0, paymentMethod } = req.body;
    if (!patientId || !items || !items.length) {
      return res.json({ success: false, message: "Patient and items are required" });
    }
    
    // Automatic calculation
    const subTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const tax = (subTotal - discount) * 0.18; // 18% GST
    const totalAmount = subTotal - discount + tax;

    const newBill = new billModel({ 
      patientId, 
      appointmentId, 
      items, 
      subTotal,
      tax,
      discount,
      totalAmount, 
      paymentMethod 
    });
    
    await newBill.save();
    res.json({ success: true, message: "Bill generated successfully", bill: newBill });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/bills/generate-combined
export const generateCombinedBill = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.json({ success: false, message: "Appointment ID is required" });
    }

    // 1. Fetch Appointment for Doctor Fee
    const appointmentModel = (await import("../models/appointmentModel.js")).default;
    const appointment = await appointmentModel.findById(appointmentId).populate('doctorId');
    if (!appointment) return res.json({ success: false, message: "Appointment not found" });

    const patientId = appointment.userId;
    const doctorFee = appointment.doctorId.fees || appointment.consultationFee || 500;
    
    const items = [
      { name: "Doctor Consultation Fee", amount: doctorFee }
    ];

    // 2. Fetch Prescription for Medicines
    const prescriptionModel = (await import("../models/prescriptionModel.js")).default;
    const medicineModel = (await import("../models/medicineModel.js")).default;
    
    const prescriptions = await prescriptionModel.find({ appointmentId, isDispensed: true });
    
    let medicinesTotal = 0;
    for (let p of prescriptions) {
      for (let med of p.medicines) {
        // Approximate cost calculation if not stored in prescription.
        const dbMedicine = await medicineModel.findOne({ name: { $regex: new RegExp(`^${med.name}$`, "i") } });
        const price = dbMedicine ? dbMedicine.price : 50; // Fallback to 50
        const qty = med.quantity || parseInt(med.dosage) || 1;
        const medCost = price * qty;
        
        items.push({ name: `Medicine: ${med.name}`, amount: medCost });
        medicinesTotal += medCost;
      }
    }

    // 3. Fetch Lab Tests for Reports
    const reportModel = (await import("../models/reportModel.js")).default;
    const labTests = await reportModel.find({ appointmentId });
    
    let labTotal = 0;
    for (let test of labTests) {
      const testCost = test.cost || 350;
      items.push({ name: `Lab Test: ${test.title}`, amount: testCost });
      labTotal += testCost;
    }

    // Calculate totals
    const subTotal = doctorFee + medicinesTotal + labTotal;
    const tax = subTotal * 0.18; // 18% GST
    const totalAmount = subTotal + tax;

    // Check if bill already exists for this appointment
    const existingBill = await billModel.findOne({ appointmentId });
    if (existingBill) {
        return res.json({ success: false, message: "Bill already generated for this appointment", bill: existingBill });
    }

    const newBill = new billModel({
      patientId,
      appointmentId,
      items,
      subTotal,
      tax,
      discount: 0,
      totalAmount,
      status: "unpaid"
    });

    await newBill.save();

    res.json({ success: true, message: "Combined Bill generated successfully", bill: newBill });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/bills/dashboard
export const getBillingDashboard = async (req, res) => {
  try {
    const bills = await billModel.find({});
    
    // Today's Revenue
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const todaysBills = bills.filter(b => b.createdAt >= startOfDay && b.createdAt <= endOfDay && b.status === "paid");
    const todaysRevenue = todaysBills.reduce((sum, b) => sum + b.totalAmount, 0);
    
    // Monthly Revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyBills = bills.filter(b => b.createdAt >= startOfMonth && b.status === "paid");
    const monthlyRevenue = monthlyBills.reduce((sum, b) => sum + b.totalAmount, 0);
    
    // Pending Payments (count or amount? Let's do amount)
    const pendingBills = bills.filter(b => b.status === "unpaid");
    const pendingPayments = pendingBills.reduce((sum, b) => sum + b.totalAmount, 0);
    
    // Total Bills
    const totalBills = bills.length;
    const paidBills = bills.filter(b => b.status === "paid").length;
    
    res.json({
      success: true,
      data: {
        todaysRevenue,
        monthlyRevenue,
        pendingPayments,
        totalBills,
        paidBills
      }
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
