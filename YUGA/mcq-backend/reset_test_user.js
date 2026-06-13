import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./modules/shared/db/models/user_schema.js";

dotenv.config();

async function reset() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const email = "student@test.com";
        const password = "password123";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.findOneAndUpdate(
            { email },
            { 
                password: hashedPassword,
                emailVerified: true 
            },
            { new: true }
        );

        if (user) {
            console.log(`Password reset for ${email} to 'password123'`);
        } else {
            console.log(`User ${email} not found`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

reset();
