import reportModel from "../models/reportModel.js";
import userModel from "../models/userModel.js";
import billModel from "../models/billModel.js";
import { callGeminiAPI } from "../util/gemini.js";

// GET /api/reports
export const getReports = async (req, res) => {
  try {
    // If patient is requesting, filter by patientId
    const filter = {};
    if (req.user) {
      filter.patientId = req.user.id;
    }
    const reports = await reportModel.find(filter).populate("doctorId", "name speciality").populate("patientId", "name image email");
    res.json({ success: true, reports });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/lab/pending
export const getPendingTests = async (req, res) => {
  try {
    const pendingTests = await reportModel.find({ status: "pending" })
      .populate("doctorId", "name speciality")
      .populate("patientId", "name");
    res.json({ success: true, data: pendingTests });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/reports
export const addReport = async (req, res) => {
  try {
    const { patientId, doctorId, title, description, fileUrl } = req.body;
    if (!patientId || !title) {
      return res.json({ success: false, message: "Patient ID and title are required" });
    }
    const newReport = new reportModel({ patientId, doctorId, title, description, fileUrl });
    await newReport.save();
    res.json({ success: true, message: "Report generated successfully", report: newReport });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/lab/test
export const createTest = async (req, res) => {
  try {
    const { patientId, doctorId, title, description } = req.body;
    if (!patientId || !title) {
      return res.json({ success: false, message: "Patient ID and title are required" });
    }
    const newReport = new reportModel({ patientId, doctorId, title, description, status: "pending" });
    await newReport.save();
    res.json({ success: true, message: "Test created successfully", report: newReport });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary.js";

// Helper to generate dynamic PDF based on test type and data
const generateActualReportPDF = (report, resultSummary, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      const patient = report.patientId || {};
      const doctor = report.doctorId || {};

      // Calculate patient age
      let patientAge = "N/A";
      if (patient.age) {
        patientAge = patient.age + " Y";
      } else if (patient.dob) {
        const diff = Date.now() - new Date(patient.dob).getTime();
        const ageDate = new Date(diff);
        patientAge = Math.abs(ageDate.getUTCFullYear() - 1970) + " Y";
      }

      // --- Header ---
      doc.fillColor('#1E3A8A') // Deep Blue
         .fontSize(20)
         .text('MEDICORE CLINICAL LABORATORIES', { align: 'center', bold: true });
      
      doc.fillColor('#4B5563') // Gray
         .fontSize(9)
         .text('402, Royal Heights, Surat, Gujarat - 395007 | Email: lab@medicore.com | Phone: +91 76372 07947', { align: 'center' });

      doc.moveDown(0.5);
      
      // Draw horizontal line
      doc.strokeColor('#D1D5DB').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.5);

      // --- Patient details (ACTUAL DATA) ---
      const startY = doc.y;
      doc.fillColor('#1F2937').fontSize(9);
      
      // Column 1
      doc.text(`Patient Name: ${patient.name || 'Jane Doe'}`, 40, startY, { bold: true });
      doc.text(`Age / Gender: ${patientAge} / ${patient.gender || 'Female'}`, 40, startY + 13);
      doc.text(`Patient ID: ${patient._id ? patient._id.toString().substring(18).toUpperCase() : 'N/A'}`, 40, startY + 26);

      // Column 2
      doc.text(`Date: ${new Date(report.date || Date.now()).toLocaleDateString('en-IN')}`, 350, startY);
      doc.text(`Ref. Doctor: ${doctor.name || 'Dr. Self Refer'}`, 350, startY + 13);
      doc.text(`Sample Type: ${report.title.toLowerCase().includes('urine') ? 'Urine Sample' : 'Whole Blood / Serum'}`, 350, startY + 26);

      doc.moveDown(1.5);
      // Draw another line
      doc.strokeColor('#D1D5DB').moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.8);

      // --- Report Title ---
      doc.fillColor('#1E3A8A')
         .fontSize(12)
         .text(`${report.title.toUpperCase()} REPORT`, { align: 'center', underline: true });
      doc.moveDown(0.8);

      const titleLower = report.title.toLowerCase();

      // DYNAMIC CONTENT BASED ON TEST TYPE
      if (titleLower.includes('blood') || titleLower.includes('cbc') || titleLower.includes('lipid')) {
        // --- Blood/Haematology table ---
        const tableTop = doc.y;
        doc.fillColor('#475569').fontSize(9);
        doc.text('Test Parameter', 40, tableTop, { bold: true });
        doc.text('Observed Value', 200, tableTop, { bold: true });
        doc.text('Unit', 300, tableTop, { bold: true });
        doc.text('Reference Range', 370, tableTop, { bold: true });
        doc.text('Status', 490, tableTop, { bold: true });

        doc.moveDown(0.4);
        doc.strokeColor('#94A3B8').lineWidth(1.2).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.5);

        // Fill parameters with actual value if matching, else defaults
        const hgbVal = resultSummary.match(/hemoglobin\s*(\d+(\.\d+)?)/i)?.[1] || '14.2';
        const wbcVal = resultSummary.match(/wbc\s*(\d+(\.\d+)?)/i)?.[1] || '6.5';
        const cholesterolVal = resultSummary.match(/cholesterol\s*(\d+)/i)?.[1] || '245';
        const triglyceridesVal = resultSummary.match(/triglycerides\s*(\d+)/i)?.[1] || '185';

        const rows = [
          { name: 'Hemoglobin', val: hgbVal, unit: 'g/dL', ref: '12.0 - 16.0', status: (parseFloat(hgbVal) < 12.0) ? 'LOW' : (parseFloat(hgbVal) > 16.0) ? 'HIGH' : 'Normal', isAlert: (parseFloat(hgbVal) < 12.0 || parseFloat(hgbVal) > 16.0) },
          { name: 'Total WBC Count', val: wbcVal, unit: '10^3/uL', ref: '4.0 - 11.0', status: 'Normal', isAlert: false },
          { name: 'Platelet Count', val: '2.8', unit: '10^5/uL', ref: '1.5 - 4.5', status: 'Normal', isAlert: false },
          { name: 'Total Cholesterol', val: cholesterolVal, unit: 'mg/dL', ref: '< 200', status: (parseInt(cholesterolVal) >= 200) ? 'HIGH' : 'Normal', isAlert: (parseInt(cholesterolVal) >= 200) },
          { name: 'Triglycerides', val: triglyceridesVal, unit: 'mg/dL', ref: '< 150', status: (parseInt(triglyceridesVal) >= 150) ? 'HIGH' : 'Normal', isAlert: (parseInt(triglyceridesVal) >= 150) },
        ];

        rows.forEach((row) => {
          const y = doc.y;
          doc.fillColor('#1F2937').fontSize(9);
          
          doc.text(row.name, 40, y);
          doc.text(row.val, 200, y);
          doc.text(row.unit, 300, y);
          doc.text(row.ref, 370, y);
          
          if (row.isAlert) {
            doc.fillColor('#DC2626').text(row.status, 490, y, { bold: true });
          } else {
            doc.fillColor('#10B981').text(row.status, 490, y);
          }
          
          doc.moveDown(0.6);
          doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
          doc.moveDown(0.6);
        });

      } else if (titleLower.includes('urine')) {
        // --- Urine test table ---
        const tableTop = doc.y;
        doc.fillColor('#475569').fontSize(9);
        doc.text('Test Parameter', 40, tableTop, { bold: true });
        doc.text('Observed Value', 200, tableTop, { bold: true });
        doc.text('Reference / Norms', 370, tableTop, { bold: true });
        doc.text('Status', 490, tableTop, { bold: true });

        doc.moveDown(0.4);
        doc.strokeColor('#94A3B8').lineWidth(1.2).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.5);

        const rows = [
          { name: 'Color', val: 'Pale Yellow', ref: 'Pale Yellow', status: 'Normal', isAlert: false },
          { name: 'Appearance', val: 'Clear', ref: 'Clear', status: 'Normal', isAlert: false },
          { name: 'Reaction (pH)', val: '6.0', ref: '4.5 - 8.0', status: 'Normal', isAlert: false },
          { name: 'Specific Gravity', val: '1.015', ref: '1.005 - 1.030', status: 'Normal', isAlert: false },
          { name: 'Urine Glucose', val: 'Negative', ref: 'Negative', status: 'Normal', isAlert: false },
          { name: 'Urine Protein', val: 'Trace', ref: 'Negative', status: 'Normal', isAlert: false },
          { name: 'Pus Cells (Pus)', val: '1-2 /hpf', ref: '0-5 /hpf', status: 'Normal', isAlert: false }
        ];

        rows.forEach((row) => {
          const y = doc.y;
          doc.fillColor('#1F2937').fontSize(9);
          
          doc.text(row.name, 40, y);
          doc.text(row.val, 200, y);
          doc.text(row.ref, 370, y);
          
          if (row.isAlert) {
            doc.fillColor('#DC2626').text(row.status, 490, y, { bold: true });
          } else {
            doc.fillColor('#10B981').text(row.status, 490, y);
          }
          
          doc.moveDown(0.6);
          doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
          doc.moveDown(0.6);
        });

      } else {
        // --- X-Ray, MRI, CT Scan / Imaging template ---
        doc.fillColor('#1F2937').fontSize(10);
        doc.text('Procedure Performed:', 40, doc.y, { bold: true });
        doc.fillColor('#4B5563').text(`${report.title.toUpperCase()} Examination`, { indent: 10 });
        doc.moveDown(0.5);

        doc.fillColor('#1F2937').text('Clinical History / Indication:', { bold: true });
        doc.fillColor('#4B5563').text(report.description || 'Routine diagnostics checkup', { indent: 10 });
        doc.moveDown(1);

        doc.fillColor('#1E3A8A').text('RADIOLOGICAL FINDINGS:', { bold: true });
        doc.strokeColor('#D1D5DB').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.5);

        doc.fillColor('#1F2937').fontSize(9.5).text(resultSummary || 'No significant abnormalities detected in the examined areas.', { lineGap: 4 });
        doc.moveDown(2);
      }

      doc.moveDown(1);

      // --- Comments / Interpretations ---
      doc.fillColor('#1E3A8A').fontSize(10).text('Clinical Interpretation & Comments:', { bold: true });
      doc.fillColor('#4B5563').fontSize(8.5);
      if (resultSummary && !titleLower.includes('x-ray') && !titleLower.includes('mri') && !titleLower.includes('scan')) {
        doc.text(`Findings: ${resultSummary}`, { indent: 10 });
      } else {
        doc.text('1. Clinical correlation is recommended for definitive diagnosis.', { indent: 10 });
        doc.text('2. Please consult the referring doctor with this report for further management.', { indent: 10 });
      }

      doc.moveDown(2.5);

      // --- Signatures ---
      const sigY = doc.y;
      doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(40, sigY).lineTo(180, sigY).stroke();
      doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(415, sigY).lineTo(555, sigY).stroke();

      doc.moveDown(0.4);
      doc.fillColor('#1F2937').fontSize(8.5);
      doc.text('Technician Signature', 40, doc.y, { align: 'left' });
      doc.text('Dr. R. K. Mehta (MD, Pathology)', 415, sigY + 6, { align: 'left' });
      doc.text('Chief Pathologist', 415, sigY + 18, { align: 'left' });

      // --- Footer ---
      doc.fontSize(8).fillColor('#9CA3AF').text('*** End of Report ***', 40, 780, { align: 'center' });
      doc.text('Disclaimer: This is a generated actual report for demonstration purposes only.', 40, 792, { align: 'center' });

      doc.end();
      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

export const uploadReportResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { resultSummary } = req.body;

    const reportObj = await reportModel.findById(id)
      .populate("patientId")
      .populate("doctorId");

    if (!reportObj) {
      return res.json({ success: false, message: "Report test not found" });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.resolve("./uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const tempFileName = `report_${id}_${Date.now()}.pdf`;
    const tempFilePath = path.join(uploadsDir, tempFileName);

    await generateActualReportPDF(reportObj, resultSummary || "", tempFilePath);

    // Save local URL pointing to our statically served uploads folder
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${tempFileName}`;

    let aiSummary = "";
    if (resultSummary) {
      try {
        const prompt = `You are an expert medical AI assistant. Summarize the following medical lab report findings into simple, layman-friendly, easy-to-understand language for a patient without a medical background.

Rules:
1. Keep the summary very short and concise (max 2-3 short sentences).
2. Use extremely simple, clear language. Explain medical jargon in normal terms.
3. Highlight critical/abnormal values, high/low states, or key recommendations using markdown bold (e.g., **high cholesterol**, **low hemoglobin**, **triglycerides are elevated**, **consult your doctor**).
4. Do NOT provide a final medical diagnosis.

Findings: ${resultSummary}

Format the output precisely like this:
[Summary text here]

*Disclaimer: AI suggestions are for informational purposes only and are not a medical diagnosis. Consult a qualified doctor for diagnosis and treatment.*`;
        aiSummary = await callGeminiAPI(prompt);
      } catch (aiErr) {
        console.error("Failed to generate AI report summary:", aiErr);
        aiSummary = `Your report has been processed. Raw Findings: ${resultSummary}.\n\n*Disclaimer: AI suggestions are for informational purposes only and are not a medical diagnosis. Consult a qualified doctor for diagnosis and treatment.*`;
      }
    }

    const report = await reportModel.findByIdAndUpdate(
      id,
      { fileUrl, resultSummary: resultSummary || "", aiSummary, status: "completed" },
      { new: true }
    );

    // Update patient's bill if it exists for this appointment
    if (report.appointmentId) {
      const bill = await billModel.findOne({ appointmentId: report.appointmentId });
      if (bill) {
        const itemExists = bill.items.some(item => item.name.includes(`Lab Test: ${report.title}`));
        if (!itemExists) {
          const testCost = report.cost || 300;
          bill.items.push({ name: `Lab Test: ${report.title}`, amount: testCost });
          bill.subTotal = bill.items.reduce((sum, item) => sum + item.amount, 0);
          bill.tax = bill.subTotal * 0.18;
          bill.totalAmount = bill.subTotal + bill.tax;
          await bill.save();
        }
      }
    }

    res.json({ success: true, message: "Report generated and uploaded successfully", report });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// PATCH /api/reports/test/:id/status
export const updateTestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g. "sample_collected", "processing"

    const validStatuses = ["pending", "sample_collected", "processing", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const report = await reportModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(455).json({ success: false, message: "Report not found" });
    }

    res.json({ success: true, message: `Status updated to ${status}`, report });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
