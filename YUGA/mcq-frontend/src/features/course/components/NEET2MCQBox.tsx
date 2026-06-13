// NEET2MCQBox.tsx
// Updated with FormattedText support for LaTeX
import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, HelpCircle, Volume2, VolumeX, ArrowRight, RotateCcw } from "lucide-react";
import { formatScientificText, formatTextForMarkdown } from "../../../core/utils/textFormatting";
import { FormattedText } from "../../../shared/components/FormattedText";

interface NEET2MCQBoxProps {
  question: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    image?: string; // Base64 encoded image for question
    imageContentType?: string; // MIME type for question (e.g., 'image/png', 'image/jpeg')
    answerImage?: string; // Base64 encoded image for answer/explanation
    answerImageContentType?: string; // MIME type for answer (e.g., 'image/png', 'image/jpeg')
    section?: number; // Section number (1, 2, or 3) for NEET AI Examiner
    sectionQuestionIndex?: number; // Question index within the section (1-10)
  };
  currentQuestionIndex: number;
  totalQuestions: number;
  onAnswerSelect: (selectedAnswer: string, isCorrect: boolean) => void;
  onExplanationRequest: (question: any) => void;
  onNextQuestion: () => void;
  onTryAgain: () => void;
  explanationText: string;
  showClarityPopup: boolean;
  onClarityResponse: (isClear: boolean) => void;
  isAudioPlaying?: boolean;
  highlightedText?: string;
  onExplanationDecline?: () => void; // NEW: Handler when user declines explanation
}

export const NEET2MCQBox: React.FC<NEET2MCQBoxProps> = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  onAnswerSelect,
  onExplanationRequest,
  onNextQuestion,
  onTryAgain,
  explanationText,
  showClarityPopup,
  onClarityResponse,
  isAudioPlaying = false,
  highlightedText,
  onExplanationDecline
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
  const [showExplanationConfirmPopup, setShowExplanationConfirmPopup] = useState<boolean>(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer('');
    setIsSubmitted(false);
    setCurrentHighlightIndex(0);
    setHighlightedWords([]);
    setShowExplanationConfirmPopup(false);
  }, [question.id]);

  // Handle text highlighting during audio playback - 2x SLOWER SPEED (480ms per word)
  useEffect(() => {
    if (highlightedText && isAudioPlaying) {
      const words = highlightedText.split(' ');
      setHighlightedWords(words);
      setCurrentHighlightIndex(0);

      const interval = setInterval(() => {
        setCurrentHighlightIndex(prev => {
          if (prev >= words.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 360); // 2x slower speed: 480ms per word

      return () => clearInterval(interval);
    } else {
      setHighlightedWords([]);
      setCurrentHighlightIndex(0);
    }
  }, [highlightedText, isAudioPlaying]);

  const handleAnswerSelect = (answer: string) => {
    if (!isSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;

    const correct = selectedAnswer === question.correctAnswer;
    setIsSubmitted(true);
    onAnswerSelect(selectedAnswer, correct);

    // For correct answers, show confirmation popup asking if they want explanation
    if (correct) {
      // Show popup after a brief delay so user can see the correct answer feedback
      setTimeout(() => {
        setShowExplanationConfirmPopup(true);
      }, 1000);
    }
    // For incorrect answers, explanation will be automatically triggered by parent
  };

  const handleExplanationConfirmYes = () => {
    setShowExplanationConfirmPopup(false);
    if (onExplanationRequest) {
      onExplanationRequest(question);
    }
  };

  const handleExplanationConfirmNo = () => {
    setShowExplanationConfirmPopup(false);
    if (onExplanationDecline) {
      onExplanationDecline();
    }
  };

  const handleTryAgainClick = () => {
    setSelectedAnswer('');
    setIsSubmitted(false);
    onTryAgain();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Question Section - Fixed height with scroll */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            {question.section ? (
              <span>
                Section {question.section} - Question {question.sectionQuestionIndex || currentQuestionIndex + 1} of 10
                <span className="ml-2 text-gray-500 dark:text-gray-500">
                  (Overall: {currentQuestionIndex + 1} of {totalQuestions})
                </span>
              </span>
            ) : (
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            )}
            <span>{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
          </div>
          {/* Section indicator */}
          {question.section && (
            <div className="mb-2 flex gap-2">
              {[1, 2, 3].map((sectionNum) => (
                <div
                  key={sectionNum}
                  className={`flex-1 h-1.5 rounded-full transition-all ${sectionNum === question.section
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : sectionNum < question.section!
                      ? 'bg-green-500 dark:bg-green-600'
                      : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                ></div>
              ))}
            </div>
          )}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Text - Always visible */}
        <div className="mb-6">
          <div className="text-lg leading-relaxed font-medium text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
            <FormattedText content={formatTextForMarkdown(question.question)} />
          </div>
          {/* Display image if available */}
          {question.image && question.imageContentType && (
            <div className="mt-4 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex justify-center">
              <img
                src={`data:${question.imageContentType};base64,${question.image}`}
                alt="Question illustration"
                className="max-w-full h-auto max-h-96 object-contain"
              />
            </div>
          )}
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === question.correctAnswer;
            const showCorrect = isSubmitted && isCorrectOption;
            const showIncorrect = isSubmitted && isSelected && !isCorrectOption;
            const isDisabled = isSubmitted && !isSelected && !isCorrectOption;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={isSubmitted}
                className={`
                  relative p-4 rounded-xl text-left transition-all duration-300
                  border-2
                  ${isSelected
                    ? 'ring-4 ring-blue-200 dark:ring-blue-900 bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500'
                  }
                  ${showCorrect ? 'ring-4 ring-green-200 dark:ring-green-900/50 bg-green-50 dark:bg-green-900/40 border-green-400 dark:border-green-600' : ''}
                  ${showIncorrect ? 'ring-4 ring-red-200 dark:ring-red-900/50 bg-red-50 dark:bg-red-900/40 border-red-400 dark:border-red-600' : ''}
                  ${isDisabled ? 'opacity-50' : ''}
                  transform hover:scale-105 active:scale-95
                  disabled:cursor-not-allowed
                `}
              >
                {/* Option Text */}
                <span className={`font-medium block ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-800 dark:text-gray-200'} ${showCorrect ? 'text-green-900 dark:text-green-100' : ''} ${showIncorrect ? 'text-red-900 dark:text-red-100' : ''}`}>
                  {formatScientificText(option)}
                </span>

                {/* Status Icons */}
                {showCorrect && (
                  <CheckCircle className="absolute -top-2 -right-2 w-8 h-8 text-green-500 bg-white dark:bg-slate-800 rounded-full p-1 border-2 border-green-500" />
                )}
                {showIncorrect && (
                  <XCircle className="absolute -top-2 -right-2 w-8 h-8 text-red-500 bg-white dark:bg-slate-800 rounded-full p-1 border-2 border-red-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center
                ${selectedAnswer
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-blue-700 hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
                transform active:scale-95
              `}
            >
              Submit Answer
            </button>
          ) : (
            <>
              {/* Try Again Button - Show when answer is incorrect */}
              {selectedAnswer !== question.correctAnswer && (
                <button
                  onClick={handleTryAgainClick}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-amber-700 hover:scale-105 transition-all duration-300 flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              )}
            </>
          )}

          {/* Show Next Question button when:
              1. Answer is wrong (always show)
              2. Answer is correct AND popup is not showing (user has made a choice)
          */}
          {isSubmitted && (selectedAnswer !== question.correctAnswer || !showExplanationConfirmPopup) && (
            <button
              onClick={onNextQuestion}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 hover:scale-105 transition-all duration-300 flex items-center ml-auto"
            >
              Next Question
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>

      {/* Explanation Section - Only appears when there's explanation */}
      {explanationText && (
        <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-900/50 max-h-48 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center">
              <HelpCircle className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
              Explanation
              {isAudioPlaying && (
                <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </h3>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
          <div className={`bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 shadow-sm transition-all duration-300 ${isAudioPlaying ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''
            }`}>
            {isAudioPlaying && highlightedWords.length > 0 ? (
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {highlightedWords.map((word, index) => (
                  <span
                    key={index}
                    className={index <= currentHighlightIndex ?
                      'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-1 rounded transition-colors duration-300' :
                      'text-gray-700 dark:text-gray-400'
                    }
                  >
                    {word}{' '}
                  </span>
                ))}
              </p>
            ) : (
              <>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {formatScientificText(explanationText)}
                </p>
                {/* Display answer image if available */}
                {question.answerImage && question.answerImageContentType && (
                  <div className="mt-4 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex justify-center">
                    <img
                      src={`data:${question.answerImageContentType};base64,${question.answerImage}`}
                      alt="Answer illustration"
                      className="max-w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}


      {/* Explanation Confirmation Popup - Show when answer is correct */}
      {showExplanationConfirmPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm mx-4 border border-gray-200 dark:border-slate-700">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Excellent! Correct Answer!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Do you want to see the explanation?
              </p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={handleExplanationConfirmYes}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-colors shadow-lg"
                >
                  Yes
                </button>
                <button
                  onClick={handleExplanationConfirmNo}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-700 transition-colors shadow-lg"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clarity Popup - Must show after explanation */}
      {showClarityPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm mx-4 border border-gray-200 dark:border-slate-700">
            <div className="text-center">
              <HelpCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Explanation Complete
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Is the explanation clear?
              </p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => onClarityResponse(true)}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-colors shadow-lg"
                >
                  Yes
                </button>
                <button
                  onClick={() => onClarityResponse(false)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-700 transition-colors shadow-lg"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
