import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, MessageCircle, BookOpen } from "lucide-react";
import { RealisticAvatar } from "./RealisticAvatar";
import { MCQPopup } from "./MCQPopup";

/**
 * Props interface for VirtualTeacher component
 */
interface VirtualTeacherProps {
  /** Whether the teaching session is currently active */
  isTeaching: boolean;
  /** Subject category for the lesson (affects MCQ selection) */
  subject: string;
  /** Callback function when user asks a question */
  onQuestionAsked: (question: string) => void;
  /** Callback function to show whiteboard */
  onShowWhiteboard: () => void;
}

/**
 * Interface for teaching script structure
 */
interface TeachingScript {
  introduction: string;
  mainContent: string[];
  keyPoints: string[];
  conclusion: string;
  interactivePrompts: string[];
}

/**
 * Interface for MCQ question structure
 */
interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  subject: string;
  image?: string; // Base64 encoded image for question
  imageContentType?: string; // MIME type for question (e.g., 'image/png', 'image/jpeg')
  imageOcrText?: string; // OCR extracted text from question image
  answerImage?: string; // Base64 encoded image for answer/explanation
  answerImageContentType?: string; // MIME type for answer (e.g., 'image/png', 'image/jpeg')
  answerImageOcrText?: string; // OCR extracted text from answer image
}

/**
 * VirtualTeacher Component
 * 
 * An advanced AI teaching component that manages the complete learning experience including:
 * - Scripted teaching phases with natural progression
 * - Interactive MCQ questions after introduction
 * - Subject-specific content and questions
 * - Speech synthesis with professional avatar
 * - Dynamic question response system
 */
export const VirtualTeacher: React.FC<VirtualTeacherProps> = ({
  isTeaching,
  subject,
  onQuestionAsked,
  onShowWhiteboard
}) => {
  // Teaching flow state management
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'question' | 'content' | 'conclusion'>('intro');
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [speechText, setSpeechText] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(false);

  // MCQ functionality state
  const [showMCQ, setShowMCQ] = useState(false);
  const [currentMCQ, setCurrentMCQ] = useState<MCQQuestion | null>(null);
  const [mcqAnswered, setMCQAnswered] = useState(false);

  /**
   * Generate subject-specific teaching scripts with professional content
   * Includes introduction, main content points, and interactive elements
   */
  const generateTeachingScript = (subjectCategory: string): TeachingScript => {
    const subjectScripts: Record<string, TeachingScript> = {
      'Mathematics': {
        introduction: "Welcome to today's mathematics lesson. I'm Diya, your AI mathematics instructor. Mathematics is the language of patterns and relationships, and today we'll explore fundamental concepts that form the building blocks of mathematical thinking. Mathematics helps us solve real-world problems with precision and logic.",
        mainContent: [
          "Mathematics is built upon logical reasoning and systematic problem-solving approaches. Each concept we learn connects to others, creating a web of mathematical understanding.",
          "In this lesson, we'll examine key mathematical principles and learn how to apply them to various scenarios you'll encounter in your academic journey.",
          "Remember, mathematics is not just about memorizing formulas - it's about understanding the why behind each concept and developing critical thinking skills.",
          "Let's work through some examples together to reinforce these important concepts and build your confidence in mathematical problem-solving."
        ],
        keyPoints: [
          "Mathematics builds logical reasoning skills",
          "Concepts interconnect to form comprehensive understanding",
          "Problem-solving requires systematic approaches",
          "Understanding principles is more important than memorization"
        ],
        conclusion: "Mathematics empowers us to understand and describe the world around us. Keep practicing these concepts, and you'll develop strong analytical skills that will benefit you throughout your academic and professional life.",
        interactivePrompts: [
          "Can you think of a real-world situation where this mathematical concept applies?",
          "What connections do you see between this topic and previous lessons?",
          "How might this mathematical principle help solve everyday problems?"
        ]
      },
      'Science': {
        introduction: "Welcome to today's science lesson. I'm Diya, your AI science instructor. Science helps us understand the natural world through observation, experimentation, and logical analysis. Today we'll explore fascinating scientific concepts that govern the world around us and learn how scientific thinking shapes our understanding of reality.",
        mainContent: [
          "Science is fundamentally about asking questions and seeking evidence-based answers. We use systematic methods to investigate natural phenomena and uncover universal principles.",
          "The scientific method guides our exploration - we observe, hypothesize, experiment, and draw conclusions based on evidence rather than assumptions.",
          "Today's lesson will demonstrate how scientific concepts apply to real-world situations and help you develop scientific reasoning skills.",
          "By understanding these principles, you'll gain a deeper appreciation for the natural world and develop critical thinking abilities."
        ],
        keyPoints: [
          "Science relies on evidence-based reasoning",
          "The scientific method provides systematic investigation",
          "Observations lead to testable hypotheses",
          "Scientific principles explain natural phenomena"
        ],
        conclusion: "Science opens doors to understanding our universe and developing solutions to complex problems. Continue exploring with curiosity and always question the world around you.",
        interactivePrompts: [
          "What scientific principles do you observe in your daily life?",
          "How might we test this hypothesis through experimentation?",
          "What connections do you see between different scientific fields?"
        ]
      },
      'Social Science': {
        introduction: "Welcome to today's social science lesson. I'm Diya, your AI social studies instructor. Social science helps us understand human societies, cultures, and the relationships between individuals and communities. Today we'll explore important concepts that shape our understanding of history, geography, politics, and economics.",
        mainContent: [
          "Social science examines how societies develop, function, and change over time. We study patterns in human behavior and the factors that influence social development.",
          "Understanding social science helps us become informed citizens who can participate meaningfully in democratic processes and contribute to society.",
          "Today's lesson will connect historical events to contemporary issues and help you understand the complex relationships between different aspects of society.",
          "By studying social science, you develop critical thinking skills and gain perspective on diverse cultures and viewpoints."
        ],
        keyPoints: [
          "Social science studies human societies and behavior",
          "Historical understanding informs current events",
          "Multiple perspectives enrich our understanding",
          "Critical thinking skills apply to social analysis"
        ],
        conclusion: "Social science empowers you to understand your place in the world and contribute positively to society. Continue exploring different cultures and historical perspectives to broaden your worldview.",
        interactivePrompts: [
          "How do historical events continue to influence modern society?",
          "What social patterns do you observe in your community?",
          "How might different cultural perspectives approach this issue?"
        ]
      },
      'English': {
        introduction: "Welcome to today's English lesson. I'm Diya, your AI English instructor. Language is the foundation of human communication and expression, and today we'll explore how English literature and language skills enhance our ability to understand, communicate, and express complex ideas effectively.",
        mainContent: [
          "English studies develop both analytical and creative thinking skills. Through literature, we explore different perspectives and learn to interpret complex texts with nuance.",
          "Strong communication skills in English open doors to academic and professional success. We'll focus on developing reading, writing, and critical analysis abilities.",
          "Today's lesson will demonstrate how literary techniques create meaning and how understanding these techniques improves both comprehension and expression.",
          "By studying English, you develop empathy through exposure to diverse voices and learn to articulate your own ideas with clarity and precision."
        ],
        keyPoints: [
          "Language skills enhance communication and expression",
          "Literature provides insights into human experience",
          "Critical analysis develops intellectual skills",
          "Strong English skills support academic success"
        ],
        conclusion: "English studies enrich your intellectual life and provide tools for effective communication. Continue reading widely and practicing your writing skills to develop your unique voice.",
        interactivePrompts: [
          "How does this literary work reflect the society in which it was written?",
          "What techniques does the author use to create meaning?",
          "How might you apply these communication skills in other areas?"
        ]
      }
    };

    return subjectScripts[subjectCategory] || subjectScripts['Mathematics'];
  };

  /**
   * Generate subject-specific MCQ questions
   * Creates relevant multiple choice questions based on the subject category
   */
  const generateMCQForSubject = (subjectCategory: string): MCQQuestion => {
    const mcqQuestions: Record<string, MCQQuestion[]> = {
      'Mathematics': [
        {
          id: 'MATH-MCQ-1',
          question: 'What is the value of √16?',
          options: ['2', '4', '8', '16'],
          correctAnswer: '4',
          explanation: '√16 = 4 because 4 × 4 = 16. The square root of a number is the value that, when multiplied by itself, gives the original number.',
          subject: 'Mathematics'
        },
        {
          id: 'MATH-MCQ-2',
          question: 'If 2x + 5 = 15, what is the value of x?',
          options: ['3', '5', '7', '10'],
          correctAnswer: '5',
          explanation: 'To solve 2x + 5 = 15, subtract 5 from both sides: 2x = 10, then divide by 2: x = 5.',
          subject: 'Mathematics'
        },
        {
          id: 'MATH-MCQ-3',
          question: 'What is the area of a circle with radius 3 units? (Use π ≈ 3.14)',
          options: ['18.84 square units', '28.26 square units', '9.42 square units', '12.56 square units'],
          correctAnswer: '28.26 square units',
          explanation: 'Area of circle = πr². With r = 3, Area = π × 3² = π × 9 ≈ 3.14 × 9 = 28.26 square units.',
          subject: 'Mathematics'
        }
      ],
      'Science': [
        {
          id: 'SCI-MCQ-1',
          question: 'What is the chemical symbol for water?',
          options: ['H₂O', 'CO₂', 'O₂', 'H₂'],
          correctAnswer: 'H₂O',
          explanation: 'Water has the chemical formula H₂O, indicating it contains two hydrogen atoms bonded to one oxygen atom.',
          subject: 'Science'
        },
        {
          id: 'SCI-MCQ-2',
          question: 'Which planet is closest to the Sun?',
          options: ['Venus', 'Mercury', 'Earth', 'Mars'],
          correctAnswer: 'Mercury',
          explanation: 'Mercury is the innermost planet in our solar system, orbiting closest to the Sun at an average distance of about 58 million kilometers.',
          subject: 'Science'
        },
        {
          id: 'SCI-MCQ-3',
          question: 'What process do plants use to make their food?',
          options: ['Respiration', 'Photosynthesis', 'Digestion', 'Fermentation'],
          correctAnswer: 'Photosynthesis',
          explanation: 'Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose (food) and oxygen.',
          subject: 'Science'
        }
      ],
      'Social Science': [
        {
          id: 'SS-MCQ-1',
          question: 'In which year did World War II end?',
          options: ['1944', '1945', '1946', '1947'],
          correctAnswer: '1945',
          explanation: 'World War II ended in 1945 with the surrender of Germany in May and Japan in September, following the atomic bombings of Hiroshima and Nagasaki.',
          subject: 'Social Science'
        },
        {
          id: 'SS-MCQ-2',
          question: 'Which river is considered the lifeline of Egypt?',
          options: ['Amazon', 'Nile', 'Mississippi', 'Ganges'],
          correctAnswer: 'Nile',
          explanation: 'The Nile River is called the lifeline of Egypt because it provides water for agriculture and has been central to Egyptian civilization for thousands of years.',
          subject: 'Social Science'
        },
        {
          id: 'SS-MCQ-3',
          question: 'What is the capital of Australia?',
          options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
          correctAnswer: 'Canberra',
          explanation: 'Canberra is the capital city of Australia, established in 1913 as a planned city to serve as the seat of government.',
          subject: 'Social Science'
        }
      ],
      'English': [
        {
          id: 'ENG-MCQ-1',
          question: 'Who wrote the play "Romeo and Juliet"?',
          options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
          correctAnswer: 'William Shakespeare',
          explanation: '"Romeo and Juliet" is one of William Shakespeare\'s most famous tragic plays, written in the early part of his career around 1595.',
          subject: 'English'
        },
        {
          id: 'ENG-MCQ-2',
          question: 'What is a synonym for "happy"?',
          options: ['Sad', 'Angry', 'Joyful', 'Tired'],
          correctAnswer: 'Joyful',
          explanation: 'A synonym is a word with the same or similar meaning. "Joyful" means feeling or expressing great happiness, making it a synonym for "happy."',
          subject: 'English'
        },
        {
          id: 'ENG-MCQ-3',
          question: 'Which of the following is a metaphor?',
          options: ['"The wind whispered through the trees"', '"She runs like the wind"', '"Time is money"', '"The cat meowed loudly"'],
          correctAnswer: '"Time is money"',
          explanation: 'A metaphor directly compares two unlike things without using "like" or "as." "Time is money" compares time to money, suggesting time has value.',
          subject: 'English'
        }
      ]
    };

    const questions = mcqQuestions[subjectCategory] || mcqQuestions['Mathematics'];
    return questions[Math.floor(Math.random() * questions.length)];
  };

  // Get the teaching script for current lesson
  const teachingScript = generateTeachingScript(subject);

  /**
   * Handle speech end events from the avatar
   * Manages progression through teaching phases and triggers MCQ when appropriate
   */
  const handleSpeechEnd = () => {
    console.log(`Speech ended in phase: ${currentPhase}`);

    if (currentPhase === 'intro' && !mcqAnswered) {
      // After introduction, show transition to question
      setTimeout(() => {
        setSpeechText("Let's try this question to test your understanding so far.");
        setCurrentPhase('question');
      }, 1500); // Brief pause before transition
    } else if (currentPhase === 'question' && !showMCQ) {
      // Show the MCQ popup after transition speech
      setTimeout(() => {
        const mcq = generateMCQForSubject(subject);
        setCurrentMCQ(mcq);
        setShowMCQ(true);
      }, 1000);
    }
  };

  /**
   * Handle MCQ answer submission
   * Provides feedback and continues teaching flow
   */
  const handleMCQAnswer = (selectedAnswer: string, isCorrect: boolean) => {
    console.log(`MCQ answered: ${selectedAnswer}, Correct: ${isCorrect}`);

    // Set avatar response based on answer correctness
    setTimeout(() => {
      if (isCorrect) {
        setSpeechText("Excellent! That's the correct answer. Well done! You're showing great understanding of this concept. Let's continue with our lesson.");
      } else {
        const correctAnswer = currentMCQ?.correctAnswer || '';
        const explanation = currentMCQ?.explanation || '';
        setSpeechText(`That's not quite right. The correct answer is ${correctAnswer}. ${explanation} Let's continue with our lesson to reinforce this concept.`);
      }

      setMCQAnswered(true);

      // Transition to main content after feedback
      setTimeout(() => {
        setCurrentPhase('content');
        setSpeechText(teachingScript.mainContent[0]);
      }, 4000);
    }, 500);
  };

  /**
   * Close MCQ popup
   */
  const handleMCQClose = () => {
    setShowMCQ(false);
    if (!mcqAnswered) {
      // If user closes without answering, skip to content
      setSpeechText("Let's continue with our lesson. We'll explore these concepts in more detail.");
      setCurrentPhase('content');
      setTimeout(() => {
        setSpeechText(teachingScript.mainContent[0]);
      }, 2000);
    }
  };

  /**
   * Initialize teaching when component starts
   */
  useEffect(() => {
    if (isTeaching && currentPhase === 'intro' && !speechText) {
      // Start with the introduction
      setSpeechText(teachingScript.introduction);
    }
  }, [isTeaching, currentPhase, speechText, teachingScript.introduction]);

  /**
   * Handle content progression through main teaching points
   */
  useEffect(() => {
    if (currentPhase === 'content' && mcqAnswered) {
      const contentTimer = setTimeout(() => {
        if (currentContentIndex < teachingScript.mainContent.length - 1) {
          setCurrentContentIndex(prev => prev + 1);
          setSpeechText(teachingScript.mainContent[currentContentIndex + 1]);
        } else {
          // Move to conclusion
          setCurrentPhase('conclusion');
          setSpeechText(teachingScript.conclusion);
        }
      }, 8000); // 8 seconds between content segments

      return () => clearTimeout(contentTimer);
    }
  }, [currentPhase, currentContentIndex, mcqAnswered, teachingScript.mainContent, teachingScript.conclusion]);

  return (
    <div className="relative">
      {/* Main Avatar with MCQ Integration */}
      <div className="flex flex-col items-center">
        <RealisticAvatar
          gender="female"
          isTeaching={isTeaching}
          currentSpeech={speechText}
          emotion="teaching"
          soundEnabled={soundEnabled}
          onQuestionAsked={onQuestionAsked}
          onSpeechEnd={handleSpeechEnd}
          language="english"
        />
      </div>

      {/* MCQ Popup */}
      <MCQPopup
        isOpen={showMCQ}
        question={currentMCQ}
        onAnswerSubmit={handleMCQAnswer}
        onClose={handleMCQClose}
        subject={subject}
        currentQuestionIndex={0}
        totalQuestions={1}
        isAnswered={mcqAnswered}
        isQuizComplete={mcqAnswered}
      />

      {/* Teaching Progress Indicator */}
      {isTeaching && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 rounded-lg p-3 text-white text-center min-w-48">
          <div className="text-xs mb-2">
            {currentPhase === 'intro' && 'Introduction'}
            {currentPhase === 'question' && 'Interactive Question'}
            {currentPhase === 'content' && `Content ${currentContentIndex + 1}/${teachingScript.mainContent.length}`}
            {currentPhase === 'conclusion' && 'Conclusion'}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{
                width: `${currentPhase === 'intro' ? 15 :
                  currentPhase === 'question' ? 30 :
                    currentPhase === 'content' ? 30 + (currentContentIndex + 1) * (50 / teachingScript.mainContent.length) :
                      100
                  }%`
              }}
            />
          </div>
        </div>
      )}

      {/* Interactive Controls */}
      <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2 flex space-x-3">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
          title={soundEnabled ? 'Mute Voice' : 'Enable Voice'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-gray-700" /> : <VolumeX className="w-5 h-5 text-gray-700" />}
        </button>

        <button
          onClick={() => setShowSubtitles(!showSubtitles)}
          className="bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
          title={showSubtitles ? 'Hide Subtitles' : 'Show Subtitles'}
        >
          <MessageCircle className="w-5 h-5 text-gray-700" />
        </button>

        <button
          onClick={onShowWhiteboard}
          className="bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
          title="Show Whiteboard"
        >
          <BookOpen className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
};
