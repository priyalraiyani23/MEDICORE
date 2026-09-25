import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Doctor from "../models/doctorModel.js";
import User from "../models/userModel.js";
import Staff from "../models/staffModel.js";

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and Password are required" });
        }

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            return res.status(200).json({
                success: true,
                message: "Admin Login successful",
                token
            });
        } else {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
        console.log(error);
    }
}

export const logoutAdmin = async (req, res) => {
    res.status(200).json({ success: true, message: "Admin Logged out successfully" });
}

export const getDoctorsList = async (req, res) => {
    try {
        const doctors = await Doctor.find({}).select("-password");
        res.status(200).json({ success: true, data: doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const editDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        
        // If password is blank/empty, do NOT overwrite existing password
        if (!updates.password) {
            delete updates.password;
        } else {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        // If email is blank, do NOT overwrite
        if (!updates.email || updates.email.trim() === '') {
            delete updates.email;
        } else {
            updates.email = updates.email.toLowerCase().trim();
        }

        // Parse availableDays and availableTimeSlots from comma-separated string to array
        if (updates.availableDays && typeof updates.availableDays === 'string') {
            updates.availableDays = updates.availableDays.split(',').map(d => d.trim()).filter(Boolean);
        }
        if (updates.availableTimeSlots && typeof updates.availableTimeSlots === 'string') {
            updates.availableTimeSlots = updates.availableTimeSlots.split(',').map(t => t.trim()).filter(Boolean);
        }

        // Remove empty dob so it doesn't overwrite with null
        if (!updates.dob || updates.dob.trim() === '') {
            delete updates.dob;
        }

        if (req.files && req.files.length > 0) {
            updates.images = req.files.map(file => ({
                public_id: file.filename,
                url: file.path,
            }));
        }
        
        const doctor = await Doctor.findByIdAndUpdate(id, updates, { new: true, runValidators: false }).select("-password");
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }
        
        res.status(200).json({ success: true, message: "Doctor updated successfully", data: doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findByIdAndDelete(id);
        
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }
        
        res.status(200).json({ success: true, message: "Doctor deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const addPatient = async (req, res) => {
    try {
        const { name, email, password, phone, address, dob, gender, age, bloodGroup, medicalHistory, allergies } = req.body;

        if (!name || !email || !password) {
            throw new Error("name, email and password are required");
        }

        const lowercaseEmail = email.toLowerCase();
        const existingUser = await User.findOne({ email: lowercaseEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Patient already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const image = req.file ? req.file.path : "";

        const user = await User.create({
            name,
            email: lowercaseEmail,
            password: hashedPassword,
            phone,
            address,
            dob,
            gender,
            age,
            bloodGroup,
            medicalHistory: medicalHistory ? (Array.isArray(medicalHistory) ? medicalHistory : medicalHistory.split(',')) : [],
            allergies: allergies ? (Array.isArray(allergies) ? allergies : allergies.split(',')) : [],
            image
        });

        res.status(201).json({ success: true, message: "Patient added successfully", data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getPatientsList = async (req, res) => {
    try {
        const patients = await User.find({}).select("-password");
        res.status(200).json({ success: true, data: patients });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const editPatient = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        if (req.file) {
            updates.image = req.file.path;
        }

        if (updates.medicalHistory && !Array.isArray(updates.medicalHistory)) {
            updates.medicalHistory = updates.medicalHistory.split(',');
        }
        if (updates.allergies && !Array.isArray(updates.allergies)) {
            updates.allergies = updates.allergies.split(',');
        }
        
        const patient = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }
        
        res.status(200).json({ success: true, message: "Patient updated successfully", data: patient });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await User.findByIdAndDelete(id);
        
        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }
        
        res.status(200).json({ success: true, message: "Patient deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const toggleDoctorAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }
        doctor.availability = !doctor.availability;
        await doctor.save();
        res.status(200).json({
            success: true,
            message: `Doctor marked as ${doctor.availability ? 'Available' : 'Unavailable'}`,
            availability: doctor.availability
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Helper: generate all 30-min time slots from 10 AM to 8:30 PM (matches frontend)
const buildAllSlots = () => {
    const slots = [];
    for (let h = 10; h <= 20; h++) {
        for (let m = 0; m < 60; m += 30) {
            const d = new Date(2000, 0, 1, h, m);
            slots.push(d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
        }
    }
    return slots;
};

export const updateUnavailableSlots = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, times } = req.body; // date: "YYYY-MM-DD", times: ["10:00 AM", "2:30 PM"]

        if (!date) {
            return res.status(400).json({ success: false, message: "Date is required" });
        }

        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        // Remove existing entry for this date, then add new one (if times exist)
        doctor.unavailableSlots = doctor.unavailableSlots.filter(s => s.date !== date);
        if (times && times.length > 0) {
            doctor.unavailableSlots.push({ date, times });
        }

        // Auto-manage availability based on TODAY's blocked slots
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        if (date === todayKey) {
            const ALL_SLOTS = buildAllSlots();
            const todayEntry = doctor.unavailableSlots.find(s => s.date === todayKey);
            const blockedToday = todayEntry ? todayEntry.times : [];

            // Check if all possible slots for today are blocked
            const allBlocked = ALL_SLOTS.every(slot => blockedToday.includes(slot));
            doctor.availability = !allBlocked;
        }

        await doctor.save();
        res.status(200).json({
            success: true,
            message: "Unavailable slots updated",
            unavailableSlots: doctor.unavailableSlots,
            availability: doctor.availability
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const addStaff = async (req, res) => {
    try {
        const { name, email, password, role, phone, address } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: "Name, email, password, and role are required" });
        }

        const lowercaseEmail = email.toLowerCase();
        const existingStaff = await Staff.findOne({ email: lowercaseEmail });
        if (existingStaff) {
            return res.status(400).json({ success: false, message: "Staff member already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const staff = await Staff.create({
            name,
            email: lowercaseEmail,
            password: hashedPassword,
            role,
            phone,
            address
        });

        res.status(201).json({ success: true, message: "Staff member added successfully", data: staff });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStaffList = async (req, res) => {
    try {
        const staff = await Staff.find({}).select("-password");
        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const editStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        } else {
            delete updates.password;
        }

        const staff = await Staff.findByIdAndUpdate(id, updates, { new: true }).select("-password");
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff member not found" });
        }

        res.status(200).json({ success: true, message: "Staff member updated successfully", data: staff });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await Staff.findByIdAndDelete(id);

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff member not found" });
        }

        res.status(200).json({ success: true, message: "Staff member deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
