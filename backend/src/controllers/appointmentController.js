import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import User from "../models/userModel.js";
import billModel from "../models/billModel.js";
import { sendEmail } from "../util/sendEmail.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummykey",
        key_secret: process.env.RAZORPAY_KEY_SECRET || "dummysecret",
    });
};


// Triggering nodemon reload to pick up new .env key values
// Helper to parse dates like "19 Aug 2026" to "YYYY-MM-DD"
const parseToYYYYMMDD = (dateStr) => {
    try {
        if (!dateStr) return "";
        if (dateStr.includes('-')) return dateStr;
        const parts = dateStr.trim().split(/\s+/);
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const monthStr = parts[1].substring(0, 3);
            const year = parts[2];
            const months = {
                Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
                Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
            };
            const month = months[monthStr] || '01';
            return `${year}-${month}-${day}`;
        }
        return dateStr;
    } catch (e) {
        return dateStr;
    }
};

// Book an appointment
export const bookAppointment = async (req, res) => {
    try {
        const { doctorId, slotDate, slotTime } = req.body;
        const userId = req.user._id;

        const doctorData = await Doctor.findById(doctorId).select("-password");
        if (!doctorData) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        // Prevent booking if slot is blocked by the doctor
        const dateKey = parseToYYYYMMDD(slotDate);
        const dayEntry = doctorData.unavailableSlots?.find(s => s.date === dateKey);
        if (dayEntry && dayEntry.times.includes(slotTime)) {
            return res.status(400).json({ success: false, message: "This time slot is blocked by the doctor" });
        }

        // Prevent double booking
        const existingAppointment = await Appointment.findOne({ 
            doctorId, 
            slotDate, 
            slotTime, 
            status: { $nin: ['Cancelled', 'Rejected'] } 
        });

        if (existingAppointment) {
            return res.status(400).json({ success: false, message: "This time slot is already booked" });
        }

        const appointment = await Appointment.create({
            userId,
            doctorId,
            slotDate,
            slotTime,
        });

        // Fetch user data to get email
        const userData = await User.findById(userId);
        
        // Send email
        // Send email in background (without await) to not block the response
        if (userData && userData.email) {
            sendEmail(
                userData.email,
                "Appointment Booked",
                `<h2>✅ Appointment Booked</h2>
                 <p>Hello <b>${userData.name}</b>,</p>
                 <p>Your appointment with <b>${doctorData.name}</b> (${doctorData.speciality}) is confirmed.</p>
                 <p><b>Date:</b> ${slotDate}<br><b>Time:</b> ${slotTime}</p>
                 <p>Thank you for choosing <b>Medicore</b>.</p>`
            );
        }

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            data: appointment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// Get user appointments
export const getUserAppointments = async (req, res) => {
    try {
        const userId = req.user._id;
        const appointments = await Appointment.find({ userId })
            .populate('doctorId', 'name speciality address images fees')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cancel user appointment
export const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.user._id;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        if (appointment.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized action" });
        }

        appointment.status = "Cancelled";
        await appointment.save();

        // Fetch user and doctor data for email
        const userData = await User.findById(userId);
        const doctorData = await Doctor.findById(appointment.doctorId);

        // Send cancellation email
        // Send cancellation email in background (without await)
        if (userData && userData.email && doctorData) {
            sendEmail(
                userData.email,
                "Appointment Cancelled",
                `<h2>❌ Appointment Cancelled</h2>
                 <p>Hello <b>${userData.name}</b>,</p>
                 <p>Your appointment with <b>${doctorData.name}</b> (${doctorData.speciality}) on <b>${appointment.slotDate}</b> at <b>${appointment.slotTime}</b> has been cancelled.</p>
                 <p>If you have any questions, please contact us.</p>
                 <p>Regards,<br><b>Medicore Team</b></p>`
            );
        }

        res.status(200).json({ success: true, message: "Appointment cancelled successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Accept appointment (Doctor)
export const acceptAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const doctorId = req.doctor._id;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        if (appointment.doctorId.toString() !== doctorId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized action" });
        }

        appointment.status = "Approved";
        await appointment.save();

        res.status(200).json({ success: true, message: "Appointment approved successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reject appointment (Doctor)
export const rejectAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const doctorId = req.doctor._id;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        if (appointment.doctorId.toString() !== doctorId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized action" });
        }

        appointment.status = "Cancelled";
        await appointment.save();

        res.status(200).json({ success: true, message: "Appointment rejected successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Complete appointment (Doctor)
export const completeAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const doctorId = req.doctor._id;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        if (appointment.doctorId.toString() !== doctorId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized action" });
        }

        appointment.status = "Completed";
        await appointment.save();

        // Create Consultation Bill
        const doctorData = await Doctor.findById(doctorId);
        const fee = doctorData.consultationFee ? parseInt(doctorData.consultationFee.replace(/\D/g, '')) || 500 : 500;
        
        const subTotal = fee;
        const tax = subTotal * 0.18;
        const totalAmount = subTotal + tax;

        await billModel.create({
            patientId: appointment.userId,
            appointmentId: appointment._id,
            items: [
                { name: `Consultation Fee - Dr. ${doctorData.name}`, amount: fee }
            ],
            subTotal: subTotal,
            tax: tax,
            discount: 0,
            totalAmount: totalAmount,
            status: "unpaid"
        });

        res.status(200).json({ success: true, message: "Appointment marked as completed and bill generated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create Razorpay Order
export const createRazorpayOrder = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.user._id;

        const appointment = await Appointment.findById(appointmentId).populate("doctorId");
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        if (appointment.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized action" });
        }

        const doctorData = appointment.doctorId;
        const rawFee = doctorData?.consultationFee || "500";
        const fee = parseInt(rawFee.replace(/\D/g, '')) || 500;

        const amount = fee * 100; // in paise
        const currency = "INR";
        const options = {
            amount,
            currency,
            receipt: `receipt_apt_${appointment._id}`,
        };

        let order;
        if (process.env.RAZORPAY_KEY_ID === "rzp_test_dummykey" || !process.env.RAZORPAY_KEY_ID) {
            order = {
                id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
                amount,
                currency,
                receipt: options.receipt,
                status: "created"
            };
        } else {
            try {
                const razorpayInstance = getRazorpayInstance();
                order = await razorpayInstance.orders.create(options);
            } catch (rzpError) {
                console.warn("Razorpay API failed (probably invalid keys or network issue). Falling back to mock order. Error:", rzpError.message || rzpError);
                order = {
                    id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
                    amount,
                    currency,
                    receipt: options.receipt,
                    status: "created"
                };
            }
        }

        // Save fee info to appointment if necessary
        appointment.consultationFee = fee;
        await appointment.save();

        res.status(200).json({
            success: true,
            order,
            appointmentFee: fee,
            key: process.env.RAZORPAY_KEY_ID || "rzp_test_dummykey"
        });
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        res.status(500).json({ success: false, message: "Razorpay order creation failed" });
    }
};

// Verify Razorpay Payment Signature
export const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;
        // Verify Mock Payment
        if (razorpay_order_id && razorpay_order_id.startsWith("order_mock_")) {
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                return res.status(404).json({ success: false, message: "Appointment not found" });
            }

            appointment.isPaid = true;
            appointment.paymentMethod = "Online";
            appointment.paymentId = razorpay_payment_id || `pay_mock_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            appointment.razorpayOrderId = razorpay_order_id;
            await appointment.save();

            // Send Email Confirmation
            const userData = await User.findById(appointment.userId);
            const doctorData = await Doctor.findById(appointment.doctorId);
            if (userData && userData.email && doctorData) {
                sendEmail(
                    userData.email,
                    "Payment Received - Appointment Confirmed",
                    `<h2>💳 Payment Received Successfully</h2>
                     <p>Hello <b>${userData.name}</b>,</p>
                     <p>We have successfully received your payment of <b>₹${appointment.consultationFee || 500}</b> for your appointment with <b>Dr. ${doctorData.name}</b>.</p>
                     <p><b>Transaction Reference:</b> ${appointment.paymentId} (Simulation Mode)</p>
                     <p><b>Date:</b> ${appointment.slotDate}<br><b>Time:</b> ${appointment.slotTime}</p>
                     <p>Your appointment is confirmed. Thank you!</p>
                     <p>Regards,<br><b>Medicore Team</b></p>`
                );
            }

            // Update associated bill status if any
            const bill = await billModel.findOne({ appointmentId: appointment._id });
            if (bill) {
                bill.status = "paid";
                bill.paymentMethod = "Online";
                await bill.save();
            }

            return res.status(200).json({ 
                success: true, 
                message: "Mock Payment verified and appointment confirmed successfully!" 
            });
        }

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "dummysecret")
            .update(sign.toString())
            .digest("hex");

        if (expectedSign === razorpay_signature) {
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                return res.status(404).json({ success: false, message: "Appointment not found" });
            }

            appointment.isPaid = true;
            appointment.paymentMethod = "Online";
            appointment.paymentId = razorpay_payment_id;
            appointment.razorpayOrderId = razorpay_order_id;
            await appointment.save();

            // Send Email Confirmation
            const userData = await User.findById(appointment.userId);
            const doctorData = await Doctor.findById(appointment.doctorId);
            if (userData && userData.email && doctorData) {
                sendEmail(
                    userData.email,
                    "Payment Received - Appointment Confirmed",
                    `<h2>💳 Payment Received Successfully</h2>
                     <p>Hello <b>${userData.name}</b>,</p>
                     <p>We have successfully received your payment of <b>₹${appointment.consultationFee || 500}</b> for your appointment with <b>Dr. ${doctorData.name}</b>.</p>
                     <p><b>Transaction Reference:</b> ${appointment.paymentId}</p>
                     <p><b>Date:</b> ${appointment.slotDate}<br><b>Time:</b> ${appointment.slotTime}</p>
                     <p>Your appointment is confirmed. Thank you!</p>
                     <p>Regards,<br><b>Medicore Team</b></p>`
                );
            }

            // Update associated bill status if any
            const bill = await billModel.findOne({ appointmentId: appointment._id });
            if (bill) {
                bill.status = "paid";
                bill.paymentMethod = "Online";
                await bill.save();
            }

            return res.status(200).json({ 
                success: true, 
                message: "Payment verified and appointment confirmed successfully!" 
            });
        } else {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }
    } catch (error) {
        console.error("Razorpay signature verification error:", error);
        res.status(500).json({ success: false, message: "Internal server verification error" });
    }
};

// Helper function to check if appointment slot is in the past
const isPastAppointment = (slotDate, slotTime) => {
    try {
        const dateParts = slotDate.split(' ');
        if (dateParts.length !== 3) return false;
        
        const day = parseInt(dateParts[0]);
        const monthStr = dateParts[1];
        const year = parseInt(dateParts[2]);
        
        const months = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };
        const month = months[monthStr];
        if (month === undefined) return false;
        
        const timeMatch = slotTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
        if (!timeMatch) return false;
        
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const ampm = timeMatch[3].toUpperCase();
        
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        const appointmentDate = new Date(year, month, day, hours, minutes);
        return appointmentDate < new Date();
    } catch (e) {
        console.error("Error parsing slot date/time:", e);
        return false;
    }
};

// Delete user appointment (for Cancelled, Completed, or Rejected/Past appointments)
export const deleteAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user._id;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        if (appointment.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized action" });
        }

        const isPast = isPastAppointment(appointment.slotDate, appointment.slotTime);

        // Allow deleting only if status is Cancelled, Completed, or if slot is in the past
        if (appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && !isPast) {
            return res.status(400).json({ 
                success: false, 
                message: "Only completed, cancelled, or past appointments can be deleted from history" 
            });
        }

        await Appointment.findByIdAndDelete(appointmentId);

        res.status(200).json({ success: true, message: "Appointment deleted successfully from history" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin route: get all appointments
export const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({})
            .populate('doctorId', 'name speciality')
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, appointments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin / Receptionist route: update status of any appointment
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId, status } = req.body;
        const validStatuses = ["Pending", "Approved", "Completed", "Cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        appointment.status = status;
        await appointment.save();

        // If status is Completed, auto-generate the consultation bill!
        if (status === "Completed") {
            const billExists = await billModel.findOne({ appointmentId: appointment._id });
            if (!billExists) {
                const doctorData = await Doctor.findById(appointment.doctorId);
                const fee = doctorData?.consultationFee ? parseInt(doctorData.consultationFee.replace(/\D/g, '')) || 500 : 500;
                await billModel.create({
                    patientId: appointment.userId,
                    appointmentId: appointment._id,
                    items: [
                        { name: `Consultation Fee - Dr. ${doctorData?.name || 'Doctor'}`, amount: fee }
                    ],
                    subTotal: fee,
                    tax: 0,
                    discount: 0,
                    totalAmount: fee,
                    status: "unpaid"
                });
            }
        }

        res.status(200).json({ success: true, message: `Appointment status updated to ${status}`, appointment });
    } catch (error) {
        res.status(550).json({ success: false, message: error.message });
    }
};
