import mongoose from "mongoose";


const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    speciality: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }, 
    images: [
        {
            url: {
                type: String,
                required: true,
            }, 
            public_id:{
                type: String,
                default: "",
            }
        }
    ],
    qualification: {
        type: String,
        default: "MBBS"
    },
    about: {
        type: String,
        default: ""
    },
    consultationFee: {
        type: String,
        default: "500"
    },
    availability: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    },
    
    department: {
        type: String,
        default: "General"
    },
    dob: {
        type: Date
    },
    availableDays: {
        type: [String],
        default: []
    },
    availableTimeSlots: {
        type: [String],
        default: []
    },
    doctorId: {
        type: String,
        unique: true
    },
    unavailableSlots: [
        {
            date: { type: String, required: true },   // Format: "YYYY-MM-DD"
            times: { type: [String], default: [] }    // e.g. ["10:00 AM", "10:30 AM"]
        }
    ]
}, { timestamps: true });

doctorSchema.pre("save", function() {
    if (!this.doctorId) {
        // Simple auto generation: DOC- + timestamp or random
        this.doctorId = "DOC-" + Math.floor(100000 + Math.random() * 900000);
    }
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
