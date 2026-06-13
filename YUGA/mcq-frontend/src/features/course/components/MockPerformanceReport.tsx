import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeft, Target, Brain, 
    CheckCircle, 
    Trophy, Activity, Clock, BarChart3,
    ArrowUpRight, Info, AlertCircle,
    TrendingUp, Zap, AlertTriangle
} from "lucide-react";
import { 
    Tooltip as RechartsTooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import { apiRequest } from "../../../core/utils/api";
import { Footer } from "../../../shared/components/Footer";

interface MockPerformanceReportProps {
    mockId: string;
    onBack: () => void;
}

export const MockPerformanceReport: React.FC<MockPerformanceReportProps> = ({ mockId, onBack }) => {
    const [data, setData] = useState<any>(null);
    const [reportData, setReportData] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [subjectData, setSubjectData] = useState<any[]>([]);
    const [weakZones, setWeakZones] = useState<any[]>([]);
    const [strongZones, setStrongZones] = useState<any[]>([]);
    const [topicData, setTopicData] = useState<any[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [timeVelocityData, setTimeVelocityData] = useState<any[]>([]);

    useEffect(() => {
        const key = `mock_result_${mockId}`;
        const savedData = localStorage.getItem(key);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setData(parsed);
            fetchDetailedReport(parsed);
        }
    }, [mockId]);

    const fetchDetailedReport = async (mockData: any) => {
        setIsGenerating(true);
        try {
            const subjStats: Record<string, { correct: number, attempted: number, totalTime: number }> = {
                'Physics': { correct: 0, attempted: 0, totalTime: 0 },
                'Chemistry': { correct: 0, attempted: 0, totalTime: 0 },
                'Botany': { correct: 0, attempted: 0, totalTime: 0 },
                'Zoology': { correct: 0, attempted: 0, totalTime: 0 }
            };
            const topicStats: Record<string, { correct: number, attempted: number, subject: string }> = {};

            const userAnswers = mockData.userAnswers || {};
            
            mockData.questions.forEach((q: any, i: number) => {
                const rawSubj = q.subject || 'General';
                // Normalize subject names for NEET/JEE
                let subj = rawSubj;
                if (rawSubj.toLowerCase().includes('botany')) subj = 'Botany';
                else if (rawSubj.toLowerCase().includes('zoology')) subj = 'Zoology';
                else if (rawSubj.toLowerCase().includes('biology')) {
                    // Split biology questions alternately if not specified, or just call it Biology
                    subj = 'Biology';
                }
                else if (rawSubj.toLowerCase().includes('chemistry')) subj = 'Chemistry';
                else if (rawSubj.toLowerCase().includes('physics')) subj = 'Physics';

                const topic = q.topic || 'General';
                if (!subjStats[subj]) subjStats[subj] = { correct: 0, attempted: 0, totalTime: 0 };
                if (!topicStats[topic]) topicStats[topic] = { correct: 0, attempted: 0, subject: subj };

                const answerObj = Array.isArray(userAnswers) ? userAnswers[i] : (userAnswers[i] || userAnswers[q.id]);
                const userAnswer = answerObj?.selectedAnswer;
                const timeTaken = answerObj?.timeTaken || 0;

                if (userAnswer) {
                    subjStats[subj].attempted++;
                    topicStats[topic].attempted++;
                    if (userAnswer === q.correctAnswer) {
                        subjStats[subj].correct++;
                        topicStats[topic].correct++;
                    }
                    subjStats[subj].totalTime += timeTaken;
                }
            });

            // If Biology exists but Botany/Zoology are empty, merge/split or keep Biology
            if (subjStats['Biology'] && subjStats['Biology'].attempted > 0) {
                // If we don't have separate Botany/Zoology, we can just keep Biology or split it
                // For now let's just ensure they all show up in the UI
            }

            const processedSubjectData = Object.keys(subjStats).map(subj => ({
                subject: subj,
                score: subjStats[subj].attempted > 0 
                    ? Math.round((subjStats[subj].correct / subjStats[subj].attempted) * 100) 
                    : 0,
                avgTime: subjStats[subj].attempted > 0 
                    ? Math.round(subjStats[subj].totalTime / subjStats[subj].attempted) 
                    : 0
            })).filter(s => s.subject !== 'Biology' || s.score > 0); // Hide empty Biology if we have splits

            const processedTopicData = Object.keys(topicStats).map(topic => ({
                topic,
                subject: topicStats[topic].subject,
                accuracy: topicStats[topic].attempted > 0 
                    ? Math.round((topicStats[topic].correct / topicStats[topic].attempted) * 100) 
                    : 0,
                attempted: topicStats[topic].attempted || 0
            })).sort((a, b) => b.accuracy - a.accuracy);

            // Immediate state updates
            setSubjectData(processedSubjectData);
            setTopicData(processedTopicData);
            setStrongZones(
                processedTopicData.filter(t => t.accuracy >= 70).length > 0
                    ? processedTopicData.filter(t => t.accuracy >= 70).slice(0, 4)
                    : processedTopicData.filter(t => t.attempted > 0).slice(0, 3) // Fallback to top 3 even if accuracy is low
            );
            setWeakZones(processedTopicData.filter(t => t.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy).slice(0, 4));
            setTimeVelocityData(processedSubjectData.map(s => ({ 
                subject: s.subject, 
                time: s.avgTime,
                // Add a normalized width for the UI progress bars (0-100)
                // Assuming max time is 120s
                percentage: Math.min(100, (s.avgTime / 120) * 100)
            })));

            const stats = {
                averageScore: Math.round((mockData.score / Math.max(1, mockData.totalQuestions)) * 100),
                projectedRank: Math.max(1, Math.round((1 - (mockData.score / Math.max(1, mockData.totalQuestions))) * 1500)),
                studyHours: Math.round((mockData.totalQuestions * 1.5) / 60) || 2, 
                questionsSolved: (mockData.correctCount || 0) + (mockData.wrongCount || 0),
                avgTime: mockData.userAnswers ? (Object.values(mockData.userAnswers).reduce((acc: number, curr: any) => acc + (curr.timeTaken || 0), 0) / Math.max(1, mockData.correctCount + mockData.wrongCount)) : 0
            };

            const response = await apiRequest('/analysis/report', 'POST', {
                stats,
                subjectData: processedSubjectData,
                topicData: processedTopicData,
                weakAreas: processedTopicData.filter(t => t.accuracy < 60).slice(0, 5),
                format: 'json',
                reportStyle: 'fancy'
            });

            if (response.ok) {
                const result = await response.json();
                setReportData(result);
            }
        } catch (error) {
            console.error("Failed to generate AI report:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        if (!data || isDownloading) return;
        setIsDownloading(true);
        try {
            const statsOverview = {
                averageScore: Math.round((data.score / Math.max(1, data.totalQuestions)) * 100),
                projectedRank: Math.max(1, Math.round((1 - (data.score / Math.max(1, data.totalQuestions))) * 1500)),
                studyHours: Math.round((data.totalQuestions * 1.5) / 60) || 2, 
                questionsSolved: (data.correctCount || 0) + (data.wrongCount || 0)
            };

            const response = await apiRequest('/analysis/report', 'POST', {
                stats: statsOverview,
                subjectData: subjectData,
                topicData: topicData,
                weakAreas: weakZones,
                format: 'pdf',
                reportStyle: 'fancy'
            }, { responseType: 'blob' });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Yuga_Performance_Report_${mockId.replace(/-/g, '_')}.pdf`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }, 100);
            } else {
                console.error("PDF generation failed on server");
                alert("Report Generation Engine is warming up. Please try again in a few moments.");
            }
        } catch (error) {
            console.error("Download error:", error);
            alert("Connection error. Please try again later.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (!data) return null;

    const { score, correctCount, wrongCount, totalQuestions } = data;
    const totalAttempted = correctCount + wrongCount;
    const accuracy = Math.round((correctCount / Math.max(1, totalAttempted)) * 100);
    const scorePercentage = Math.round((score / Math.max(1, totalQuestions)) * 100);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-x-hidden">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50" />
            </div>

            {/* Premium Header */}
            <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl transition-colors">
                <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={onBack}
                            className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5 text-indigo-600 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-300">Exit Report</span>
                        </button>
                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
                        <div className="hidden md:block">
                            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                Performance <span className="text-indigo-600 dark:text-indigo-400">Intelligence</span>
                            </h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-4 px-6 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                            <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300 text-[9px]">Live Assessment</span>
                        </div>
                        <div className="h-10 px-6 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center gap-2 font-black text-xl shadow-lg shadow-black/10">
                            {score} <span className="text-[10px] uppercase tracking-widest opacity-60">Points</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-20 relative z-10">
                {/* Hero Stats */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                >
                    <MetricCard 
                        icon={Target} 
                        label="Mastery Index" 
                        value={`${scorePercentage}%`} 
                        color="indigo" 
                        trend="+12% vs Avg"
                        subValue={`${score} / ${totalQuestions} Marks`}
                    />
                    <MetricCard 
                        icon={CheckCircle} 
                        label="Accuracy Precision" 
                        value={`${accuracy}%`} 
                        color="emerald" 
                        trend="Top 5%"
                        subValue={`${correctCount} of ${totalAttempted} Qs`}
                    />
                    <MetricCard 
                        icon={BarChart3} 
                        label="Global Ranking" 
                        value={scorePercentage < 50 ? "Rising Star" : `#${reportData?.stats?.projectedRank || '--'}`} 
                        color="amber" 
                        trend={scorePercentage < 50 ? "Potential High" : "Diamond Tier"}
                        subValue={scorePercentage < 50 ? "Building Foundation" : "Live Projection"}
                    />
                    <MetricCard 
                        icon={Clock} 
                        label="Solving Velocity" 
                        value={reportData?.stats?.avgTime ? `${Math.round(reportData.stats.avgTime)}s` : "1.2s"} 
                        color="rose" 
                        trend="Fast Pace"
                        subValue="Avg. per Question"
                    />
                </motion.div>

                {/* Secondary Analytical Row: Graphs & Infographics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Mastery Radar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group"
                    >
                        <div className="relative z-10 mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <Target className="w-5 h-5 text-indigo-600" /> Subject Mastery
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Radar Analysis</p>
                        </div>

                        <div className="h-[280px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectData}>
                                    <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <Radar
                                        name="Mastery"
                                        dataKey="score"
                                        stroke="#4f46e5"
                                        strokeWidth={3}
                                        fill="#4f46e5"
                                        fillOpacity={0.3}
                                    />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Time Velocity / Speed Redesign */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col"
                    >
                        <div className="relative z-10 mb-8">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                <span className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-rose-500" /> Solving Speed
                                </span>
                                <div className="px-3 py-1 bg-rose-50 dark:bg-rose-500/10 rounded-lg text-[9px] font-black text-rose-600 uppercase tracking-widest">
                                    Pace: Optimum
                                </div>
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Average seconds per question</p>
                        </div>

                        <div className="flex-1 space-y-6 flex flex-col justify-center">
                            {timeVelocityData.map((item, idx) => (
                                <div key={idx} className="group">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">{item.subject}</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{item.time || 0}s</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.max(5, item.percentage || 0)}%` }}
                                            transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                                            className={`h-full rounded-full shadow-lg ${
                                                item.time > 60 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 
                                                item.time > 0 ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' :
                                                'bg-slate-200 dark:bg-slate-700'
                                            }`}
                                        />
                                        <div className="absolute inset-0 bg-white/10 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Insights / Readiness Overhaul */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/40 text-white flex flex-col justify-between overflow-hidden relative"
                    >
                        {/* Futuristic Background Layers */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <TrendingUp className="w-7 h-7 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Status</div>
                                    <div className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mt-1 border border-white/10">
                                        {scorePercentage >= 60 ? 'Qualifying' : 'In Review'}
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-3xl font-black tracking-tighter mb-2 leading-none">Exam Readiness</h3>
                            <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                                Projected Percentile: <span className="text-white">94.2%</span>
                            </p>
                        </div>

                        <div className="relative z-10 my-6 py-8 flex flex-col items-center justify-center">
                            <HighFidelityGauge score={scorePercentage} />
                        </div>

                        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Probability</div>
                                <div className="text-2xl font-black leading-none">{scorePercentage}%</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Confidence</div>
                                <div className="text-sm font-black">HIGH</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                    {/* Weak vs Strong Zones Section */}
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2.5rem] p-8 border border-emerald-100 dark:border-emerald-500/20 shadow-sm"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <CheckCircle className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-emerald-900 dark:text-white tracking-tight">Strong Zones</h3>
                            </div>
                            <TopicSplitView topics={strongZones} type="strong" />
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-rose-50/50 dark:bg-rose-900/10 rounded-[2.5rem] p-8 border border-rose-100 dark:border-rose-500/20 shadow-sm"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                                    <AlertTriangle className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-rose-900 dark:text-white tracking-tight">Weak Areas</h3>
                            </div>
                            <TopicSplitView topics={weakZones} type="weak" />
                        </motion.div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Analytical Core */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        <motion.section 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative lg:min-h-[600px]"
                        >
                            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden min-h-full">
                                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                            <Brain className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">AI Intelligence Engine</h2>
                                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest">Neural Assessment Report</p>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {isGenerating && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                                                <span className="text-[9px] font-black uppercase text-indigo-600 tracking-tighter">Analyzing Metadata...</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="p-10">
                                    {isGenerating ? (
                                        <div className="space-y-8 py-10">
                                            <div className="space-y-4">
                                                <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse"></div>
                                                <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse"></div>
                                                <div className="h-4 bg-slate-100 rounded-full w-5/6 animate-pulse"></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6 pt-8">
                                                <div className="h-40 bg-slate-50 border border-slate-100 rounded-3xl animate-pulse"></div>
                                                <div className="h-40 bg-slate-50 border border-slate-100 rounded-3xl animate-pulse"></div>
                                            </div>
                                        </div>
                                    ) : reportData?.aiAnalysis ? (
                                        <div 
                                            className="ai-report-viewport prose max-w-none text-slate-600" 
                                            dangerouslySetInnerHTML={{ __html: reportData.aiAnalysis }}
                                        />
                                    ) : (
                                        <div className="text-center py-32 space-y-4">
                                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                                                <AlertCircle className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-400">Data Synchronization Pending</h3>
                                            <p className="text-sm text-slate-400 max-w-xs mx-auto">Please refresh if the report doesn't appear within 30 seconds.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.section>
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="relative group p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30 overflow-hidden"
                        >
                            <Trophy className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 transform rotate-12" />
                            
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="px-4 py-1.5 rounded-full bg-white/20 border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                    Performance Tier
                                </div>
                                <div className="text-7xl font-black tracking-tighter mb-2">
                                    {scorePercentage >= 90 ? 'S+' : scorePercentage >= 70 ? 'A' : scorePercentage >= 45 ? 'B' : 'C'}
                                </div>
                                <div className="text-lg font-bold text-white/90 mb-6">
                                    {scorePercentage >= 90 ? 'Mastermind Scholar' : scorePercentage >= 70 ? 'Expert Rank' : scorePercentage >= 45 ? 'Elite Tier' : 'Growing Talent'}
                                </div>
                                
                                <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden mb-3">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${scorePercentage}%` }}
                                        className="h-full bg-white"
                                    />
                                </div>
                                <div className="text-[10px] font-bold text-white/70 flex justify-between w-full uppercase tracking-widest">
                                    <span>Precision Progress</span>
                                    <span>Next Level: +140pts</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl"
                        >
                            <h3 className="text-lg font-bold mb-8 flex items-center justify-between text-slate-900 dark:text-white">
                                <span className="flex items-center gap-3"><BarChart3 className="w-5 h-5 text-indigo-600" /> Mastery Matrix</span>
                                <ArrowUpRight className="w-4 h-4 text-slate-300" />
                            </h3>
                            <div className="space-y-7">
                                <ProgressRow label="Conceptual Depth" value={scorePercentage} color="#4f46e5" />
                                <ProgressRow label="Solving Velocity" value={accuracy} color="#10b981" />
                                <ProgressRow label="Memory Recall" value={70} color="#f59e0b" />
                                <ProgressRow label="Focus Stability" value={80} color="#ec4899" />
                            </div>
                            
                            <button 
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className={`w-full mt-10 py-4 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white hover:opacity-90 transition-all font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-black/10 ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isDownloading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Generating Assessment...
                                    </>
                                ) : (
                                    <>
                                        Download Analysis <ArrowUpRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </motion.div>

                        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center shadow-sm">
                                <Info className="w-5 h-5 text-indigo-500" />
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed px-1 uppercase tracking-tight">
                                Intelligence suggests focus on <span className="text-indigo-600 dark:text-indigo-400">Organic Mechanisms</span> for next session.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            <style>{`
                .ai-report-viewport {
                    color: #475569;
                }
                .ai-report-viewport .mission-brief {
                    background: #f8fafc;
                    padding: 2.5rem;
                    border-radius: 2rem;
                    border: 1px solid #e2e8f0;
                    margin-bottom: 3rem;
                }
                .ai-report-viewport .mission-brief h3 {
                    margin-top: 0;
                    color: #4f46e5;
                    font-size: 1.5rem;
                    font-weight: 900;
                    letter-spacing: -0.025em;
                    margin-bottom: 1rem;
                    border: none;
                    padding: 0;
                }
                .ai-report-viewport .mission-brief p {
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: #64748b;
                    font-style: italic;
                    margin-bottom: 0;
                }
                .ai-report-viewport h3 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a !important;
                    margin-top: 3rem;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    border-left: 4px solid #4f46e5;
                    padding-left: 1.25rem;
                }
                .ai-report-viewport p {
                    font-size: 0.95rem;
                    line-height: 1.8;
                    color: #475569;
                    margin-bottom: 1.5rem;
                }
                .ai-report-viewport ul {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1rem;
                    padding: 0;
                    list-style: none;
                }
                @media (min-width: 640px) {
                    .ai-report-viewport ul {
                        grid-template-columns: 1fr 1fr;
                    }
                }
                .ai-report-viewport li {
                    background: #fff;
                    border: 1px solid #f1f5f9;
                    padding: 1.5rem;
                    border-radius: 1.5rem;
                    box-shadow: 0 4px 12px -2px rgba(0,0,0,0.03);
                }
                .ai-report-viewport li strong {
                    display: block;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #4f46e5;
                    margin-bottom: 0.5rem;
                }
            `}</style>
        </div>
    );
};

const MetricCard = ({ icon: Icon, label, value, color, trend, subValue }: any) => {
    const colorClasses: any = {
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        rose: "text-rose-600 bg-rose-50 border-rose-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100"
    };

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all">
            <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="px-3 py-1.5 rounded-full bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {trend}
                </div>
            </div>
            
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tighter text-slate-900">{value}</span>
            </div>
            <div className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{subValue}</div>
        </div>
    );
};

const ProgressRow = ({ label, value, color }: any) => (
    <div className="space-y-3">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <span>{label}</span>
            <span className="text-slate-900 dark:text-white">{value}%</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
            />
        </div>
    </div>
);

const TopicSplitView = ({ topics, type }: any) => (
    <div className="space-y-4">
        {topics.map((t: any, idx: number) => (
            <div key={idx} className="bg-white/80 dark:bg-slate-800/80 p-5 rounded-[1.5rem] border border-white/50 dark:border-slate-700 flex items-center justify-between shadow-sm group hover:scale-[1.02] transition-transform">
                <div>
                    <div className="font-bold text-slate-800 dark:text-white text-sm tracking-tight">{t.topic}</div>
                    <div className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest mt-0.5">{t.subject}</div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className={`font-black text-xl tracking-tighter ${type === 'strong' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{t.accuracy}%</div>
                    </div>
                    {type === 'weak' && (
                        <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
                            <Zap className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                        </div>
                    )}
                </div>
            </div>
        ))}
        {topics.length === 0 && (
            <div className="py-12 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                    <Activity className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Awaiting More Data</p>
            </div>
        )}
    </div>
);

const HighFidelityGauge = ({ score }: { score: number }) => {
    const size = 180;
    const center = size / 2;
    const radius = 70;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    // Semi-circle (actually 270 degrees)
    const arcLength = 270;
    const normalizedScore = Math.min(100, Math.max(0, score || 1)); // Default 1 for visualization
    const offset = (normalizedScore / 100) * (circumference * (arcLength / 360));

    return (
        <div className="relative flex items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-[225deg]">
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - arcLength / 360)}
                    strokeLinecap="round"
                />
                <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' }}
                />
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fff" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.5)" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl font-black text-white tracking-tighter"
                >
                    {score}%
                </motion.div>
                <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Mastery</div>
            </div>
            {/* Glow particles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/20 blur-3xl rounded-full" />
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border border-slate-800 scale-90">
                <p className="font-black text-[10px] uppercase tracking-widest mb-2 border-b border-white/10 pb-1">{label || payload[0].payload.subject}</p>
                {payload.map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between gap-4">
                        <span className="text-[10px] text-slate-400 font-bold">{p.name === 'time' ? 'Time' : 'Score'}:</span>
                        <span className="text-sm font-black">{p.value}{p.name === 'time' ? 's' : '%'}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};
