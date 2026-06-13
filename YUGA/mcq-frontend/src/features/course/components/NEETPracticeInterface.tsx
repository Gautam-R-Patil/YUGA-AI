import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Play, Pause, Square, ArrowRight, Brain, MessageSquare, X, RotateCcw, Loader2, ShieldAlert, RefreshCw } from "lucide-react";
import { TutorExplanationPopup } from "./TutorExplanationPopup";
import { ReportQuestionModal } from "../../../shared/components/ReportQuestionModal";
import avatarVideo from "../../../assets/avatar.mp4";
import { apiRequest, API_BASE_URL } from "../../../core/utils/api";
import { formatTextForMarkdown } from "../../../core/utils/textFormatting";
import { FormattedText } from '../../../shared/components/FormattedText';
import { createAudioDataUrl } from "../../../core/utils/audio";
// ... (imports remain same, I will use multi_replace for this actually to be cleaner or just replace imports separately if they are far apart)

// Actually I can use multi_replace to do both at once.

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { motion, AnimatePresence } from "framer-motion";

// Animation Variants


const slideIn = {
    hidden: { x: 20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
    exit: { x: -20, opacity: 0, transition: { duration: 0.2 } }
};

const cardHover = {
    hover: { y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }
};

// Types
interface PracticeQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    subject: string;
    sub_topic?: string; // NEW: For context-aware pronunciation
    difficulty: 'Easy' | 'Medium' | 'Hard';
    hasImage?: boolean; // Maintain backward compatibility (though images array is preferred now)
    images?: string[];
    explanation?: string;
    basicAnswer?: string; // New field for simple explanation
    keywords?: Record<string, string>; // New field for custom pronunciation context
}

interface NEETPracticeInterfaceProps {
    subjectProp?: string;
    initialSet?: number;
    initialQuestionIndex?: number; // New prop for resume capability
    onExit?: () => void;
    // New Props for external control (Daily Quiz / AI Assessment)
    questionsData?: PracticeQuestion[];
    onComplete?: (results: any) => void;
    mode?: 'practice' | 'assessment'; // 'practice' (default) or 'assessment' (Daily Quiz)

    // SME Review Mode Props
    isSMEReviewMode?: boolean;
    onSMEAction?: (action: 'check' | 'report' | 'recheck', questionId: string) => void;
}

export const NEETPracticeInterface: React.FC<NEETPracticeInterfaceProps> = ({
    subjectProp,
    initialSet,
    initialQuestionIndex = 0,
    onExit,
    questionsData,
    onComplete,
    mode = 'practice',
    isSMEReviewMode = false,
    onSMEAction,
}) => {
    const { subject: paramSubject } = useParams<{ subject: string }>();
    const navigate = useNavigate();

    // Prefer prop subject if testing via selection screen, else URL param
    const rawSubject = subjectProp || paramSubject || 'Physics';

    // Robust normalization
    const subject = (() => {
        const s = rawSubject.toLowerCase();
        if (s.includes('physics')) return 'Physics';
        if (s.includes('chemistry')) return 'Chemistry';
        if (s.includes('biology')) return 'Biology';
        return rawSubject;
    })();

    // State
    const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(initialQuestionIndex); // Initialize with prop
    const [isTutorOpen, setIsTutorOpen] = useState(false);
    const [tutorContext, setTutorContext] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);


    const [isExplaining, setIsExplaining] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted] = useState(false); // New Mute State
    const [score, setScore] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [explanationText, setExplanationText] = useState<string>('');
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [showSetCompletePopup, setShowSetCompletePopup] = useState(false);
    const [isFetchingExplanation, setIsFetchingExplanation] = useState(false);

    const [timeElapsed, setTimeElapsed] = useState(0); // Timer in seconds
    const [totalSets, setTotalSets] = useState(5); // Default to 5 until fetched

    // Refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const audioRequestRef = useRef(0);
    const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);




    // Timer Effect
    useEffect(() => {
        const timer = setInterval(() => {
            if (!isPaused && !isExplaining && !loading && !showSetCompletePopup) {
                setTimeElapsed(prev => prev + 1);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [isPaused, isExplaining, loading, showSetCompletePopup]);

    // Use initialSet if provided, otherwise load from localStorage or default to 1
    const [currentSet, setCurrentSet] = useState(() => {
        if (initialSet) return initialSet;
        try {
            let reqSubject = subject || 'Physics';
            if (reqSubject.includes('Physics')) reqSubject = 'Physics';
            else if (reqSubject.includes('Chemistry')) reqSubject = 'Chemistry';
            else if (reqSubject.includes('Biology')) reqSubject = 'Biology';

            const savedProgress = JSON.parse(localStorage.getItem('yuga_mcq_progress') || '{}');
            return savedProgress[reqSubject] || 1;
        } catch (e) {
            return 1;
        }
    });

    // Resume Progress Effect
    // Resume Progress Effect (Legacy Removed)
    // We now handle progress saving in a unified effect below.

    // Filter out duplicate options helper
    const filterUniqueQuestions = (data: PracticeQuestion[]) => {
        return data.filter((q) => {
            // Filter out broken "Match Column" questions
            const isMatchingQuestion = /Match\s+(Column|List)/i.test(q.question);
            if (isMatchingQuestion) return false;

            const uniqueOptions = new Set(q.options.map(o => o.trim()));
            return uniqueOptions.size === q.options.length;
        });
    };

    // Fetch Total Sets
    useEffect(() => {
        // Only fetch set count if in practice mode
        if (mode !== 'practice') return;

        const fetchSetCount = async () => {
            if (!subject) return;
            try {
                const response = await apiRequest(`/mcq/subject/${encodeURIComponent(subject)}/sets`, 'GET');
                if (response.ok) {
                    const data = await response.json();
                    if (data.count && data.count > 0) {
                        setTotalSets(data.count);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch set count", e);
            }
        };
        fetchSetCount();
    }, [subject, mode]);

    // Fetch Questions
    useEffect(() => {
        let active = true;

        const fetchQuestions = async () => {
            // --- NEW: Use provided questions if available ---
            if (questionsData && questionsData.length > 0) {
                if (active) {
                    // Normalize incoming question objects to internal PracticeQuestion shape
                    const normalize = (raw: any): PracticeQuestion => {
                        const qText = raw.question || raw.text || raw.question_text || '';
                        const opts = Array.isArray(raw.options) ? raw.options : (Array.isArray(raw.opts) ? raw.opts : []);

                        // Normalize correct answer: prefer provided correctAnswer or snake_case correct_answer or answer
                        const corr = raw.correctAnswer || raw.correct_answer || raw.correct_answer_text || raw.answer || raw.correct || '';

                        // Basic answer / short explanation
                        const basic = raw.basicAnswer || raw.basic_answer || raw.basic || raw.short_answer || '';

                        // Images: support string urls, objects with path (served under /api/questions-data/...), or base64
                        const images: string[] = [];
                        if (Array.isArray(raw.images)) {
                            raw.images.forEach((img: any) => {
                                if (!img) return;
                                if (typeof img === 'string') {
                                    images.push(img);
                                } else if (img.base64) {
                                    images.push(`data:image/png;base64,${img.base64}`);
                                } else if (img.path) {
                                    // path is relative to data/questions root
                                    images.push(`${API_BASE_URL}/questions-data/${img.path}`);
                                } else if (img.url) {
                                    images.push(img.url);
                                } else if (img.filename && raw._meta && raw._meta.folder) {
                                    images.push(`${API_BASE_URL}/questions-data/${raw._meta.folder}/images/${img.filename}`);
                                }
                            });
                        }

                        const subj = raw.subject || raw.Subject || subject || 'Physics';

                        return {
                            id: String(raw.id || raw._id || raw.original_id || Math.random().toString(36).slice(2)),
                            question: qText,
                            options: opts,
                            correctAnswer: corr,
                            subject: subj,
                            sub_topic: raw.sub_topic || raw.topic || raw.subTopic || undefined,
                            difficulty: (raw.difficulty === 'Easy' || raw.difficulty === 'Hard') ? raw.difficulty : 'Medium',
                            hasImage: (images.length > 0) || raw.has_images || false,
                            images,
                            explanation: raw.explanation || raw.explain || '',
                            basicAnswer: basic,
                            keywords: raw.keywords || raw.meta || undefined,
                        };
                    };

                    const normalized = questionsData.map(q => normalize(q as any));
                    setQuestions(normalized);
                    setLoading(false);
                    // Reset or set index safely
                    if (initialQuestionIndex < normalized.length) {
                        setCurrentQIndex(initialQuestionIndex);
                    } else {
                        setCurrentQIndex(0);
                    }
                }
                return;
            }

            // Map frontend subject
            let reqSubject = subject || 'Physics';
            if (reqSubject.includes('Physics')) reqSubject = 'Physics';
            else if (reqSubject.includes('Chemistry')) reqSubject = 'Chemistry';
            else if (reqSubject.includes('Biology')) reqSubject = 'Biology';

            if (active) setLoading(true);
            try {
                // Request 10 questions per set
                const response = await apiRequest(`/mcq/subject/practice?subject=${encodeURIComponent(reqSubject)}&count=10&set=${currentSet}&mode=json&t=${Date.now()}`, 'GET');

                if (!active) return;

                if (!response.ok) throw new Error('Failed to fetch practice set');

                const data = await response.json();

                if (data && Array.isArray(data) && data.length > 0) {
                    const validQuestions = filterUniqueQuestions(data);

                    if (validQuestions.length < data.length) {
                        console.warn(`Filtered out ${data.length - validQuestions.length} questions with duplicate options.`);
                    }

                    if (validQuestions.length === 0) {
                        setError("No valid questions available at the moment.");
                    } else {
                        setQuestions(validQuestions);
                        // Restore Index (Legacy Removed)
                        // Restoration is now handled by parent via initialQuestionIndex prop.
                        // However, we verify bounds safety:
                        if (currentQIndex >= validQuestions.length) {
                            setCurrentQIndex(0);
                        }
                    }
                } else {
                    setError("No valid questions could be generated. Please try again.");
                }
            } catch (err) {
                if (!active) return;
                console.error(err);
                setError("Failed to load practice questions. Please check your connection.");
            } finally {
                if (active) setLoading(false);
            }
        };

        if (subject || questionsData) fetchQuestions();

        return () => {
            active = false;
            stopAudio();
            if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
        };
    }, [subject, currentSet, questionsData]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, []);

    const stopAudio = () => {
        // Increment request ID to invalidate any pending fetches
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



    // --- NEW: Save Progress on Question Change ---
    useEffect(() => {
        if (initialSet) {
            const progressKey = `practice_progress_${subject}_${initialSet}`;
            console.log("NEETPracticeInterface: Saving to", progressKey, currentQIndex);
            localStorage.setItem(progressKey, currentQIndex.toString());
        }
    }, [currentQIndex, subject, initialSet]);

    // Handlers
    const handleOptionSelect = (option: string) => {
        if (isAnswered || isExplaining) return;

        setSelectedOption(option);
        const currentQ = questions[currentQIndex];
        // Robust comparison: normalize and compare, support partial matches and unicode superscripts
        const normalizeForCompare = (s: any) => {
            if (!s && s !== 0) return '';
            let str = String(s);
            // map common unicode superscripts to digits
            const supMap: Record<string, string> = { '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁰': '0', '⁻': '-', '−': '-' };
            str = str.split('').map(ch => supMap[ch] || ch).join('');
            // remove non-alphanumeric (keep letters and digits)
            str = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            return str;
        };

        const isOptionMatchingAnswer = (opt: string, ans: any) => {
            const nOpt = normalizeForCompare(opt);
            const nAns = normalizeForCompare(ans);
            if (!nAns) return false;
            if (nOpt === nAns) return true;
            if (nOpt.includes(nAns) || nAns.includes(nOpt)) return true;
            return false;
        };

        let correct = false;
        if (Array.isArray(currentQ.options)) {
            const selectedIdx = currentQ.options.findIndex(o => normalizeForCompare(o) === normalizeForCompare(option));
            const matchedIdx = currentQ.options.findIndex(o => isOptionMatchingAnswer(o, currentQ.correctAnswer));
            if (matchedIdx >= 0 && selectedIdx >= 0) {
                correct = selectedIdx === matchedIdx;
            } else {
                // fallback: compare normalized values directly
                correct = isOptionMatchingAnswer(option, currentQ.correctAnswer);
            }
        } else {
            correct = isOptionMatchingAnswer(option, currentQ.correctAnswer);
        }

        setIsAnswered(true);
        setIsCorrect(correct);

        if (correct) setScore(s => s + 1);

        // Auto-prompt SHORT explanation only
        startExplanation('short');
    };



    const startExplanation = async (type: 'short' | 'detailed' = 'detailed') => {
        // Stop any previous audio and invalidate pending fetches
        stopAudio();
        setIsExplaining(true);
        const currentQ = questions[currentQIndex];

        try {
            let text = "";

            if (type === 'short') {
                // Short Mode: Basic Answer or Verified Correctness
                // This is what plays automatically on selection.
                if (currentQ.basicAnswer) {
                    text = currentQ.basicAnswer;
                } else {
                    // Try to speak the option LETTER (A/B/C/D) when possible
                    const corr = currentQ.correctAnswer;
                    let spoken = corr;
                    if (Array.isArray(currentQ.options) && corr) {
                        const idx = currentQ.options.findIndex(o => String(o).trim() === String(corr).trim());
                        if (idx >= 0) spoken = String.fromCharCode(65 + idx);
                    }
                    text = `The correct answer is Option ${spoken}.`;
                }
            } else {
                // Detailed Mode: Full Explanation
                // Check if explanation text is already loaded to avoid re-fetching/re-setting
                text = explanationText;

                if (!text) {
                    // 1. Get Text Explanation
                    // Check if question already has an explanation from RAG data
                    const hasExplanation = currentQ.explanation && currentQ.explanation.trim().length > 0;

                    if (hasExplanation) {
                        // Use the existing explanation from RAG data
                        text = currentQ.explanation!; // Non-null assertion since we checked hasExplanation
                        setExplanationText(text);
                    } else {
                        // Generate explanation using LLM (only for detailed requests)
                        const prompt = `
                            You are a NEET teacher. Provide a brief explanation (under 60 words) for this question.
                            
                            Question: ${currentQ.question}
                            
                            Options:
                            ${currentQ.options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}
                            
                            Correct Answer: ${currentQ.correctAnswer}
                            
                            IMPORTANT: Start your explanation with "The answer is ${currentQ.correctAnswer} because..." OR end with "Therefore/Hence/So, the answer is ${currentQ.correctAnswer}."
                            
                            Explain why this is the correct answer. Be concise but clear.
                        `;

                        const response = await apiRequest('/voice/query', 'POST', {
                            messages: [{ role: 'user', content: prompt }],
                            courseCategory: currentQ.subject,
                            taskType: 'explanation',
                            subject: subject,
                            setNumber: currentSet,
                            keywords: (currentQ as any).keywordContext || (currentQ as any).keywords || []
                        });

                        if (response.ok) {
                            const data = await response.json();
                            text = data.response;
                            setExplanationText(text);
                        } else {
                            // Fallback
                            text = `The correct answer is ${currentQ.correctAnswer}.`;
                            setExplanationText(text);
                        }
                    }
                }
            }

            // 2. Fetch Audio from Backend
            // Strip LaTeX dollar signs and apply speech preprocessing (decimals, units, underscores)
            const cleanedText = text.replace(/[$]/g, '');
            // Send keywords to backend for accurate TTS pronunciation
            await fetchAndPlayAudio(cleanedText, currentQ.keywords || {});

        } catch (e) {
            console.error("Explanation error", e);
            // Even if audio fails, we want UI to show explaining state so user sees text
        }
    };

    const fetchAndPlayAudio = async (text: string, keywords: Record<string, string> = {}) => {
        // Capture current request ID
        const requestId = audioRequestRef.current;

        try {
            const response = await apiRequest('/voice/speak', 'POST', {
                text: text,
                language: 'english', // Backend handles defaulting to "English (Female)" if configured
                keywords: keywords // Send keywords for accurate pronunciation
            });

            // Check if request is still valid
            if (requestId !== audioRequestRef.current) {
                console.log("Audio request cancelled/superceded.");
                return;
            }

            if (response.ok) {
                const data = await response.json();
                if (data.audio) {
                    // Double check overlap (though stopAudio called before should handle it, async gap exists)
                    if (audioRef.current) {
                        audioRef.current.pause();
                    }

                    const audioSrc = createAudioDataUrl(data.audio, data.audioMime);
                    const audio = new Audio(audioSrc);
                    audio.muted = isMuted;
                    audioRef.current = audio;

                    audio.onended = () => {
                        setIsExplaining(false);
                        // Auto-popup removed. User can click "Dig Deeper" manually.
                        if (videoRef.current) {
                            videoRef.current.pause();
                            videoRef.current.currentTime = 0;
                        }

                        // CHECK: Is this the last question?
                        if (currentQIndex === questions.length - 1) {
                            console.log("Last question audio ended. Auto-advancing in 5s...");
                            if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);

                            autoAdvanceTimeoutRef.current = setTimeout(() => {
                                handleSetCompletion();
                            }, 5000);
                        }
                    };

                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise
                            .then(_ => {
                                // Automatic playback started!
                                if (videoRef.current) {
                                    videoRef.current.play().catch(e => console.error("Video Play Error:", e));
                                }
                            })
                            .catch(error => {
                                console.error("Audio Playback Failed:", error);
                                // If autoplay is blocked (more likely with slower Qwen responses),
                                // retry once on the next explicit user interaction.
                                const retryPlayback = () => {
                                    const activeAudio = audioRef.current;
                                    if (!activeAudio) return;

                                    activeAudio.play()
                                        .then(() => {
                                            if (videoRef.current) {
                                                videoRef.current.play().catch(e => console.error("Video Play Error:", e));
                                            }
                                        })
                                        .catch(retryError => {
                                            console.error("Retry playback failed:", retryError);
                                            setIsExplaining(false);
                                        });
                                };

                                if (typeof window !== 'undefined') {
                                    window.addEventListener('click', retryPlayback, { once: true });
                                } else {
                                    setIsExplaining(false);
                                }

                            });
                    }

                } else {
                    console.warn("No audio returned from backend");
                    // Fallback
                    setTimeout(() => {
                        setIsExplaining(false);
                    }, 2000);
                }
            } else {
                // Response not ok
                throw new Error("TTS response not ok");
            }
        } catch (e) {
            console.error("TTS fetch error", e);
            setTimeout(() => {
                setIsExplaining(false);
            }, 1000);
        }
    };

    const stopExplanation = () => {
        stopAudio();
        setIsExplaining(false);
        setIsPaused(false);
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

    // Extracted Completion Logic to be reused by Auto-Advance
    const handleSetCompletion = () => {
        // --- NEW: If in assessment mode, trigger completion callback ---
        if (mode === 'assessment' && onComplete) {
            const results = {
                score: score,
                totalQuestions: questions.length,
                correctCount: score,
                timeTaken: timeElapsed
            };
            onComplete(results);
            return;
        }

        // Set Completed Logic (Practice Mode)
        const nextSet = currentSet + 1;
        let reqSubject = subject || 'Physics';
        if (reqSubject.includes('Physics')) reqSubject = 'Physics';
        else if (reqSubject.includes('Chemistry')) reqSubject = 'Chemistry';
        else if (reqSubject.includes('Biology')) reqSubject = 'Biology';

        const savedProgress = JSON.parse(localStorage.getItem('yuga_mcq_progress') || '{}');
        savedProgress[reqSubject] = nextSet;
        localStorage.setItem('yuga_mcq_progress', JSON.stringify(savedProgress));

        const historyItem = {
            id: Date.now().toString(),
            subject: reqSubject,
            set: currentSet,
            score: score,
            total: questions.length,
            date: new Date().toISOString(),
            timeTaken: timeElapsed
        };

        try {
            const existingHistory = JSON.parse(localStorage.getItem('yuga_practice_history') || '[]');
            existingHistory.push(historyItem);
            localStorage.setItem('yuga_practice_history', JSON.stringify(existingHistory));
        } catch (e) {
            console.error("Failed to save practice history", e);
        }

        if (nextSet > totalSets) {
            alert(`All ${totalSets} Sets Completed for ${reqSubject}! Final Score: ${score}/${questions.length}`);
            navigate('/');
        } else {
            setShowSetCompletePopup(true);
        }
    };

    const nextQuestion = () => {
        stopExplanation(); // Explicitly stop any playing audio
        if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);

        setIsAnswered(false);
        setIsCorrect(false);
        setSelectedOption(null);
        setExplanationText('');
        setIsExplaining(false);
        setIsPaused(false);

        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            handleSetCompletion();
        }
    };

    const handleNextSet = () => {
        const nextSet = currentSet + 1;
        setScore(0);
        setCurrentQIndex(0);
        setQuestions([]);
        setLoading(true); // Prevent render with empty questions
        setTimeElapsed(0);
        setCurrentSet(nextSet);
        setShowSetCompletePopup(false);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const prevQuestion = () => {
        if (currentQIndex > 0) {
            stopExplanation(); // Stop audio from current question

            // Reset state for previous question view (or keep answer state if we want persistence - usually practice mode resets to specific question state, but here simple reset is safer)
            // Ideally we should track answered state per question, but for now reset allows re-attempt or clean view.
            // If we want to keep state, we need a history array. Assuming simple navigation for now.
            setIsAnswered(false);
            setIsCorrect(false);
            setSelectedOption(null);
            setExplanationText('');
            setIsExplaining(false);
            setIsPaused(false);
            setCurrentQIndex(prev => prev - 1);
        }
    };

    const handleReportClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsReportModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center flex-col gap-4">
                <div className="text-red-500 font-medium">{error}</div>
                <button
                    onClick={() => onExit ? onExit() : navigate('/')}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const currentQ = questions[currentQIndex];

    // Safety guard: If currentQ is undefined (e.g., during set transition or fetch error), show loading
    if (!currentQ) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Process question text to extract images and parse Match Columns
    const processedContent = (() => {
        // Normalize question text to handle varied field names from different sources
        const qAny = currentQ as any;
        let text = currentQ.question || qAny.text || qAny.question_text || '';
        const processedImages: string[] = [];
        let columnsData: { intro: string, col1: string[], col2: string[] } | null = null;

        // --- Image Extraction Logic ---
        if (currentQ.images && currentQ.images.length > 0) {
            currentQ.images.forEach(img => {
                if (typeof img === 'string') {
                    processedImages.push(img);
                } else if (img && typeof img === 'object') {
                    const imgObj = img as any;

                    // New Logic: Construct path for "questions-data" static route
                    // The backend serves "data/questions" at "/api/questions-data"
                    // Practice images are at: mcq_practice/{subject}/Set{set}/images/{filename}
                    // The JSON usually gives "path": "images/filename.png" OR "filename": "..."

                    let imagePath = '';
                    if (imgObj.path && !imgObj.path.includes('\\')) {
                        imagePath = imgObj.path; // e.g. "images/set1_id_7.png"
                    } else if (imgObj.filename) {
                        imagePath = `images/${imgObj.filename}`;
                    }

                    if (imagePath) {
                        // We need subject and set to construct the full URL
                        // currentQ.subject might be "Physics", currentSet might be 1.
                        // Folder structure uses lower case subject?? Let's check. 
                        // The folder viewed earlier was "mcq_practice/physics/Set1". 
                        // Subject in JSON is "Physics" (Title Case).
                        const safeSubject = (currentQ.subject || 'physics').toLowerCase();
                        const safeSet = `Set${currentSet}`;

                        // Mock Test images might differ? 
                        // If it's a mock test calculation, the logic might be different.
                        // But here we are in Practice Interface.

                        processedImages.push(`${API_BASE_URL}/questions-data/mcq_practice/${safeSubject}/${safeSet}/${imagePath}`);
                    }
                    else if (imgObj.url || imgObj.src) processedImages.push(imgObj.url || imgObj.src);
                }
            });
        }
        const imgTags = (text || '').match(/\[IMG:\s*([^\]]+)\]/g);
        if (imgTags) {
            imgTags.forEach((tag: string) => {
                const filename = tag.replace(/\[IMG:\s*|\]/g, '').trim();
                // Assuming [IMG: ...] tags also refer to the same folder structure
                const safeSubject = (currentQ.subject || 'physics').toLowerCase();
                const safeSet = `Set${currentSet}`;
                const imgUrl = `${API_BASE_URL}/questions-data/mcq_practice/${safeSubject}/${safeSet}/images/${filename}`;

                // Only add if not already in processedImages (avoid duplicates)
                if (!processedImages.some(existingUrl => existingUrl.includes(filename))) {
                    processedImages.push(imgUrl);
                }
            });
            text = text.replace(/\[IMG:\s*[^\]]+\]/g, '').trim();
        }

        // --- Match Column Parsing Logic ---
        // Look for pattern "Column-1" ... "Column-2"
        if ((text || '').includes("Column-1") && (text || '').includes("Column-2")) {
            try {
                // Split into Intro, Col 1 block, Col 2 block
                const parts = text.split(/Column-1|Column-2/);
                if (parts.length >= 3) {
                    // Helper to clean up markdown artifacts like **
                    const cleanText = (str: string) => str.replace(/\*\*/g, '').trim();

                    const intro = cleanText(parts[0]);
                    const col1Raw = parts[1].trim();
                    const col2Raw = parts[2].trim();

                    // Helper to split items (assuming they start with P, Q, R, S or A, B, C, D followed by dot or bracket)
                    // We split by newline lookahead that starts with a capital letter and dot/bracket
                    const splitItems = (raw: string) => {
                        return raw.split(/\n(?=[A-Z][.)])/).map(s => cleanText(s)).filter(s => s);
                    };

                    columnsData = {
                        intro,
                        col1: splitItems(col1Raw),
                        col2: splitItems(col2Raw)
                    };
                }
            } catch (e) {
                console.error("Failed to parse Match Columns", e);
            }
        }

        return { text, images: processedImages, columns: columnsData };
    })();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col transition-colors duration-300 relative overflow-x-hidden selection:bg-blue-200 dark:selection:bg-blue-900">
            {/* Dynamic Backgrounds */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-900/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-200/40 dark:bg-blue-900/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Header - Floating Glass */}
            <header className="sticky top-0 z-50 px-4 sm:px-6 py-3">
                <div className="max-w-7xl mx-auto bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-2xl shadow-lg ring-1 ring-black/5 flex items-center justify-between px-4 py-3 relative overflow-hidden">
                    {/* Progress Bar (Subtle) */}
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 opacity-80" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }} />

                    <div className="flex items-center gap-2 sm:gap-4 z-10 overflow-hidden">
                        <button
                            onClick={() => onExit ? onExit() : navigate('/')}
                            className="p-1.5 sm:p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-slate-600 dark:text-slate-300 transition-colors group shrink-0"
                            title="Exit"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </button>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            {(() => {
                                const uniqueSubjects = Array.from(new Set(questions.map(q => q.subject))).filter(Boolean);

                                if (uniqueSubjects.length > 1) {
                                    return (
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 overflow-hidden">
                                            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-lg sm:rounded-xl shadow-inner overflow-x-auto no-scrollbar">
                                                {uniqueSubjects.map((subText) => {
                                                    const isActive = currentQ.subject === subText;
                                                    return (
                                                        <button
                                                            key={subText}
                                                            onClick={() => {
                                                                const firstIdx = questions.findIndex(q => q.subject === subText);
                                                                if (firstIdx !== -1 && firstIdx !== currentQIndex) {
                                                                    stopExplanation();
                                                                    setIsAnswered(false);
                                                                    setIsCorrect(false);
                                                                    setSelectedOption(null);
                                                                    setExplanationText('');
                                                                    setIsExplaining(false);
                                                                    setIsPaused(false);
                                                                    setCurrentQIndex(firstIdx);
                                                                }
                                                            }}
                                                            className={`whitespace-nowrap px-2 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-sm font-bold transition-all ${isActive
                                                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                                                }`}
                                                        >
                                                            {subText}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                                Q{currentQIndex + 1} of {questions.length}
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="min-w-0">
                                        <h1 className="text-sm sm:text-lg font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5 truncate">
                                            {currentQ.subject}
                                            <span className="text-[8px] sm:text-xs font-medium px-1.5 sm:py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 whitespace-nowrap">Set {currentSet}</span>
                                        </h1>
                                        <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                            Question {currentQIndex + 1} of {questions.length}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 z-10">
                        {/* Timer (Optional - if needed, reusing timeElapsed logic) */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50/80 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800/50 text-xs font-semibold">
                            <span>{Math.floor(timeElapsed / 60).toString().padStart(2, '0')}:{(timeElapsed % 60).toString().padStart(2, '0')}</span>
                        </div>

                        <div className="px-3 py-1.5 rounded-lg bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 flex items-center gap-2 text-sm font-bold shadow-sm backdrop-blur-sm">
                            <CheckCircle className="w-4 h-4" />
                            {score}
                        </div>

                        <button
                            onClick={handleReportClick}
                            className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                            title="Report"
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10">

                {/* Left Column: Question & Options */}
                <div className="lg:col-span-8 space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQIndex}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={slideIn}
                            className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl overflow-hidden shadow-xl"
                        >
                            {/* Question Header & Band */}
                            <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30 px-6 py-4 border-b border-white/20 dark:border-slate-700/30 flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Question {currentQIndex + 1}</span>
                                <span className="px-3 py-1 bg-white/50 dark:bg-slate-800/50 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 border border-white/20 dark:border-slate-700/30">
                                    {currentQ.difficulty || "Medium"}
                                </span>
                            </div>

                            <div className="p-6 sm:p-8">
                                <h2 className="text-xl sm:text-2xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed font-serif tracking-tight">
                                    {processedContent.columns ? (
                                        // Match Columns Layout
                                        <div className="space-y-6">
                                            <p className="mb-4 text-base sm:text-lg">{processedContent.columns.intro}</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-4 sm:p-6 border border-slate-200/50 dark:border-slate-700/50">
                                                <div className="space-y-4">
                                                    <div className="font-bold text-xs uppercase tracking-wider text-slate-400 text-center mb-2">Column I</div>
                                                    {processedContent.columns.col1.map((item, idx) => (
                                                        <div key={idx} className="flex gap-3 text-base p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                                            <ReactMarkdown components={{ p: (p) => <span {...p} /> }}>{item}</ReactMarkdown>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="font-bold text-xs uppercase tracking-wider text-slate-400 text-center mb-2">Column II</div>
                                                    {processedContent.columns.col2.map((item, idx) => (
                                                        <div key={idx} className="flex gap-3 text-base p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                                            <ReactMarkdown components={{ p: (p) => <span {...p} /> }}>{item}</ReactMarkdown>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Standard Text Layout
                                        <div className="text-lg leading-relaxed font-medium text-slate-800 dark:text-slate-100">
                                            <FormattedText content={formatTextForMarkdown(processedContent.text)} />
                                        </div>
                                    )}
                                </h2>

                                {processedContent.images.length > 0 && (
                                    <div className={`mt-8 ${processedContent.images.length > 1 ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex justify-center'} gap-4`}>
                                        {processedContent.images.map((imgSrc, idx) => (
                                            <div key={idx} className="relative group rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center h-64">
                                                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" style={{ display: 'none' }} />
                                                <img
                                                    src={imgSrc}
                                                    alt={`Diagram ${idx + 1}`}
                                                    className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {currentQ.options.map((option, idx) => {
                                const isSelected = selectedOption === option;
                                const isCorrectOpt = option === currentQ.correctAnswer;
                                const showResult = isAnswered;

                                let variant = "default";
                                if (showResult) {
                                    if (isCorrectOpt) variant = "correct";
                                    else if (isSelected && !isCorrectOpt) variant = "incorrect";
                                    else variant = "dimmed";
                                } else if (isSelected) {
                                    variant = "selected";
                                }

                                const styles = {
                                    default: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500",
                                    selected: "bg-blue-50 dark:bg-blue-900/40 border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800",
                                    correct: "bg-green-50 dark:bg-green-900/30 border-green-500 ring-1 ring-green-200 dark:ring-green-800",
                                    incorrect: "bg-red-50 dark:bg-red-900/30 border-red-500 ring-1 ring-red-200 dark:ring-red-800",
                                    dimmed: "opacity-50 grayscale bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800"
                                };

                                return (
                                    <motion.button
                                        key={idx}
                                        variants={cardHover}
                                        whileHover={!isAnswered ? "hover" : {}}
                                        whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                        onClick={() => handleOptionSelect(option)}
                                        disabled={isAnswered}
                                        className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col justify-center min-h-[100px] shadow-sm ${styles[variant as keyof typeof styles]}`}
                                    >
                                        <div className="flex items-start gap-3 w-full">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${variant === 'correct' ? 'bg-green-500 text-white' :
                                                variant === 'incorrect' ? 'bg-red-500 text-white' :
                                                    variant === 'selected' ? 'bg-blue-500 text-white' :
                                                        'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                                }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <div className={`flex-1 text-sm sm:text-base font-medium ${variant === 'correct' ? 'text-green-800 dark:text-green-200' :
                                                variant === 'incorrect' ? 'text-red-800 dark:text-red-200' :
                                                    'text-slate-700 dark:text-slate-200'
                                                }`}>
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkMath]}
                                                    rehypePlugins={[rehypeKatex]}
                                                    components={{ p: (props: any) => <span {...props} className="whitespace-pre-line" /> }}
                                                >
                                                    {option}
                                                </ReactMarkdown>
                                            </div>

                                            {/* Status Icon */}
                                            {showResult && isCorrectOpt && <CheckCircle className="w-6 h-6 text-green-500 absolute top-4 right-4" />}
                                            {showResult && isSelected && !isCorrectOpt && <XCircle className="w-6 h-6 text-red-500 absolute top-4 right-4" />}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* SME Action Buttons (Injected for Review Mode) */}
                    {isSMEReviewMode && (
                        <div className="mt-6 w-full border-t border-slate-200 dark:border-slate-700/50 pt-6 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => onSMEAction && onSMEAction('report', currentQ.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-95"
                            >
                                <ShieldAlert className="w-5 h-5" />
                                Report Issue
                            </button>
                            <button
                                onClick={() => onSMEAction && onSMEAction('recheck', currentQ.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-95"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Recheck
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column (Control Deck & Avatar) */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 h-fit">

                    {/* Avatar Portal Card */}
                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />

                        <div className="relative z-10 flex flex-row lg:flex-col items-center gap-4 lg:gap-0">
                            {/* Avatar Circle */}
                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 lg:mb-6 shrink-0">
                                <div className={`absolute inset-0 bg-gradient-to-tr from-blue-400 to-purple-400 rounded-full blur-2xl opacity-20 transition-opacity duration-500 ${isExplaining ? 'animate-pulse opacity-40' : ''}`} />
                                <div className="w-full h-full rounded-2xl overflow-hidden border-2 sm:border-4 border-white dark:border-slate-800 shadow-2xl relative bg-slate-200 dark:bg-slate-900">
                                    <video
                                        ref={videoRef}
                                        src={avatarVideo}
                                        className="w-full h-full object-cover"
                                        loop
                                        muted
                                        playsInline
                                    />
                                    {/* Mute Toggle Overlay */}

                                </div>
                            </div>
                            {/* Dialogue / Status */}
                            <div className="flex-1 text-left lg:text-center space-y-2 min-h-[40px] lg:min-h-[60px]">
                                {!isAnswered ? (
                                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium animate-pulse">
                                        Checking your knowledge...
                                    </p>
                                ) : (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1 sm:space-y-2">
                                        <div className={`text-base sm:text-lg font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                            {isCorrect ? "Correct!" : "Incorrect"}
                                        </div>
                                        {/* Auto-Explanation Text (Mini) */}
                                        {currentQ.basicAnswer && (
                                            <div className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 p-2 sm:p-3 rounded-lg text-left border border-slate-200 dark:border-slate-700/50 max-h-24 overflow-y-auto no-scrollbar">
                                                <FormattedText content={formatTextForMarkdown(currentQ.basicAnswer)} />
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Control Deck (Command Center) */}
                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl p-4 shadow-xl">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            {/* Navigation Buttons */}
                            <button
                                onClick={prevQuestion}
                                disabled={currentQIndex === 0}
                                className={`col-span-1 py-3 px-4 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all ${currentQIndex === 0 ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                                    }`}
                            >
                                <ArrowLeft className="w-4 h-4" /> Prev
                            </button>
                            <button
                                onClick={nextQuestion}
                                className="col-span-1 py-3 px-4 rounded-xl font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="h-px bg-slate-200 dark:bg-slate-700 my-4" />

                        {/* Tools Grid */}
                        <div className="grid grid-cols-3 gap-2 animate-fade-in-up">
                            <button
                                onClick={() => {
                                    stopExplanation();
                                    setTutorContext({
                                        question: currentQ.question,
                                        options: currentQ.options,
                                        correctAnswer: currentQ.correctAnswer,
                                        userAnswer: selectedOption,
                                        explanation: currentQ.explanation,
                                        simpleExplanation: currentQ.basicAnswer,
                                        mode: 'doubt',
                                        subject: currentQ.subject,
                                        keywords: (currentQ as any).keywords
                                    });
                                    setIsTutorOpen(true);
                                }}
                                className="py-3 px-1 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold border-2 border-purple-400 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-1 text-xs"
                                title="Ask a Doubt"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Doubt</span>
                            </button>

                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    stopExplanation();

                                    // If explanation exists, open popup immediately
                                    if (currentQ.explanation) {
                                        setTutorContext({
                                            question: currentQ.question,
                                            options: currentQ.options,
                                            correctAnswer: currentQ.correctAnswer,
                                            userAnswer: selectedOption,
                                            explanation: currentQ.explanation,
                                            simpleExplanation: currentQ.basicAnswer,
                                            mode: 'detailed',
                                            subject: currentQ.subject,
                                            keywords: (currentQ as any).keywords
                                        });
                                        setIsTutorOpen(true);
                                        return;
                                    }

                                    // Else fetch on-demand
                                    if (isFetchingExplanation) return; // Prevent double click

                                    setIsFetchingExplanation(true);
                                    try {
                                        const response = await apiRequest('/ai-assessment/explain', 'POST', {
                                            question: currentQ.question,
                                            options: currentQ.options,
                                            correctAnswer: currentQ.correctAnswer,
                                            subject: currentQ.subject
                                        });

                                        if (response.ok) {
                                            const data = await response.json();
                                            const newExplanation = data.explanation;

                                            // Update local state so we don't fetch again
                                            setQuestions(prev => prev.map((q, idx) =>
                                                idx === currentQIndex ? { ...q, explanation: newExplanation } : q
                                            ));

                                            // Open popup
                                            setTutorContext({
                                                question: currentQ.question,
                                                options: currentQ.options,
                                                correctAnswer: currentQ.correctAnswer,
                                                userAnswer: selectedOption,
                                                explanation: newExplanation,
                                                simpleExplanation: currentQ.basicAnswer,
                                                mode: 'detailed',
                                                subject: currentQ.subject,
                                                keywords: (currentQ as any).keywords
                                            });
                                            setIsTutorOpen(true);
                                        }
                                    } catch (err) {
                                        console.error("Failed to fetch detailed explanation", err);
                                    } finally {
                                        setIsFetchingExplanation(false);
                                    }
                                }}
                                className="py-3 px-1 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold border-2 border-blue-400 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-1 text-xs"
                                title="Explain Deeply"
                                disabled={isFetchingExplanation}
                            >
                                {isFetchingExplanation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                                <span>In-detailed</span>
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); startExplanation('short'); }}
                                className="py-3 px-1 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold border-2 border-orange-400 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-1 text-xs group relative"
                                title="Replay Explanation"
                            >
                                <RotateCcw className="w-4 h-4 group-hover:rotate-[360deg] transition-transform duration-500" />
                                <span>Replay</span>
                                {isExplaining && !isPaused && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse absolute top-2 right-2" />}
                            </button>
                        </div>

                        {/* Audio Control Bar (When Explaining) */}
                        <AnimatePresence>
                            {isExplaining && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 overflow-hidden"
                                >
                                    <div className="flex items-center justify-between gap-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                                        <div className="px-3 text-xs font-bold text-slate-500 uppercase">Audio</div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={pauseExplanation} className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-sm hover:scale-110 transition-transform">
                                                {isPaused ? <Play className="w-4 h-4 fill-slate-800 dark:fill-white" /> : <Pause className="w-4 h-4 fill-slate-800 dark:fill-white" />}
                                            </button>
                                            <button onClick={stopExplanation} className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors">
                                                <Square className="w-4 h-4 fill-current" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </main>


            {/* AI Teacher Popup */}
            {isTutorOpen && tutorContext && (
                <TutorExplanationPopup
                    isOpen={isTutorOpen}
                    onClose={() => setIsTutorOpen(false)}
                    context={tutorContext}
                />
            )}

            {/* Action Menu Popup */}
            <AnimatePresence>
                {showActionMenu && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowActionMenu(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-white/20 dark:border-slate-700 relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Explanation Options</h3>
                                <button
                                    onClick={() => setShowActionMenu(false)}
                                    className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-500 dark:text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        setShowActionMenu(false);
                                        setTutorContext({
                                            question: currentQ.question,
                                            options: currentQ.options,
                                            correctAnswer: currentQ.correctAnswer,
                                            userAnswer: selectedOption,
                                            explanation: explanationText,
                                            simpleExplanation: explanationText,
                                            mode: 'detailed',
                                            subject: currentQ.subject,
                                            keywords: (currentQ as any).keywords
                                        });
                                        setIsTutorOpen(true);
                                    }}
                                    className="w-full py-4 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
                                >
                                    <Brain className="w-5 h-5" />
                                    Detailed Explanation
                                </button>

                                <button
                                    onClick={() => {
                                        setShowActionMenu(false);
                                        startExplanation();
                                    }}
                                    className="w-full py-4 px-4 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 text-slate-700 dark:text-slate-200 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all"
                                >
                                    <Play className="w-5 h-5" />
                                    Repeat Explanation
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            <ReportQuestionModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                questionData={questions[currentQIndex]}
                type="practice"
                extraData={{
                    selectedAnswer: isAnswered ? (selectedOption || undefined) : undefined,
                    explanation: explanationText || questions[currentQIndex]?.explanation
                }}
            />
            {/* Set Complete Popup */}
            <AnimatePresence>
                {showSetCompletePopup && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl p-8 max-w-md w-full text-center border-2 border-white/50 dark:border-slate-700 relative overflow-hidden ring-1 ring-white/20"
                        >
                            {/* Decorative Background Effects */}
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 animate-spin-slow"></div>
                                <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-[50px] animate-pulse"></div>
                                <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-purple-400/20 rounded-full blur-[60px] animate-pulse delay-700"></div>
                            </div>

                            <div className="relative z-10">
                                {/* Success Icon Animation */}
                                <div className="w-24 h-24 mx-auto mb-6 relative">
                                    <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
                                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 border-4 border-white dark:border-slate-800">
                                        <CheckCircle className="w-12 h-12 text-white" />
                                    </div>
                                    {/* Small floating particles */}
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="absolute bottom-2 left-0 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-300"></div>
                                </div>

                                <motion.h3
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 mb-2"
                                >
                                    Set {currentSet} Conquered!
                                </motion.h3>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-slate-500 dark:text-slate-400 mb-8 font-medium"
                                >
                                    You're making great progress.
                                </motion.p>

                                {/* Score Card */}
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-8 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between shadow-inner"
                                >
                                    <div className="text-center flex-1 border-r border-slate-200 dark:border-slate-700">
                                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Score</div>
                                        <div className="text-2xl font-black text-slate-800 dark:text-white">
                                            {score}<span className="text-lg text-slate-400 font-medium">/{questions.length}</span>
                                        </div>
                                    </div>
                                    <div className="text-center flex-1">
                                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Time</div>
                                        <div className="text-2xl font-black text-slate-800 dark:text-white">
                                            {Math.floor(timeElapsed / 60)}<span className="text-sm font-medium text-slate-400">m</span> {timeElapsed % 60}<span className="text-sm font-medium text-slate-400">s</span>
                                        </div>
                                    </div>
                                </motion.div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleNextSet}
                                        className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
                                    >
                                        Start Set {currentSet + 1}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button
                                        onClick={handleGoHome}
                                        className="w-full py-4 px-6 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                    >
                                        Return to Dashboard
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

