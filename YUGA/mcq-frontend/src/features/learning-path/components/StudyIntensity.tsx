import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { Flame } from 'lucide-react';

interface StudyIntensityProps {
    data?: { day: string; value: number }[];
}

// Mock data if none provided
const MOCK_DATA = [
    { day: 'Jan 30', value: 110 },
    { day: 'Jan 31', value: 0 },
    { day: 'Feb 1', value: 0 },
    { day: 'Feb 2', value: 20 },
    { day: 'Feb 3', value: 30 },
    { day: 'Feb 4', value: 120 },
    { day: 'Feb 5', value: 10 },
];

export const StudyIntensity: React.FC<StudyIntensityProps> = ({ data = MOCK_DATA }) => {

    return (
        <div className="relative group h-full">
            {/* Gradient Glow Background - matching PerformancePage style */}
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-[2.5rem] opacity-10 group-hover:opacity-20 blur-xl transition-opacity" />

            <div className="relative h-full bg-white dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] p-8 border border-slate-200 dark:border-green-500/20 shadow-xl overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider block mb-1">
                            Daily Activity
                        </span>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                            Study Intensity
                        </h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg shadow-green-500/10 border border-slate-100 dark:border-slate-700">
                        <Flame className="w-6 h-6 text-green-500" />
                    </div>
                </div>

                {/* Chart */}
                <div className="flex-1 w-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} barSize={36}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="rgba(148, 163, 184, 0.1)"
                            />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                hide={false}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                                dx={-10}
                            />
                            <RechartsTooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Bar
                                dataKey="value"
                                radius={[8, 8, 8, 8]}
                                animationDuration={1500}
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === data.length - 1 ? '#10b981' : '#e2e8f0'}
                                        className={index === data.length - 1 ? 'dark:fill-green-500' : 'dark:fill-slate-700'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
