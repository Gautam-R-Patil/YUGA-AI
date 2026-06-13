import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../../../core/utils/api';

interface PredictionData {
    predictedScore: number;
    confidence: "High" | "Medium" | "Low";
    drivingFactors: string[];
    isReady: boolean;
    isPremium?: boolean;
}

export const PredictiveAnalyticsWidget = () => {
    const [data, setData] = useState<PredictionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrediction = async () => {
            try {
                const response = await apiRequest('/learning-analytics/predictive-score', 'GET');
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (error) {
                console.error("Failed to fetch predictive score:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrediction();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl h-64 flex items-center justify-center animate-pulse">
                <div className="text-slate-400 font-bold flex flex-col items-center gap-2">
                    <BrainCircuit className="w-8 h-8 opacity-50" />
                    Analyzing Historical Data...
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-white"
        >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 opacity-20 rounded-full -ml-20 -mb-20 blur-2xl"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                        <Target className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight">AI Exam Predictor</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full ${data.confidence === 'High' ? 'bg-emerald-500/20 text-emerald-300' :
                                data.confidence === 'Medium' ? 'bg-amber-500/20 text-amber-300' :
                                    'bg-rose-500/20 text-rose-300'
                                }`}>
                                {data.confidence} Confidence
                            </span>
                        </div>
                    </div>
                </div>

                {!data.isPremium ? (
                    <div className="flex flex-col items-center text-center py-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-purple-500/30">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                        <h3 className="text-lg font-bold mb-1">Premium Feature</h3>
                        <p className="text-sm font-medium text-white/60 max-w-[220px] mb-4">
                            Unlock AI-powered predictive scoring and personalized insights.
                        </p>
                        <a href="/premium" className="text-xs font-bold bg-white text-indigo-900 px-4 py-2 rounded-full hover:bg-indigo-50 transition-colors">
                            Upgrade Now
                        </a>
                    </div>
                ) : !data.isReady ? (
                    <div className="flex flex-col items-center text-center py-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                        <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
                        <h3 className="text-lg font-bold mb-1">More Data Needed</h3>
                        <p className="text-sm font-medium text-white/60 max-w-[200px]">
                            Complete more mock exams and practice sessions to unlock AI predictions.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        {/* Score Ring */}
                        <div className="relative w-40 h-40 flex-shrink-0">
                            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                {/* Background Track */}
                                <circle
                                    cx="50" cy="50" r="40"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="8"
                                />
                                {/* Progress */}
                                <motion.circle
                                    initial={{ strokeDashoffset: 251.2 }}
                                    animate={{ strokeDashoffset: 251.2 - (251.2 * data.predictedScore) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    cx="50" cy="50" r="40"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray="251.2"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#818cf8" />
                                        <stop offset="100%" stopColor="#c084fc" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
                                    {data.predictedScore}%
                                </span>
                                <span className="text-[10px] uppercase tracking-widest font-bold text-white/50">Predicted</span>
                            </div>
                        </div>

                        {/* Driving Factors */}
                        <div className="flex-1 space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Why this score?
                            </h4>
                            {data.drivingFactors.map((factor, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (idx * 0.1) }}
                                    key={idx}
                                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex items-start gap-3"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                                    <p className="text-sm font-medium text-white/80 leading-snug">{factor}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
