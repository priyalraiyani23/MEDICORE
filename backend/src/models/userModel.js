import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
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
        required: false
    },
    phone: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    dob: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    age: {
        type: Number,
        default: null
    },
    bloodGroup: {
        type: String,
        default: ""
    },
    medicalHistory: {
        type: [String],
        default: []
    },
    allergies: {
        type: [String],
        default: []
    },
    patientId: {
        type: String,
        unique: true
    },
    height: {
        type: String,
        default: ""
    },
    weight: {
        type: String,
        default: ""
    },
    emergencyContact: {
        type: String,
        default: ""
    },
    currentMedications: {
        type: [String],
        default: []
    }
}, { timestamps: true });

userSchema.pre("save", function() {
    if (!this.patientId) {
        this.patientId = "PAT-" + Math.floor(100000 + Math.random() * 900000);
    }
});

const User = mongoose.model("User", userSchema);

export default User;
