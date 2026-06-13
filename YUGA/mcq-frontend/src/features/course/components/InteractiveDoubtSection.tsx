import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, ThumbsUp, ThumbsDown, BookOpen, Lightbulb } from "lucide-react";
import { AIAvatar } from "../../../shared/components/AIAvatar";
import { apiRequest } from "../../../core/utils/api";

interface Doubt {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  helpful: boolean | null;
  category: 'concept' | 'application' | 'example' | 'clarification';
}

interface InteractiveDoubtSectionProps {
  isVisible: boolean;
  lessonTitle: string;
  onClose: () => void;
  onShowWhiteboard: () => void;
}

export const InteractiveDoubtSection: React.FC<InteractiveDoubtSectionProps> = ({
  isVisible,
  lessonTitle,
  onClose,
  onShowWhiteboard
}) => {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'concept' | 'application' | 'example' | 'clarification'>('concept');
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentQuestion(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [doubts]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateAIAnswer = (question: string, category: string): string => {
    const responses = {
      concept: [
        "Great conceptual question! Let me break this down into simpler terms...",
        "This is a fundamental concept. Think of it this way...",
        "Excellent question about the core principles. Here's how I'd explain it..."
      ],
      application: [
        "Perfect practical question! Here's how this applies in real-world scenarios...",
        "Great application thinking! This concept is used in many industries...",
        "Wonderful question about implementation. Let me show you some examples..."
      ],
      example: [
        "I love that you're asking for examples! Here are some concrete cases...",
        "Examples really help understanding. Let me give you a few scenarios...",
        "Perfect request for examples! This will make the concept much clearer..."
      ],
      clarification: [
        "Thanks for asking for clarification! Let me explain this more clearly...",
        "Good catch! This can be confusing. Let me clarify the difference...",
        "Excellent clarification question! This is a common point of confusion..."
      ]
    };

    const categoryResponses = responses[category as keyof typeof responses];
    const randomResponse = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    
    // Add specific content based on lesson and question
    let specificAnswer = "";
    if (lessonTitle.toLowerCase().includes('machine learning')) {
      if (question.toLowerCase().includes('supervised')) {
        specificAnswer = " Supervised learning uses labeled training data, like showing a computer thousands of photos labeled 'cat' or 'dog'. The algorithm learns from these examples to make predictions on new, unlabeled data.";
      } else if (question.toLowerCase().includes('algorithm')) {
        specificAnswer = " Machine learning algorithms are mathematical procedures that find patterns in data. Popular ones include decision trees (which ask yes/no questions), neural networks (which mimic brain neurons), and linear regression (which finds the best line through data points).";
      } else {
        specificAnswer = " Machine learning is essentially pattern recognition at scale. Instead of programming specific rules, we show computers examples and let them discover the underlying patterns themselves.";
      }
    }
    
    return randomResponse + specificAnswer + " Does this help clarify things for you?";
  };

  const handleSubmitQuestion = async () => {
    if (!currentQuestion.trim()) return;

    setIsProcessing(true);
    
    const newDoubt: Doubt = {
      id: Date.now().toString(),
      question: currentQuestion,
      answer: '',
      timestamp: new Date(),
      helpful: null,
      category: selectedCategory
    };

    setDoubts(prev => [...prev, newDoubt]);
    setCurrentQuestion('');

    try {
      // Convert doubts to messages format for backend
      const messages = doubts.map(d => [
        { role: 'user', content: d.question },
        { role: 'assistant', content: d.answer }
      ]).flat();
      
      // Add current question
      messages.push({ role: 'user', content: newDoubt.question });

      const response = await apiRequest('/voice/query', 'POST', {
        messages: messages,
        courseCategory: lessonTitle,
        taskType: 'doubt_clarification'
      });

      if (response.ok) {
        const data = await response.json();
        setDoubts(prev => prev.map(doubt => 
          doubt.id === newDoubt.id 
            ? { ...doubt, answer: data.response }
            : doubt
        ));
      } else {
        // Fallback to mock if API fails
        const aiAnswer = generateAIAnswer(newDoubt.question, selectedCategory);
        setDoubts(prev => prev.map(doubt => 
          doubt.id === newDoubt.id 
            ? { ...doubt, answer: aiAnswer + " (Offline Mode)" }
            : doubt
        ));
      }
    } catch (error) {
      console.error("Error fetching answer:", error);
       // Fallback
        const aiAnswer = generateAIAnswer(newDoubt.question, selectedCategory);
        setDoubts(prev => prev.map(doubt => 
          doubt.id === newDoubt.id 
            ? { ...doubt, answer: aiAnswer + " (Offline Mode)" }
            : doubt
        ));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition error:', error);
      }
    }
  };

  const handleFeedback = (doubtId: string, helpful: boolean) => {
    setDoubts(prev => prev.map(doubt => 
      doubt.id === doubtId 
        ? { ...doubt, helpful }
        : doubt
    ));
  };

  const suggestedQuestions = [
    "Can you explain this with a simple example?",
    "How is this used in real applications?",
    "What's the difference between this and...?",
    "Can you show this on the whiteboard?",
    "What are the key points I should remember?"
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9997] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AIAvatar size="medium" emotion="explaining" isActive />
            <div>
              <h3 className="text-xl font-bold">Interactive Doubt Solver</h3>
              <p className="text-blue-100">{lessonTitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onShowWhiteboard}
              className="bg-white bg-opacity-20 text-white p-2 rounded-lg hover:bg-opacity-30 transition-colors"
              title="Open Whiteboard"
            >
              <Lightbulb className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Doubts History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {doubts.length === 0 ? (
            <div className="text-center py-8">
              <AIAvatar size="large" emotion="encouraging" />
              <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2">Ask me anything!</h4>
              <p className="text-gray-600 mb-6">I'm here to help clarify concepts and answer your questions about {lessonTitle}.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(question)}
                    className="p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            doubts.map((doubt) => (
              <div key={doubt.id} className="bg-gray-50 rounded-lg p-4">
                {/* Question */}
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    Q
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{doubt.question}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doubt.category === 'concept' ? 'bg-blue-100 text-blue-700' :
                        doubt.category === 'application' ? 'bg-green-100 text-green-700' :
                        doubt.category === 'example' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {doubt.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {doubt.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Answer */}
                {doubt.answer ? (
                  <div className="flex items-start space-x-3">
                    <AIAvatar size="small" emotion="explaining" />
                    <div className="flex-1 bg-white rounded-lg p-3 border-l-4 border-blue-500">
                      <p className="text-gray-700">{doubt.answer}</p>
                      
                      {/* Feedback */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Was this helpful?</span>
                          <button
                            onClick={() => handleFeedback(doubt.id, true)}
                            className={`p-1 rounded transition-colors ${
                              doubt.helpful === true ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:text-green-600'
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleFeedback(doubt.id, false)}
                            className={`p-1 rounded transition-colors ${
                              doubt.helpful === false ? 'text-red-600 bg-red-100' : 'text-gray-400 hover:text-red-600'
                            }`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={onShowWhiteboard}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                        >
                          <BookOpen className="w-4 h-4 mr-1" />
                          Show on Whiteboard
                        </button>
                      </div>
                    </div>
                  </div>
                ) : isProcessing ? (
                  <div className="flex items-center space-x-3">
                    <AIAvatar size="small" emotion="thinking" isActive />
                    <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-gray-600 ml-2">Thinking...</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="border-t border-gray-200 p-4">
          {/* Category Selection */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm text-gray-600">Question type:</span>
            {(['concept', 'application', 'example', 'clarification'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                placeholder="Ask your question here..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitQuestion();
                  }
                }}
              />
            </div>
            <button
              onClick={handleVoiceInput}
              className={`p-3 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isListening ? 'Stop Listening' : 'Voice Input'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={handleSubmitQuestion}
              disabled={!currentQuestion.trim() || isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
