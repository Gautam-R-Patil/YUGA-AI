import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../modules/shared/db/models/user_schema.js';

dotenv.config();

const usersToCreate = [
    {
        fullName: 'NEET Student',
        email: 'neet@test.com',
        topic: 'NEET',
        password: 'password123'
    },
    {
        fullName: 'JEE Student',
        email: 'jee@test.com',
        topic: 'JEE',
        password: 'password123'
    },
    {
        fullName: 'Both Student',
        email: 'both@test.com',
        topic: 'Both',
        password: 'password123'
    }
];

const createUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        for (const userData of usersToCreate) {
            // Cleanup existing
            await User.deleteOne({ email: userData.email });

            const user = new User({
                fullName: userData.fullName,
                email: userData.email,
                topic: userData.topic,
                emailVerified: true,
                password: userData.password // Will be hashed by pre-save
            });

            await user.save();
            console.log(`Created user: ${userData.email} (${userData.topic})`);
        }

        console.log('All users created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating users:', error);
        process.exit(1);
    }
};

createUsers();
