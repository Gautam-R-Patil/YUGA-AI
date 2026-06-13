
// TutorExplanationPopup.tsx - Enhanced with Question Display
import React, { useState, useEffect, useRef, memo } from "react";
import { X, Bot, RotateCcw, Pause, Play, MessageSquare, Mic, MicOff, Send, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { apiRequest } from "../../../core/utils/api";
import { preprocessTextForSpeech, formatTextForMarkdown } from "../../../core/utils/textFormatting";
import avatarVideo from "../../../assets/avatar.mp4";
import { createAudioDataUrl } from "../../../core/utils/audio";

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Global counter to track audio requests across all component instances/mounts
let globalAudioRequestId = 0;

// Memoized Video Component - No props that change to prevent ANY re-renders
const AvatarVideo = memo(({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement> }) => (
    <div className="relative w-full aspect-[3/4] max-h-[320px] rounded-2xl overflow-hidden shadow-xl ring-4 ring-white/50">
        <video
            ref={videoRef}
            src={avatarVideo}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
        />
    </div>
));

interface TutorContext {
    question: string;
    options: string[];
    correctAnswer: string;
    userAnswer: string | null;
    explanation?: string;
    simpleExplanation?: string;
    mode: 'simple' | 'doubt' | 'detailed';
    subject?: string;
    keywords?: Record<string, string>;
}

interface TutorExplanationPopupProps {
    isOpen: boolean;
    onClose: () => void;
    context: TutorContext;
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const TutorExplanationPopup: React.FC<TutorExplanationPopupProps> = ({ isOpen, onClose, context }) => {
    const [explanation, setExplanation] = useState<string>("");
    const [isPaused, setIsPaused] = useState(false);
    const [showDoubtChat, setShowDoubtChat] = useState(false);
    const [isQuestionExpanded, setIsQuestionExpanded] = useState(false);

    // Chat states
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const isPausedRef = useRef(false);

    // Keep ref in sync for use in async closures
    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
                setIsListening(false);
                // Optionally auto-submit if you want:
                // handleDoubtSubmit(transcript);
            };

            recognitionRef.current.onerror = () => {
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);



    // Initialize
    useEffect(() => {
        if (isOpen && context) {
            // Fix double playback:
            // Ensure any existing audio is stopped before starting new one
            stopAudio();

            // Note: globalAudioRequestId is incremented inside speakResponse now

            handleInitialFlow();
        }
        return () => {
            stopAudio();
            // Invalidate any pending requests on unmount
            globalAudioRequestId++;
            setExplanation("");
            setMessages([]);
            setIsSpeaking(false);
            setIsPaused(false);
            setShowDoubtChat(false);
        };
    }, [isOpen]);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.onended = null;
            audioRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.pause();
        }
        if (window.speechSynthesis) window.speechSynthesis.cancel();

        // Reset states
        setIsSpeaking(false);
        setIsPaused(false);
    };

    const getSystemPrompt = () => {
        return `You are an expert NEET Teacher named Diya.
        Context:
        Question: ${context.question}
        Options: ${context.options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join(', ')}
        Correct Answer: ${context.correctAnswer}
        Student Answer: ${context.userAnswer || "None"}
        Basic Explanation: ${context.simpleExplanation || context.explanation || "N/A"}

        Task: Clarify the student's doubts. Be concise, encouraging, and clear.
        CRITICAL FORMATTING RULES:
        1. Write conversationally and kindly, like a helpful tutor.
        2. DO NOT use LaTeX (do not use $ or $$). Use standard text characters (e.g., a^2, H2O, pi). The chat interface cannot render LaTeX.
        3. Keep it highly readable with short paragraphs and bullet points if needed.`;
    };

    const handleInitialFlow = async () => {
        if (context.mode === 'simple' || context.mode === 'detailed') {
            const text = context.explanation || `The correct answer is ${context.correctAnswer}.`;
            setExplanation(formatTextForMarkdown(text));
            setIsSpeaking(true);
            await speakResponse(text);
        } else if (context.mode === 'doubt') {
            setShowDoubtChat(true);
            const initialMsg: ChatMessage = { role: 'assistant', content: "I'm here to help! What's confusing you?" };
            const sysMsg: ChatMessage = { role: 'system', content: getSystemPrompt() };
            setMessages([sysMsg, initialMsg]);
            speakResponse(initialMsg.content);
        }
    };

    const speakResponse = async (text: string) => {
        if (!text) return;

        // Ensure previous audio is stopped immediately before starting new one
        stopAudio();
        setIsPaused(false);
        setIsSpeaking(true);

        // Take a snapshot of the current request ID
        // Even if the component remounts, this global ID will have been incremented
        const requestId = ++globalAudioRequestId;

        try {
            const audioText = preprocessTextForSpeech(text, context.subject);
            const response = await apiRequest('/voice/speak', 'POST', {
                text: audioText,
                language: 'english',
                keywords: context.keywords || {}
            });

            // If globalAudioRequestId has changed, it means a new request started or popup closed
            if (requestId !== globalAudioRequestId) return;

            if (response.ok) {
                const data = await response.json();

                // Final check before playback
                if (requestId !== globalAudioRequestId) return;

                if (data.audio) {
                    const audio = new Audio(createAudioDataUrl(data.audio, data.audioMime));
                    audioRef.current = audio;
                    audio.onended = () => {
                        if (requestId === globalAudioRequestId) {
                            setIsSpeaking(false);
                            if (videoRef.current) videoRef.current.pause();
                        }
                    };

                    // Check if user paused while we were loading
                    if (!isPausedRef.current) {
                        await audio.play();
                        if (requestId === globalAudioRequestId && videoRef.current) {
                            videoRef.current.play();
                        }
                    } else {
                        // Stay paused if user requested it
                        setIsSpeaking(true);
                    }
                }
            }
        } catch (err) {
            console.error("TTS Error", err);
            if (requestId === globalAudioRequestId) {
                setIsSpeaking(false);
            }
        }
    };

    const handleDoubtSubmit = async () => {
        if (!inputText.trim()) return;

        // Stop any current speaking before submitting/loading
        stopAudio();

        const userMsg: ChatMessage = { role: 'user', content: inputText };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputText("");
        setLoading(true);

        try {
            const response = await apiRequest('/voice/query', 'POST', {
                messages: newMessages,
                courseCategory: 'NEET',
                taskType: 'doubt_clarification'
            });

            if (response.ok) {
                const data = await response.json();
                const aiMsg: ChatMessage = { role: 'assistant', content: data.response };
                setMessages(prev => [...prev, aiMsg]);
                speakResponse(data.response);
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg: ChatMessage = { 
                    role: 'assistant', 
                    content: errorData.message || (response.status === 403 ? "You've reached your free doubt limit. Upgrade to continue!" : "I'm having a bit of trouble connecting right now. Please try again later.")
                };
                setMessages(prev => [...prev, errorMsg]);
            }
        } catch (e) {
            console.error("Error", e);
            const errorMsg: ChatMessage = { 
                role: 'assistant', 
                content: "System connection error. Please check your internet or try again."
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleVoiceInput = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                // Stop any current speaking when starting voice input
                stopAudio();
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error('Speech recognition error:', error);
            }
        }
    };

    const togglePause = () => {
        if (isPaused) {
            if (videoRef.current) videoRef.current.play();
            if (audioRef.current) audioRef.current.play();
            setIsPaused(false);
        } else {
            if (videoRef.current) videoRef.current.pause();
            if (audioRef.current) audioRef.current.pause();
            setIsPaused(true);
        }
    };

    const replayExplanation = () => {
        stopAudio();
        setIsPaused(false);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
        }
        handleInitialFlow();
    };

    const startDoubtChat = () => {
        stopAudio();
        setShowDoubtChat(true);
        if (messages.length === 0) {
            const initialMsg: ChatMessage = { role: 'assistant', content: "I'm here to help! What part of this question is confusing you?" };
            const sysMsg: ChatMessage = { role: 'system', content: getSystemPrompt() };
            setMessages([sysMsg, initialMsg]);
            speakResponse(initialMsg.content);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 font-sans">
            {/* Backdrop - Removed blur for performance */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-indigo-900/80 to-slate-900/90"
                onClick={() => {
                    stopAudio();
                    onClose();
                }}
            />

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-6xl h-[90vh] flex gap-6 animate-in zoom-in-95 fade-in duration-500">

                {/* Left: Teacher Video Card */}
                <div className="w-[360px] shrink-0 flex flex-col">
                    {/* Video Container */}
                    <div className="relative bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 rounded-3xl overflow-hidden shadow-2xl flex-1 flex flex-col">
                        {/* Video - Using memoized component */}
                        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                            <AvatarVideo videoRef={videoRef} />
                        </div>

                        {/* Teacher Info */}
                        <div className="px-6 pb-4 text-center relative z-10">
                            <h3 className="text-xl font-bold text-slate-800 mb-1">Diya</h3>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm">
                                <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                                <span className="text-xs font-medium text-slate-600">
                                    {isSpeaking ? 'Speaking...' : 'Ready'}
                                </span>
                            </div>
                        </div>

                        {/* Control Button */}
                        <div className="px-4 pb-3 relative z-10">
                            <button
                                onClick={togglePause}
                                disabled={!isSpeaking && !isPaused}
                                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${isPaused ? 'bg-indigo-100 text-indigo-700' :
                                    isSpeaking ? 'bg-white/70 hover:bg-white text-slate-700' :
                                        'bg-slate-100/50 text-slate-400 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                {isPaused ? 'Resume' : 'Pause'}
                            </button>
                        </div>

                        {/* Ask Doubt Button - More Prominent */}
                        <div className="px-4 pb-4 relative z-10">
                            <button
                                onClick={startDoubtChat}
                                disabled={showDoubtChat}
                                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg group ${showDoubtChat
                                    ? 'bg-green-500 text-white cursor-default'
                                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                                    }`}
                            >
                                <MessageSquare className={`w-5 h-5 ${showDoubtChat ? '' : 'group-hover:scale-110 transition-transform'}`} />
                                {showDoubtChat ? 'Chat Active' : 'Ask a Doubt'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Solution / Doubt Chat */}
                <div className="flex-1 flex flex-col min-w-0 gap-4">

                    {/* Question Card (Collapsible) */}
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/5 shrink-0">
                        <button
                            onClick={() => setIsQuestionExpanded(!isQuestionExpanded)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-200">Question & Options</span>
                            </div>
                            {isQuestionExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                        </button>

                        {isQuestionExpanded && (
                            <div className="px-6 pb-5 animate-in slide-in-from-top-2 duration-300">
                                {/* Question Text */}
                                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-4">
                                    <ReactMarkdown components={{ p: ({ node, ...props }) => <span {...props} /> }}>
                                        {context.question}
                                    </ReactMarkdown>
                                </p>

                                {/* Options Grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    {context.options.map((opt, i) => {
                                        const isCorrect = opt === context.correctAnswer;
                                        const isUserAnswer = opt === context.userAnswer;
                                        const isWrong = isUserAnswer && !isCorrect;

                                        return (
                                            <div
                                                key={i}
                                                className={`p-3 rounded-xl border-2 flex items-start gap-2 transition-all ${isCorrect
                                                    ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700'
                                                    : isWrong
                                                        ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700'
                                                        : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                                                    }`}
                                            >
                                                <span className={`font-bold text-sm shrink-0 ${isCorrect ? 'text-green-600' : isWrong ? 'text-red-600' : 'text-slate-500'
                                                    }`}>
                                                    {String.fromCharCode(65 + i)})
                                                </span>
                                                <span className={`text-sm flex-1 ${isCorrect ? 'text-green-700 dark:text-green-300 font-medium'
                                                    : isWrong ? 'text-red-700 dark:text-red-300'
                                                        : 'text-slate-600 dark:text-slate-400'
                                                    }`}>
                                                    {opt}
                                                </span>
                                                {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                                                {isWrong && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Solution Card */}
                    <div className="flex-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/5 min-h-0">

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                        {showDoubtChat ? 'Ask Your Doubt' : 'Detailed Solution'}
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {showDoubtChat ? 'Chat with Diya about this question' : 'Step-by-step explanation'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {showDoubtChat && (
                                    <button
                                        onClick={() => {
                                            stopAudio();
                                            setShowDoubtChat(false);
                                        }}
                                        className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                                    >
                                        ← Back to Solution
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        stopAudio();
                                        onClose();
                                    }}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {showDoubtChat ? (
                                // Doubt Chat Interface
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {messages.filter(m => m.role !== 'system').map((msg, idx) => {
                                        const isUser = msg.role === 'user';
                                        return (
                                            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${isUser
                                                    ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-tr-sm'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                                                    }`}>
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {loading && (
                                        <div className="flex justify-start">
                                            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                                                <span className="text-sm text-slate-500">Diya is typing...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                            ) : (
                                // Solution Content
                                <div className="prose prose-slate dark:prose-invert max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {explanation ? (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                            components={{
                                                h1: (props: any) => <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0 mb-4 pb-3 border-b-2 border-indigo-500/30" {...props} />,
                                                h2: (props: any) => <h2 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 mt-6 mb-3" {...props} />,
                                                h3: (props: any) => <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-5 mb-2" {...props} />,
                                                p: (props: any) => <p className="mb-4 leading-7 text-slate-600 dark:text-slate-300 text-[0.95rem]" {...props} />,
                                                strong: (props: any) => <strong className="font-bold text-indigo-700 dark:text-indigo-300" {...props} />,
                                                ul: (props: any) => <ul className="space-y-2 my-4 list-none" {...props} />,
                                                li: (props: any) => (
                                                    <li className="pl-0 mb-2" {...props} />
                                                ),
                                                blockquote: (props: any) => (
                                                    <blockquote className="border-l-4 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-r-xl my-5 not-italic" {...props} />
                                                ),
                                            }}
                                        >
                                            {explanation}
                                        </ReactMarkdown>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-indigo-500 animate-spin" />
                                            </div>
                                            <p className="text-sm text-slate-400 animate-pulse">Loading explanation...</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer / Input */}
                        {showDoubtChat ? (
                            // Chat Input
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (inputText.trim() && !loading) {
                                        handleDoubtSubmit();
                                    }
                                }}
                                className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 relative z-50"
                            >
                                <div className="flex gap-3 items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/30 transition-all">
                                    <button
                                        type="button"
                                        onClick={handleVoiceInput}
                                        className={`p-2.5 rounded-xl transition-all cursor-pointer ${isListening
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-500'
                                            }`}
                                        title={isListening ? "Stop listening" : "Start voice input"}
                                    >
                                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                    </button>
                                    <input
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Type your doubt here..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 py-2 px-1"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputText.trim() || loading}
                                        className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-md hover:shadow-lg relative z-[60]"
                                        title="Send message"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            // Solution Footer
                            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Bot className="w-4 h-4" />
                                    <span className="uppercase tracking-wider font-medium text-xs">Teacher's Explanation</span>
                                </div>
                                <button
                                    onClick={replayExplanation}
                                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Replay Explanation
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
