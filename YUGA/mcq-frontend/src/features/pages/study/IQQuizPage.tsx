import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, Play, Sparkles, Target, Zap, Trophy, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { NEETPracticeInterface } from '../../course/components/NEETPracticeInterface';
import { iqSets } from './iqQuestions';

/**
 * IQ Quiz Page - Temporary Feature
 * This component handles set selection and integrates with NEETPracticeInterface for the quiz.
 */

export const IQQuizPage = () => {
    const navigate = useNavigate();
    const [selectedSet, setSelectedSet] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const sets = [
        { id: 1, title: "Foundation Mixed", description: "ICT, Logic, Math, English & GK", icon: <Target className="w-5 h-5" />, color: "from-blue-500 to-indigo-600" },
        { id: 2, title: "Explorer Mixed", description: "ICT, Logic, Math, English & GK", icon: <Brain className="w-5 h-5" />, color: "from-purple-500 to-pink-600" },
        { id: 3, title: "Skill Mixed", description: "ICT, Logic, Math, English & GK", icon: <Zap className="w-5 h-5" />, color: "from-amber-500 to-orange-600" },
        { id: 4, title: "Knowledge Mixed", description: "ICT, Logic, Math, English & GK", icon: <Sparkles className="w-5 h-5" />, color: "from-emerald-500 to-teal-600" },
        { id: 5, title: "Mastery Mixed", description: "ICT, Logic, Math, English & GK", icon: <Trophy className="w-5 h-5" />, color: "from-rose-500 to-red-600" },
    ];

    if (selectedSet) {
        return (
            <div className="iq-quiz-container">
                <NEETPracticeInterface
                    mode="assessment"
                    subjectProp={`IQ Test - ${sets.find(s => s.id === selectedSet)?.title}`}
                    initialSet={selectedSet}
                    questionsData={iqSets[selectedSet as keyof typeof iqSets] as any}
                    onComplete={(results: any) => {
                        console.log("IQ Quiz Completed. Results:", results);

                        // Check if feedback already given for this set
                        // Using v2 key to ensure fresh testing
                        const feedbackKey = `iq_feedback_status_v2_${selectedSet}`;
                        const hasGivenFeedback = localStorage.getItem(feedbackKey);

                        console.log(`Feedback Check: Key=${feedbackKey}, Value=${hasGivenFeedback}`);

                        if (!hasGivenFeedback) {
                            console.log("Showing Feedback Modal");
                            setShowFeedback(true);
                        } else {
                            console.log("Feedback already given. Redirecting...");
                            // If feedback already given, proceed
                            setSelectedSet(null);
                        }
                    }}
                    onExit={() => setSelectedSet(null)}
                />

                {/* Feedback Modal */}
                {showFeedback && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full border border-indigo-200 dark:border-indigo-800 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">We Value Your Feedback!</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Help us improve the IQ Challenge. Please verify your experience by filling out this quick form.
                                </p>
                            </div>

                            <a
                                href="https://docs.google.com/forms/d/e/1FAIpQLSeJXhNiYBdqzvlQz8n6B8Tapx8x72URlT94_DQ5Z-B3L4-ofg/viewform"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-center transition-colors mb-4 shadow-lg shadow-indigo-500/30"
                                onClick={() => {
                                    // Optional: Mark as done immediately on click? 
                                    // User requested "remember if an user as already given". 
                                    // Usually better to wait for "I've filled it" button, but click is a good intent signal.
                                }}
                            >
                                Open Feedback Form
                            </a>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        // Mark as given
                                        if (selectedSet) {
                                            localStorage.setItem(`iq_feedback_status_v2_${selectedSet}`, 'true');
                                        }
                                        setShowFeedback(false);
                                        setSelectedSet(null); // Exit after feedback
                                    }}
                                    className="flex-1 py-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-bold rounded-xl hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                                >
                                    I've Filled It
                                </button>
                                <button
                                    onClick={() => {
                                        // Skip for now
                                        setShowFeedback(false);
                                        setSelectedSet(null);
                                    }}
                                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Later
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-300 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
            </div>

            <main className="max-w-5xl mx-auto px-4 py-12 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => navigate('/')}
                        className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-4 scale-110">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                            IQ <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Challenge</span>
                        </h1>
                    </div>
                    <div className="w-12 h-12" /> {/* Spacer */}
                </div>

                {/* Subtitle */}
                <p className="text-center text-slate-500 dark:text-slate-400 font-medium text-lg mb-16 max-w-2xl mx-auto">
                    Evaluate your intelligence across 5 specialized cognitive domains. Each set contains 10 curated questions designed to stretch your brain.
                </p>

                {/* Sets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sets.map((set, idx) => (
                        <motion.button
                            key={set.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setSelectedSet(set.id)}
                            className="group relative bg-white dark:bg-slate-800/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-2xl transition-all duration-500 text-left overflow-hidden h-full flex flex-col"
                        >
                            {/* Hover Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${set.color} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-500`} />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className={`w-12 h-12 bg-gradient-to-br ${set.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                                    {set.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {set.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6 flex-1">
                                    {set.description}
                                </p>
                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest mt-auto">
                                    <span>Start Assessment</span>
                                    <Play className="w-3 h-3 fill-current group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>

                            {/* Set Number Badge */}
                            <div className="absolute -bottom-4 -right-4 text-9xl font-black text-slate-100 dark:text-slate-700/30 select-none group-hover:text-indigo-500/10 transition-colors duration-500">
                                {set.id}
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="mt-20 p-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <Trophy className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="text-lg font-bold text-indigo-900 dark:text-indigo-200">Global IQ Benchmarking</h4>
                    </div>
                    <p className="text-sm text-indigo-700/70 dark:text-indigo-300/60 font-medium max-w-xl mx-auto">
                        Your results are calculated based on accuracy and speed. Complete all 4 sets for a full cognitive profile.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default IQQuizPage;
