import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, MessageCircle, BookOpen, Lightbulb } from "lucide-react";
import { AIAvatar } from "../../../shared/components/AIAvatar";

interface VirtualTeacherProps {
  lessonTitle: string;
  isTeaching: boolean;
  onQuestionAsked: (question: string) => void;
  onShowWhiteboard: () => void;
}

interface TeachingScript {
  introduction: string;
  mainContent: string[];
  keyPoints: string[];
  conclusion: string;
  interactivePrompts: string[];
}

export const VirtualTeacher: React.FC<VirtualTeacherProps> = ({
  lessonTitle,
  isTeaching,
  onQuestionAsked,
  onShowWhiteboard
}) => {
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'content' | 'conclusion'>('intro');
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [speechText, setSpeechText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(false); // Changed to false to hide subtitles by default

  // Generate teaching script based on lesson
  const generateTeachingScript = (title: string): TeachingScript => {
    const scripts: Record<string, TeachingScript> = {
      'Introduction to Machine Learning': {
        introduction: "Welcome to this exciting lesson on Machine Learning! I'm your AI instructor, and I'm thrilled to guide you through this fascinating field that's transforming our world.",
        mainContent: [
          "Machine Learning is like teaching computers to learn patterns from data, just like how you learned to recognize faces or understand language.",
          "Think of it this way - instead of programming every possible scenario, we show the computer examples and let it figure out the patterns.",
          "There are three main types: Supervised learning with labeled examples, Unsupervised learning for finding hidden patterns, and Reinforcement learning through trial and error.",
          "Real-world applications include recommendation systems like Netflix, voice assistants like Siri, and even medical diagnosis systems."
        ],
        keyPoints: [
          "ML teaches computers to learn from data",
          "Three main types: Supervised, Unsupervised, Reinforcement",
          "Used in recommendations, voice recognition, medical diagnosis",
          "Patterns recognition is the core concept"
        ],
        conclusion: "Machine Learning is everywhere around us, making our lives easier and more efficient. In our next lesson, we'll dive deeper into each type of machine learning.",
        interactivePrompts: [
          "Can you think of a machine learning system you use daily?",
          "What patterns do you think a computer might find in your music listening habits?",
          "How do you think Netflix knows what movies to recommend to you?"
        ]
      },
      'Types of Machine Learning': {
        introduction: "Now that we understand what Machine Learning is, let's explore the three main types and see how they work in practice.",
        mainContent: [
          "Supervised Learning is like learning with a teacher. We provide the computer with input-output pairs, like showing it thousands of photos labeled 'cat' or 'dog'.",
          "Unsupervised Learning is like being a detective. The computer looks at data without labels and tries to find hidden patterns or group similar things together.",
          "Reinforcement Learning is like training a pet with rewards. The computer learns by trying actions and getting positive or negative feedback.",
          "Each type solves different kinds of problems. Supervised for prediction, Unsupervised for discovery, and Reinforcement for decision-making."
        ],
        keyPoints: [
          "Supervised: Learning with labeled examples",
          "Unsupervised: Finding patterns without labels",
          "Reinforcement: Learning through rewards and penalties",
          "Each type serves different problem-solving needs"
        ],
        conclusion: "Understanding these three types helps you choose the right approach for different problems. Next, we'll focus on supervised learning algorithms.",
        interactivePrompts: [
          "Which type would you use to group customers by shopping behavior?",
          "How would you teach a computer to play chess?",
          "What type of learning do you think spam filters use?"
        ]
      }
    };

    return scripts[title] || {
      introduction: `Welcome to this lesson on ${title}. Let's explore this topic together!`,
      mainContent: [
        `This lesson covers the fundamental concepts of ${title}.`,
        "We'll explore practical applications and real-world examples.",
        "By the end, you'll have a solid understanding of the key principles."
      ],
      keyPoints: [
        "Key concepts and definitions",
        "Practical applications",
        "Real-world examples"
      ],
      conclusion: "Great job completing this lesson! You're making excellent progress.",
      interactivePrompts: [
        "What questions do you have about this topic?",
        "Can you think of how this applies to your daily life?",
        "What would you like to explore further?"
      ]
    };
  };

  const teachingScript = generateTeachingScript(lessonTitle);

  useEffect(() => {
    if (isTeaching) {
      startTeaching();
    } else {
      stopTeaching();
    }
  }, [isTeaching]);

  const startTeaching = () => {
    setCurrentPhase('intro');
    setCurrentContentIndex(0);
    speakText(teachingScript.introduction);
  };

  const stopTeaching = () => {
    setIsSpeaking(false);
    setSpeechText('');
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  };

  const speakText = (text: string) => {
    setSpeechText(text);
    setIsSpeaking(true);

    if (soundEnabled && 'speechSynthesis' in window) {
      speechSynthesis.cancel();

      const sanitizedText = text
        .replace(/\\+[rn]/g, '. ')     // Catch literal \n, \r, \\n, etc.
        .replace(/[\r\n]+/g, '. ')     // Catch actual newline characters
        .replace(/\s+-\s+/g, ', ')     // Replace " - " with a comma/pause
        .replace(/^-\s+/gm, ', ')      // Replace leading "- " (bullets) with a comma/pause
        .replace(/[*#_]/g, '')         // Remove markdown artifacts
        // Format large numbers with commas to prevent TTS from reading "20000" as "20 zero"
        .replace(/(^|[^\d.])(\d{5,})/g, (_match, p1, p2) => p1 + p2.replace(/\B(?=(\d{3})+(?!\d))/g, ","))
        .replace(/(\.\s*){2,}/g, '. ') // Remove double dots
        .replace(/\bions\b/gi, ' eye-ons ')
        .replace(/\bion\b/gi, ' eye-on ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(sanitizedText);
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;

      // Try to use a more natural voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.name.includes('Google') ||
        voice.name.includes('Microsoft') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Alex')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        setTimeout(() => {
          proceedToNext();
        }, 2000);
      };

      speechSynthesis.speak(utterance);
    } else {
      // If speech is disabled, auto-proceed after reading time
      setTimeout(() => {
        setIsSpeaking(false);
        setTimeout(() => {
          proceedToNext();
        }, 1000);
      }, text.length * 50); // Approximate reading time
    }
  };

  const proceedToNext = () => {
    if (currentPhase === 'intro') {
      setCurrentPhase('content');
      setCurrentContentIndex(0);
      speakText(teachingScript.mainContent[0]);
    } else if (currentPhase === 'content') {
      if (currentContentIndex < teachingScript.mainContent.length - 1) {
        const nextIndex = currentContentIndex + 1;
        setCurrentContentIndex(nextIndex);
        speakText(teachingScript.mainContent[nextIndex]);
      } else {
        setCurrentPhase('conclusion');
        speakText(teachingScript.conclusion);
      }
    } else {
      // Teaching complete, show interactive prompts
      const randomPrompt = teachingScript.interactivePrompts[
        Math.floor(Math.random() * teachingScript.interactivePrompts.length)
      ];
      speakText(randomPrompt);
    }
  };

  const handleQuestionClick = () => {
    const prompt = "What would you like to know more about?";
    onQuestionAsked(prompt);
  };

  return (
    <div className="relative">
      {/* Main Avatar */}
      <div className="flex flex-col items-center">
        <AIAvatar
          size="xl"
          emotion="teaching"
          isActive={isTeaching}
          isSpeaking={isSpeaking}
          speechText={speechText}
          enableInteraction={false}
        />

        {/* Teacher Name */}
        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold text-white">Professor YUGA</h3>
          <p className="text-blue-200 text-sm">AI Learning Specialist</p>
        </div>
      </div>

      {/* Speech Bubble with Subtitles - Hidden by default */}
      {isSpeaking && speechText && showSubtitles && (
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 max-w-md z-10">
          <div className="text-sm text-gray-800 text-center">
            {speechText}
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
          </div>
        </div>
      )}

      {/* Teaching Progress Indicator */}
      {isTeaching && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 rounded-lg p-3 text-white text-center min-w-48">
          <div className="text-xs mb-2">
            {currentPhase === 'intro' && 'Introduction'}
            {currentPhase === 'content' && `Content ${currentContentIndex + 1}/${teachingScript.mainContent.length}`}
            {currentPhase === 'conclusion' && 'Conclusion'}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{
                width: `${currentPhase === 'intro' ? 10 :
                  currentPhase === 'content' ? 10 + (currentContentIndex + 1) * (80 / teachingScript.mainContent.length) :
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
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-blue-600" />
          ) : (
            <VolumeX className="w-5 h-5 text-gray-400" />
          )}
        </button>

        <button
          onClick={() => setShowSubtitles(!showSubtitles)}
          className="bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
          title={showSubtitles ? 'Hide Subtitles' : 'Show Subtitles'}
        >
          <BookOpen className="w-5 h-5 text-blue-600" />
        </button>

        <button
          onClick={handleQuestionClick}
          className="bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
          title="Ask Question"
        >
          <MessageCircle className="w-5 h-5 text-blue-600" />
        </button>

        <button
          onClick={onShowWhiteboard}
          className="bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
          title="Open Smart Whiteboard"
        >
          <Lightbulb className="w-5 h-5 text-blue-600" />
        </button>
      </div>

      {/* Key Points Display */}
      {currentPhase === 'content' && (
        <div className="absolute top-0 right-0 bg-white bg-opacity-90 rounded-lg p-4 max-w-xs">
          <h4 className="font-bold text-gray-900 mb-2">Key Points</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            {teachingScript.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
