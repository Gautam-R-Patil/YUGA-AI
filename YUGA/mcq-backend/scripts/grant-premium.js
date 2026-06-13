import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../modules/shared/db/models/user_schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from parent directory
dotenv.config({ path: path.join(__dirname, "../.env") });

const emailsToGrant = [
    "sourav.r@yugaai.app",
    "arpita.m@yugaai.app",
    "ceo@yugaai.app"
];

async function grantPremium() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI not found in environment variables");
        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ Connected to MongoDB");

        for (const email of emailsToGrant) {
            console.log(`Processing user: ${email}...`);
            const user = await User.findOne({ email });

            if (!user) {
                console.log(`⚠ User ${email} not found - skipping`);
                continue;
            }

            user.membership = {
                plan: "premium",
                status: "active",
                validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 10)) // 10 years validity
            };

            await user.save();
            console.log(`✅ Granted PREMIUM membership to user: ${email}`);
        }

        console.log("\n✅ Done!");

    } catch (error) {
        console.error("❌ Error granting premium membership:", error);
    } finally {
        await mongoose.connection.close();
        console.log("\n✓ Database connection closed");
        process.exit(0);
    }
}

grantPremium();
