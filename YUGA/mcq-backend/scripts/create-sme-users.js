import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../modules/shared/db/models/user_schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from parent directory
dotenv.config({ path: path.join(__dirname, "../.env") });

const usersToCreate = [
    { fullName: 'Chem SME 1', email: 'chem_sme1@yugaai.app', topic: 'Both' },
    { fullName: 'Chem SME 2', email: 'chem_sme2@yugaai.app', topic: 'Both' },
    { fullName: 'Chem SME 3', email: 'chem_sme3@yugaai.app', topic: 'Both' },
    { fullName: 'Phy SME 1', email: 'phy_sme1@yugaai.app', topic: 'Both' },
    { fullName: 'Phy SME 2', email: 'phy_sme2@yugaai.app', topic: 'Both' },
    { fullName: 'Phy SME 3', email: 'phy_sme3@yugaai.app', topic: 'Both' },
    { fullName: 'Bio SME', email: 'bio_sme@yugaai.app', topic: 'Both' },
    { fullName: 'Bot SME', email: 'bot_sme@yugaai.app', topic: 'Both' },
    { fullName: 'Zoo SME', email: 'zoo_sme@yugaai.app', topic: 'Both' }
];

const password = 'password123';

const createSMEUsers = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI not found in environment variables");
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');

        for (const userData of usersToCreate) {
            // Delete existing user if any
            await User.deleteOne({ email: userData.email });

            const user = new User({
                fullName: userData.fullName,
                email: userData.email,
                topic: userData.topic,
                emailVerified: true,
                password: password,
                membership: {
                    plan: "premium",
                    status: "active",
                    validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 10)) // 10 years validity
                }
            });

            await user.save();
            console.log(`Created SME user with PRO access: ${userData.email} (${userData.topic})`);
        }

        console.log('\n✅ All SME users created successfully with PRO access!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating SME users:', error);
        process.exit(1);
    }
};

createSMEUsers();
