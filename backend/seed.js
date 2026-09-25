import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import Doctor from './src/models/doctorModel.js';
import Staff from './src/models/staffModel.js';
import Medicine from './src/models/medicineModel.js';
import { mockDoctors } from '../frontend/src/data/doctors.js';

import dns from 'node:dns';

dns.setServers(["96.45.45.45", "96.45.46.46", "4.2.2.2", "1.1.1.1", "8.8.8.8"]);

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to DB for seeding...");

        // Clear existing doctors to avoid duplicates
        await Doctor.deleteMany({});
        console.log("Cleared existing doctors.");

        // Clear existing staff members
        await Staff.deleteMany({});
        console.log("Cleared existing staff members.");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("doctor123", salt);

        const doctorsToInsert = mockDoctors.map((doc, index) => {
            return {
                name: doc.name,
                email: `doctor${index + 1}@medicore.com`,
                password: hashedPassword,
                gender: index % 2 === 0 ? "Female" : "Male", // rough approximation based on names
                experience: doc.experience,
                speciality: doc.speciality,
                phone: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                address: "402, Royal Heights, Surat",
                images: [{ url: doc.image, public_id: `mock_img_${index}` }],
                doctorId: `DOC-${100000 + index}`
            };
        });

        await Doctor.insertMany(doctorsToInsert);
        console.log("Seeded", doctorsToInsert.length, "doctors successfully!");

        // Seed staff
        const receptionistPass = await bcrypt.hash("receptionist123", salt);
        const pharmacistPass = await bcrypt.hash("pharmacist123", salt);
        const labPass = await bcrypt.hash("lab123", salt);

        const staffToInsert = [
            {
                name: "Default Receptionist",
                email: "receptionist@medicore.com",
                password: receptionistPass,
                role: "receptionist",
                phone: "+91 9988776655",
                address: "Medicore Reception Desk, Wing A, Surat",
                status: "Active"
            },
            {
                name: "Default Pharmacist",
                email: "pharmacist@medicore.com",
                password: pharmacistPass,
                role: "pharmacist",
                phone: "+91 8877665544",
                address: "Medicore Pharmacy Store, Ground Floor, Surat",
                status: "Active"
            },
            {
                name: "Default Laboratory Staff",
                email: "lab@medicore.com",
                password: labPass,
                role: "laboratory",
                phone: "+91 7766554433",
                address: "Medicore Diagnostics Lab, B-Wing, Surat",
                status: "Active"
            }
        ];

        await Staff.insertMany(staffToInsert);
        console.log("Seeded", staffToInsert.length, "staff members successfully!");

        // Seed standard medicines
        await Medicine.deleteMany({});
        const medicinesToInsert = [
            { name: "Paracetamol", category: "Tablet", price: 10, stock: 100, manufacturer: "PharmaCorp", expiryDate: new Date("2028-12-31") },
            { name: "Amoxicillin", category: "Tablet", price: 50, stock: 100, manufacturer: "BioLabs", expiryDate: new Date("2028-12-31") },
            { name: "Ibuprofen", category: "Tablet", price: 15, stock: 100, manufacturer: "MedLife", expiryDate: new Date("2028-12-31") },
            { name: "Cough Syrup", category: "Syrup", price: 80, stock: 50, manufacturer: "NatureCare", expiryDate: new Date("2028-12-31") },
            { name: "Cetirizine", category: "Tablet", price: 12, stock: 100, manufacturer: "AllerStop", expiryDate: new Date("2028-12-31") }
        ];
        await Medicine.insertMany(medicinesToInsert);
        console.log("Seeded", medicinesToInsert.length, "medicines successfully!");

        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding DB:", error);
        mongoose.connection.close();
    }
};

seedDB();
