import mongoose from "mongoose";

const connect_DB = async () => {
    try {
        const db_URI = process.env.DB_URL;

        if (!db_URI) {
            throw new Error("Database connection string is not defined.");
        }

        await mongoose.connect(db_URI);
        console.log("Connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

export default connect_DB;