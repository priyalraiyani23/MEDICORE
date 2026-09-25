import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
dotenv.config();

dns.setServers(["96.45.45.45", "96.45.46.46", "4.2.2.2", "1.1.1.1", "8.8.8.8"]);

const reportSchema = new mongoose.Schema({}, { strict: false });
const Report = mongoose.models.report || mongoose.model("report", reportSchema);

async function dump() {
  await mongoose.connect(process.env.DB_URL);
  const allReports = await Report.find({});
  console.log("ALL REPORTS:", JSON.stringify(allReports, null, 2));
  process.exit(0);
}
dump();
