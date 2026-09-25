import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const reportSchema = new mongoose.Schema({}, { strict: false });
const Report = mongoose.models.report || mongoose.model("report", reportSchema);

async function dump() {
  await mongoose.connect(process.env.DB_URL);
  const allReports = await Report.find({});
  console.log("ALL REPORTS:", JSON.stringify(allReports, null, 2));
  process.exit(0);
}
dump();
