import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../modules/shared/db/models/user_schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const newEmails = [
    "chem_hsme_a10@yugaai.app", "chem_asme_a11@yugaai.app", "chem_asme_a12@yugaai.app",
    "phy_hsme_a10@yugaai.app", "phy_asme_a11@yugaai.app", "phy_asme_a12@yugaai.app",
    "bot_hsme_a10@yugaai.app", "bot_asme_a11@yugaai.app", "bot_asme_a12@yugaai.app",
    "zoo_hsme_a10@yugaai.app", "zoo_asme_a11@yugaai.app", "zoo_asme_a12@yugaai.app",
    "chem_hsme_b10@yugaai.app", "chem_asme_b11@yugaai.app", "chem_asme_b12@yugaai.app",
    "phy_hsme_b10@yugaai.app", "phy_asme_b11@yugaai.app", "phy_asme_b12@yugaai.app",
    "bot_hsme_b10@yugaai.app", "bot_asme_b11@yugaai.app", "bot_asme_b12@yugaai.app",
    "zoo_hsme_b10@yugaai.app", "zoo_asme_b11@yugaai.app", "zoo_asme_b12@yugaai.app"
];

const updateMembership = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI not found");
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');

        const result = await User.updateMany(
            { email: { $in: newEmails } },
            {
                $set: {
                    'membership.plan': 'premium',
                    'membership.status': 'active',
                    'membership.validUntil': new Date(new Date().setFullYear(new Date().getFullYear() + 10))
                }
            }
        );
        console.log(`Updated ${result.modifiedCount} users to premium.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateMembership();
