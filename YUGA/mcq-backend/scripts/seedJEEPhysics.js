import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../modules/shared/db/models/course.js';

dotenv.config();

const JEE_PHYSICS_COURSE = {
    id: 'jee-physics-class-001',
    title: 'JEE Physics Class',
    description: 'Master JEE Physics with concept-driven AI lessons and advanced problem-solving techniques.',
    image: '/images/thumbnails/physics.png',
    category: 'JEE Physics Class',
    duration: '45 mins',
    level: 'Advanced',
    color: 'bg-indigo-600',
    instructor: 'AI Tutor',
    rating: 4.8,
    students: 1200,
    tags: ['JEE', 'Physics', 'Preparation'],
    chapters: [
        { title: 'Units and Measurements' },
        { title: 'Kinematics' },
        { title: 'Laws of Motion' },
        { title: 'Work, Energy and Power' },
        { title: 'Rotational Motion' },
        { title: 'Gravitation' },
        { title: 'Properties of Solids and Liquids' },
        { title: 'Thermodynamics' },
        { title: 'Kinetic Theory of Gases' },
        { title: 'Oscillations and Waves' },
        { title: 'Electrostatics' },
        { title: 'Current Electricity' },
        { title: 'Magnetic Effects of Current and Magnetism' },
        { title: 'Electromagnetic Induction and Alternating Current' },
        { title: 'Electromagnetic Waves' },
        { title: 'Optics' },
        { title: 'Dual Nature of Matter and Radiation' },
        { title: 'Atoms and Nuclei' },
        { title: 'Electronic Devices' }
    ],
    lessons: [
        {
            id: 'jee-physics-intro',
            title: 'Introduction to JEE Physics',
            type: 'video',
            duration: '10 mins',
            completed: false
        }
    ]
};

async function seedJEEPhysics() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if course already exists
        const existing = await Course.findOne({ id: JEE_PHYSICS_COURSE.id });
        if (existing) {
            console.log('JEE Physics Class already exists. Updating...');
            await Course.updateOne({ id: JEE_PHYSICS_COURSE.id }, JEE_PHYSICS_COURSE);
        } else {
            console.log('Creating JEE Physics Class...');
            await Course.create(JEE_PHYSICS_COURSE);
        }

        console.log('JEE Physics Class seeded successfully');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding JEE Physics:', error);
        process.exit(1);
    }
}

seedJEEPhysics();
