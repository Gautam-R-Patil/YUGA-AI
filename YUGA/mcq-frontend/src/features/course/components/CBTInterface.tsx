import React, { useState, useEffect, useRef } from "react";
import {
    Maximize2,
    Minimize2,
    AlertCircle,
    CheckCircle2,
    User,
    Clock,
    BookOpen,
    ChevronRight,
    Menu,
    X,
    MessageSquare
} from "lucide-react";
import { ReportQuestionModal } from "../../../shared/components/ReportQuestionModal";
import { apiRequest } from "../../../core/utils/api";
import { formatScientificText } from "../../../core/utils/textFormatting";

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    subject: string;
    topic?: string;
    sub_topic?: string;
    difficulty?: string;
    hasImage?: boolean;
    images?: Array<{
        filename: string;
        base64: string;
    }>;
}

interface QuestionStatus {
    status: 'NOT_VISITED' | 'NOT_ANSWERED' | 'ANSWERED' | 'MARKED' | 'ANSWERED_MARKED';
    selectedAnswer: string | null;
    timeTaken: number;
}

interface CBTInterfaceProps {
    mockId: string;
    onClose: () => void;
    onComplete: (results: any) => void;
    questionsData?: any[]; // NEW: Allow passing questions directly (e.g. from AI)
}

const CBTInterface: React.FC<CBTInterfaceProps> = ({ mockId, onClose, onComplete, questionsData }) => {
    // Exam State
    const [hasStarted, setHasStarted] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [qStatus, setQStatus] = useState<Record<number, QuestionStatus>>({});
    const [activeSubject, setActiveSubject] = useState<string>('Physics');

    // Default to 40 mins for Micro Mocks (neet-mock-), else 180 mins.
    const [timeLeft, setTimeLeft] = useState(180 * 60);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Enforce 40 minute timer for all NEET mock IDs (Micro Series)
        if (mockId.toLowerCase().includes('neet')) {
            setTimeLeft(40 * 60);
        }
    }, [mockId]);

    // Answer State
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Ultra-Premium Loading Animation State
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [currentLoadingMessage, setCurrentLoadingMessage] = useState("Initializing secure environment...");



    useEffect(() => {
        if (isLoading) {
            const messages = [
                "Establishing secure connection to YUGA servers...",
                "Accessing 5000+ Question Bank...",
                "Finalizing questions from 5000+ questions...",
                "Calibrating difficulty parameters...",
                "Verifying question integrity & assets...",
                "Preparing your personalized exam environment..."
            ];

            setLoadingProgress(0);

            const interval = setInterval(() => {
                setLoadingProgress(prev => {
                    const diff = Math.random() * 8; // Random jump
                    const newProgress = Math.min(prev + diff, 98); // Cap at 98 until real load finishes

                    // Update message based on progress bracket
                    const msgIndex = Math.floor((newProgress / 100) * messages.length);
                    setCurrentLoadingMessage(messages[Math.min(msgIndex, messages.length - 1)]);

                    return newProgress;
                });
            }, 300);

            return () => clearInterval(interval);
        }
    }, [isLoading]);

    // Derived State
    const subjects = ['Physics', 'Chemistry', 'Botany', 'Zoology'];


    // If exact subject match fails (e.g. backend uses different names), fallback to grouping
    // This effect handles the initial load and subject grouping robustly
    const [groupedIndices, setGroupedIndices] = useState<Record<string, number[]>>({ Physics: [], Chemistry: [], Botany: [], Zoology: [] });

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            setLoadingProgress(10); // Start

            try {
                let data = [];

                if (questionsData && questionsData.length > 0) {
                    // CASE 1: Use provided data (e.g. AI Weekly Mock)
                    setLoadingProgress(50);
                    data = questionsData;
                    setLoadingProgress(80);
                } else {
                    // CASE 2: Fetch from Backend (Standard Mocks)
                    // Use mockId as the subject parameter to trigger backend customization
                    setLoadingProgress(30); // Pre-fetch
                    const response = await apiRequest(`/mcq/subject/${encodeURIComponent(mockId)}`);
                    setLoadingProgress(60); // Received Response

                    data = await response.json();
                    setLoadingProgress(75); // Parsed JSON
                }

                    if (Array.isArray(data)) {
                    setLoadingProgress(85); // Validating
                    // For sample mock, select a balanced short sample so students see all sections
                    if (mockId === 'neet-mock-sample' && !questionsData) {
                        // If backend returned a full sample (e.g., 20 questions), show them all.
                        // Use the old balanced 10-question sampling only when the dataset is small.
                        if (data.length <= 10) {
                            const groups: Record<string, any[]> = { Physics: [], Chemistry: [], Botany: [], Zoology: [], Other: [] };
                            data.forEach((q: any) => {
                                const sub = (q.subject || '').toLowerCase();
                                if (sub.includes('physics')) groups.Physics.push(q);
                                else if (sub.includes('chemistry')) groups.Chemistry.push(q);
                                else if (sub.includes('botany')) groups.Botany.push(q);
                                else if (sub.includes('zoology')) groups.Zoology.push(q);
                                else groups.Other.push(q);
                            });

                            const take = (arr: any[], n: number) => arr.slice(0, n);
                            const sampled = [
                                ...take(groups.Physics, 3),
                                ...take(groups.Chemistry, 3),
                                ...take(groups.Botany, 2),
                                ...take(groups.Zoology, 2)
                            ].filter(Boolean);

                            if (sampled.length < 10) {
                                const remaining = data.filter(d => !sampled.includes(d));
                                sampled.push(...remaining.slice(0, 10 - sampled.length));
                            }

                            data = sampled.slice(0, 10);
                        } else {
                            // Keep full dataset as provided by backend (e.g., 20 questions)
                        }
                    }

                    // Normalize subjects for the mock
                    const processedData = data.map((q: any) => ({
                        ...q,
                        // Normalize fields from backend/paper JSON
                        question: q.question || q.text || q.question_text || '',
                        options: Array.isArray(q.options) ? q.options : (q.opts || []),
                        correctAnswer: q.correctAnswer || q.correct_answer || q.answer || '',
                        images: q.images || q.images_list || [],
                        subject: q.subject || q.subject_name || 'Physics'
                    }));

                    // Filter out questions with duplicate options and broken matching questions
                    const validQuestions = processedData.filter((q: any) => {
                        if (!q.options || !Array.isArray(q.options)) return false;

                        // Filter out broken "Match Column" questions
                        if (/Match\s+(Column|List)/i.test(q.question)) return false;

                        const uniqueOptions = new Set(q.options.map((o: string) => o.trim()));
                        return uniqueOptions.size === q.options.length;
                    });

                    setLoadingProgress(95); // Nearly done

                    setQuestions(validQuestions);

                    // Initialize Status
                    setQStatus(
                        Object.fromEntries(processedData.map((_: any, i: number) => [i, { status: 'NOT_VISITED', selectedAnswer: null, timeTaken: 0 }]))
                    );

                    // Robust Grouping Indices (Case-Insensitive)
                    const groups: Record<string, number[]> = { Physics: [], Chemistry: [], Botany: [], Zoology: [] };
                    processedData.forEach((q: any, i: number) => {
                        const sub = (q.subject || 'Physics').toLowerCase();
                        if (sub.includes('physics')) groups.Physics.push(i);
                        else if (sub.includes('chemistry')) groups.Chemistry.push(i);
                        else if (sub.includes('botany')) groups.Botany.push(i);
                        else if (sub.includes('zoology')) groups.Zoology.push(i);
                        else groups.Botany.push(i); // Fallback to Botany if unknown biology component
                    });
                    setGroupedIndices(groups);

                    // Auto-switch active subject if Physics is empty but others are not
                    if (groups.Physics.length === 0) {
                        if (groups.Chemistry.length > 0) setActiveSubject('Chemistry');
                        else if (groups.Botany.length > 0) setActiveSubject('Botany');
                        else if (groups.Zoology.length > 0) setActiveSubject('Zoology');
                    }
                }
            } catch (error) {
                console.error("Failed to fetch questions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestions();

        window.history.pushState(null, "", window.location.href);
        const handlePopState = () => {
            if (window.confirm("You are in an active exam! Do you want to exit? All progress will be lost.")) {
                onClose();
            } else {
                window.history.pushState(null, "", window.location.href);
            }
        };
        window.addEventListener('popstate', handlePopState);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // Timer Logic - Starts only after instructions
    useEffect(() => {
        if (hasStarted && !timerRef.current) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 0) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        handleSubmit(true); // Auto submit
                        return 0;
                    }
                    return prev - 1;
                });

                // Increment timeTaken for the currently active question
                setQStatus(prev => {
                    const currentStatus = prev[currentQuestionIndex];
                    if (currentStatus) {
                        return {
                            ...prev,
                            [currentQuestionIndex]: {
                                ...currentStatus,
                                timeTaken: (currentStatus.timeTaken || 0) + 1
                            }
                        };
                    }
                    return prev;
                });
            }, 1000);

            // Mark first question as visited
            if (questions.length > 0) {
                setQStatus(prev => ({
                    ...prev,
                    [0]: { ...prev[0], status: prev[0]?.status === 'NOT_VISITED' ? 'NOT_ANSWERED' : prev[0]?.status }
                }));
            }
        }
    }, [hasStarted, questions.length]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => console.error(e));
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const updateStatus = (index: number, status: QuestionStatus['status'], answer: string | null = null) => {
        setQStatus(prev => ({
            ...prev,
            [index]: {
                ...prev[index], // Preserve timeTaken
                status,
                selectedAnswer: answer !== null ? answer : prev[index]?.selectedAnswer || null
            }
        }));
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
    };

    // Navigation Logic
    const goToQuestion = (index: number) => {
        if (index < 0 || index >= questions.length) return;

        // Update status of current question before leaving
        // If it was NOT_VISITED, it becomes NOT_ANSWERED (red) automatically when visited
        // NTA logic: Visiting a question makes it Not Answered (Red) unless answered.

        // Mark destination as NOT_ANSWERED if it was NOT_VISITED
        if (qStatus[index]?.status === 'NOT_VISITED') {
            updateStatus(index, 'NOT_ANSWERED');
        }

        setCurrentQuestionIndex(index);
        setSelectedOption(qStatus[index]?.selectedAnswer || null);

        // Switch active subject tab if needed
        const qSub = (questions[index].subject || 'Physics').toLowerCase();
        let newSub = 'Physics';
        if (qSub.includes('chemistry')) newSub = 'Chemistry';
        else if (qSub.includes('botany') || qSub.includes('biology')) newSub = 'Botany';
        else if (qSub.includes('zoology')) newSub = 'Zoology';

        if (newSub !== activeSubject) setActiveSubject(newSub);

        // On mobile, close sidebar after selection
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };

    const handleSaveAndNext = () => {
        if (selectedOption) {
            updateStatus(currentQuestionIndex, 'ANSWERED', selectedOption);
            goToNext();
        } else {
            // NTA: Save & Next without an option is treated as just visiting next
            // But usually validation prevents it or it just moves. 
            // We'll mark current as NOT_ANSWERED (Red)
            updateStatus(currentQuestionIndex, 'NOT_ANSWERED');
            goToNext();
        }
    };

    const handleClearResponse = () => {
        setSelectedOption(null);
        updateStatus(currentQuestionIndex, 'NOT_ANSWERED', null); // Cleared answer -> Not Answered
    };

    const handleSaveAndMarkForReview = () => {
        if (selectedOption) {
            updateStatus(currentQuestionIndex, 'ANSWERED_MARKED', selectedOption);
            goToNext();
        } else {
            // Logic: Without answer, it's just Mark for Review
            handleMarkForReviewAndNext();
        }
    };

    const handleMarkForReviewAndNext = () => {
        // Keeps answer if selected, but marks blue
        if (selectedOption) {
            updateStatus(currentQuestionIndex, 'ANSWERED_MARKED', selectedOption);
        } else {
            updateStatus(currentQuestionIndex, 'MARKED', null);
        }
        goToNext();
    };

    const goToNext = () => {
        // Logic to find next index
        // Should we stay in subject? Yes, usually.
        // But if end of subject, move to next subject? NTA usually continues sequence.
        // We will just go to index + 1
        if (currentQuestionIndex < questions.length - 1) {
            goToQuestion(currentQuestionIndex + 1);
        }
    };

    const goToBack = () => {
        if (currentQuestionIndex > 0) {
            goToQuestion(currentQuestionIndex - 1);
        }
    };

    const handleSubjectChange = (subject: string) => {
        setActiveSubject(subject);
        // Jump to first question of this subject
        const firstIdx = groupedIndices[subject]?.[0];
        if (firstIdx !== undefined) {
            goToQuestion(firstIdx);
        }
    };

    const handleSubmit = (auto = false) => {
        const answered = Object.values(qStatus).filter(s => s.status === 'ANSWERED' || s.status === 'ANSWERED_MARKED').length;
        if (auto || window.confirm(`You have answered ${answered} out of ${questions.length} questions. Are you sure you want to finish the exam?`)) {

            // Calculate Score
            let score = 0;
            let correctCount = 0;
            let wrongCount = 0;

            questions.forEach((q, idx) => {
                const status = qStatus[idx];
                if (status && (status.status === 'ANSWERED' || status.status === 'ANSWERED_MARKED') && status.selectedAnswer) {
                    if (status.selectedAnswer === q.correctAnswer) {
                        score += 1;
                        correctCount++;
                    } else {
                        // Removed negative marking for simplicity as requested (1 mark per question)
                        wrongCount++;
                    }
                }
            });

            const results = {
                mockId,
                totalQuestions: questions.length,
                answered,
                marked: Object.values(qStatus).filter(s => s.status === 'MARKED' || s.status === 'ANSWERED_MARKED').length,
                unvisited: Object.values(qStatus).filter(s => s.status === 'NOT_VISITED').length,
                score,
                correctCount,
                wrongCount,
                questions,
                userAnswers: qStatus,
                timestamp: Date.now()
            };

            // Sync to Backend for Learning Analytics
            const syncToBackend = async () => {
                try {
                    const attempts = questions.map((q, idx) => {
                        const status = qStatus[idx];
                        if (!status || !status.selectedAnswer) return null;

                        return {
                            questionId: q.id,
                            subject: q.subject,
                            topic: q.topic || q.sub_topic || 'General',
                            difficulty: q.difficulty || 'Medium',
                            isCorrect: status.selectedAnswer === q.correctAnswer,
                            timeSpent: status.timeTaken || 0,
                        };
                    }).filter(Boolean);

                    if (attempts.length > 0) {
                        await apiRequest('/learning-analytics/batch-attempt', 'POST', { attempts });
                    }
                } catch (error) {
                    console.error("Failed to sync mock results to backend:", error);
                }
            };

            syncToBackend();
            onComplete(results);
        }
    };

    const handleReportClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsReportModalOpen(true);
    };

    // --- RENDER HELPERS ---

    const StatusBox = ({ count, label, type }: { count: number, label: string, type: string }) => {
        let shapeClass = "";
        // Replicating NTA Shapes
        if (type === 'NOT_VISITED') shapeClass = "w-6 h-6 rounded bg-white border border-slate-300";
        if (type === 'NOT_ANSWERED') shapeClass = "w-6 h-6 rounded-b-[12px] rounded-t-[2px] bg-[#D9534F] text-white"; // Attempting NTA shape
        if (type === 'ANSWERED') shapeClass = "w-6 h-6 bg-[#5CB85C] text-white clip-polygon-answer";
        if (type === 'MARKED') shapeClass = "w-6 h-6 bg-[#6f42c1] text-white rounded-full";
        if (type === 'ANSWERED_MARKED') shapeClass = "w-6 h-6 bg-[#6f42c1] text-white rounded-full relative";

        return (
            <div className="flex items-center gap-2 mb-1">
                <div className={`${shapeClass} flex items-center justify-center text-[10px] font-bold shadow-sm relative shrink-0`}>
                    {type === 'ANSWERED_MARKED' && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 flex items-center justify-center bg-[#5CB85C] rounded-full border border-white text-[6px]">✓</div>}
                    {count}
                </div>
                <span className="text-[11px] font-medium text-slate-700 leading-tight">{label}</span>
            </div>
        );
    };

    const currentQ = questions[currentQuestionIndex];

    // Status counts
    const getStatusCounts = () => {
        const statuses = Object.values(qStatus).map(s => s.status);
        return {
            unvisited: statuses.filter(s => s === 'NOT_VISITED').length,
            notAnswered: statuses.filter(s => s === 'NOT_ANSWERED').length,
            answered: statuses.filter(s => s === 'ANSWERED').length,
            marked: statuses.filter(s => s === 'MARKED').length,
            ansMarked: statuses.filter(s => s === 'ANSWERED_MARKED').length
        };
    };
    const counts = getStatusCounts();

    // -- LOADING STATE --
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center font-sans select-none">
                {/* Modern Loader Design */}
                <div className="w-full max-w-md p-8 flex flex-col items-center relative">
                    {/* Floating Background Elements */}
                    <div className="absolute top-10 right-10 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-10 left-10 w-24 h-24 bg-violet-100 rounded-full blur-2xl opacity-20 animate-pulse delay-1000"></div>

                    <div className="w-24 h-24 mb-10 relative flex items-center justify-center">
                        {/* Outer Ring */}
                        <div className="absolute inset-0 border-[6px] border-purple-50 rounded-full"></div>
                        {/* Spinning Inner Ring */}
                        <div className="absolute inset-0 border-[6px] border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        {/* Logo/Icon or Percent */}
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-purple-900 font-mono">
                            {Math.round(loadingProgress)}%
                        </div>
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Setting up Exam</h3>

                    <div className="h-6 mb-8 flex items-center justify-center">
                        <p className="text-slate-500 text-sm font-medium animate-pulse text-center">
                            {currentLoadingMessage}
                        </p>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner relative ring-1 ring-slate-200">
                        <div
                            className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out relative"
                            style={{ width: `${loadingProgress}%`, backgroundSize: '200% 100%', animation: 'gradientMove 2s linear infinite' }}
                        >
                            <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>

                    <div className="mt-12 flex items-center gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse"></span>
                            Secure Environment
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50 animate-pulse delay-75"></span>
                            Optimizing Assets
                        </span>
                    </div>

                    <style>{`
                        @keyframes gradientMove {
                            0% { background-position: 100% 0; }
                            100% { background-position: -100% 0; }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    // -- INSTRUCTIONS SCREEN --
    if (!hasStarted) {
        return (
            <div className="fixed inset-0 z-[60] bg-[#F8FAFC] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
                {/* Header */}
                <header className="h-16 sm:h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 shadow-sm relative z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                            <span className="font-bold text-lg">N</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">NEET UG 2026</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Official Mock Examination Interface</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-xs font-bold border border-purple-100 dark:border-purple-800/50 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {Math.floor(timeLeft / 60)} Minutes
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-5xl mx-auto p-4 sm:p-8 pb-32">

                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
                            <div className="p-1 bg-gradient-to-r from-purple-500 via-purple-500 to-blue-500"></div>
                            <div className="p-5 sm:p-8">
                                <h1 className="text-xl sm:text-3xl font-black text-slate-900 mb-2">General Instructions</h1>
                                <p className="text-sm sm:text-lg text-slate-500">Please read the following rules and regulations carefully before proceeding.</p>

                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Column 1: Exam Rules */}
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" /> Examination Rules
                                        </h3>
                                        <div className="space-y-4">
                                            {[
                                                `Total duration of this mock exam is ${Math.floor(timeLeft / 60)} minutes.`,
                                                "The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time.",
                                                "The examination will auto-submit when the timer reaches zero.",
                                                "You can switch between Subject Sections (Physics, Chemistry, Biology) at any time."
                                            ].map((rule, idx) => (
                                                <div key={idx} className="flex gap-4 items-start group">
                                                    <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-0.5 group-hover:bg-purple-50 group-hover:text-purple-600 group-hover:border-purple-200 transition-colors">
                                                        {idx + 1}
                                                    </div>
                                                    <p className="text-slate-700 leading-relaxed text-sm">{rule}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Column 2: Navigation & Status */}
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" /> Question Palette
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                                                <div className="w-6 h-6 rounded bg-white border border-slate-300"></div>
                                                <span className="text-xs font-bold text-slate-700">Not Visited</span>
                                            </div>
                                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-b-[12px] rounded-t-[2px] bg-[#D9534F] text-white flex items-center justify-center text-[10px]">1</div>
                                                <span className="text-xs font-bold text-red-700">Not Answered</span>
                                            </div>
                                            <div className="p-3 rounded-lg bg-green-50 border border-green-100 flex items-center gap-3">
                                                <div className="w-6 h-6 bg-[#5CB85C] text-white clip-polygon-answer flex items-center justify-center text-[10px]">5</div>
                                                <span className="text-xs font-bold text-green-700">Answered</span>
                                            </div>
                                            <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 flex items-center gap-3">
                                                <div className="w-6 h-6 bg-[#6f42c1] text-white rounded-full flex items-center justify-center text-[10px]">3</div>
                                                <span className="text-xs font-bold text-purple-700">Marked for Review</span>
                                            </div>
                                        </div>

                                        <div className="bg-purple-50/50 rounded-xl p-5 border border-purple-100">
                                            <h4 className="font-bold text-purple-900 text-sm mb-3">Assessment Marking Scheme</h4>
                                            <div className="flex gap-6">
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    <span>+1 for Correct</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                    <AlertCircle className="w-4 h-4 text-slate-300" />
                                                    <span>0 for Incorrect</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50/80 backdrop-blur border border-yellow-200 rounded-2xl p-6 flex items-start gap-4">
                            <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg shrink-0">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-yellow-900 mb-1">Final Declaration</h4>
                                <p className="text-yellow-800/80 text-sm leading-relaxed">
                                    I have read and understood the instructions. I agree that in case of not adhering to the exam instructions, I shall be liable to be debarred from this Test and/or to disciplinary action, which may include ban from future tests / examinations.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Action */}
                <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 md:p-6 flex items-center justify-between z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        Cancel Examination
                    </button>
                    <button
                        onClick={() => {
                            if (document.documentElement.requestFullscreen) {
                                document.documentElement.requestFullscreen().catch(() => { });
                                setIsFullscreen(true);
                            }
                            setHasStarted(true);
                        }}
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-purple-700 text-white font-bold text-base shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        I am ready to begin <ChevronRight className="w-5 h-5" />
                    </button>
                </footer>
            </div>
        );
    }

    // -- MAIN EXAM INTERFACE --
    return (
        <div className="fixed inset-0 z-[60] bg-[#f5f5f5] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans select-none overflow-hidden">
            {/* Header */}
            <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 px-4 flex items-center justify-between z-30 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <h1 className="text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded border border-slate-200 dark:border-slate-700 uppercase tracking-wide">
                        Micro Mock Exam
                    </h1>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                    <div className="flex flex-col items-center bg-[#2d2d2d] text-white px-4 py-1 rounded shadow-inner">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Time Remaining</span>
                        <span className={`text-xl font-mono font-bold leading-none ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-slate-800 dark:text-white">Candidate Name</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Roll No: 2026001</div>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                            <User className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 dark:text-slate-300" />
                        </div>
                    </div>
                    <button onClick={toggleFullscreen} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 hidden sm:block" title="Fullscreen">
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 lg:hidden"
                    >
                        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </header>

            {/* Subject Tabs */}
            <div className="h-10 bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 flex items-center px-2 gap-1 shadow-sm">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2 uppercase tracking-wide">Sections:</div>
                {subjects.map(sub => {
                    const isActive = activeSubject === sub;
                    return (
                        <button
                            key={sub}
                            onClick={() => handleSubjectChange(sub)}
                            className={`h-8 px-4 flex items-center justify-center text-sm font-bold rounded-t transition-colors relative top-[1px]
                                ${isActive
                                    ? 'bg-purple-600 text-white border-t border-x border-purple-600'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'}
                            `}
                        >
                            {sub}
                            <span className="ml-2 text-[10px] opacity-70 bg-black/20 px-1.5 rounded-full">
                                {activeSubject === sub ? "i" : "!"}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left: Question Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 relative z-10">
                    <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 px-3 sm:px-6 py-2 flex justify-between items-center">
                        <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            Question {currentQuestionIndex + 1}
                            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded">
                                {currentQ?.subject || 'General'}
                            </span>
                        </h2>
                        <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-bold">
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> +1</span>
                            <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> 0</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar bg-white dark:bg-slate-900">
                        <div className="max-w-4xl mx-auto">
                            {currentQ && (
                                <>
                                    <div className="text-base sm:text-lg text-slate-900 dark:text-slate-100 font-serif leading-relaxed mb-6 font-medium border-l-4 border-purple-500 pl-4 py-1">
                                        {formatScientificText((currentQ.question || '').replace(/\[IMG:.*?\]/g, ''))}
                                    </div>

                                    {currentQ.images && currentQ.images.length > 0 && (
                                        <div className="mb-8 border border-slate-200 p-2 bg-slate-50 flex justify-center rounded shadow-sm max-w-fit mx-auto">
                                            {currentQ.images.map((img, idx) => (
                                                <img key={idx} src={`data:image/png;base64,${img.base64}`} alt="Figure" className="max-h-[300px] object-contain" />
                                            ))}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-3">
                                        {currentQ.options.map((option, i) => {
                                            const isSelected = selectedOption === option;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handleOptionSelect(option)}
                                                    className={`group flex items-start p-4 rounded-lg border-2 transition-all duration-200 text-left relative overflow-hidden
                                                        ${isSelected
                                                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-md'
                                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-slate-700'}
                                                    `}
                                                >
                                                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center font-bold text-xs sm:text-sm mr-3 sm:mr-4 z-10
                                                        ${isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 group-hover:border-purple-400 group-hover:text-purple-500'}
                                                    `}>
                                                        {String.fromCharCode(65 + i)}
                                                    </div>
                                                    <span className={`text-sm sm:text-base z-10 mt-0.5 ${isSelected ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {formatScientificText(option)}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <footer className="h-auto sm:h-16 border-t border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20 py-3 sm:py-0 gap-3">
                        <div className="flex gap-2 w-full overflow-x-auto pb-1 sm:pb-0 sm:w-auto no-scrollbar">
                            <button onClick={handleSaveAndNext} className="btn-action bg-[#5CB85C] border-[#4CAE4C] text-white hover:bg-[#4CAE4C] whitespace-nowrap">Save & Next</button>
                            <button onClick={handleClearResponse} className="btn-action bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 whitespace-nowrap">Clear</button>
                            <button onClick={handleSaveAndMarkForReview} className="btn-action bg-[#F0AD4E] border-[#EEA236] text-white hover:bg-[#EC971F] whitespace-nowrap">
                                <span className="hidden sm:inline">Save & Mark for Review</span>
                                <span className="sm:hidden">Save & Mark</span>
                            </button>
                            <button onClick={handleMarkForReviewAndNext} className="btn-action bg-[#337AB7] border-[#2E6DA4] text-white hover:bg-[#286090] whitespace-nowrap">
                                <span className="hidden sm:inline">Mark for Review & Next</span>
                                <span className="sm:hidden">Mark & Next</span>
                            </button>
                            <button
                                onClick={handleReportClick}
                                className="btn-action bg-red-50 border-red-200 text-red-600 hover:bg-red-100 flex items-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Report Question</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2 ml-auto shrink-0">
                            <button onClick={goToBack} disabled={currentQuestionIndex === 0} className="px-3 sm:px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 text-xs uppercase">Back</button>
                            <button onClick={goToNext} disabled={currentQuestionIndex === questions.length - 1} className="px-3 sm:px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 text-xs uppercase">Next</button>
                            <div className="w-px h-8 bg-slate-300 dark:bg-slate-700 mx-2 hidden sm:block"></div>
                            <button onClick={() => handleSubmit(false)} className="px-4 sm:px-6 py-2 bg-[#5CB85C] text-white font-bold rounded shadow hover:bg-[#449d44] hover:shadow-md transition-all text-xs uppercase tracking-wider">Submit</button>
                        </div>
                    </footer>
                </div>

                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Right: Question Palette (Responsive Drawer) */}
                <aside
                    className={`
                        fixed inset-y-0 right-0 z-50 w-[85vw] max-w-[340px] bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out
                        lg:static lg:transform-none lg:shadow-xl lg:w-[340px] lg:border-l lg:border-slate-300 dark:border-slate-800 flex flex-col
                        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                    `}
                >
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded overflow-hidden bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shrink-0">
                                <User className="w-full h-full p-2 text-slate-400" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-800 dark:text-white">Student Name</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">Roll No: 2026001</div>
                            </div>
                        </div>

                        <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 lg:hidden">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col p-4 overflow-hidden bg-white dark:bg-slate-900">
                        <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 border-b pb-1">Legend</h3>
                        <div className="grid grid-cols-2 gap-y-2 mb-4">
                            <StatusBox count={counts.ansMarked} label="Ans & Marked" type="ANSWERED_MARKED" />
                            <StatusBox count={counts.marked} label="Marked" type="MARKED" />
                            <StatusBox count={counts.answered} label="Answered" type="ANSWERED" />
                            <StatusBox count={counts.notAnswered} label="Not Answered" type="NOT_ANSWERED" />
                            <StatusBox count={counts.unvisited} label="Not Visited" type="NOT_VISITED" />
                        </div>

                        <h3 className="text-xs font-bold uppercase bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-2 border border-blue-100 dark:border-blue-800/50 rounded-t mb-0 flex justify-between items-center">
                            <span>{activeSubject} Palette</span>
                            <span className="text-[10px] bg-blue-200 dark:bg-blue-800 px-1.5 rounded-full text-blue-800 dark:text-blue-200">{groupedIndices[activeSubject]?.length || 0}</span>
                        </h3>
                        <div className="border border-slate-200 dark:border-slate-700 rounded-b p-2 flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-800/50 custom-scrollbar">
                            <div className="grid grid-cols-4 gap-2">
                                {groupedIndices[activeSubject]?.map((originalIndex) => {
                                    const status = qStatus[originalIndex].status;
                                    const isCurrent = currentQuestionIndex === originalIndex;

                                    // Palette button styling based on NTA 
                                    let btnClass = "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200"; // Not Visited
                                    if (status === 'NOT_VISITED') btnClass = "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200";
                                    if (status === 'NOT_ANSWERED') btnClass = "bg-[#D9534F] border-[#D43F3A] text-white rounded-b-[12px] rounded-t-[2px]";
                                    if (status === 'ANSWERED') btnClass = "bg-[#5CB85C] border-[#4CAE4C] text-white clip-polygon-answer";
                                    if (status === 'MARKED') btnClass = "bg-[#6f42c1] border-[#5a32a3] text-white rounded-full";
                                    if (status === 'ANSWERED_MARKED') btnClass = "bg-[#6f42c1] border-[#5a32a3] text-white rounded-full relative";

                                    return (
                                        <button
                                            key={originalIndex}
                                            onClick={() => goToQuestion(originalIndex)}
                                            className={`h-9 w-full flex items-center justify-center text-xs font-bold border transition-all shadow-sm
                                                ${btnClass} 
                                                ${isCurrent ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-800 z-10 scale-105' : 'hover:opacity-90'}
                                            `}
                                        >
                                            {originalIndex + 1}
                                            {status === 'ANSWERED_MARKED' && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#5CB85C] rounded-full border border-white text-[6px] flex items-center justify-center">✓</div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            <ReportQuestionModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                questionData={questions[currentQuestionIndex]}
                type="mock"
                extraData={{
                    explanation: (questions[currentQuestionIndex] as any)?.explanation
                }}
            />

            <style>{`
                .clip-polygon-answer {
                     clip-path: polygon(15% 0, 85% 0, 100% 100%, 0 100%);
                     border-radius: 0;
                }
                .btn-action {
                    height: 36px;
                    padding: 0 16px;
                    border-radius: 2px;
                    border-width: 1px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    transition: all 0.2s;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .btn-action:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .btn-action:active {
                    transform: translateY(0);
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
};

export { CBTInterface };

