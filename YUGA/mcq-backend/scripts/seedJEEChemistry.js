import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../modules/shared/db/models/course.js';

dotenv.config();

const JEE_CHEMISTRY_COURSE = {
    id: 'jee-chemistry-class-001',
    title: 'JEE Chemistry Class',
    description: 'Complete JEE Chemistry preparation across Physical, Organic, and Inorganic Chemistry.',
    image: '/images/thumbnails/chemistry.png',
    category: 'JEE Chemistry Class',
    duration: '60 mins',
    level: 'Advanced',
    color: 'bg-emerald-600',
    instructor: 'AI Tutor',
    rating: 4.8,
    students: 1100,
    tags: ['JEE', 'Chemistry', 'Preparation'],
    chapters: [
        // Physical
        { title: 'Some Basic Concepts of Chemistry' },
        { title: 'Atomic Structure' },
        { title: 'States of Matter' },
        { title: 'Thermodynamics' },
        { title: 'Chemical Equilibrium' },
        { title: 'Ionic Equilibrium' },
        { title: 'Redox Reactions' },
        { title: 'Solutions' },
        { title: 'Electrochemistry' },
        { title: 'Chemical Kinetics' },
        { title: 'Surface Chemistry' },
        // Inorganic
        { title: 'Periodic Table and Periodicity' },
        { title: 'Chemical Bonding' },
        { title: 'Hydrogen' },
        { title: 's-Block Elements' },
        { title: 'p-Block Elements' },
        { title: 'd- and f-Block Elements' },
        { title: 'Coordination Compounds' },
        { title: 'Metallurgy' },
        { title: 'Environmental Chemistry' },
        // Organic
        { title: 'Basic Organic Chemistry' },
        { title: 'Hydrocarbons' },
        { title: 'Haloalkanes and Haloarenes' },
        { title: 'Alcohols, Phenols and Ethers' },
        { title: 'Aldehydes, Ketones and Carboxylic Acids' },
        { title: 'Amines' },
        { title: 'Biomolecules' },
        { title: 'Polymers' },
        { title: 'Chemistry in Everyday Life' }
    ],
    lessons: [
        {
            id: 'jee-chemistry-intro',
            title: 'Introduction to JEE Chemistry',
            type: 'video',
            duration: '10 mins',
            completed: false
        }
    ]
};

async function seedJEEChemistry() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if course already exists
        const existing = await Course.findOne({ id: JEE_CHEMISTRY_COURSE.id });
        if (existing) {
            console.log('JEE Chemistry Class already exists. Updating...');
            await Course.updateOne({ id: JEE_CHEMISTRY_COURSE.id }, JEE_CHEMISTRY_COURSE);
        } else {
            console.log('Creating JEE Chemistry Class...');
            await Course.create(JEE_CHEMISTRY_COURSE);
        }

        console.log('JEE Chemistry Class seeded successfully');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding JEE Chemistry:', error);
        process.exit(1);
    }
}

seedJEEChemistry();
