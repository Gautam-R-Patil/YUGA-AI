
import mongoose from 'mongoose';
import User from '../modules/shared/db/models/user_schema.js';
// Adjust path if needed, assuming run from backend root
import dotenv from 'dotenv';
dotenv.config();

const clearDailyQuiz = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // Clear dailyQuiz for ALL users or a specific one if we knew the ID. 
        // For dev, clearing all is fine or usually just the dev user.
        // Let's clear for all to be safe/sure for the user.
        const result = await User.updateMany({}, {
            $unset: { dailyQuiz: 1 }
        });

        console.log(`Cleared daily quiz for ${result.modifiedCount} users.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

clearDailyQuiz();
