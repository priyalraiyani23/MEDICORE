import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String }, // Link to PDF or image
  resultSummary: { type: String, default: "" }, // Raw text findings for AI summary
  aiSummary: { type: String, default: "" }, // Layman-friendly explanation by AI
  status: { type: String, enum: ["pending", "sample_collected", "processing", "completed"], default: "pending" },
  cost: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const reportModel = mongoose.models.report || mongoose.model("report", reportSchema);
export default reportModel;
