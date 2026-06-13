import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, TrendingUp, BookOpen, X, ArrowRight } from "lucide-react";
import { MockTestSelection } from "../../course/components/MockTestSelection";
import { CBTInterface } from "../../course/components/CBTInterface";
import { MockAnalysisView } from "../../course/components/MockAnalysisView";
import { MockPerformanceReport } from "../../course/components/MockPerformanceReport";

export const MockExamHubPage = () => {
    const navigate = useNavigate();
    const [selectedMockId, setSelectedMockId] = useState<string | null>(null);
    const [isCBTOpen, setIsCBTOpen] = useState(false);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completedMockId, setCompletedMockId] = useState<string | null>(null);

    useEffect(() => {
        setLoading(false);
    }, []);

    const handleSelectMock = (mockId: string) => {
        setSelectedMockId(mockId);
        setIsCBTOpen(true);
        setIsAnalysisOpen(false);
    };

    const handleAnalysisMock = (mockId: string) => {
        setSelectedMockId(mockId);
        setIsAnalysisOpen(true);
        setIsCBTOpen(false);
        setIsPerformanceOpen(false);
    };

    const handlePerformanceMock = (mockId: string) => {
        setSelectedMockId(mockId);
        setIsPerformanceOpen(true);
        setIsAnalysisOpen(false);
        setIsCBTOpen(false);
    };

    const handleReattemptMock = (mockId: string) => {
        setSelectedMockId(mockId);
        setIsCBTOpen(true);
        setIsAnalysisOpen(false);
    };

    const handleCBTComplete = (results: any) => {
        console.log("CBT Results:", results);

        const savedProgress = localStorage.getItem('neet_mock_progress');
        const progress = savedProgress ? JSON.parse(savedProgress) : {};
        if (selectedMockId) {
            progress[selectedMockId] = { completed: true, timestamp: Date.now() };
            localStorage.setItem('neet_mock_progress', JSON.stringify(progress));
            localStorage.setItem(`mock_result_${selectedMockId}`, JSON.stringify(results));
        }

        setIsCBTOpen(false);
        setCompletedMockId(selectedMockId);
        setShowCompletionModal(true);
        setSelectedMockId(null);
        setLastUpdated(Date.now());
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <>
            {isAnalysisOpen && selectedMockId ? (
                <MockAnalysisView
                    mockId={selectedMockId}
                    onBack={() => {
                        setIsAnalysisOpen(false);
                        setSelectedMockId(null);
                    }}
                />
            ) : isPerformanceOpen && selectedMockId ? (
                <MockPerformanceReport
                    mockId={selectedMockId}
                    onBack={() => {
                        setIsPerformanceOpen(false);
                        setSelectedMockId(null);
                    }}
                />
            ) : (
                <>
                    <MockTestSelection
                        onBack={() => navigate('/')}
                        onSelectMock={handleSelectMock}
                        onAnalysis={handleAnalysisMock}
                        onPerformance={handlePerformanceMock}
                        onReattempt={handleReattemptMock}
                        lastUpdated={lastUpdated}
                    />

                    {isCBTOpen && selectedMockId && (
                        <CBTInterface
                            mockId={selectedMockId}
                            onClose={() => {
                                setIsCBTOpen(false);
                                setSelectedMockId(null);
                            }}
                            onComplete={handleCBTComplete}
                        />
                    )}

                    <AnimatePresence>
                        {showCompletionModal && completedMockId && (
                            <PostExamCompletionModal
                                mockId={completedMockId}
                                onAnalyze={() => {
                                    handleAnalysisMock(completedMockId);
                                    setShowCompletionModal(false);
                                }}
                                onPerformance={() => {
                                    handlePerformanceMock(completedMockId);
                                    setShowCompletionModal(false);
                                }}
                                onClose={() => setShowCompletionModal(false)}
                            />
                        )}
                    </AnimatePresence>
                </>
            )}
        </>
    );
};

interface PostExamCompletionModalProps {
    mockId: string;
    onAnalyze: () => void;
    onPerformance: () => void;
    onClose: () => void;
}

const PostExamCompletionModal: React.FC<PostExamCompletionModalProps> = ({ onAnalyze, onPerformance, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden px-8 py-10 text-center"
            >
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>

                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                    Exam Completed!
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg font-medium">
                    Excellent work finishing the session. How would you like to proceed?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={onAnalyze}
                        className="group p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all text-left relative overflow-hidden"
                    >
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400 mb-4 w-fit">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white mb-1">Check Answers</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Review detailed solutions and explanations.</p>
                        <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest gap-2">
                            Review Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    <button
                        onClick={onPerformance}
                        className="group p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all text-left relative overflow-hidden"
                    >
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 mb-4 w-fit">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white mb-1">Performance Report</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Analyze your speed, accuracy and progress.</p>
                        <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest gap-2">
                            View Report <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
