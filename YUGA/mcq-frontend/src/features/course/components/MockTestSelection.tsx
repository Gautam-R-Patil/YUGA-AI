import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    ArrowLeft, Lock, CheckCircle2, Clock, 
    BookOpen, ChevronRight, Zap, Target, 
    TrendingUp, RefreshCw, Star
} from "lucide-react";
import { AIAvatar } from "../../../shared/components/AIAvatar";
import { useCourse } from "../../../core/contexts/CourseContext";
import { useAuth } from "../../../core/contexts/AuthContext";
import { Link } from "react-router-dom";

interface MockPaper {
    id: string;
    title: string;
    description: string;
    totalQuestions: number;
    duration: string;
    status: 'locked' | 'unlocked' | 'completed';
    attempts?: number;
    bestScore?: number;
    image: string;
    accentColor: string;
}

interface MockTestSelectionProps {
    onBack: () => void;
    onSelectMock: (mockId: string) => void;
    onAnalysis?: (mockId: string) => void;
    onPerformance?: (mockId: string) => void;
    onReattempt?: (mockId: string) => void;
    lastUpdated?: number;
}

const MockTestSelection: React.FC<MockTestSelectionProps> = ({ 
    onBack, onSelectMock, onAnalysis, onPerformance, onReattempt, lastUpdated 
}) => {
    const { selectedCourse } = useCourse();
    const { user } = useAuth();
    const plan = user?.membership?.plan || 'free';
    const isPremium = plan === 'student' || plan === 'pro' || plan === 'premium';
    const title = selectedCourse === 'both' ? 'NEET & JEE' : selectedCourse.toUpperCase();


    const [mockPapers, setMockPapers] = useState<MockPaper[]>([
        {
            id: 'neet-mock-1',
            title: 'Micro Mock 01',
            description: 'Comprehensive simulation of the NEET UG examination environment (Micro Series).',
            totalQuestions: 40,
            duration: '40 mins',
            status: 'unlocked',
            image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80',
            accentColor: 'blue'
        },
        {
            id: 'neet-mock-2',
            title: 'Micro Mock 02',
            description: 'Advanced difficulty level focusing on high-probability topics (Micro Series).',
            totalQuestions: 40,
            duration: '40 mins',
            status: 'unlocked',
            image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80',
            accentColor: 'emerald'
        },
        {
            id: 'neet-mock-3',
            title: 'Micro Mock 03',
            description: 'Rigorous assessment designed to test deep conceptual understanding (Micro Series).',
            totalQuestions: 40,
            duration: '40 mins',
            status: 'unlocked',
            image: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=800&q=80',
            accentColor: 'amber'
        },
        {
            id: 'neet-mock-4',
            title: 'Micro Mock 04',
            description: 'Balanced test series mirroring latest exam patterns (Micro Series).',
            totalQuestions: 40,
            duration: '40 mins',
            status: 'unlocked',
            image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
            accentColor: 'purple'
        }
    ]);

    useEffect(() => {
        const savedProgress = localStorage.getItem('neet_mock_progress');
        const progress = savedProgress ? JSON.parse(savedProgress) : {};
        
        setMockPapers(prev => prev.map((paper, idx) => {
            let status = paper.status;
            
            // Enforce locking for free tier (mocks > 2)
            if (!isPremium && idx >= 2) {
                status = 'locked';
            } else if (progress[paper.id]?.completed) {
                status = 'completed';
            } else {
                status = 'unlocked';
            }
            
            return { ...paper, status };
        }));
    }, [isPremium, lastUpdated]);

    const completedCount = mockPapers.filter(p => p.status === 'completed').length;
    const progressPercentage = Math.round((completedCount / mockPapers.length) * 100);

    return (
        <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-indigo-100/30 rounded-full blur-[100px]"></div>
            </div>

            {/* Header */}
            <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-100 bg-white/70 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={onBack}
                            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-slate-500 hover:text-slate-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">
                                {title} <span className="text-indigo-600">Sync</span> Hub
                            </h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Adaptive Test Selection</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center gap-6 px-6 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                            <StatPill icon={Star} label="Tier" value="Diamond" color="indigo" />
                            <div className="w-[1px] h-8 bg-slate-200"></div>
                            <StatPill icon={Zap} label="Efficiency" value="94%" color="emerald" />
                        </div>
                        <AIAvatar size="small" emotion="happy" isActive />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
                <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12 mb-16">
                    <div className="max-w-2xl">
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-6"
                        >
                            2026 Academic Series
                        </motion.span>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-6"
                        >
                            ENGINEER YOUR <br />
                            <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-[10px]">FUTURE.</span>
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-500 text-lg font-medium leading-relaxed"
                        >
                            Custom-built mocks designed by top subject matter experts. 
                            Track your progress and outpace the competition.
                        </motion.p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="w-full lg:w-85 p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Progress</span>
                            <span className="text-xl font-black text-indigo-600">{progressPercentage}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-6">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                className="h-full bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                            />
                        </div>
                        <button 
                            onClick={() => { localStorage.removeItem('neet_mock_progress'); window.location.reload(); }}
                            className="w-full py-3.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Reset History
                        </button>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mockPapers.map((paper, idx) => (
                        <MockCard 
                            key={paper.id}
                            paper={paper}
                            index={idx}
                            onSelect={() => onSelectMock(paper.id)}
                            onAnalysis={() => onAnalysis?.(paper.id)}
                            onPerformance={() => onPerformance?.(paper.id)}
                            onReattempt={() => onReattempt?.(paper.id)}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

const MockCard = ({ paper, index, onSelect, onAnalysis, onPerformance, onReattempt }: any) => {
    const isLocked = paper.status === 'locked';
    const isCompleted = paper.status === 'completed';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300`}
        >
            {/* Header Image Area */}
            <div className="relative h-60 overflow-hidden">
                <img 
                    src={paper.image} 
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale opacity-60' : 'opacity-100'}`}
                />
                
                <div className="absolute top-6 right-6">
                    {isLocked ? (
                        <div className="p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-100 shadow-lg shadow-black/5">
                            <Lock className="w-5 h-5 text-slate-400" />
                        </div>
                    ) : (
                        <div className={`px-4 py-1.5 rounded-full backdrop-blur-md text-[10px] font-black uppercase tracking-widest shadow-xl border ${isCompleted ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white/90 text-indigo-600 border-white'}`}>
                            {isCompleted ? 'Completed' : 'Available'}
                        </div>
                    )}
                </div>

                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white via-white/50 to-transparent"></div>

                <div className="absolute bottom-6 left-8 right-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Mock Exam {index + 1}</span>
                        <div className="h-[1px] flex-1 bg-indigo-100"></div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{paper.title}</h3>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8 pt-2">
                <div className="flex items-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{paper.totalQuestions} Questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{paper.totalQuestions} Marks</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{paper.duration}</span>
                    </div>
                </div>

                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 line-clamp-2">
                    {paper.description}
                </p>

                <div className="">
                    {isLocked ? (
                        <Link 
                            to="/premium"
                            className="w-full py-4 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-lg"
                        >
                            <Lock className="w-4 h-4" /> Upgrade to Unlock
                        </Link>
                    ) : isCompleted ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={onReattempt}
                                    className="py-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-all text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center justify-center gap-2"
                                >
                                    Retake
                                </button>
                                <button 
                                    onClick={onAnalysis}
                                    className="py-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all text-[10px] font-black uppercase tracking-widest text-emerald-700 flex items-center justify-center gap-2"
                                >
                                    Answers <CheckCircle2 className="w-4 h-4" />
                                </button>
                            </div>
                            <button 
                                onClick={onPerformance}
                                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition-all text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20"
                            >
                                <TrendingUp className="w-4 h-4" /> Performance Report
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={onSelect}
                            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition-all text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-3 group/btn shadow-lg shadow-indigo-500/20"
                        >
                            Launch Session <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const StatPill = ({ icon: Icon, label, value, color }: any) => {
    const colors: any = {
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100"
    };
    return (
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${colors[color]}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 leading-none mb-1.5">{label}</p>
                <p className="text-sm font-black text-slate-900 leading-none">{value}</p>
            </div>
        </div>
    );
};

export { MockTestSelection };
