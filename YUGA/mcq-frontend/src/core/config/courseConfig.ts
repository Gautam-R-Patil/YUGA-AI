export type CourseType = 'neet' | 'jee' | 'both';

export interface CourseConfig {
    id: CourseType;
    label: string;
    name: string;
    searchPlaceholder: string;
    coursePrefix: string;
    subjects: string[];
    colors: Record<string, string>;
    thumbnails: Record<string, string>;
    descriptions: Record<string, string>;
    lockEmoji?: string;
}

export const NEET_CONFIG: CourseConfig = {
    id: 'neet',
    label: 'NEET',
    name: 'NEET Exam Prep',
    searchPlaceholder: 'Search NEET courses, subjects...',
    coursePrefix: 'NEET',
    subjects: ['Physics', 'Chemistry', 'Biology'],
    colors: {
        'NEET AI Examiner': 'bg-teal-500',
        'NEET Physics MCQs': 'bg-pink-500',
        'NEET Physics Class': 'bg-purple-600',
        'NEET Chemistry Class': 'bg-green-600',
        'NEET Biology Class': 'bg-red-600',
        'NEET Chemistry MCQs': 'bg-orange-500',
        'NEET Biology MCQs': 'bg-lime-500',
        'Your Scheduled Classes': 'bg-purple-600',
    },
    thumbnails: {
        'NEET Physics Class': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80',
        'NEET Chemistry Class': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=800&q=80',
        'NEET Biology Class': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80',
        'NEET Physics MCQs': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80',
        'NEET Chemistry MCQs': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=800&q=80',
        'NEET Biology MCQs': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80',
        'NEET AI Examiner': 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80', // Futuristic DNA/Medical Abstract
        'Your Scheduled Classes': 'https://images.unsplash.com/photo-1633526543814-9718c8922b7a?auto=format&fit=crop&w=800&q=80', // 3D Abstract Calendar
    },
    descriptions: {
        'NEET Physics Class': "Master Physics concepts with AI-guided lessons, interactive simulations, and real-world problem solving.",
        'NEET Chemistry Class': "Comprehensive Chemistry coverage including Organic, Inorganic, and Physical Chemistry with detailed explanations.",
        'NEET Biology Class': "In-depth Biology lessons covering Botany and Zoology with high-quality diagrams and retention aids.",
        'NEET AI Examiner': "Simulate the real exam environment with our advanced AI Examiner. Adaptive difficulty and detailed analysis.",
        'NEET Physics MCQs': "Sharpen your Physics problem-solving skills with a vast bank of targeted MCQs and instant solution tracking.",
        'NEET Chemistry MCQs': "Practice high-yield Chemistry questions curated to boost your speed and accuracy for the NEET exam.",
        'NEET Biology MCQs': "Test your Biology knowledge with topic-wise MCQs designed to reinforce key concepts and improve recall.",
        'Your Scheduled Classes': "Your daily AI-scheduled classes based on your Yuga Timer study plan. Stay on track!"
    }
};

export const JEE_CONFIG: CourseConfig = {
    id: 'jee',
    label: 'JEE',
    name: 'JEE Mains & Advanced',
    searchPlaceholder: 'Search JEE courses, subjects...',
    coursePrefix: 'JEE',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    colors: {
        'JEE AI Examiner': 'bg-indigo-500',
        'JEE Physics MCQs': 'bg-pink-500',
        'JEE Physics Class': 'bg-indigo-600',
        'JEE Chemistry Class': 'bg-emerald-600',
        'JEE Mathematics Class': 'bg-orange-600',
        'JEE Chemistry MCQs': 'bg-orange-500',
        'JEE Mathematics MCQs': 'bg-blue-500',
        'Your Scheduled Classes': 'bg-indigo-600',
    },
    thumbnails: {
        'JEE Physics Class': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80',
        'JEE Chemistry Class': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=800&q=80',
        'JEE Mathematics Class': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
        'JEE Physics MCQs': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80',
        'JEE Chemistry MCQs': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=800&q=80',
        'JEE Mathematics MCQs': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
        'JEE AI Examiner': 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80', // Futuristic DNA/Medical Abstract
        'Your Scheduled Classes': 'https://images.unsplash.com/photo-1633526543814-9718c8922b7a?auto=format&fit=crop&w=800&q=80', // 3D Abstract Calendar
    },
    descriptions: {
        'JEE Physics Class': "Master JEE Physics with concept-driven AI lessons and advanced problem-solving techniques.",
        'JEE Chemistry Class': "Complete JEE Chemistry preparation across Physical, Organic, and Inorganic Chemistry.",
        'JEE Mathematics Class': "Deep dive into Calculus, Algebra, and Geometry with AI-powered interactive sessions.",
        'JEE AI Examiner': "Professional JEE Mock Test environment with AI analysis and All India Ranking.",
        'JEE Physics MCQs': "Intensive Physics practice with previous year questions and AI-guided problem solving.",
        'JEE Chemistry MCQs': "Targeted JEE Chemistry MCQs to enhance speed and accuracy in problematic topics.",
        'JEE Mathematics MCQs': "Master complex Mathematical problems with our extensive JEE MCQ bank and AI solutions.",
        'Your Scheduled Classes': "Personalized JEE study schedule tailored by your Yuga Timer settings."
    }
};

export const BOTH_CONFIG: CourseConfig = {
    id: 'both',
    label: 'NEET & JEE',
    name: 'Integrated Preparation',
    searchPlaceholder: 'Search all courses...',
    coursePrefix: '', // Empty prefix to allow both
    subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics'],
    colors: {
        ...NEET_CONFIG.colors,
        ...JEE_CONFIG.colors,
        'Your Scheduled Classes': 'bg-purple-600',
    },
    thumbnails: {
        ...NEET_CONFIG.thumbnails,
        ...JEE_CONFIG.thumbnails,
    },
    descriptions: {
        ...NEET_CONFIG.descriptions,
        ...JEE_CONFIG.descriptions,
    }
};

export const COURSE_CONFIGS: Record<CourseType, CourseConfig> = {
    neet: NEET_CONFIG,
    jee: JEE_CONFIG,
    both: BOTH_CONFIG,
};
