import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import Staff from "../models/staffModel.js";

// Middleware for Admin
export const authAdmin = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized, token missing" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decodedToken.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Not authorized, Admin only" });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Not authorized" });
    }
};

// Middleware for Doctor
export const authDoctor = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized, token missing" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find doctor
        const doctor = await Doctor.findById(decodedToken.id).select("-password");
        if (!doctor) {
            return res.status(401).json({ success: false, message: "Not authorized as Doctor" });
        }

        req.doctor = doctor;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Not authorized" });
    }
};

// Middleware for User/Patient
export const authUser = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized, token missing" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user
        const user = await User.findById(decodedToken.id).select("-password");
        if (!user) {
            return res.status(401).json({ success: false, message: "Not authorized as User" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Not authorized" });
    }
};

// Middleware for Staff (Receptionist, Pharmacist, Lab)
export const authStaff = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            let token;
            if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
                token = req.headers.authorization.split(" ")[1];
            }

            if (!token) {
                return res.status(401).json({ success: false, message: "Not authorized, token missing" });
            }

            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

            // Admin can bypass staff authorization
            if (decodedToken.role === 'admin') {
                return next();
            }

            if (allowedRoles.includes(decodedToken.role)) {
                const staff = await Staff.findById(decodedToken.id).select("-password");
                if (!staff || staff.status !== 'Active') {
                    return res.status(401).json({ success: false, message: "Not authorized, staff inactive or not found" });
                }
                req.staff = staff;
                return next();
            }

            return res.status(403).json({ success: false, message: "Not authorized, role access denied" });
        } catch (error) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }
    };
};
