import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../modules/shared/db/models/course.js';

dotenv.config();

const JEE_MATHEMATICS_COURSE = {
    id: 'jee-mathematics-class-001',
    title: 'JEE Mathematics Class',
    description: 'Deep dive into Calculus, Algebra, and Geometry with AI-powered interactive sessions.',
    image: '/images/thumbnails/maths.png',
    category: 'JEE Mathematics Class',
    duration: '60 mins',
    level: 'Advanced',
    color: 'bg-orange-600',
    instructor: 'AI Tutor',
    rating: 4.8,
    students: 1050,
    tags: ['JEE', 'Mathematics', 'Preparation'],
    chapters: [
        // Class 11
        { title: 'Sets, Relations and Functions' },
        { title: 'Complex Numbers and Quadratic Equations' },
        { title: 'Linear Inequalities' },
        { title: 'Permutations and Combinations' },
        { title: 'Binomial Theorem' },
        { title: 'Sequences and Series' },
        { title: 'Straight Lines' },
        { title: 'Conic Sections' },
        { title: 'Trigonometry' },
        { title: 'Limits and Derivatives' },
        { title: 'Mathematical Reasoning' },
        { title: 'Statistics' },
        // Class 12
        { title: 'Matrices and Determinants' },
        { title: 'Continuity and Differentiability' },
        { title: 'Applications of Derivatives' },
        { title: 'Integrals' },
        { title: 'Applications of Integrals' },
        { title: 'Differential Equations' },
        { title: 'Vector Algebra' },
        { title: 'Three-Dimensional Geometry' },
        { title: 'Probability' }
    ],
    lessons: [
        {
            id: 'jee-maths-intro',
            title: 'Introduction to JEE Mathematics',
            type: 'video',
            duration: '10 mins',
            completed: false
        }
    ]
};

async function seedJEEMathematics() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if course already exists
        const existing = await Course.findOne({ id: JEE_MATHEMATICS_COURSE.id });
        if (existing) {
            console.log('JEE Mathematics Class already exists. Updating...');
            await Course.updateOne({ id: JEE_MATHEMATICS_COURSE.id }, JEE_MATHEMATICS_COURSE);
        } else {
            console.log('Creating JEE Mathematics Class...');
            await Course.create(JEE_MATHEMATICS_COURSE);
        }

        console.log('JEE Mathematics Class seeded successfully');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding JEE Mathematics:', error);
        process.exit(1);
    }
}

seedJEEMathematics();
