import React from 'react';
import { HelpCircle } from 'lucide-react';

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
}

interface QuizComponentProps {
    questions: Question[];
    onComplete: (score: number) => void;
}

export const QuizComponent: React.FC<QuizComponentProps> = ({ questions, onComplete }) => {
    return (
        <div className="p-6 bg-white rounded-xl border border-gray-200 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Quiz Component</h3>
            <p className="text-gray-500 mb-4">This component is under development.</p>
            <button
                onClick={() => onComplete(questions.length)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Simulate Completion (100%)
            </button>
        </div>
    );
};
