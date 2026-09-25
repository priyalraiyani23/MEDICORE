import Doctor from "../models/doctorModel.js";
import Appointment from "../models/appointmentModel.js";
import Prescription from "../models/prescriptionModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import reportModel from "../models/reportModel.js";

export const addDoctor = async (req, res) => {
    try {
        const { name, email, password, gender, experience, speciality, phone, address, qualification, about, consultationFee, availability, status, department, dob, availableDays, availableTimeSlots } = req.body;
        const images = req.files ? req.files.map(file => ({
            public_id: file.filename,
            url: file.path,
        })) : [];

        if (!name || !email || !password || !gender || !experience || !speciality || !phone || !address) {
            throw new Error("all fields are required");
        }

        const lowercaseEmail = email.toLowerCase();
        const existingDoctor = await Doctor.findOne({ email: lowercaseEmail });
        if (existingDoctor) {
            return res.status(400).json({ success: false, message: "Doctor already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const doctor = await Doctor.create({
            name,
            email: lowercaseEmail,
            password: hashedPassword,
            gender,
            experience,
            speciality,
            phone,
            images,
            address,
            qualification,
            about,
            consultationFee,
            availability,
            status,
            department,
            dob,
            availableDays,
            availableTimeSlots
        });

        res.status(201).json({
            success: true,
            message: "doctor added successfully",
            data: doctor,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
        console.log(error);
    }
}

export const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and Password are required" });
        }

        const lowercaseEmail = email.toLowerCase();
        const doctor = await Doctor.findOne({ email: lowercaseEmail });
        
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        let isMatch = false;
        if (doctor.password) {
            if (doctor.password.startsWith('$2')) {
                isMatch = await bcrypt.compare(password, doctor.password);
            } else {
                isMatch = (password === doctor.password);
                if (isMatch) {
                    try {
                        const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash(password, salt);
                        doctor.password = hashedPassword;
                        await doctor.save();
                        console.log(`Auto-migrated plain-text password for doctor ${doctor.email} to bcrypt hash.`);
                    } catch (migrateErr) {
                        console.error("Failed to migrate doctor plain text password:", migrateErr);
                    }
                }
            }
        }

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid Password" });
        }

        const token = jwt.sign(
            { id: doctor._id, role: 'doctor' },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: doctor,
        });
    } catch (error) {
        res.status(403).json({
            success: false,
            message: error.message
        });
        console.log(error);
    }
}

export const logoutDoctor = async (req, res) => {
    // For JWT, logout is typically handled client-side by deleting the token.
    // If using cookies, we would clear the cookie here.
    res.status(200).json({ success: true, message: "Logged out successfully" });
}

export const getAllDoctors = async (req, res) => {
    try {
        const { search, speciality, department, status } = req.query;
        let query = {};
        
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        if (speciality) query.speciality = speciality;
        if (department) query.department = department;
        if (status) query.status = status;

        const doctors = await Doctor.find(query).select("-password");
        
        // Format the database doctors to match the frontend expected structure
        const formattedDoctors = doctors.map(doc => {
            const d = doc.toObject();
            return {
                ...d,
                image: d.images && d.images.length > 0 ? d.images[0].url : 'https://via.placeholder.com/150',
                rating: 4.8,
                reviews: Math.floor(Math.random() * 100) + 20,
                degree: d.qualification || 'MBBS, MD',
                fees: d.consultationFee || '₹500',
                about: d.about || 'Experienced and dedicated doctor committed to providing the highest quality of patient care.'
            };
        });

        res.status(200).json({ success: true, data: formattedDoctors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (req.files && req.files.length > 0) {
            updates.images = req.files.map(file => ({
                public_id: file.filename,
                url: file.path,
            }));
        }

        const doctor = await Doctor.findByIdAndUpdate(id, updates, { new: true }).select("-password");
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

        res.status(200).json({ success: true, message: "Doctor updated successfully", data: doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findByIdAndDelete(id);
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

        res.status(200).json({ success: true, message: "Doctor deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getDoctorDashboard = async (req, res) => {
    try {
        const doctorId = req.doctor._id;
        
        // Fetch appointments for this doctor
        const appointments = await Appointment.find({ doctorId }).populate('userId', 'name image email');
        
        // Calculate Today's Appointments
        const today = new Date();
        const formattedToday = `${today.getDate()} ${today.toLocaleString('default', { month: 'short' })} ${today.getFullYear()}`;
        
        const todayAppointmentsCount = appointments.filter(app => app.slotDate === formattedToday).length;
        
        // Calculate Total Patients (unique users)
        const uniquePatients = new Set(appointments.map(app => app.userId?._id?.toString())).size;
        
        // Get recent appointments
        const recentAppointments = await Appointment.find({ doctorId })
            .populate('userId', 'name image email')
            .sort({ createdAt: -1 })
            .limit(5);
        
        // Get pending reports count
        const pendingReportsCount = await reportModel.countDocuments({ doctorId, status: "pending" });
        
        const dashboardData = {
            todayAppointments: todayAppointmentsCount,
            totalPatients: uniquePatients,
            pendingReports: pendingReportsCount,
            recentAppointments: recentAppointments,
            allAppointments: appointments,
            doctor: req.doctor
        };
        
        res.status(200).json({ success: true, data: dashboardData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const generatePrescription = async (req, res) => {
    try {
        const doctorId = req.doctor._id;
        const { patientId, appointmentId, medicines, instructions, labTests } = req.body;

        if (!patientId || !medicines || medicines.length === 0) {
            return res.status(400).json({ success: false, message: "Patient ID and Medicines are required" });
        }

        const prescription = await Prescription.create({
            doctorId,
            patientId,
            appointmentId,
            medicines,
            instructions
        });

        // Automatically create laboratory test requests if provided
        if (labTests && labTests.length > 0) {
            const reportModel = (await import("../models/reportModel.js")).default;
            for (let test of labTests) {
                const title = typeof test === 'string' ? test : test.title;
                const desc = typeof test === 'string' ? "" : test.description || "";
                if (!title) continue;
                
                await reportModel.create({
                    patientId,
                    doctorId,
                    appointmentId,
                    title,
                    description: desc,
                    status: "pending",
                    cost: 300 // default test cost (e.g. CBC is ₹300)
                });
            }
        }

        res.status(201).json({ success: true, message: "Prescription generated successfully", data: prescription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getPatientDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const doctorId = req.doctor._id;
        
        // Find appointments for this patient and doctor
        const appointments = await Appointment.find({ doctorId, userId: id }).sort({ createdAt: -1 });
        
        // Find prescriptions for this patient
        const prescriptions = await Prescription.find({ patientId: id }).populate('doctorId', 'name speciality').sort({ createdAt: -1 });
        
        // Find lab reports for this patient
        const reports = await reportModel.find({ patientId: id }).sort({ createdAt: -1 });
        
        res.status(200).json({ 
            success: true, 
            data: {
                appointments,
                prescriptions,
                reports
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Helper: generate all 30-min slots 10AM–8:30PM
const buildAllTimeSlots = () => {
    const slots = [];
    for (let h = 10; h <= 20; h++) {
        for (let m = 0; m < 60; m += 30) {
            const d = new Date(2000, 0, 1, h, m);
            slots.push(d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
        }
    }
    return slots;
};

export const updateDoctorUnavailableSlots = async (req, res) => {
    try {
        const doctorId = req.doctor._id;
        const { date, times } = req.body; // date: "YYYY-MM-DD", times: ["10:00 AM", "2:30 PM"]

        if (!date) {
            return res.status(400).json({ success: false, message: "Date is required" });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        // Remove existing entry for this date, add new one if times exist
        doctor.unavailableSlots = doctor.unavailableSlots.filter(s => s.date !== date);
        if (times && times.length > 0) {
            doctor.unavailableSlots.push({ date, times });
        }

        // Auto-manage availability based on TODAY's blocked slots
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        if (date === todayKey) {
            const ALL_SLOTS = buildAllTimeSlots();
            const todayEntry = doctor.unavailableSlots.find(s => s.date === todayKey);
            const blockedToday = todayEntry ? todayEntry.times : [];
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

export const updateDoctorProfile = async (req, res) => {
    try {
        const doctorId = req.doctor._id;
        const updates = { ...req.body };

        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        } else {
            delete updates.password; // Do not overwrite with empty password
        }

        if (req.files && req.files.length > 0) {
            updates.images = req.files.map(file => ({
                public_id: file.filename,
                url: file.path,
            }));
        }

        const doctor = await Doctor.findByIdAndUpdate(doctorId, updates, { new: true }).select("-password");
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        res.status(200).json({ success: true, message: "Profile updated successfully", data: doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

