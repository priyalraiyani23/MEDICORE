import Prescription from "../models/prescriptionModel.js";
import billModel from "../models/billModel.js";
import Doctor from "../models/doctorModel.js";

// Fetch prescriptions for a patient
export const getPatientPrescriptions = async (req, res) => {
    try {
        const patientId = req.user._id;
        const prescriptions = await Prescription.find({ patientId })
            .populate('doctorId', 'name speciality')
            .sort({ createdAt: -1 });

        console.log("FETCHED PRESCRIPTIONS:", JSON.stringify(prescriptions, null, 2));
        res.status(200).json({ success: true, data: prescriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a prescription (Doctor)
export const createPrescription = async (req, res) => {
    try {
        const { patientId, appointmentId, medicines, instructions, labTests } = req.body;
        const doctorId = req.doctor._id; // AuthDoctor middleware sets req.doctor

        const prescription = await Prescription.create({
            patientId,
            doctorId,
            appointmentId: appointmentId || null,
            medicines,
            instructions
        });

        // Create lab tests if provided
        if (labTests && labTests.length > 0) {
            const reportModel = (await import("../models/reportModel.js")).default;
            for (let test of labTests) {
                await reportModel.create({
                    patientId,
                    doctorId,
                    appointmentId,
                    title: test.title || test, // Support both string and object
                    description: test.description || "",
                    status: "pending",
                    cost: 350 // Mock lab cost, or fetch from a config/db
                });
            }
        }

        res.status(201).json({ success: true, message: "Prescription created successfully", data: prescription });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Fetch all prescriptions (for Admin/Pharmacy)
export const getAllPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({})
            .populate('doctorId', 'name speciality')
            .populate('patientId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: prescriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark prescription as dispensed
export const markDispensed = async (req, res) => {
    try {
        const { prescriptionId } = req.body;
        
        const prescription = await Prescription.findById(prescriptionId);
        if (!prescription) {
            return res.status(404).json({ success: false, message: "Prescription not found" });
        }

        prescription.isDispensed = true;
        await prescription.save();

        const medicineModel = (await import("../models/medicineModel.js")).default;

        let dispensedMeds = [];

        // Deduct stock
        for (let med of prescription.medicines) {
            // Find medicine in inventory (case insensitive)
            const dbMedicine = await medicineModel.findOne({ name: { $regex: new RegExp(`^${med.name}$`, "i") } });
            
            let quantityToDeduct = 1;
            // Parse duration & frequency for quantity to deduct
            if (med.frequency || med.duration) {
                let days = 5;
                if (med.duration) {
                    const num = parseInt(med.duration) || 1;
                    if (med.duration.toLowerCase().includes('week')) {
                        days = num * 7;
                    } else if (med.duration.toLowerCase().includes('month')) {
                        days = num * 30;
                    } else {
                        days = num;
                    }
                }
                let perDay = 1;
                if (med.frequency) {
                    const matches = med.frequency.match(/\d/g);
                    if (matches && matches.length > 0) {
                        perDay = matches.reduce((sum, val) => sum + parseInt(val), 0);
                    }
                }
                quantityToDeduct = perDay * days;
            } else {
                quantityToDeduct = med.quantity || parseInt(med.dosage) || 10;
            }

            if (dbMedicine) {
                dbMedicine.stock = Math.max(0, dbMedicine.stock - quantityToDeduct);
                await dbMedicine.save();

                const price = dbMedicine.price || 50;
                const cost = price * quantityToDeduct;
                dispensedMeds.push({ name: `Medicine: ${med.name}`, amount: cost });
            } else {
                const cost = 50 * quantityToDeduct;
                dispensedMeds.push({ name: `Medicine: ${med.name}`, amount: cost });
            }
        }

        // Update patient's bill if it exists for this appointment
        if (prescription.appointmentId && dispensedMeds.length > 0) {
            const bill = await billModel.findOne({ appointmentId: prescription.appointmentId });
            if (bill) {
                for (let dispensedMed of dispensedMeds) {
                    const itemExists = bill.items.some(item => item.name.includes(dispensedMed.name));
                    if (!itemExists) {
                        bill.items.push(dispensedMed);
                    }
                }
                bill.subTotal = bill.items.reduce((sum, item) => sum + item.amount, 0);
                bill.tax = bill.subTotal * 0.18;
                bill.totalAmount = bill.subTotal + bill.tax;
                await bill.save();
            }
        }

        res.status(200).json({ success: true, message: "Prescription marked as dispensed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
