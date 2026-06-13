import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { apiRequest } from '../../../core/utils/api';

interface SRSItem {
    _id: string;
    subject: string;
    chapter: string;
    nextReviewDate: string;
    interval: number;
    repetition: number;
    easeFactor: number;
}

interface Props {
    onSelectTopic: (subject: string, chapter: string) => void;
}

export const SRSReviewComponent: React.FC<Props> = ({ onSelectTopic }) => {
    const [dueItems, setDueItems] = useState<SRSItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState<string | null>(null);

    const fetchDueItems = async () => {
        try {
            const response = await apiRequest('/srs/due', 'GET');
            const data = await response.json();
            if (data.success) {
                setDueItems(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch due SRS items:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDueItems();
    }, []);

    const handleReview = async (item: SRSItem, score: number) => {
        setSubmittingId(item._id);

        try {
            const response = await apiRequest('/srs/review', 'POST', {
                subject: item.subject,
                chapter: item.chapter,
                score
            });

            const data = await response.json();
            if (data.success) {
                // Remove the reviewed item from the list
                setDueItems(prev => prev.filter(i => i._id !== item._id));
            }
        } catch (error) {
            console.error("Failed to submit review:", error);
        } finally {
            setSubmittingId(null);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl h-48 flex items-center justify-center">
                <div className="animate-pulse flex items-center gap-3">
                    <Brain className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-400 font-bold text-sm">Checking Knowledge Base...</span>
                </div>
            </div>
        );
    }

    if (dueItems.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-[1.5rem] flex items-center justify-center text-emerald-500 mb-4 border border-emerald-100 dark:border-emerald-800/50">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">You're All Caught Up!</h3>
                    <p className="text-sm font-medium text-slate-500 max-w-[250px]">
                        No active reviews needed right now. Generating new notes will add them to your Spaced Repetition queue.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-500">
                        <Brain className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Active Recalls</h3>
                        <p className="text-xs font-medium text-slate-500">{dueItems.length} topic{dueItems.length !== 1 ? 's' : ''} due for review</p>
                    </div>
                </div>
                <div className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Due Now
                </div>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                    {dueItems.map((item) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                            className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group"
                        >
                            {submittingId === item._id && (
                                <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm z-10 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <span className="text-[10px] font-black tracking-widest uppercase text-indigo-500 mb-1 block">
                                        {item.subject}
                                    </span>
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">
                                        {item.chapter}
                                    </h4>
                                </div>
                                <button
                                    onClick={() => onSelectTopic(item.subject, item.chapter)}
                                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors shadow-sm border border-slate-100 dark:border-slate-700"
                                    title="Open Notes"
                                >
                                    <BookOpen className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700/50">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2 text-center">Rate Your Memory</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleReview(item, 1)}
                                        className="flex-1 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold transition-colors"
                                    >
                                        Hard
                                    </button>
                                    <button
                                        onClick={() => handleReview(item, 3)}
                                        className="flex-1 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-bold transition-colors"
                                    >
                                        Good
                                    </button>
                                    <button
                                        onClick={() => handleReview(item, 5)}
                                        className="flex-1 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-bold transition-colors"
                                    >
                                        Easy
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
