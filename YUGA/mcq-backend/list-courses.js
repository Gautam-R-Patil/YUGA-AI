import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './modules/shared/db/models/course.js';

dotenv.config();

async function listCourses() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        const course = await Course.findOne({ category: 'NEET Physics Class' });
        console.log('NEET Physics Class details:');
        console.log(JSON.stringify(course, null, 2));
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

listCourses();
