import React from 'react';
import { Target, Zap, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeakSubject {
    subject: string;
    topic: string;
    accuracy: number;
    urgent?: boolean;
}

interface WeakAreasProps {
    areas?: WeakSubject[];
}

// Mock data
const MOCK_AREAS: WeakSubject[] = [
    { subject: 'BIOLOGY', topic: 'Biology Revision', accuracy: 10, urgent: true },
    { subject: 'CHEMISTRY', topic: 'Chemistry Revision', accuracy: 18, urgent: true },
    { subject: 'PHYSICS', topic: 'Physics Revision', accuracy: 25, urgent: true },
];

export const WeakAreas: React.FC<WeakAreasProps> = ({ areas = MOCK_AREAS }) => {
    return (
        <div className="relative group h-full">
            {/* Gradient Glow Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 rounded-[2.5rem] opacity-10 group-hover:opacity-20 blur-xl transition-opacity" />

            <div className="relative h-full bg-white dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] p-8 border border-slate-200 dark:border-red-500/20 shadow-xl overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block mb-1">
                            Priority Focus
                        </span>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                            Weak Areas
                        </h3>
                    </div>
                    {/* Floating styled icon similar to screenshot */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                        <Target className="w-7 h-7 text-white" />
                    </div>
                </div>

                {/* List */}
                <div className="flex flex-col gap-4">
                    {areas.map((area, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-4 rounded-2xl bg-red-50 dark:bg-slate-800/50 border border-red-100 dark:border-red-500/10 group/item cursor-pointer hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-500 dark:text-red-400">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">
                                        {area.topic}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                            {area.subject}
                                        </span>
                                        {area.urgent && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                                <span className="text-xs font-bold text-red-500 uppercase">Urgent</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-2xl font-black text-red-600 dark:text-red-400">
                                        {area.accuracy}%
                                    </div>
                                    <div className="text-xs font-semibold text-slate-400">Accuracy</div>
                                </div>
                                <motion.button
                                    whileHover={{ rotate: 90 }}
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 text-white"
                                >
                                    <Zap className="w-5 h-5 fill-current" />
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
