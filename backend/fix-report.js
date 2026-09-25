import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
dotenv.config();

dns.setServers(["96.45.45.45", "96.45.46.46", "4.2.2.2", "1.1.1.1", "8.8.8.8"]);

const fix = async () => {
  try {
    await mongoose.connect(process.env.DB_URL || 'mongodb+srv://priyalraiyani23_db_user:6355844803@cluster0.hh9frfx.mongodb.net/learn_db');
    const Report = (await import('./src/models/reportModel.js')).default;
    
    const res = await Report.updateOne({}, { 
      $set: { 
        status: 'completed', 
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
      } 
    });
    console.log('Updated:', res);
    process.exit();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
};

fix();
