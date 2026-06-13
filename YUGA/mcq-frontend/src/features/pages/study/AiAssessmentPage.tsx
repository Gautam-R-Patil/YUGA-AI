import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { api } from '../../../core/utils/api';
import { useToast } from '../../../core/contexts';
import { CBTInterface } from '../../course/components/CBTInterface';
import { NEETPracticeInterface } from '../../course/components/NEETPracticeInterface';

interface Question {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
    subject: string;
    topic: string;
    text?: string;
    correct_answer?: string;
    basic_answer?: string;
    sub_topic?: string;
}

interface AssessmentResponse {
    title: string;
    difficulty: string;
    questions: Question[];
    existing?: boolean;
    completed?: boolean;
    score?: number;
}

export const AiAssessmentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();
    const { type, subject } = location.state || {};

    const [loading, setLoading] = useState(true);
    const [assessment, setAssessment] = useState<AssessmentResponse | null>(null);
    const [score, setScore] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);

    useEffect(() => {
        if (!type) {
            fetchAssessment('quiz', 'General Science');
            return;
        }
        fetchAssessment(type, subject);
    }, [type, subject]);

    const fetchAssessment = async (assessmentType: string, assessmentSubject?: string) => {
        try {
            setLoading(true);
            const response = await api.post<AssessmentResponse>('/ai-assessment/generate', {
                type: assessmentType,
                subject: assessmentSubject
            });
            setAssessment(response.data);

            if (response.data.existing && response.data.completed) {
                setScore(response.data.score || 0);
                setIsCompleted(true);
                toast.success("Loaded your completed assessment for today.");
            }
        } catch (error) {
            console.error("Failed to generate assessment", error);
            toast.error("Failed to generate AI assessment. Please try again.");
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const submitScore = async (finalScore: number) => {
        try {
            await api.post('/ai-assessment/submit', {
                type: type,
                score: finalScore
            });
        } catch (error) {
            console.error("Failed to submit score", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Generating personalized assessment...</h2>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                    Analyzing your learning history to create the perfect challenge.
                </p>
            </div>
        );
    }

    if (!assessment) return null;

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-900/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-200/40 dark:bg-blue-900/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
                </div>

                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/50 dark:border-slate-700 rounded-3xl p-8 max-w-2xl w-full text-center shadow-2xl relative z-10">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Assessment Completed!</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        Great job attempting this {assessment.difficulty} level assessment.
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Score</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">
                                <span className="text-blue-600">{score}</span>/{assessment.questions.length}
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Accuracy</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">
                                {Math.round((score / assessment.questions.length) * 100)}%
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Time</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">
                                {Math.floor(timeElapsed / 60)}m {timeElapsed % 60}s
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (type === 'mock' && assessment) {
        return (
            <CBTInterface
                mockId="weekly-ai-mock"
                questionsData={assessment.questions}
                onClose={() => navigate('/')}
                onComplete={(results) => {
                    setIsCompleted(true);
                    setScore(results.score);
                    setTimeElapsed(results.timeTaken || 0);
                    submitScore(results.score);
                }}
            />
        );
    }

    if (assessment) {
        const practiceQuestions = assessment.questions.map((q, idx) => ({
            id: `ai-q-${idx}`,
            question: q.text || q.question,
            options: q.options,
            correctAnswer: q.correct_answer || q.answer,
            subject: q.subject,
            sub_topic: q.sub_topic || q.topic,
            difficulty: (assessment.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
            explanation: q.explanation,
            basicAnswer: q.basic_answer,
        }));

        return (
            <NEETPracticeInterface
                mode="assessment"
                questionsData={practiceQuestions}
                onComplete={(results) => {
                    setScore(results.score);
                    setTimeElapsed(results.timeTaken || 0);
                    setIsCompleted(true);
                    if (!assessment.completed) {
                        submitScore(results.score);
                    }
                }}
                onExit={() => navigate('/')}
            />
        );
    }

    return null;
};
