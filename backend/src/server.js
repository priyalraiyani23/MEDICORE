import dotenv from "dotenv";
dotenv.config();
// Loaded active Razorpay and environment configurations
import express from "express";
import connectDB from "./config/db.js";
import dns from "dns";
import authRoute from "./routes/authRoute.js"
import doctorRoute from "./routes/doctorRoute.js"
import adminRoute from "./routes/adminRoute.js"
import userRoute from "./routes/userRoute.js"
import appointmentRoute from "./routes/appointmentRoute.js"
import pharmacyRoute from "./routes/pharmacyRoute.js"
import labRoute from "./routes/labRoute.js"
import billingRoute from "./routes/billingRoute.js"
import aiRoute from "./routes/aiRoute.js"
import prescriptionRoute from "./routes/prescriptionRoute.js"
import messageRoute from "./routes/messageRoute.js"
import chatRoute from "./routes/chatRoute.js"

dns.setServers(["96.45.45.45", "96.45.46.46", "4.2.2.2", "1.1.1.1", "8.8.8.8"]);

connectDB();

const app = express();

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.get("/", (req, res) => {
    res.send("Welcome to the backend server!");
});

// Original Routes (kept for backward compatibility with frontend if any)
app.use("/api/admin",adminRoute);

// Core RESTful APIs (as requested)
app.use("/api/auth", authRoute);
app.use("/api/doctors", doctorRoute);
app.use("/api/patients", userRoute);
app.use("/api/appointment", appointmentRoute);

// New Modules
app.use("/api/medicines", pharmacyRoute);
app.use("/api/reports", labRoute);
app.use("/api/bills", billingRoute);
app.use("/api/ai", aiRoute);
app.use("/api/prescriptions", prescriptionRoute);
app.use("/api/contact-messages", messageRoute);
app.use("/api/chat", chatRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
dotenv.config();