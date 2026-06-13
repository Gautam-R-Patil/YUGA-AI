import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { apiRequest } from "../../../core/utils/api";
import { 
    ArrowLeft, CheckCircle, XCircle, MessageSquare,
    ShieldCheck, Brain, Play, Pause, Square, ArrowRight, RotateCcw
} from "lucide-react";
import { TutorExplanationPopup } from "./TutorExplanationPopup";
import { ReportQuestionModal } from "../../../shared/components/ReportQuestionModal";
import avatarVideo from "../../../assets/avatar.mp4";
import { formatTextForMarkdown } from "../../../core/utils/textFormatting";
import { FormattedText } from '../../../shared/components/FormattedText';
import { createAudioDataUrl } from "../../../core/utils/audio";

interface AnalysisProps {
    mockId: string;
    onBack: () => void;
}

export const MockAnalysisView: React.FC<AnalysisProps> = ({ mockId, onBack }) => {
    const [data, setData] = useState<any>(null);
    const [isTutorOpen, setIsTutorOpen] = useState(false);
    const [tutorContext, setTutorContext] = useState<any>(null);
    const [reportData, setReportData] = useState<{ q: any, userSelected: string | undefined } | null>(null);

    // New states for Practice-like UI
    const [currentIdx, setCurrentIdx] = useState(0);
    const [activeSubjectTab, setActiveSubjectTab] = useState<string>('All');
    const [isExplaining, setIsExplaining] = useState(false);
    const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
    const [isPaused, setIsPaused] = useState(false);

    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const audioRequestRef = React.useRef(0);

    useEffect(() => {
        const key = `mock_result_${mockId}`;
        const savedData = localStorage.getItem(key);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setData(parsed);
            generateExplanations(parsed, key);
        }
    }, [mockId]);

    const generateExplanations = async (currentData: any, storageKey: string) => {
        const { questions, userAnswers } = currentData;
        const missingIndices = questions.map((q: any, i: number) => (!q.explanation && !q.basic_answer && !q.basicAnswer) ? i : -1).filter((i: number) => i !== -1);
        if (missingIndices.length === 0) return;

        async function processNext(index: number) {
            if (index >= missingIndices.length) return;
            const qIdx = missingIndices[index];
            try {
                const q = questions[qIdx];
                const answerObj = Array.isArray(userAnswers) ? userAnswers[qIdx] : (userAnswers[qIdx] || userAnswers[q.id]);
                const response = await apiRequest('/analysis/explain', 'POST', {
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    selectedAnswer: answerObj?.selectedAnswer || null,
                    subject: q.subject
                });
                if (response.ok) {
                    const resJson = await response.json();
                    setData((prev: any) => {
                        if (!prev) return prev;
                        const newData = { ...prev };
                        const newQuestions = [...newData.questions];
                        newQuestions[qIdx] = { ...newQuestions[qIdx], explanation: resJson.explanation };
                        newData.questions = newQuestions;
                        localStorage.setItem(storageKey, JSON.stringify(newData));
                        return newData;
                    });
                }
            } catch (err) {
                console.error("Failed to fetch explanation", err);
            } finally {
                processNext(index + 1);
            }
        }
        processNext(0);
    };

    const stopAudio = () => {
        audioRequestRef.current++;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    const fetchAndPlayAudio = async (text: string, keywords?: Record<string, string>) => {
        const requestId = audioRequestRef.current;
        try {
            const response = await apiRequest('/voice/speak', 'POST', {
                text: text.replace(/[$]/g, ''),
                language: 'english',
                keywords: keywords || {}
            });

            if (requestId !== audioRequestRef.current) return;

            if (response.ok) {
                const data = await response.json();
                if (data.audio) {
                    if (audioRef.current) audioRef.current.pause();
                    const audio = new Audio(createAudioDataUrl(data.audio, data.audioMime));
                    audioRef.current = audio;
                    audio.onended = () => {
                        setIsExplaining(false);
                        if (videoRef.current) {
                            videoRef.current.pause();
                            videoRef.current.currentTime = 0;
                        }
                    };
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            if (videoRef.current) videoRef.current.play();
                        }).catch(e => console.error("Audio Playback Error:", e));
                    }
                }
            }
        } catch (e) {
            console.error("TTS error", e);
            setIsExplaining(false);
        }
    };

    const startExplanation = async (q: any) => {
        stopAudio();
        setIsExplaining(true);
        
        // Mark as revealed so text stays visible
        const qIdx = questions.indexOf(q);
        if (qIdx !== -1) {
            setRevealedIndices(prev => new Set(prev).add(qIdx));
        }

        let text = q.basic_answer || q.basicAnswer || q.explanation || "The correct answer is " + q.correctAnswer;

        // Keyword-based pronunciation replacement is now gracefully handled natively 
        // by the centralized scientific TTS engine on the Node backend.
        // We simply forward q.keywords directly to fetchAndPlayAudio.
        
        await fetchAndPlayAudio(text, q.keywords);
    };

    const pauseExplanation = () => {
        if (audioRef.current) {
            if (isPaused) {
                audioRef.current.play();
                if (videoRef.current) videoRef.current.play();
                setIsPaused(false);
            } else {
                audioRef.current.pause();
                if (videoRef.current) videoRef.current.pause();
                setIsPaused(true);
            }
        }
    };

    useEffect(() => {
        stopAudio();
        setIsExplaining(false);
    }, [currentIdx, activeSubjectTab]);

    useEffect(() => {
        return () => stopAudio();
    }, []);

    if (!data) return null;

    const { questions, userAnswers, score, correctCount, wrongCount, totalQuestions } = data;
    const accuracy = Math.round((correctCount / (correctCount + wrongCount || 1)) * 100);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[100px]"></div>
            </div>

            {/* Sticky Navigation Header */}
            <div className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
                <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={onBack} className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 transition-all text-sm font-bold shadow-sm">
                            <ArrowLeft className="w-4 h-4 text-indigo-600 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-slate-700 dark:text-slate-300">Exit Analysis</span>
                        </button>
                        <div className="hidden lg:block">
                            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                Solutions <span className="text-slate-200 dark:text-slate-800 mx-2">/</span> <span className="text-indigo-600 dark:text-indigo-400">{mockId.replace(/-/g, ' ')}</span>
                            </h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                        <div className="text-right hidden sm:block">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Score</div>
                            <div className="text-2xl font-black text-slate-900">{score} <span className="text-xs text-slate-400">/ {totalQuestions}</span></div>
                        </div>
                        <div className="h-10 w-[1px] bg-slate-200"></div>
                        <div className="flex items-center gap-3">
                            <div className="px-5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-black text-emerald-700">{accuracy}% Accuracy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-6 py-12 relative z-10">
                <div className="mt-16 pb-20">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Solution Interface</h2>
                            <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Post-Exam Analysis</span>
                            </div>
                        </div>

                        {/* Subject Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                            {['All', 'Physics', 'Chemistry', 'Biology', 'Botany', 'Zoology']
                                .filter(sub => sub === 'All' || questions.some((q: any) => q.subject?.toLowerCase().includes(sub.toLowerCase())))
                                .map((sub) => (
                                <button
                                    key={sub}
                                    onClick={() => {
                                        setActiveSubjectTab(sub);
                                        setCurrentIdx(0);
                                    }}
                                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                        activeSubjectTab === sub 
                                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' 
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Single Question Grid */}
                    {(() => {
                        const filteredQuestions = activeSubjectTab === 'All' 
                            ? questions 
                            : questions.filter((q: any) => q.subject?.toLowerCase().includes(activeSubjectTab.toLowerCase()));
                        
                        const q = filteredQuestions[currentIdx];
                        if (!q) return <div className="text-center py-20 text-slate-400 font-bold">No questions found for this section.</div>;

                        const originalIdx = questions.indexOf(q);
                        const userAnswerEntry = userAnswers[originalIdx];
                        const userSelected = userAnswerEntry?.selectedAnswer;
                        const isCorrect = userSelected === q.correctAnswer;
                        const isSkipped = !userSelected;

                        return (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* Left/Center: Question and Options */}
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-10 shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8">
                                            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                                isCorrect ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800' :
                                                isSkipped ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800' :
                                                'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-800'
                                            }`}>
                                                {isCorrect ? 'Correct Decision' : isSkipped ? 'Question Skipped' : 'Logical Error'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center font-black text-xl text-indigo-600 dark:text-indigo-400 shadow-inner">
                                                {originalIdx + 1}
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{q.subject}</div>
                                        </div>

                                        <div className="prose prose-slate dark:prose-invert max-w-none text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-10 leading-snug tracking-tight">
                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                {q.question}
                                            </ReactMarkdown>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt: string, i: number) => {
                                                const isThisCorrect = opt === q.correctAnswer;
                                                const isThisSelected = opt === userSelected;
                                                
                                                let style = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 text-slate-700 dark:text-slate-300 transition-all duration-300";
                                                if (isThisCorrect) style = "bg-emerald-50 dark:bg-green-900/20 border-emerald-500 text-emerald-900 dark:text-green-200 ring-2 ring-emerald-500/10";
                                                if (isThisSelected && !isThisCorrect) style = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-200 ring-2 ring-red-500/10";

                                                return (
                                                    <div key={i} className={`flex items-center gap-5 p-5 rounded-2xl border-2 shadow-sm ${style}`}>
                                                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-black shrink-0 ${
                                                            isThisCorrect ? 'bg-emerald-500 text-white' : 
                                                            isThisSelected && !isThisCorrect ? 'bg-red-500 text-white' : 
                                                            'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                                        }`}>
                                                            {String.fromCharCode(65 + i)}
                                                        </div>
                                                        <span className="font-bold flex-1">
                                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                                {opt}
                                                            </ReactMarkdown>
                                                        </span>
                                                        {isThisCorrect && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                                                        {isThisSelected && !isThisCorrect && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Avatar and Controls */}
                                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
                                    {/* Avatar Card */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="relative w-48 h-48 mb-6">
                                                <div className={`absolute inset-0 bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-full blur-2xl opacity-20 transition-opacity duration-500 ${isExplaining ? 'animate-pulse opacity-40' : ''}`} />
                                                <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl relative bg-slate-200 dark:bg-slate-900">
                                                    <video
                                                        ref={videoRef}
                                                        src={avatarVideo}
                                                        className="w-full h-full object-cover"
                                                        loop
                                                        muted
                                                        playsInline
                                                    />
                                                </div>
                                            </div>

                                            <div className="w-full text-center min-h-[100px]">
                                                {isExplaining || revealedIndices.has(originalIdx) ? (
                                                    <div className="space-y-3">
                                                       <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 italic">
                                                           {isExplaining ? "SME AI Explaining" : "Solution Summary"}
                                                       </div>
                                                       <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-left overflow-y-auto max-h-[120px]">
                                                            <FormattedText content={formatTextForMarkdown(q.basic_answer || q.basicAnswer || q.explanation || "Analyzing the solution step-by-step.")} />
                                                       </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => startExplanation(q)}
                                                        className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 group"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Play className="w-3 h-3 fill-current" />
                                                            Show Solution
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Command Center */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-xl">
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <button
                                                onClick={() => {
                                                    stopAudio();
                                                    setCurrentIdx(prev => Math.max(0, prev - 1));
                                                }}
                                                disabled={currentIdx === 0}
                                                className={`py-4 px-4 rounded-2xl font-black uppercase tracking-widest border text-[10px] flex items-center justify-center gap-2 transition-all ${
                                                    currentIdx === 0 
                                                        ? 'opacity-50 grayscale bg-slate-50 dark:bg-slate-800 text-slate-400' 
                                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                                                }`}
                                            >
                                                <ArrowLeft className="w-4 h-4" /> Prev
                                            </button>
                                            <button
                                                onClick={() => {
                                                    stopAudio();
                                                    setCurrentIdx(prev => Math.min(filteredQuestions.length - 1, prev + 1));
                                                }}
                                                disabled={currentIdx === filteredQuestions.length - 1}
                                                className={`py-4 px-4 rounded-2xl font-black uppercase tracking-widest bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] flex items-center justify-center gap-2 shadow-lg transition-all ${
                                                    currentIdx === filteredQuestions.length - 1 ? 'opacity-50' : 'hover:-translate-y-0.5 active:translate-y-0'
                                                }`}
                                            >
                                                Next <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => {
                                                    setTutorContext({
                                                        question: q.question,
                                                        options: q.options,
                                                        correctAnswer: q.correctAnswer,
                                                        userAnswer: userSelected,
                                                        explanation: q.explanation || q.basic_answer || q.basicAnswer,
                                                        mode: 'doubt',
                                                        subject: q.subject,
                                                        keywords: q.keywords
                                                    });
                                                    setIsTutorOpen(true);
                                                }}
                                                className="py-4 px-1 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] flex flex-col items-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                Doubt
                                            </button>

                                            <button
                                                onClick={async () => {
                                                    setTutorContext({
                                                        question: q.question,
                                                        options: q.options,
                                                        correctAnswer: q.correctAnswer,
                                                        userAnswer: userSelected,
                                                        explanation: q.explanation || q.basic_answer || q.basicAnswer,
                                                        mode: 'simple',
                                                        subject: q.subject,
                                                        keywords: q.keywords
                                                    });
                                                    setIsTutorOpen(true);
                                                }}
                                                className="py-4 px-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] flex flex-col items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                                            >
                                                <Brain className="w-4 h-4" />
                                                In-Detailed
                                            </button>

                                            <button
                                                onClick={() => startExplanation(q)}
                                                className="py-4 px-1 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] flex flex-col items-center gap-2 shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                Replay
                                            </button>
                                        </div>

                                        {isExplaining && (
                                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-full border border-slate-100 dark:border-slate-700">
                                                    <div className="px-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Audio</div>
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={pauseExplanation} className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 hover:scale-110 transition-transform">
                                                            {isPaused ? <Play className="w-3.5 h-3.5 fill-slate-800 dark:fill-white" /> : <Pause className="w-3.5 h-3.5 fill-slate-800 dark:fill-white" />}
                                                        </button>
                                                        <button onClick={stopAudio} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                                                            <Square className="w-3.5 h-3.5 fill-current" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </main>

            {/* Popups */}
            {isTutorOpen && tutorContext && (
                <TutorExplanationPopup
                    isOpen={isTutorOpen}
                    onClose={() => setIsTutorOpen(false)}
                    context={tutorContext}
                />
            )}

            <ReportQuestionModal
                isOpen={!!reportData}
                onClose={() => setReportData(null)}
                questionData={reportData?.q}
                type="analysis"
                extraData={{ selectedAnswer: reportData?.userSelected, explanation: reportData?.q?.explanation }}
            />

            <style>{`
                .animate-spin-slow { animation: spin 8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};
