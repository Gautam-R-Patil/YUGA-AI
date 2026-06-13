import React from 'react';
import { Clock, ArrowUpRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface Session {
    id: string;
    subject: string;
    topic: string;
    date: Date;
    score: number;
    duration: number; // in specific unit, e.g., minutes
}

interface RecentSessionsProps {
    sessions?: Session[];
}

// Mock data
const MOCK_SESSIONS: Session[] = [
    { id: '1', subject: 'Physics', topic: 'Thermodynamics', date: new Date(), score: 85, duration: 45 },
    { id: '2', subject: 'Chemistry', topic: 'Organic Chemistry Basics', date: new Date(Date.now() - 86400000), score: 92, duration: 30 },
    { id: '3', subject: 'Biology', topic: 'Cell Structure', date: new Date(Date.now() - 172800000), score: 78, duration: 60 },
    { id: '4', subject: 'Physics', topic: 'Kinematics', date: new Date(Date.now() - 259200000), score: 65, duration: 40 },
];

export const RecentSessions: React.FC<RecentSessionsProps> = ({ sessions = MOCK_SESSIONS }) => {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500 bg-green-500/10 border-green-500/20';
        if (score >= 60) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
        return 'text-red-500 bg-red-500/10 border-red-500/20';
    };

    return (
        <div className="relative group">
            {/* Gradient Glow Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-[2.5rem] opacity-10 group-hover:opacity-20 blur-xl transition-opacity" />

            <div className="relative bg-white dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] p-8 border border-slate-200 dark:border-blue-500/20 shadow-xl overflow-hidden">

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                            History
                        </span>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                            Recent Sessions
                        </h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg shadow-blue-500/10 border border-slate-100 dark:border-slate-700">
                        <Clock className="w-6 h-6 text-blue-500" />
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {sessions.map((session, index) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.01, x: 4 }}
                            className="group/item flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${session.subject === 'Biology' ? 'bg-pink-100 dark:bg-pink-500/20 text-pink-500' :
                                    session.subject === 'Chemistry' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-500' :
                                        'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-500'
                                    }`}>
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white group-hover/item:text-blue-500 transition-colors">
                                        {session.topic}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                            {session.subject}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                        <span className="text-xs text-slate-400">
                                            {formatDate(session.date)} • {session.duration} mins
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={`px-3 py-1 rounded-lg border text-sm font-bold ${getScoreColor(session.score)}`}>
                                {session.score}%
                            </div>
                        </motion.div>
                    ))}

                    {sessions.length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                            No recent activity found. Start practicing!
                        </div>
                    )}
                </div>

                <button className="w-full mt-6 py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    View All History <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
