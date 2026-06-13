import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Clock, Layers } from "lucide-react";
import { AIAvatar } from "../../../shared/components/AIAvatar";
import { apiRequest } from "../../../core/utils/api";

interface PracticeSet {
    id: number;
    title: string;
    description: string;
    totalQuestions: number;
    duration: string;
    status: 'locked' | 'unlocked' | 'completed';
    accentColor: string;
    image: string;
}

interface PracticeSetSelectionProps {
    subject: string;
    onBack: () => void;
    onSelectSet: (setNumber: number, startIndex?: number) => void;
}

const PracticeSetSelection: React.FC<PracticeSetSelectionProps> = ({ subject, onBack, onSelectSet }) => {
    const [sets, setSets] = useState<PracticeSet[]>([]);

    useEffect(() => {
        // Topic-Specific Abstract Images
        const physicsImages = [
            "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
            "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0fe?w=800&q=80",
            "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
            "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80"
        ];

        const chemistryImages = [
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
            "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80",
            "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80",
            "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=800&q=80",
            "https://images.unsplash.com/photo-1622675363311-385c40d6268b?w=800&q=80"
        ];

        const biologyImages = [
            "/images/dna_thumb.png",
            "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80",
            "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
            "https://images.unsplash.com/photo-1532187643603-ba119ca4189e?w=800&q=80",
            "/images/dna_cells.png"
        ];

        const fetchSets = async () => {
            let topicImages = physicsImages;
            const subjLower = subject.toLowerCase();
            if (subjLower.includes('chemistry')) topicImages = chemistryImages;
            else if (subjLower.includes('biology')) topicImages = biologyImages;

            try {
                const response = await apiRequest(`/mcq/subject/${encodeURIComponent(subject)}/sets`, 'GET');
                let totalSets = 5;

                if (response.ok) {
                    const data = await response.json();
                    if (data.count && data.count > 0) {
                        totalSets = data.count;
                    }
                }

                const newSets: PracticeSet[] = Array.from({ length: totalSets }, (_, i) => {
                    const setNumber = i + 1;
                    return {
                        id: setNumber,
                        title: `Practice Set ${setNumber}`,
                        description: `Core concepts and high-yield questions for ${subject}.`,
                        totalQuestions: 10,
                        duration: '10-15 mins',
                        status: 'unlocked',
                        accentColor: i % 2 === 0 ? 'from-purple-500 to-blue-500' : 'from-blue-600 to-purple-600',
                        image: topicImages[i % topicImages.length]
                    };
                });

                const savedProgress = JSON.parse(localStorage.getItem('yuga_mcq_progress') || '{}');
                const currentSetNum = savedProgress[subject] || 1;

                const updatedSets = newSets.map(set => {
                    if (set.id < currentSetNum) return { ...set, status: 'completed' as const };
                    return set;
                });

                setSets(updatedSets);

            } catch (err) {
                console.error("Failed to fetch sets:", err);
                const fallbackSets: PracticeSet[] = Array.from({ length: 6 }, (_, i) => ({
                    id: i + 1,
                    title: `Practice Set ${i + 1}`,
                    description: `Core concepts and high-yield for ${subject}.`,
                    totalQuestions: 10,
                    duration: '10-15 mins',
                    status: 'unlocked',
                    accentColor: i % 2 === 0 ? 'from-purple-500 to-blue-500' : 'from-blue-600 to-purple-600',
                    image: topicImages[i % topicImages.length]
                }));
                setSets(fallbackSets);
            }
        };

        fetchSets();
    }, [subject]);

    const completedCount = sets.filter(s => s.status === 'completed').length;
    const progressPercentage = Math.round((completedCount / 10) * 100);

    const [showResumePopup, setShowResumePopup] = useState(false);
    const [pendingSetId, setPendingSetId] = useState<number | null>(null);
    const [savedProgressIndex, setSavedProgressIndex] = useState<number>(0);

    const handleSetClick = (setId: number) => {
        const normalizedSubject = (() => {
            const s = subject.toLowerCase();
            if (s.includes('physics')) return 'Physics';
            if (s.includes('chemistry')) return 'Chemistry';
            if (s.includes('biology')) return 'Biology';
            return subject;
        })();

        const progressKey = `practice_progress_${normalizedSubject}_${setId}`;
        const savedIndex = localStorage.getItem(progressKey);

        if (savedIndex && parseInt(savedIndex) > 0) {
            setPendingSetId(setId);
            setSavedProgressIndex(parseInt(savedIndex));
            setShowResumePopup(true);
        } else {
            onSelectSet(setId, 0);
        }
    };

    const confirmResume = (resume: boolean) => {
        if (pendingSetId !== null) {
            if (resume) {
                onSelectSet(pendingSetId, savedProgressIndex);
            } else {
                onSelectSet(pendingSetId, 0);
            }
        }
        setShowResumePopup(false);
        setPendingSetId(null);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0f172a] text-slate-900 dark:text-white font-sans selection:bg-purple-100 selection:text-purple-900">
            {showResumePopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 transform scale-100 transition-all">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Resume Practice?</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                You left off at Question {savedProgressIndex + 1}. Would you like to continue or start over?
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => confirmResume(false)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Start Over
                            </button>
                            <button
                                onClick={() => confirmResume(true)}
                                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-normal animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-violet-200/40 dark:bg-violet-900/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-normal"></div>
            </div>

            <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:white transition-all border border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 uppercase">{subject} PRACTICE</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800">AI POWERED</span>
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Topic-wise Mastery</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-6 text-sm bg-white/60 dark:bg-slate-800/60 px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="p-1 rounded-md bg-amber-100 text-amber-600">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Progress</div>
                                    <div className="font-bold text-slate-900 dark:text-white">{completedCount}/10 Sets</div>
                                </div>
                            </div>
                        </div>
                        <AIAvatar size="medium" emotion="happy" isActive />
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
                            Choose Your<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 animate-gradient">Practice Set</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xl text-lg leading-relaxed">
                            Master {subject} one set at a time. All sets are now fully unlocked for your preparation.
                        </p>
                    </div>
                    <div className="w-full md:w-80 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between text-xs font-bold mb-3 text-slate-400 uppercase tracking-wider">
                            <span>Topic Mastery</span>
                            <span className="text-purple-600">{progressPercentage}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-full relative transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            >
                                <div className="absolute inset-0 bg-white/30 animate-pulse-fast"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sets.map((set, index) => {
                        const isCompleted = set.status === 'completed';
                        let theme = 'purple';
                        if (subject.toLowerCase().includes('biology')) theme = 'teal';
                        else if (subject.toLowerCase().includes('chemistry')) theme = 'emerald';
                        else if (subject.toLowerCase().includes('physics')) theme = 'violet';
                        else if (subject.toLowerCase().includes('math')) theme = 'indigo';

                        const gradients: Record<string, any> = {
                            teal: { from: 'from-teal-500', to: 'to-emerald-500', shadow: 'shadow-teal-500/20', btnShadow: 'shadow-teal-500/40', text: 'text-teal-600', light: 'bg-teal-50', border: 'border-teal-100' },
                            indigo: { from: 'from-indigo-600', to: 'to-blue-600', shadow: 'shadow-indigo-500/20', btnShadow: 'shadow-indigo-500/40', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-100' },
                            violet: { from: 'from-violet-600', to: 'to-purple-600', shadow: 'shadow-violet-500/20', btnShadow: 'shadow-violet-500/40', text: 'text-violet-600', light: 'bg-violet-50', border: 'border-violet-100' },
                            emerald: { from: 'from-emerald-500', to: 'to-teal-500', shadow: 'shadow-emerald-500/20', btnShadow: 'shadow-emerald-500/40', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-100' },
                            purple: { from: 'from-purple-600', to: 'to-pink-600', shadow: 'shadow-purple-500/20', btnShadow: 'shadow-purple-500/40', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-100' },
                        };

                        const palette = gradients[theme] || gradients['purple'];

                        return (
                            <div
                                key={set.id}
                                onClick={() => handleSetClick(set.id)}
                                style={{ animationDelay: `${index * 100}ms` }}
                                className={`group relative overflow-hidden bg-white dark:bg-[#0b0f19] rounded-[2.5rem] shadow-lg ${palette.shadow} hover:shadow-2xl hover:shadow-${theme}-500/30 transition-all duration-500 border border-gray-100 dark:border-slate-800 cursor-pointer w-full hover:-translate-y-2 animate-fade-in-up opacity-0 flex flex-col`}
                            >
                                <div className={`absolute inset-0 rounded-[2.5rem] border-2 border-transparent bg-gradient-to-br ${palette.from} ${palette.to} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}></div>

                                <div className="relative h-56 overflow-hidden shrink-0">
                                    <img
                                        src={set.image}
                                        alt={set.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/50 to-transparent opacity-90"></div>

                                    <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-sm`}>
                                            {isCompleted ? 'Completed' : 'Practice Set'}
                                        </div>
                                        <h3 className="text-3xl font-black text-white mb-2 leading-tight tracking-tight drop-shadow-lg flex items-center justify-between">
                                            <span>Set {String(set.id).padStart(2, '0')}</span>
                                            {isCompleted && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                                        </h3>
                                    </div>
                                </div>

                                <div className="relative p-8 pt-4 flex-grow flex flex-col justify-between bg-white dark:bg-[#0b0f19]">
                                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">
                                        {set.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${palette.light} ${palette.text}`}>
                                                <Layers className="w-4 h-4" />
                                                <span>{set.totalQuestions} Qs</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                <span>{set.duration}</span>
                                            </div>
                                        </div>

                                        <button className={`relative overflow-hidden pl-6 pr-5 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r ${palette.from} ${palette.to} ${palette.btnShadow} group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-md`}>
                                            <span>{isCompleted ? 'Retry' : 'Solve'}</span>
                                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export { PracticeSetSelection };
