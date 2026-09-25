import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  items: [
    {
      name: { type: String, required: true },
      amount: { type: Number, required: true }
    }
  ],
  subTotal: { type: Number, required: true, default: 0 },
  tax: { type: Number, required: true, default: 0 }, // GST
  discount: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
  paymentMethod: { type: String, enum: ["online", "cash", ""] },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const billModel = mongoose.models.bill || mongoose.model("bill", billSchema);
export default billModel;
