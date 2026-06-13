import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./modules/shared/db/models/user_schema.js";

dotenv.config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        
        const users = await User.find().sort({ createdAt: -1 }).limit(10).select("email fullName emailVerified password createdAt");
        console.log("Last 10 users:");
        users.forEach(u => {
            console.log(`- ${u.email} (${u.fullName}): verified=${u.emailVerified}, hasPassword=${!!u.password}, createdAt=${u.createdAt}`);
        });
        
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkUsers();
