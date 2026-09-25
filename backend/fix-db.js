import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
dotenv.config();

dns.setServers(["96.45.45.45", "96.45.46.46", "4.2.2.2", "1.1.1.1", "8.8.8.8"]);

const fix = async () => {
  try {
    await mongoose.connect(process.env.DB_URL || 'mongodb+srv://priyalraiyani23_db_user:6355844803@cluster0.hh9frfx.mongodb.net/learn_db');
    const Doctor = (await import('./src/models/doctorModel.js')).default;
    const Prescription = (await import('./src/models/prescriptionModel.js')).default;
    
    const doc = await Doctor.findOne();
    if (doc) {
      // get all doctor ids
      const doctorIds = await Doctor.find().distinct('_id');
      const res = await Prescription.updateMany(
        { doctorId: { $nin: doctorIds } },
        { $set: { doctorId: doc._id } }
      );
      console.log('Updated prescriptions:', res);
    } else {
      console.log('No doctors found');
    }
    process.exit();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
};

fix();
