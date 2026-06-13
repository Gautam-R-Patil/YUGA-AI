import { Course, QuizQuestion, UserProgress, Lesson } from "../types";

export const mockLessons: Lesson[] = [
  {
    id: '1',
    title: 'Introduction to the Topic',
    content: 'This lesson introduces the fundamental concepts and provides a foundation for understanding the subject matter.',
    type: 'video',
    duration: '15 min',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/rU0T7l6QX4w',
    transcript: 'Welcome to this lesson. In this session, we will explore the fundamentals...',
    resources: ['Study Notes PDF', 'Practice Exercises'],
    dateAdded: '2 weeks ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    images: [
      { url: 'https://www.mathsisfun.com/algebra/images/quadratic-equation.svg', alt: 'Algebra formula 1' },
      { url: 'https://www.mathsisfun.com/algebra/images/quadratic-graph.svg' }
    ]
  },
  {
    id: '2',
    title: 'Core Concepts',
    content: 'Deep dive into the core concepts and principles that form the backbone of this subject.',
    type: 'interactive',
    duration: '20 min',
    completed: false,
    resources: ['Interactive Quiz', 'Concept Map'],
    dateAdded: '2 weeks ago',
    videoUrl: 'https://www.youtube.com/embed/Jsiy4TxgIME',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80',
    images: [
      { url: 'https://www.mathsisfun.com/algebra/images/trigonometry-triangle.svg', alt: 'Algebra formula 1' },
      { url: 'https://www.mathsisfun.com/algebra/images/trigonometry-triangle.svg' }
    ]
  },
  {
    id: '3',
    title: 'Practical Applications',
    content: 'Learn how to apply the concepts in real-world scenarios and problem-solving situations.',
    type: 'video',
    duration: '25 min',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/g78utcLQrJ4',
    dateAdded: '2 weeks ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80',
    images: [
      { url: 'https://www.sciencefacts.net/wp-content/uploads/2019/12/Photosynthesis-Process.jpg', alt: 'Algebra formula 1' },
      { url: 'https://cdn1.byjus.com/wp-content/uploads/2018/11/biology/2016/01/26093457/Photosynthesis-1.png' }
    ],
    transcript: 'Now let\'s see how these concepts apply in practice...'
  }
];

/**
 * @deprecated Use backend API to fetch courses. mockCourses is now empty.
 */
export const mockCourses: Course[] = [];


/**
 * Enhanced quiz questions with NEET-specific questions
 * Each question includes subject categorization and detailed explanations
 */
export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'What is the value of √2 approximately?',
    options: [
      '1.414',
      '1.732',
      '2.236',
      '3.142'
    ],
    correctAnswer: 0,
    explanation: "**Core Concept:**\nRational and irrational numbers in mathematics.\n\n**Why this answer:**\nThe square root of 2 is an irrational number with a non-terminating decimal expansion that begins with 1.414.\n\n**Common Mistakes:**\nConfusing it with √3 (1.732) or √5 (2.236).",
    difficulty: 'easy',
    subject: 'Mathematics'
  },
  {
    id: '2',
    question: 'Which of the following is the correct formula for the area of a circle?',
    options: [
      '2πr',
      'πr²',
      'πd',
      '4πr²'
    ],
    correctAnswer: 1,
    explanation: "**Core Concept:**\nGeometric formulas for 2D circular shapes.\n\n**Why this answer:**\nThe area is defined as the space enclosed by a circle, calculated using the square of the radius (r) multiplied by π.\n\n**Common Mistakes:**\nUsing the circumference formula (2πr) or the area of a sphere formula (4πr²).",
    difficulty: 'easy',
    subject: 'Mathematics'
  },
  {
    id: '3',
    question: 'What is the chemical formula for water?',
    options: [
      'H₂O',
      'CO₂',
      'NaCl',
      'CaCO₃'
    ],
    correctAnswer: 0,
    explanation: "**Core Concept:**\nChemical composition of common compound substances.\n\n**Why this answer:**\nWater consists of two hydrogen atoms and one oxygen atom covalently bonded.\n\n**Common Mistakes:**\nConfusing it with Carbon Dioxide (CO₂) or Salt (NaCl).",
    difficulty: 'easy',
    subject: 'Science'
  },
  {
    id: '4',
    question: 'Who wrote the poem "Fire and Ice"?',
    options: [
      'Robert Frost',
      'William Shakespeare',
      'John Keats',
      'William Wordsworth'
    ],
    correctAnswer: 0,
    explanation: "**Core Concept:**\nRecognition of classic poetic works and their authors.\n\n**Why this answer:**\nRobert Frost authored this poem as a meditation on the two possible ways the world might end.\n\n**Common Mistakes:**\nAttributing it to other romantic poets like Keats or Wordsworth.",
    difficulty: 'medium',
    subject: 'English'
  },
  {
    id: '5',
    question: 'In which year did the French Revolution begin?',
    options: [
      '1789',
      '1799',
      '1804',
      '1815'
    ],
    correctAnswer: 0,
    explanation: "**Core Concept:**\nChronology of major historical political transformations.\n\n**Why this answer:**\nThe revolution officially began in 1789 with the storming of the Bastille.\n\n**Common Mistakes:**\nPicking 1804 (Napoleon becomes Emperor) or 1815 (Battle of Waterloo).",
    difficulty: 'medium',
    subject: 'Social Science'
  },
  // NEW NEET-SPECIFIC QUESTIONS
  {
    id: '6',
    question: 'Which of the following is the powerhouse of the cell?',
    options: [
      'Nucleus',
      'Mitochondria',
      'Ribosome',
      'Golgi apparatus'
    ],
    correctAnswer: 1,
    explanation: "**Core Concept:**\nCellular organelles and their specific metabolic roles.\n\n**Why this answer:**\nMitochondria produce ATP through aerobic respiration, providing energy for cellular activities.\n\n**Common Mistakes:**\nThinking the Nucleus (control center) or Ribosomes (protein factories) handle energy production.",
    difficulty: 'easy',
    subject: 'NEET'
  },
  {
    id: '7',
    question: 'What is the SI unit of electric current?',
    options: [
      'Volt',
      'Ampere',
      'Watt',
      'Ohm'
    ],
    correctAnswer: 1,
    explanation: "**Core Concept:**\nStandardized measurement units in electromagnetism.\n\n**Why this answer:**\nThe Ampere (A) measures the rate of flow of electric charge.\n\n**Common Mistakes:**\nConfusing current with voltage (Volt) or power (Watt).",
    difficulty: 'easy',
    subject: 'NEET'
  },
  {
    id: '8',
    question: 'Which functional group is present in alcohols?',
    options: [
      '-COOH',
      '-CHO',
      '-OH',
      '-NH₂'
    ],
    correctAnswer: 2,
    explanation: "**Core Concept:**\nFunctional group identification in organic chemistry.\n\n**Why this answer:**\nAlcohols are defined by the presence of a hydroxyl group (-OH) attached to a carbon atom.\n\n**Common Mistakes:**\nConfusing the hydroxyl group with the aldehyde group (-CHO) or carboxylic acid group (-COOH).",
    difficulty: 'medium',
    subject: 'NEET'
  }
];

/**
 * User progress tracking data structure
 * Includes achievements and weekly goals for gamification
 */
export const mockUserProgress: UserProgress = {
  totalCourses: 7, // Updated to include NEET
  completedCourses: 0,
  currentStreak: 7,
  totalHours: 42,
  achievements: [
    {
      id: '1',
      title: 'First Course Started',
      description: 'Started your first Class 10 course',
      icon: '🎓',
      unlockedAt: new Date(Date.now() - 86400000),
      rarity: 'common'
    },
    {
      id: '2',
      title: 'Week Streak',
      description: 'Maintained a 7-day learning streak',
      icon: '🔥',
      unlockedAt: new Date(),
      rarity: 'rare'
    },
    {
      id: '3',
      title: 'Math Explorer',
      description: 'Completed 5 mathematics lessons',
      icon: '🧮',
      unlockedAt: new Date(Date.now() - 172800000),
      rarity: 'epic'
    },
    // NEW NEET-SPECIFIC ACHIEVEMENT
    {
      id: '4',
      title: 'Future Doctor',
      description: 'Started NEET preparation journey',
      icon: '🩺',
      unlockedAt: new Date(Date.now() - 432000000),
      rarity: 'legendary'
    }
  ],
  weeklyGoal: 10,
  weeklyProgress: 7
};

/**
 * AI response generator for chat functionality
 * Provides contextual responses based on Class 10 curriculum
 */
export const getAIResponse = (_message: string): string => {
  const responses = [
    "That's an excellent question! Let me break this down for you step by step. Based on your Class 10 curriculum, I think you'll find this explanation particularly helpful...",
    "I can see you're making fantastic progress! Here's what I'd recommend focusing on next to build upon what you've already learned...",
    "Interesting point! This concept actually connects to several topics we've covered in your Class 10 syllabus. Let me show you how they relate...",
    "You're thinking like a true scholar! Let's dive deeper into this topic and explore some practical applications that will help in your board exams...",
    "Perfect! Your understanding is really developing well. Here's an advanced perspective that will challenge your thinking and prepare you for higher studies...",
    "Great insight! This connects to several key principles in your Class 10 curriculum. Let me explain how they work together...",
    "I love that you asked this! It shows you're thinking critically about the material. Here's a comprehensive explanation with examples from your textbook...",
    "This is a common question that many Class 10 students have. Let me provide you with a clear, practical answer with step-by-step examples..."
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

/**
 * Subject-specific response generator for targeted learning
 * Includes NEET-specific responses for medical entrance preparation
 */
export const getSubjectSpecificResponse = (_message: string, subject: string): string => {
  const subjectResponses: Record<string, string[]> = {
    'Mathematics': [
      "In Class 10 Mathematics, this concept is fundamental to understanding algebra and geometry...",
      "From a mathematical perspective, let me explain the underlying principles and their practical applications in your board exam...",
      "This mathematical concept has practical applications in real life. Here's how it works step by step..."
    ],
    'Science': [
      "In Class 10 Science, this principle applies across Physics, Chemistry, and Biology. Let me explain how...",
      "From a scientific standpoint, this concept helps us understand natural phenomena. Here's the detailed explanation...",
      "This scientific concept is crucial for your board exams. Here's how it connects to other topics in your syllabus..."
    ],
    'Social Science': [
      "In Class 10 Social Science, this topic connects to important historical and geographical concepts...",
      "From a social science perspective, understanding this helps us analyze society and governance...",
      "This concept is important for understanding our world today. Here's how it relates to current events..."
    ],
    'English': [
      "In Class 10 English literature, this concept helps us understand themes and literary devices...",
      "From a language perspective, understanding this will improve your writing and comprehension skills...",
      "This literary concept appears frequently in your board exam. Here's how to analyze it effectively..."
    ],
    'Hindi': [
      "कक्षा 10 हिंदी में यह विषय साहित्य और व्याकरण दोनों के लिए महत्वपूर्ण है...",
      "हिंदी भाषा के दृष्टिकोण से, यह अवधारणा आपकी लेखन और समझ कौशल में सुधार करेगी...",
      "यह साहित्यिक अवधारणा आपकी बोर्ड परीक्षा में अक्सर आती है। इसका विश्लेषण कैसे करें..."
    ],
    // NEW NEET-SPECIFIC RESPONSES
    'NEET': [
      "For NEET preparation, this concept is crucial across Physics, Chemistry, and Biology. Let me explain how it appears in the entrance exam...",
      "From a medical entrance perspective, understanding this topic will help you solve complex NEET questions with confidence...",
      "This is a high-yield topic for NEET. Here's how it's typically tested and the key points you should remember for the exam...",
      "In NEET, this concept often appears in combination with other topics. Let me show you the interconnections and solve some practice questions...",
      "This topic has significant weightage in NEET Biology/Physics/Chemistry. Here's how to approach it systematically for maximum scores..."
    ]
  };

  const responses = subjectResponses[subject] || subjectResponses['Mathematics'];
  return responses[Math.floor(Math.random() * responses.length)];
};

export const getDynamicNotification = () => {
  const notificationTypes = ['class', 'revision', 'quiz', 'tip', 'live'];
  const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

  // Pick a random course
  const course = mockCourses[Math.floor(Math.random() * mockCourses.length)];

  // Base notification structure
  let notification = {
    title: 'Ready to Learn?',
    message: 'Start your personalized learning journey today.',
    actionLabel: 'Get Started',
    type: 'reminder' as 'live' | 'reminder' | 'tip',
    gradient: 'from-blue-600 via-blue-600 to-pink-600'
  };

  if (!course) return notification;

  switch (type) {
    case 'class':
      notification = {
        title: `${course.category} Class`,
        message: `It's time to start your ${course.title} session. Keep up the momentum!`,
        actionLabel: 'Start Class',
        type: 'reminder',
        gradient: course.color.replace('bg-gradient-to-br', '') // Reuse course gradient colors
      };
      break;
    case 'revision':
      notification = {
        title: 'Revision Time',
        message: `Revise key concepts from ${course.category}. Spaced repetition helps memory!`,
        actionLabel: 'Revise Now',
        type: 'reminder',
        gradient: 'from-blue-600 via-blue-600 to-blue-600'
      };
      break;
    case 'live':
      notification = {
        title: `Live: ${course.category}`,
        message: `A live session for ${course.title} is starting in 5 minutes. Join now!`,
        actionLabel: 'Join Live',
        type: 'live',
        gradient: 'from-red-600 via-rose-600 to-pink-600'
      };
      break;
    case 'quiz':
      notification = {
        title: 'Quick Quiz',
        message: `Test your knowledge in ${course.category}. Take a 5-minute rapid fire quiz.`,
        actionLabel: 'Take Quiz',
        type: 'tip',
        gradient: 'from-amber-500 via-orange-500 to-yellow-500'
      };
      break;
    case 'tip':
    default:
      const tips = [
        { t: 'Doubt Solver', m: 'Stuck? Ask our AI tutor for instant detailed explanations.', a: 'Ask Now', g: 'from-emerald-500 via-teal-500 to-cyan-500' },
        { t: 'Study Stake', m: 'You are doing great! Maintain your 7-day streak.', a: 'View Progress', g: 'from-blue-500 via-cyan-500 to-teal-500' },
        { t: 'Night Mode', m: 'Studying late? Late night study sessions are most effective with low light.', a: 'Dismiss', g: 'from-gray-700 via-gray-800 to-black' }
      ];
      const tip = tips[Math.floor(Math.random() * tips.length)];
      notification = {
        title: tip.t,
        message: tip.m,
        actionLabel: tip.a,
        type: 'tip',
        gradient: tip.g
      };
      break;
  }

  // Ensure gradient format matches what the component expects (remove 'bg-gradient-to-br' if present in course color to avoid duplication/errors, though we doing replace above)
  if (!notification.gradient || notification.gradient.trim() === '') {
    notification.gradient = 'from-blue-600 via-blue-600 to-blue-600';
  }

  return notification;
};
