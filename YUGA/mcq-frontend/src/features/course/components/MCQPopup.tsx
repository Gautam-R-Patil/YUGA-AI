// MCQPopup.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, CheckCircle, XCircle, Clock } from "lucide-react";
import { FormattedText } from '../../../shared/components/FormattedText';
// Imported formatting utils
import { formatScientificText, formatTextForMarkdown } from "../../../core/utils/textFormatting";

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
  section?: number; // Section number (1, 2, or 3) for NEET AI Examiner
  sectionQuestionIndex?: number; // Question index within the section (1-10)
  image?: string; // Base64 encoded image for question
  imageContentType?: string; // MIME type for question (e.g., 'image/png', 'image/jpeg')
  imageOcrText?: string; // OCR extracted text from question image
  answerImage?: string; // Base64 encoded image for answer/explanation
  answerImageContentType?: string; // MIME type for answer (e.g., 'image/png', 'image/jpeg')
  answerImageOcrText?: string; // OCR extracted text from answer image
}

/**
 * Props interface for MCQPopup component
 */
interface MCQPopupProps {
  /** Whether the popup is currently visible */
  isOpen: boolean;
  /** MCQ question data to display */
  question: MCQQuestion | null;
  /** Callback function when user selects an answer */
  onAnswerSubmit: (selectedAnswer: string, isCorrect: boolean) => void;
  /** Callback function to close the popup */
  onClose: () => void;
  /** Callback function to advance to the next question */
  onNextQuestion?: () => void; // NEW PROP ADDED
  /** Callback function when Continue Learning button is clicked */
  onContinueLearning?: () => void; // NEW PROP FOR AVATAR SPEECH
  /** Callback function to request explanation (for correct answers) */
  onExplanationRequest?: (question: MCQQuestion) => void;
  /** Callback function when user declines explanation */
  onExplanationDecline?: () => void; // NEW PROP FOR DECLINING EXPLANATION
  /** Subject for styling theme */
  subject: string;
  /** Current question index (for multiple questions) */
  currentQuestionIndex: number;
  /** Total number of questions */
  totalQuestions: number;
  /** Whether the current question has been answered */
  isAnswered: boolean;
  /** Whether the entire quiz is complete */
  isQuizComplete: boolean;
}

/**
 * MCQPopup Component
 *
 * A modern, animated popup component that displays multiple choice questions
 * with dynamic styling based on subject and interactive answer selection
 */
export const MCQPopup: React.FC<MCQPopupProps> = ({
  isOpen,
  question,
  onAnswerSubmit,
  onClose,
  onNextQuestion, // NEW PROP USED
  onContinueLearning, // NEW PROP FOR AVATAR SPEECH
  onExplanationRequest, // NEW PROP FOR EXPLANATION REQUEST
  onExplanationDecline, // NEW PROP FOR DECLINING EXPLANATION
  subject,
  currentQuestionIndex,
  totalQuestions,
  isAnswered,
  isQuizComplete
}) => {
  // Component state for user interaction
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false); // Track if explanation should be shown
  const [timeLeft, setTimeLeft] = useState<number>(60); // 60 second timer
  const prevQuestionIdRef = useRef<string | null>(null); // Track previous question ID to prevent reset on update
  const [showExplanationConfirmPopup, setShowExplanationConfirmPopup] = useState<boolean>(false); // Track explanation confirmation popup

  /**
   * Get subject-specific color theme for styling
   * Returns appropriate gradient classes based on subject
   */
  const getSubjectTheme = (subjectName: string) => {
    const themes: Record<string, { gradient: string; accent: string; ring: string }> = {
      'Mathematics': {
        gradient: 'from-blue-600 via-blue-600 to-blue-600',
        accent: 'bg-blue-500',
        ring: 'ring-blue-300'
      },
      'Science': {
        gradient: 'from-green-600 via-emerald-600 to-teal-600',
        accent: 'bg-green-500',
        ring: 'ring-green-300'
      },
      'Social Science': {
        gradient: 'from-orange-600 via-red-600 to-pink-600',
        accent: 'bg-orange-500',
        ring: 'ring-orange-300'
      },
      'English': {
        gradient: 'from-blue-600 via-cyan-600 to-sky-600',
        accent: 'bg-blue-500',
        ring: 'ring-blue-300'
      },
      'NEET': {
        gradient: 'from-red-600 via-pink-600 to-rose-600',
        accent: 'bg-red-500',
        ring: 'ring-red-300'
      }
    };
    return themes[subjectName] || themes['Mathematics'];
  };

  const theme = getSubjectTheme(subject);

  /**
   * Parse options from question text when options array is invalid
   * Handles formats like "1. Option 2. Option" or "A. Option B. Option"
   */
  const parseOptionsFromQuestion = (questionText: string): string[] => {
    // Try to find options in various formats
    // Pattern 1: "1. Option 2. Option 3. Option 4. Option" (handles spaces between numbers)
    // Improved pattern to handle cases like "1. Species 2. Family 3. Class 4. Division"
    const pattern1 = /(\d+)\.\s*([^\d]+?)(?=\s+\d+\.|$)/g;
    const matches1 = [...questionText.matchAll(pattern1)];

    if (matches1.length >= 2) {
      const options = matches1.map(match => match[2].trim()).filter(opt => opt.length > 0);
      if (options.length >= 2) {
        return options;
      }
    }

    // Pattern 2: "A. Option B. Option C. Option D. Option"
    const pattern2 = /([A-D])\.\s*([^A-D]+?)(?=\s+[A-D]\.|$)/g;
    const matches2 = [...questionText.matchAll(pattern2)];

    if (matches2.length >= 2) {
      const options = matches2.map(match => match[2].trim()).filter(opt => opt.length > 0);
      if (options.length >= 2) {
        return options;
      }
    }

    // Pattern 3: Look for numbered list anywhere in question (more flexible)
    // Handles cases where options are embedded in the question text
    const pattern3 = /(\d+)\.\s*([^\d\n]+?)(?=\s+\d+\.|\s*$)/g;
    const matches3 = [...questionText.matchAll(pattern3)];

    if (matches3.length >= 2) {
      const options = matches3.map(match => match[2].trim()).filter(opt => opt.length > 0);
      if (options.length >= 2) {
        return options;
      }
    }

    // Pattern 4: Try to extract options from end of question text
    // Split by numbers at the end: "1. Species 2. Family 3. Class 4. Division"
    const endPattern = /(\d+)\.\s*([A-Za-z\s]+?)(?=\s+\d+\.|$)/g;
    const endMatches = [...questionText.matchAll(endPattern)];

    if (endMatches.length >= 2) {
      const options = endMatches.map(match => match[2].trim()).filter(opt => opt.length > 0);
      if (options.length >= 2) {
        return options;
      }
    }

    return [];
  };

  /**
   * Get processed options - parse from question text if options are invalid
   */
  const getProcessedOptions = (): string[] => {
    if (!question) return [];

    // Check if options contain the error message or are invalid
    const hasParsingError = question.options.some(opt =>
      opt.toLowerCase().includes('option parsing failed') ||
      opt.toLowerCase().includes('parsing failed') ||
      opt.trim().length === 0
    );

    // Also check if options array is empty or has only one option
    const hasInvalidOptions = question.options.length === 0 ||
      question.options.length === 1 ||
      hasParsingError;

    // Try to parse from question text if options are invalid
    if (hasInvalidOptions && question.question) {
      const parsedOptions = parseOptionsFromQuestion(question.question);
      if (parsedOptions.length >= 2) {
        return parsedOptions;
      }
    }

    // Return original options if parsing failed or options are valid
    return question.options.filter(opt => opt.trim().length > 0);
  };

  const processedOptions = getProcessedOptions();

  /**
   * Handle answer selection by user
   * Updates selected answer state and provides visual feedback
   */
  const handleAnswerSelect = (answer: string) => {
    if (!isSubmitted && !isAnswered) {
      setSelectedAnswer(answer);
    }
  };

  /**
   * Handle answer submission and validation
   * Checks if answer is correct and triggers callback
   */
  const handleSubmit = useCallback(() => {
    if (!question || isSubmitted || isAnswered) return;

    // Get processed options for this question
    const currentOptions = getProcessedOptions();

    // Check if answer matches (handle various formats)
    let correct = selectedAnswer === question.correctAnswer ||
      selectedAnswer.trim() === question.correctAnswer.trim();

    // If direct match fails, try to match by option content or index
    if (!correct) {
      // Check if correctAnswer is a letter/number reference (e.g., "1. Species" or "A. Species")
      const correctAnswerMatch = question.correctAnswer.match(/^([A-D1-4])\.?\s*(.+)$/);
      if (correctAnswerMatch) {
        const [, letterOrNum, answerText] = correctAnswerMatch;
        // Check if selected answer matches the text part
        correct = selectedAnswer.trim() === answerText.trim() ||
          selectedAnswer.includes(answerText) ||
          answerText.includes(selectedAnswer);

        // Also check by index
        if (!correct) {
          const letterToIdx = letterOrNum === 'A' || letterOrNum === '1' ? 0 :
            letterOrNum === 'B' || letterOrNum === '2' ? 1 :
              letterOrNum === 'C' || letterOrNum === '3' ? 2 : 3;
          if (currentOptions[letterToIdx]) {
            correct = selectedAnswer === currentOptions[letterToIdx] ||
              selectedAnswer.trim() === currentOptions[letterToIdx].trim();
          }
        }
      } else {
        // Try partial matching
        correct = question.correctAnswer.includes(selectedAnswer) ||
          selectedAnswer.includes(question.correctAnswer);
      }
    }

    setIsSubmitted(true);

    // Show explanation automatically for incorrect answers
    if (!correct) {
      setShowExplanation(true);
    } else {
      // For correct answers, show confirmation popup after a brief delay
      setTimeout(() => {
        setShowExplanationConfirmPopup(true);
      }, 1000);
    }

    // Trigger callback to parent component
    onAnswerSubmit(selectedAnswer, correct);
  }, [question, isSubmitted, isAnswered, selectedAnswer, onAnswerSubmit, getProcessedOptions]);

  /**
   * Handle explanation request for correct answers (when user clicks Yes)
   */
  const handleExplanationConfirmYes = () => {
    setShowExplanationConfirmPopup(false);
    if (question && onExplanationRequest) {
      setShowExplanation(true);
      onExplanationRequest(question);
    }
  };

  /**
   * Handle explanation decline for correct answers (when user clicks No)
   */
  const handleExplanationConfirmNo = () => {
    setShowExplanationConfirmPopup(false);
    if (onExplanationDecline) {
      onExplanationDecline();
    }
  };

  /**
   * Reset component state when question changes or popup opens
   * Only reset when question ID or index actually changes, not when question object is updated
   */
  useEffect(() => {
    if (isOpen && question) {
      const currentQuestionId = question.id;
      const questionChanged = prevQuestionIdRef.current !== currentQuestionId;

      // Only reset if this is a new question (different ID) or popup just opened
      if (questionChanged || prevQuestionIdRef.current === null) {
        setSelectedAnswer('');
        setIsSubmitted(false);
        setShowExplanation(false);
        setShowExplanationConfirmPopup(false);
        setTimeLeft(60);
        prevQuestionIdRef.current = currentQuestionId;
      }
    } else if (!isOpen) {
      // Reset ref when popup closes
      prevQuestionIdRef.current = null;
    }
  }, [isOpen, question?.id, currentQuestionIndex]);

  /**
   * Handle countdown timer for question answering
   * Timer stops once answer is submitted to preserve images and explanation
   */
  useEffect(() => {
    if (isOpen && !isSubmitted && timeLeft > 0 && !isAnswered) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Will trigger auto-submit in next effect
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    // Timer stops when submitted or answered - images will persist
  }, [isOpen, isSubmitted, timeLeft, isAnswered]);

  /**
   * Auto-submit when timer reaches zero
   */
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitted && !isAnswered && question && isOpen) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, isAnswered, question, isOpen, handleSubmit]);

  /**
   * Handle popup close with proper cleanup
   */
  const handleClose = () => {
    setSelectedAnswer('');
    setIsSubmitted(false);
    setTimeLeft(60);
    onClose();
  };

  /**
   * Handle "Continue" button click
   * Decides whether to close the quiz or advance to the next question
   */
  const handleContinueClick = () => {
    // Only call the avatar speech for the final "Continue Learning" after quiz completion
    if (isQuizComplete) {
      // Call the callback to make the avatar speak before continuing
      if (onContinueLearning) {
        onContinueLearning();
      }
      handleClose(); // Close the popup if the quiz is complete
    } else if (onNextQuestion) {
      onNextQuestion(); // Advance to the next question if available
    } else {
      handleClose(); // Fallback to close if no next question handler
    }
  };

  // Don't render if not open or no question data
  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      {/* Popup Container with Animation */}
      <div className={`
        relative bg-gradient-to-br ${theme.gradient}
        rounded-3xl shadow-2xl border border-white/20
        max-w-2xl w-full mx-4
        max-h-[90vh] flex flex-col overflow-hidden
        transform transition-all duration-500 ease-out
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
        {/* Modern Glass Effect Overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl"></div>

        {/* Scrollable Content Container */}
        <div className="relative z-10 overflow-y-auto flex-1 min-h-0 p-8 pb-6">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${theme.accent} animate-pulse`}></div>
                <h2 className="text-xl font-bold text-white">
                  {subject} Question {totalQuestions > 1 ? `(${currentQuestionIndex + 1}/${totalQuestions})` : ''}
                </h2>
              </div>
              {/* Section Information for NEET AI Examiner */}
              {question.section && (
                <div className="ml-6 space-y-2">
                  <div className="text-sm text-white/90 font-medium">
                    Section {question.section} - Question {question.sectionQuestionIndex || currentQuestionIndex + 1} of 10
                  </div>
                  {/* Section Progress Bar - Shows progress within current section (1-10) */}
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((question.sectionQuestionIndex || currentQuestionIndex + 1) / 10) * 100}%` }}
                    ></div>
                  </div>
                  {/* Section Progress Indicators - Shows which section you're in */}
                  <div className="flex gap-2">
                    {[1, 2, 3].map((sectionNum) => (
                      <div
                        key={sectionNum}
                        className={`flex-1 h-1.5 rounded-full transition-all ${sectionNum === question.section
                          ? 'bg-blue-400'
                          : sectionNum < question.section!
                            ? 'bg-green-500'
                            : 'bg-white/20'
                          }`}
                      ></div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timer Display - Only show if question is not answered */}
            {!isAnswered && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                  <Clock className="w-4 h-4 text-white" />
                  <span className={`text-white font-bold ${timeLeft <= 10 ? 'text-red-300 animate-pulse' : ''}`}>
                    {timeLeft}s
                  </span>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  aria-label="Close Question"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
          </div>

          {/* Question Section - For NEET AI Examiner: show image only, for others: show text + image */}
          <div className="mb-8">
            {/* For NEET AI Examiner: Hide text when image exists, show only image */}
            {subject === 'NEET AI Examiner' && question.image && question.imageContentType ? (
              <div className="rounded-lg overflow-hidden border-2 border-white/20 flex justify-center">
                <img
                  src={`data:${question.imageContentType};base64,${question.image}`}
                  alt="Question illustration"
                  className="max-w-full h-auto max-h-[500px] object-contain bg-white/5"
                  loading="eager"
                />
              </div>
            ) : (
              /* For other subjects or when no image: Show text (and image if available) */
              <>
                <p className="text-lg text-white leading-relaxed font-medium">
                  {formatScientificText(question.question)}
                </p>
                {/* Display image if available (for non-NEET AI Examiner subjects) */}
                {question.image && question.imageContentType && (
                  <div className="mt-4 rounded-lg overflow-hidden border-2 border-white/20 flex justify-center">
                    <img
                      src={`data:${question.imageContentType};base64,${question.image}`}
                      alt="Question illustration"
                      className="max-w-full h-auto max-h-[500px] object-contain bg-white/5"
                      loading="eager"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Answer Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {processedOptions.map((option, index) => {
              const isSelected = selectedAnswer === option;
              // Check if this option matches the correct answer (handle both formats)
              const isCorrectOption = option === question.correctAnswer ||
                option.trim() === question.correctAnswer.trim() ||
                (question.correctAnswer.includes(option) && option.length > 5);
              const showCorrect = isSubmitted && isCorrectOption;
              const showIncorrect = isSubmitted && isSelected && !isCorrectOption;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isSubmitted || isAnswered}
                  className={`
                    relative p-6 rounded-2xl text-left transition-all duration-300
                    border-2 border-white/20
                    ${isSelected ? `${theme.ring} ring-4 bg-white/20` : 'bg-white/10 hover:bg-white/20'}
                    ${showCorrect ? 'ring-4 ring-green-300 bg-green-500/30 border-green-400' : ''}
                    ${showIncorrect ? 'ring-4 ring-red-300 bg-red-500/30 border-red-400' : ''}
                    ${(isSubmitted || isAnswered) && !isSelected && !isCorrectOption ? 'opacity-70' : ''}
                    transform hover:scale-105 active:scale-95
                    disabled:cursor-not-allowed
                  `}
                >
                  {/* Option Text */}
                  <span className="text-white font-medium block">
                    {formatScientificText(option)}
                  </span>

                  {/* Status Icons */}
                  {showCorrect && (
                    <CheckCircle className="absolute -top-2 -right-2 w-8 h-8 text-green-300 bg-green-700 rounded-full p-1" />
                  )}
                  {showIncorrect && (
                    <XCircle className="absolute -top-2 -right-2 w-8 h-8 text-red-300 bg-red-700 rounded-full p-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Submit Button - Immediately after options */}
          {!isSubmitted && (
            <div className="flex justify-end mb-8">
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className={`
                  px-8 py-3 rounded-full font-semibold transition-all duration-300
                  ${selectedAnswer
                    ? 'bg-white text-gray-800 hover:bg-gray-100 hover:scale-105'
                    : 'bg-white/30 text-white/70 cursor-not-allowed'
                  }
                  transform active:scale-95
                `}
              >
                Submit Answer
              </button>
            </div>
          )}

          {/* Continue Button - Show after submission */}
          {isSubmitted && (isAnswered || isQuizComplete || showExplanation || !showExplanationConfirmPopup) && (
            <div className="flex justify-end mb-8">
              <button
                onClick={handleContinueClick}
                className="px-8 py-3 bg-white text-gray-800 rounded-full font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-300 transform active:scale-95"
              >
                {isQuizComplete ? 'Continue Learning' : 'Next Question'}
              </button>
            </div>
          )}

          {/* Explanation Section - Show after submission for incorrect answers or when requested for correct answers */}
          {isSubmitted && showExplanation && (question.explanation || (question.answerImage && question.answerImageContentType)) && (
            <div className="mt-8 p-6 bg-white/10 rounded-2xl border border-white/20">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
                Explanation
              </h3>
              {/* Display answer image if available */}
              {question.answerImage && question.answerImageContentType && (
                <div className={`rounded-lg overflow-hidden border-2 border-white/20 flex justify-center ${question.explanation ? 'mt-4' : ''}`}>
                  <img
                    src={`data:${question.answerImageContentType};base64,${question.answerImage}`}
                    alt="Answer illustration"
                    className="max-w-full h-auto max-h-[500px] object-contain bg-white/5"
                    loading="eager"
                  />
                </div>
              )}
              {question.explanation && (
                <FormattedText content={formatTextForMarkdown(question.explanation)} className="text-white/90 leading-relaxed mb-4" />
              )}

            </div>
          )}
        </div>

        {/* Fixed Footer with Progress Indicator Only - Submit button removed */}
        <div className={`relative z-10 border-t border-white/30 bg-black/20 backdrop-blur-sm px-8 py-4 flex justify-between items-center flex-shrink-0`}>
          {/* Progress Indicator */}
          <div className="flex items-center space-x-2">
            {totalQuestions > 1 && (
              <div className="flex space-x-1">
                {/* For NEET AI Examiner: Show only 10 dots per section */}
                {question.section && question.sectionQuestionIndex ? (
                  // Section-wise progress: Show 10 dots for current section
                  Array.from({ length: 10 }).map((_, index) => {
                    const sectionQuestionNum = index + 1;
                    const isCurrent = sectionQuestionNum === question.sectionQuestionIndex;
                    const isCompleted = sectionQuestionNum < question.sectionQuestionIndex!;
                    return (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${isCurrent
                          ? 'bg-white w-4'
                          : isCompleted
                            ? 'bg-green-400'
                            : 'bg-white/40'
                          }`}
                      />
                    );
                  })
                ) : (
                  // For other subjects: Show all questions
                  Array.from({ length: totalQuestions }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentQuestionIndex
                        ? 'bg-white w-4'
                        : index < currentQuestionIndex
                          ? 'bg-green-400'
                          : 'bg-white/40'
                        }`}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Explanation Confirmation Popup - Show when answer is correct */}
        {showExplanationConfirmPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 border border-gray-200">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Excellent! Correct Answer!
                </h3>
                <p className="text-gray-600 mb-6">
                  Do you want to see the explanation?
                </p>
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={handleExplanationConfirmYes}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={handleExplanationConfirmNo}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-700 transition-colors"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

