import React from 'react';
import { Atom, Brain, FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';
// v2 - Colored Triangle Design

interface SubjectData {
    subject: string;
    mastery: number;
    color: string;
    icon: React.ReactNode;
}

interface SubjectAnalysisProps {
    data?: SubjectData[];
}

const MOCK_DATA: SubjectData[] = [
    { subject: 'Physics', mastery: 25, color: '#a855f7', icon: <Atom className="w-6 h-6" /> },
    { subject: 'Biology', mastery: 10, color: '#f43f5e', icon: <Brain className="w-6 h-6" /> },
    { subject: 'Chemistry', mastery: 18, color: '#10b981', icon: <FlaskConical className="w-6 h-6" /> },
];

const ColoredTriangle: React.FC<{ data: SubjectData[] }> = ({ data }) => {
    // Assuming data order: Physics (top), Biology (bottom-right), Chemistry (bottom-left)
    const [physics, biology, chemistry] = data;

    return (
        <div className="relative w-full h-[300px] flex items-center justify-center">
            <svg viewBox="0 0 200 180" className="w-full h-full max-w-[280px]">
                <defs>
                    {/* Gradients for each section */}
                    <linearGradient id="physicsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={physics.color} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={physics.color} stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="biologyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={biology.color} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={biology.color} stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="chemistryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={chemistry.color} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={chemistry.color} stopOpacity={0.3} />
                    </linearGradient>

                    {/* Glow filters */}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Main triangle outline */}
                <motion.path
                    d="M 100 20 L 170 150 L 30 150 Z"
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.2)"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Physics - Top section */}
                <motion.path
                    d="M 100 20 L 170 150 L 100 110 Z"
                    fill="url(#physicsGrad)"
                    stroke={physics.color}
                    strokeWidth="3"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ transformOrigin: '100px 90px' }}
                    filter="url(#glow)"
                />

                {/* Biology - Bottom right section */}
                <motion.path
                    d="M 170 150 L 100 110 L 30 150 Z"
                    fill="url(#biologyGrad)"
                    stroke={biology.color}
                    strokeWidth="3"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    style={{ transformOrigin: '100px 110px' }}
                    filter="url(#glow)"
                />

                {/* Chemistry - Bottom left section */}
                <motion.path
                    d="M 30 150 L 100 110 L 100 20 Z"
                    fill="url(#chemistryGrad)"
                    stroke={chemistry.color}
                    strokeWidth="3"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    style={{ transformOrigin: '76px 90px' }}
                    filter="url(#glow)"
                />

                {/* Center circle with overall mastery */}
                <circle
                    cx="100"
                    cy="110"
                    r="20"
                    fill="rgba(15, 23, 42, 0.95)"
                    stroke="rgba(148, 163, 184, 0.3)"
                    strokeWidth="2"
                />
                <text
                    x="100"
                    y="110"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="16"
                    fontWeight="bold"
                >
                    {Math.round((physics.mastery + biology.mastery + chemistry.mastery) / 3)}%
                </text>
            </svg>

            {/* Decorative glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full" />
            </div>
        </div>
    );
};

export const SubjectAnalysis: React.FC<SubjectAnalysisProps> = ({ data = MOCK_DATA }) => {
    console.log('🎨 SubjectAnalysis v2 - ColoredTriangle loaded!', data);

    return (
        <div className="relative group h-full">
            {/* Gradient Glow Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-[2.5rem] opacity-10 group-hover:opacity-20 blur-xl transition-opacity" />

            <div className="relative h-full bg-white dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] p-8 border border-slate-200 dark:border-purple-500/20 shadow-xl flex flex-col">

                {/* Header */}
                <div className="text-center mb-6">
                    <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider block mb-1">
                        Subject Analysis
                    </span>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                        Mastery Triangle
                    </h3>
                </div>

                {/* Colored Triangle */}
                <ColoredTriangle data={data} />

                {/* Subject Legend */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                    {data.map((subject, index) => (
                        <motion.div
                            key={subject.subject}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50"
                        >
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg"
                                style={{ backgroundColor: subject.color }}
                            >
                                {subject.icon}
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-bold text-slate-900 dark:text-white">
                                    {subject.subject}
                                </div>
                                <div className="text-xl font-black" style={{ color: subject.color }}>
                                    {subject.mastery}%
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Detailed List */}
                <div className="flex flex-col gap-3 mt-6 flex-1">
                    {data.map((item, index) => (
                        <motion.div
                            key={item.subject}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 cursor-pointer hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg"
                                    style={{ backgroundColor: item.color }}
                                >
                                    {item.icon}
                                </div>
                                <div className="font-bold text-slate-900 dark:text-white">
                                    {item.subject}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.mastery}%` }}
                                        transition={{ duration: 1, delay: 1.3 + (index * 0.1) }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                </div>
                                <div className="text-xl font-black text-slate-900 dark:text-white min-w-[50px] text-right">
                                    {item.mastery}%
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
