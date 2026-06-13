import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../modules/shared/db/models/user_schema.js';

dotenv.config();

const usersToCreate = [
    {
        fullName: 'Chemistry HSME B10 Student',
        email: 'chem_hsme_b10@yugaai.app',
        topic: 'NEET',
        password: 'password@123'
    },
    {
        fullName: 'Chemistry ASME B11 Student',
        email: 'chem_asme_b11@yugaai.app',
        topic: 'NEET',
        password: 'password@123'
    },
    {
        fullName: 'Chemistry ASME B12 Student',
        email: 'chem_asme_b12@yugaai.app',
        topic: 'NEET',
        password: 'password@123'
    },
    {
        fullName: 'Physics HSME B10 Student',
        email: 'phy_hsme_b10@yugaai.app',
        topic: 'NEET',
        password: 'password@123'
    },
    {
        fullName: 'Physics ASME B11 Student',
        email: 'phy_asme_b11@yugaai.app',
        topic: 'NEET',
        password: 'password@123'
    },
    {
        fullName: 'Physics ASME B12 Student',
        email: 'phy_asme_b12@yugaai.app',
        topic: 'NEET',
        password: 'password@123'
    },
    {
        fullName: 'Botany HSME B10 Student',
        email: 'bot_hsme_b10@yugaai.app',
        topic: 'NEET',
        password: 'password@123'
    },
    {
        fullName: 'Botany ASME B11 Student',
        email: 'bot_asme_b11@yugaai.app',
        topic: 'NEET',
        password: 'password@123'
    },
    {
        fullName: 'Botany ASME B12 Student',
        email: 'bot_asme_b12@yugaai.app',
        topic: 'NEET',
        password: 'password@123'
    },
    {
        fullName: 'Zoology HSME B10 Student',
        email: 'zoo_hsme_b10@yugaai.app',
        topic: 'NEET',
        password: 'password@123'
    },
    {
        fullName: 'Zoology ASME B11 Student',
        email: 'zoo_asme_b11@yugaai.app',
        topic: 'NEET',
        password: 'password@123'
    },
    {
        fullName: 'Zoology ASME B12 Student',
        email: 'zoo_asme_b12@yugaai.app',
        topic: 'NEET',
        password: 'password@123'
    }
];

const createUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        for (const userData of usersToCreate) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`User already exists: ${userData.email} - Skipping`);
                continue;
            }

            const user = new User({
                fullName: userData.fullName,
                email: userData.email,
                topic: userData.topic,
                emailVerified: true,
                password: userData.password // Will be hashed by pre-save hook
            });

            await user.save();
            console.log(`✅ Created user: ${userData.email} (${userData.topic})`);
        }

        console.log('\n✅ All users created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating users:', error);
        process.exit(1);
    }
};

createUsers();
