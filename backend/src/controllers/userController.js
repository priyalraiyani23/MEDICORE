import User from "../models/userModel.js";
import Appointment from "../models/appointmentModel.js";
import reportModel from "../models/reportModel.js";
import billModel from "../models/billModel.js";
import Prescription from "../models/prescriptionModel.js";
import Doctor from "../models/doctorModel.js";
// Get user profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const { name, phone, address, dob, gender, age, bloodGroup, height, weight, emergencyContact } = req.body;
        // In FormData, array fields might come as strings or arrays depending on how they were appended.
        // If sent as 'medicalHistory[]', we might need to look for that key, or just req.body.medicalHistory.
        // Assuming express handles 'medicalHistory[]' as an array in req.body.medicalHistory or we parse it.
        const medicalHistory = req.body['medicalHistory[]'] || req.body.medicalHistory;
        const allergies = req.body['allergies[]'] || req.body.allergies;
        const currentMedications = req.body['currentMedications[]'] || req.body.currentMedications;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.dob = dob || user.dob;
        user.gender = gender || user.gender;
        user.age = age || user.age;
        user.bloodGroup = bloodGroup || user.bloodGroup;
        user.height = height || user.height;
        user.weight = weight || user.weight;
        user.emergencyContact = emergencyContact || user.emergencyContact;

        if (medicalHistory) {
            user.medicalHistory = Array.isArray(medicalHistory) ? medicalHistory : [medicalHistory];
        }
        if (allergies) {
            user.allergies = Array.isArray(allergies) ? allergies : [allergies];
        }
        if (currentMedications) {
            user.currentMedications = Array.isArray(currentMedications) ? currentMedications : [currentMedications];
        }
        if (req.file) {
            user.image = req.file.path;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPatientDashboard = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch upcoming appointments
        const today = new Date();
        const formattedToday = `${today.getDate()} ${today.toLocaleString('default', { month: 'short' })} ${today.getFullYear()}`;
        // Since slotDate is a string, this basic filter might not accurately represent "upcoming",
        // but for simplicity, we fetch all and maybe sort/filter them.
        const appointments = await Appointment.find({ userId }).populate('doctorId', 'name speciality').sort({ createdAt: -1 });

        // Fetch prescriptions
        const prescriptions = await Prescription.find({ patientId: userId }).populate('doctorId', 'name speciality').sort({ createdAt: -1 });

        // Fetch reports
        const reports = await reportModel.find({ patientId: userId }).populate('doctorId', 'name speciality').sort({ createdAt: -1 });

        // Fetch bills
        const bills = await billModel.find({ patientId: userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                appointments,
                prescriptions,
                reports,
                bills
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPrescriptions = async (req, res) => {
    try {
        const userId = req.user._id;
        const prescriptions = await Prescription.find({ patientId: userId })
            .populate('doctorId', 'name speciality')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: prescriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPatientReports = async (req, res) => {
    try {
        const userId = req.user._id;
        const reports = await reportModel.find({ patientId: userId })
            .populate('doctorId', 'name speciality')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
