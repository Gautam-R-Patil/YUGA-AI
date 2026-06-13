import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar,
    RadarChart, PolarGrid, PolarAngleAxis, Radar,
    ReferenceLine
} from "recharts";
import {
    TrendingUp, Clock, Target,
    BookOpen, Activity,
    Trophy,
    History as HistoryIcon, BarChart2,
    CheckCircle, Flame, AlertTriangle, Download, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../core/contexts/AuthContext";
import { apiRequest } from "../../../core/utils/api";
import { Footer } from "../../../shared/components/Footer";
import { ReportModal } from "./ReportModal";
import { PredictiveAnalyticsWidget } from "../../learning-analytics/components/PredictiveAnalyticsWidget";

export const PerformancePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('week');

    // State for Real Data
    const [stats, setStats] = useState({
        averageScore: 0,
        questionsSolved: 0,
        accuracy: 0,
        studyHours: 0,
        scoreChange: 0,
        accuracyChange: 0,
        questionsChange: 0,
        classesAttended: 0,
        doubtsAsked: 0,
        projectedScore: 0,
        projectedRank: 0,
        aiInsight: "Complete more tests to unlock AI insights.",
        studyActivity: [] as any[],
        speedMetrics: [] as any[],
        knowledgeGrowth: 0,
        consistencyScore: 0, // New
        readinessScore: 0 // New
    });

    const [scoreHistory, setScoreHistory] = useState<any[]>([]);
    const [subjectData, setSubjectData] = useState<any[]>([]);
    const [weakAreas, setWeakAreas] = useState<any[]>([]);
    const [strongAreas, setStrongAreas] = useState<any[]>([]); // New
    const [topicData, setTopicData] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]); // New for Recent Activity
    const [heatmapData, setHeatmapData] = useState<any[]>([]); // New for Consistency

    const [hasData, setHasData] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Report Modal State
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportHtml, setReportHtml] = useState<string | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    // --- Report Handlers ---
    const handleViewReport = async () => {
        setIsReportModalOpen(true);
        if (!reportHtml) {
            setIsGeneratingReport(true);
            try {
                const response = await apiRequest('/analysis/report', 'POST', {
                    stats,
                    subjectData,
                    weakAreas,
                    topicData,
                    format: 'html',
                    reportStyle: 'plain'
                });

                if (!response.ok) throw new Error('Report generation failed');
                const html = await response.text();
                setReportHtml(html);
            } catch (error) {
                console.error('Error fetching report preview:', error);
            } finally {
                setIsGeneratingReport(false);
            }
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const response = await apiRequest('/analysis/report', 'POST', {
                stats,
                subjectData,
                weakAreas,
                topicData,
                format: 'pdf',
                reportStyle: 'plain'
            }, { responseType: 'blob' });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'PDF generation failed');
            }

            const blob = await response.blob();

            // If backend fell back to HTML or another content type, open in new tab instead of forcing .pdf
            if (blob.type !== 'application/pdf') {
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
                // Do not force download filename in fallback case
                return;
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error: any) {
            console.error('Download failed:', error);
            alert(`Failed to download PDF: ${error.message}`);
        }
    };

    // Helper for relative time
    const getTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "m ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return "Just now";
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoadingData(true);
            try {
                // Determine cutoff
                const now = new Date();
                let cutoffDate = new Date();
                let rangeDays = 7;
                if (timeRange === 'week') {
                    cutoffDate.setDate(now.getDate() - 7);
                    rangeDays = 7;
                } else if (timeRange === 'month') {
                    cutoffDate.setDate(now.getDate() - 30);
                    rangeDays = 30;
                } else if (timeRange === 'year') {
                    cutoffDate.setDate(now.getDate() - 365);
                    rangeDays = 365;
                }
                const cutoffTs = cutoffDate.getTime();

                // Initialize Aggregates
                let totalScore = 0;
                let totalMaxScore = 0;
                let totalCorrect = 0;
                let totalWrong = 0;
                let totalAttempted = 0;
                let totalStudySeconds = 0;
                let classesAttendedCount = 0;

                const historyData: any[] = [];
                const subjStats: Record<string, { correct: number, attempted: number, totalTime: number }> = {};
                const topicAggregates: Record<string, { correct: number, attempted: number, subject: string, totalTime: number }> = {};
                const combinedTestsList: any[] = [];
                const dailyActivityMap: Record<string, number> = {};
                const rawSpeedAccuracyData: any[] = []; // For Scatter Plot

                // --- 0. Load Backend Data if available ---
                try {
                    const trendsRes = await apiRequest(`/learning-analytics/trends?period=${timeRange === 'year' ? 'month' : 'week'}`, 'GET');
                    if (trendsRes.ok) {
                        const trends = await trendsRes.json();
                        if (Array.isArray(trends)) {
                            trends.forEach((t: any) => {
                                historyData.push({
                                    date: t.date,
                                    score: t.accuracy,
                                    type: 'Global',
                                    timestamp: new Date(t.date).getTime()
                                });
                            });
                        }
                    }

                    const overviewRes = await apiRequest('/learning-analytics/overview', 'GET');
                    if (overviewRes.ok) {
                        const overview = await overviewRes.json();
                        // We use these as base stats if local is empty or to supplement
                        if (overview.subjectBreakdown) {
                            overview.subjectBreakdown.forEach((s: any) => {
                                if (!subjStats[s.subject]) {
                                    subjStats[s.subject] = { correct: s.correctAttempts || 0, attempted: s.attempts || 0, totalTime: (s.attempts || 0) * 60 };
                                }
                            });
                        }
                    }
                } catch (e) {
                    console.warn("Backend analytics fetch failed, falling back to local only", e);
                }

                // Initialize Activity Map based on range
                // For Heatmap, we ideally want the last 6 months or year regardless of filter, 
                // but let's respect the filter for now or mock a wider range for the heatmap specifically.
                const heatmapMap: Record<string, number> = {};
                for (let i = 0; i < 180; i++) { // Last 6 months for heatmap
                    const d = new Date();
                    d.setDate(now.getDate() - i);
                    heatmapMap[d.toISOString().split('T')[0]] = 0;
                }

                if (timeRange === 'year') {
                    for (let i = 11; i >= 0; i--) {
                        const d = new Date();
                        d.setMonth(now.getMonth() - i);
                        dailyActivityMap[d.toLocaleDateString('en-US', { month: 'short' })] = 0;
                    }
                } else {
                    for (let i = rangeDays - 1; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(now.getDate() - i);
                        dailyActivityMap[d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })] = 0;
                    }
                }

                // --- 1. Load Mock Test Data ---
                const savedProgress = localStorage.getItem('neet_mock_progress');
                if (savedProgress) {
                    const progressMap = JSON.parse(savedProgress);
                    const completedIds = Object.keys(progressMap)
                        .filter(id => progressMap[id].completed);

                    completedIds.forEach((mockId) => {
                        const resultKey = `mock_result_${mockId}`;
                        const resStr = localStorage.getItem(resultKey);
                        if (resStr) {
                            const res = JSON.parse(resStr);
                            const resTs = res.timestamp || Date.now();
                            const isoDate = new Date(resTs).toISOString().split('T')[0];
                            if (heatmapMap[isoDate] !== undefined) heatmapMap[isoDate] += (res.score || 0);

                            if (resTs < cutoffTs) return;

                            const isMicroMock = mockId.toLowerCase().includes('neet-mock-');
                            const multiplier = isMicroMock ? 1 : 4;
                            const currentScore = res.score || 0;
                            const attempts = (res.correctCount || 0) + (res.wrongCount || 0);

                            totalScore += (currentScore * multiplier);
                            totalMaxScore += (res.totalQuestions * 4);
                            totalCorrect += (res.correctCount || 0);
                            totalWrong += (res.wrongCount || 0);
                            totalAttempted += attempts;
                            totalStudySeconds += 3 * 3600;

                            const dStr = timeRange === 'year'
                                ? new Date(resTs).toLocaleDateString('en-US', { month: 'short' })
                                : new Date(resTs).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

                            if (dailyActivityMap[dStr] !== undefined) dailyActivityMap[dStr] += attempts;

                            historyData.push({
                                date: new Date(resTs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                score: Math.round((currentScore / (res.totalQuestions * (isMicroMock ? 1 : 4))) * 100),
                                type: 'Mock',
                                timestamp: resTs
                            });

                            combinedTestsList.push({
                                id: mockId,
                                type: 'Mock',
                                name: mockId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()).replace('Neet', 'NEET'),
                                score: currentScore * multiplier, // Normalize to NEET scale
                                total: res.totalQuestions * 4,
                                date: getTimeAgo(resTs),
                                timestamp: resTs,
                                improvement: '+5%'
                            });

                            if (res.questions && Array.isArray(res.questions)) {
                                res.questions.forEach((q: any, qIdx: number) => {
                                    const subj = q.subject || 'General';
                                    if (!subjStats[subj]) subjStats[subj] = { correct: 0, attempted: 0, totalTime: 0 };
                                    const userAns = res.userAnswers?.[qIdx]?.selectedAnswer;
                                    // Mock time taken per question usually comes from real tracking. 
                                    // We will randomize it slightly around 45s-90s if not present.
                                    const timeTaken = res.userAnswers?.[qIdx]?.timeTaken || Math.floor(Math.random() * 60) + 30;

                                    if (userAns) {
                                        subjStats[subj].attempted++;
                                        if (userAns === q.correctAnswer) subjStats[subj].correct++;
                                        subjStats[subj].totalTime += timeTaken;

                                        // For Scatter Plot
                                        rawSpeedAccuracyData.push({
                                            subject: subj,
                                            time: timeTaken,
                                            correct: userAns === q.correctAnswer
                                        });
                                    }

                                    // Topic Aggregation
                                    // Topic Aggregation
                                    const topic = q.topic || q.sub_topic;
                                    if (topic) {
                                        if (!topicAggregates[topic]) topicAggregates[topic] = { correct: 0, attempted: 0, subject: subj, totalTime: 0 };
                                        if (userAns) {
                                            topicAggregates[topic].attempted++;
                                            if (userAns === q.correctAnswer) topicAggregates[topic].correct++;
                                            topicAggregates[topic].totalTime += timeTaken;
                                        }
                                    }
                                });
                            }
                        }
                    });
                }

                // --- 2. Load MCQ Practice Data ---
                const practiceHistoryStr = localStorage.getItem('yuga_practice_history');
                if (practiceHistoryStr) {
                    const practiceHistory = JSON.parse(practiceHistoryStr);
                    practiceHistory.forEach((session: any) => {
                        const sessionTs = new Date(session.date).getTime();
                        const isoDate = new Date(sessionTs).toISOString().split('T')[0];
                        if (heatmapMap[isoDate] !== undefined) heatmapMap[isoDate] += session.score;

                        if (sessionTs < cutoffTs) return;

                        totalScore += session.score;
                        totalMaxScore += session.total;
                        totalAttempted += session.total;
                        totalCorrect += session.score;

                        const timeTaken = session.timeTaken || session.total * 60; // Approx 1 min per q
                        totalStudySeconds += timeTaken;

                        const dStr = timeRange === 'year'
                            ? new Date(sessionTs).toLocaleDateString('en-US', { month: 'short' })
                            : new Date(sessionTs).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

                        if (dailyActivityMap[dStr] !== undefined) dailyActivityMap[dStr] += session.total;

                        historyData.push({
                            date: new Date(sessionTs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            score: Math.round((session.score / session.total) * 100),
                            type: 'Practice',
                            timestamp: sessionTs
                        });

                        combinedTestsList.push({
                            id: session.id,
                            type: 'Practice',
                            name: `${session.subject} Practice`,
                            score: session.score,
                            total: session.total,
                            date: getTimeAgo(sessionTs),
                            timestamp: sessionTs
                        });

                        const subj = session.subject;
                        if (!subjStats[subj]) subjStats[subj] = { correct: 0, attempted: 0, totalTime: 0 };
                        subjStats[subj].attempted += session.total;
                        subjStats[subj].correct += session.score;
                        subjStats[subj].totalTime += timeTaken;
                    });
                }

                // --- 3. Load Class Progress ---
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('yuga_progress_')) {
                        try {
                            const val = JSON.parse(localStorage.getItem(key) || '{}');
                            if (val.progress > 10) {
                                classesAttendedCount++;
                                const progress = Math.min(val.progress, 100);
                                totalStudySeconds += (progress / 100) * 45 * 60;
                            }
                        } catch (e) { /* ignore */ }
                    }
                }

                // --- 4. Load Doubts History ---
                const doubtsStr = localStorage.getItem('yuga_doubts_history');
                const doubtsCount = doubtsStr ? JSON.parse(doubtsStr).length : 0;

                // --- 5. Final Aggregation ---
                setHasData(combinedTestsList.length > 0 || classesAttendedCount > 0 || doubtsCount > 0);

                combinedTestsList.sort((a, b) => b.timestamp - a.timestamp);
                historyData.sort((a, b) => a.timestamp - b.timestamp);

                let runningSum = 0;
                historyData.forEach((point, idx) => {
                    runningSum += point.score;
                    point.avg = Math.round(runningSum / (idx + 1));
                });

                const subjectColors: any = {
                    'Physics': '#8b5cf6',
                    'Chemistry': '#06b6d4',
                    'Botany': '#10b981',
                    'Zoology': '#8b5cf6',
                    'NEET Physics MCQs': '#8b5cf6',
                    'NEET Chemistry MCQs': '#06b6d4',
                    'NEET Botany MCQs': '#10b981',
                    'NEET Zoology MCQs': '#8b5cf6',
                    'JEE Mains Physics': '#8b5cf6',
                    'JEE Mains Chemistry': '#06b6d4',
                    'JEE Advanced Physics': '#7c3aed',
                    'JEE Advanced Chemistry': '#0891b2',
                };

                // Consolidate data by Subject Name (merging NEET Physics, JEE Physics -> Physics)
                const mergedSubjStats: Record<string, { correct: number, attempted: number, totalTime: number, originalKey: string }> = {};

                Object.keys(subjStats).forEach(key => {
                    const cleanName = key.replace(/^(NEET|JEE Mains|JEE Advanced) /, '').replace(' MCQs', '');
                    if (cleanName === 'Biology') return; // Skip aggregate Biology
                    if (cleanName === 'Mathematics') return; // Skip Mathematics if not part of current focus

                    if (!mergedSubjStats[cleanName]) {
                        mergedSubjStats[cleanName] = { correct: 0, attempted: 0, totalTime: 0, originalKey: key };
                    }
                    mergedSubjStats[cleanName].correct += subjStats[key].correct;
                    mergedSubjStats[cleanName].attempted += subjStats[key].attempted;
                    mergedSubjStats[cleanName].totalTime += subjStats[key].totalTime;
                });

                const formattedSubjects = Object.keys(mergedSubjStats).map(subj => {
                    const s = mergedSubjStats[subj];
                    const acc = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;

                    // improved color mapping logic
                    let color = subjectColors[subj]; // Check for direct "Physics"
                    if (!color) color = subjectColors[s.originalKey] || '#8b5cf6';

                    return {
                        subject: subj,
                        score: acc,
                        fill: color,
                        fullSubject: s.originalKey,
                        avgTime: s.attempted > 0 ? Math.round(s.totalTime / s.attempted) : 0
                    };
                });

                const totalStudyHours = Math.round((totalStudySeconds / 3600) * 10) / 10;
                const finalAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
                const finalAvgScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : (totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0);

                const projScore = Math.round((finalAvgScore / 100) * 720);
                const projRank = totalAttempted > 0 ? Math.max(1, Math.round((100 - finalAvgScore) * 1500)) : 0;
                const consistency = Math.min(100, (classesAttendedCount * 5) + (totalAttempted / 10)); // Arbitrary calc
                const readiness = Math.round((finalAccuracy * 0.4) + (finalAvgScore * 0.4) + (consistency * 0.2));

                let insight = "Start practicing to get AI insights.";
                if (formattedSubjects.length > 0) {
                    const sortedSubj = [...formattedSubjects].sort((a, b) => b.score - a.score);
                    const best = sortedSubj[0];
                    const worst = sortedSubj[sortedSubj.length - 1];
                    if (best.score > 80 && worst.score < 50) {
                        insight = `Your ${best.subject} is on fire! However, ${worst.subject} needs focus. Master the fundamentals to skyrocket your rank.`;
                    } else if (finalAvgScore > 75) {
                        insight = "Elite territory! You're performing at a top-1% consistency. Keep this momentum for the final push.";
                    } else {
                        insight = `Strategic growth required. Bridge the gap in ${worst.subject} to unlock your true rank potential.`;
                    }
                }

                const studyActivityData = Object.keys(dailyActivityMap).map(day => ({
                    day,
                    questions: dailyActivityMap[day]
                }));

                const speedMetricsData = formattedSubjects.map(s => ({
                    subject: s.subject,
                    accuracy: s.score,
                    speed: s.avgTime
                }));

                setStats({
                    averageScore: historyData.length > 0 ? Math.round(historyData.reduce((a, b) => a + b.score, 0) / historyData.length) : 0,
                    questionsSolved: totalAttempted,
                    accuracy: finalAccuracy,
                    studyHours: totalStudyHours > 0 ? totalStudyHours : (user?.progress?.weeklyProgress || 0),
                    scoreChange: historyData.length >= 2 ? (historyData[historyData.length - 1].score - historyData[historyData.length - 2].score) : 0,
                    accuracyChange: 0,
                    questionsChange: totalAttempted,
                    classesAttended: classesAttendedCount,
                    doubtsAsked: doubtsCount,
                    projectedScore: projScore,
                    projectedRank: projRank,
                    aiInsight: insight,
                    studyActivity: studyActivityData,
                    speedMetrics: speedMetricsData,
                    knowledgeGrowth: Math.min(100, (totalAttempted / 500) * 100),
                    consistencyScore: consistency, // Mock Consistency
                    readinessScore: readiness // Mock Readiness
                });

                setScoreHistory(historyData);
                setSubjectData(formattedSubjects);

                // Process Topic Stats
                const processedTopics = Object.keys(topicAggregates).map(topic => {
                    const d = topicAggregates[topic];
                    return {
                        topic,
                        subject: d.subject.replace(/^(NEET|JEE Mains|JEE Advanced) /, '').replace(' MCQs', ''),
                        accuracy: d.attempted > 0 ? Math.round((d.correct / d.attempted) * 100) : 0,
                        attempted: d.attempted,
                        speed: d.attempted > 0 ? Math.round(d.totalTime / d.attempted) : 0
                    };
                }).sort((a, b) => b.accuracy - a.accuracy);

                setTopicData(processedTopics);

                const weakTopics = processedTopics.filter(t => t.accuracy < 65).sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
                const strongTopics = processedTopics.filter(t => t.accuracy >= 65).sort((a, b) => b.accuracy - a.accuracy).slice(0, 5);

                setWeakAreas(weakTopics);
                setStrongAreas(strongTopics);



                // Heatmap Data (Transforming Map to Array)
                const heatmapArray = Object.keys(heatmapMap)
                    .map(date => ({
                        date,
                        count: heatmapMap[date],
                        intensity: Math.min(4, Math.ceil(heatmapMap[date] / 10))
                    }))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Ensure date ascending
                    .slice(-120); // Last 4 months
                setHeatmapData(heatmapArray);
                setActivities(combinedTestsList);

            } catch (err) {
                console.error("Error processing performance data", err);
            } finally {
                setIsLoadingData(false);
            }
        };

        loadData();
    }, [user, timeRange]);

    const handleStartTest = () => {
        navigate('/mock-neet');
    };

    const handlePractice = (subject?: string) => {
        navigate(`/practice/${subject || 'Biology'}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-x-hidden">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                                <Activity className="w-3 h-3" />
                                Live Intelligence
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                            Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Hub</span>
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 max-w-xl text-lg">
                            Advanced analytics to visualize your mastery and predict your rank.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <ActionButton icon={Download} label="View Report" onClick={handleViewReport} />
                        <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center">
                            {['week', 'month', 'year'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${timeRange === range
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {isLoadingData ? (
                        <motion.div
                            key="loading-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center min-h-[400px] gap-6"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
                                />
                                <Activity className="w-8 h-8 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Analyzing your progress...</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm">Gathering insights from your tests and study sessions to build your performance profile.</p>
                            </div>
                        </motion.div>
                    ) : hasData ? (
                        <motion.div
                            key="dashboard-content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-8"
                        >

                            {/* Top Tier: Readiness & Insights */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Exam Readiness Gauge - Redesigned */}
                                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                    <div className="mb-4 relative z-10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Trophy className="w-5 h-5 text-emerald-500" />
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Exam Readiness</h3>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Composite score based on your overall performance.</p>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                                        <div className="h-[180px] w-full relative flex items-center justify-center">
                                            <PremiumReadinessGauge score={stats.readinessScore} />
                                            <div className="absolute bottom-6 text-center">
                                                <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.readinessScore}%</div>
                                                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-0.5">Prepared</div>
                                            </div>
                                        </div>

                                        {/* Breakdown Metrics */}
                                        <div className="flex w-full justify-between px-2 mt-2">
                                            <div className="text-center">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</div>
                                                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{stats.accuracy}%</div>
                                            </div>
                                            <div className="text-center border-x border-slate-100 dark:border-slate-800 px-4">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coverage</div>
                                                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{Math.round(stats.knowledgeGrowth)}%</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Habit</div>
                                                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{stats.consistencyScore}%</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 text-center text-xs font-medium text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 py-2 rounded-xl">
                                        Top 15% of students are here
                                    </div>
                                </div>

                                {/* AI Insight & Projections Widget */}
                                <div className="lg:col-span-2">
                                    <PredictiveAnalyticsWidget />
                                </div>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <MetricCard label="Avg. Score" value={`${stats.averageScore}%`} trend={stats.scoreChange} icon={Target} color="indigo" />
                                <MetricCard label="Questions Solved" value={stats.questionsSolved} icon={BookOpen} color="slate" />
                                <MetricCard label="Accuracy" value={`${stats.accuracy}%`} icon={Activity} color="emerald" />
                                <MetricCard label="Study Hours" value={`${Math.floor(stats.studyHours)}h`} icon={Clock} color="rose" />
                            </div>

                            {/* Charts Row 1: Evolution & Radar */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-colors duration-700" />

                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-indigo-500" /> Performance Trend
                                            </h3>
                                            <p className="text-slate-500 text-sm mt-1">Tracking your mock test scores over time.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                Target: 85%
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                Avg: {stats.averageScore}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-[350px] w-full relative z-10" style={{ width: '100%', height: 350 }}>
                                        {scoreHistory.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                                                    <TrendingUp className="w-7 h-7 text-indigo-400" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No test results yet</p>
                                                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 max-w-[220px]">
                                                        Complete a mock test or practice session — your score trend will appear here.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleStartTest}
                                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2 transition-all"
                                                >
                                                    Take your first test →
                                                </button>
                                            </div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={scoreHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                                    <XAxis
                                                        dataKey="date"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                                        dy={10}
                                                    />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                                        domain={[0, 100]}
                                                        hide={false}
                                                    />
                                                    <RechartsTooltip cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} content={<CustomTooltip />} />

                                                    {/* Target Line */}
                                                    <ReferenceLine y={85} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />

                                                    {/* Average Line */}
                                                    <ReferenceLine y={stats.averageScore} stroke="#6366f1" strokeDasharray="3 3" strokeOpacity={0.3} />

                                                    <Area
                                                        type="monotone"
                                                        dataKey="score"
                                                        stroke="#6366f1"
                                                        strokeWidth={4}
                                                        fill="url(#scoreGradient)"
                                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#fff', stroke: '#6366f1' }}
                                                        animationDuration={1500}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-colors duration-700" />

                                    <div className="relative z-10 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Target className="w-5 h-5 text-indigo-500" /> Mastery Radar
                                        </h3>
                                        <p className="text-slate-500 text-xs">Subject-wise strength analysis.</p>
                                    </div>

                                    <div className="h-[250px] w-full relative z-10" style={{ width: '100%', height: 250 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={subjectData}>
                                                <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
                                                <PolarAngleAxis
                                                    dataKey="subject"
                                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                                                />
                                                <Radar
                                                    name="Mastery"
                                                    dataKey="score"
                                                    stroke="#6366f1"
                                                    strokeWidth={3}
                                                    fill="#6366f1"
                                                    fillOpacity={0.4}
                                                />
                                                <RechartsTooltip content={<CustomTooltip />} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Subject Legend */}
                                    <div className="relative z-10 mt-2 grid grid-cols-2 gap-2">
                                        {subjectData.map((subj: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subj.fill || '#6366f1' }} />
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[80px]">{subj.subject}</span>
                                                </div>
                                                <span className="text-xs font-black text-slate-900 dark:text-white">{subj.score}%</span>
                                            </div>
                                        ))}
                                        {subjectData.length === 0 && (
                                            <div className="col-span-2 text-center text-xs text-slate-400 py-2">
                                                Complete tests to see subject breakdown
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Infographics Section */}
                            <div className="grid grid-cols-1 gap-6">
                                {/* Study Intensity & Recent Activity - REPLACED Subject Performance */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Study Intensity (Bar Chart) */}
                                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Daily Activity</div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    Study Intensity
                                                </h3>
                                            </div>
                                            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                                                <Flame className="w-6 h-6 text-emerald-500" />
                                            </div>
                                        </div>

                                        <div className="h-[250px] min-h-[250px] w-full mt-4" style={{ width: '100%', height: '250px' }}>
                                            {heatmapData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={heatmapData.slice(-7)} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                                        <XAxis
                                                            dataKey="date"
                                                            tickFormatter={(date) => {
                                                                const d = new Date(date);
                                                                return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
                                                            }}
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                                            dy={10}
                                                        />
                                                        <YAxis
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                                        />
                                                        <RechartsTooltip
                                                            cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                                                            content={({ active, payload, label }) => {
                                                                if (active && payload && payload.length) {
                                                                    return (
                                                                        <div className="bg-slate-900 text-white text-xs py-1 px-3 rounded-lg shadow-xl">
                                                                            <div className="font-bold mb-0.5">{label}</div>
                                                                            <div>Questions: {payload[0].value}</div>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            }}
                                                        />
                                                        <Bar
                                                            dataKey="count"
                                                            fill="#cbd5e1"
                                                            radius={[6, 6, 0, 0]}
                                                            barSize={40}
                                                            className="hover:opacity-80 transition-opacity"
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                                    No activity data available
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recent Activity List */}
                                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <HistoryIcon className="w-5 h-5 text-indigo-500" /> Recent Activity
                                                </h3>
                                                <p className="text-slate-500 text-sm mt-1">Latest exams, practice sessions, and classes.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {activities.slice(0, 4).map((activity: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2.5 rounded-lg ${activity.type === 'Mock' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                                                            {activity.type === 'Mock' ? <Trophy className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 dark:text-white text-sm">{activity.name}</div>
                                                            <div className="text-xs text-slate-500 font-medium">{activity.date} • {activity.type}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-black text-slate-900 dark:text-white text-lg">{activity.score < 100 ? `${Math.round((activity.score / activity.total) * 100)}%` : activity.score}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase">Score</div>
                                                    </div>
                                                </div>
                                            ))}
                                            {activities.length === 0 && (
                                                <div className="text-center text-sm text-slate-500 py-8">No recent activity found.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Strong vs Weak Split */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2rem] p-6 border border-emerald-100 dark:border-emerald-500/20">
                                        <div className="flex items-center gap-2 mb-6">
                                            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                            <h3 className="text-xl font-bold text-emerald-900 dark:text-white">Strong Zones</h3>
                                        </div>
                                        <TopicSplitView topics={strongAreas} type="strong" />
                                    </div>
                                    <div className="bg-rose-50/50 dark:bg-rose-900/10 rounded-[2rem] p-6 border border-rose-100 dark:border-rose-500/20">
                                        <div className="flex items-center gap-2 mb-6">
                                            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                                            <h3 className="text-xl font-bold text-rose-900 dark:text-white">Weak Areas</h3>
                                        </div>
                                        <TopicSplitView topics={weakAreas} type="weak" onPractice={handlePractice} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        // Empty State
                        <motion.div
                            key="empty-state"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                        >
                            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-indigo-50/50 dark:ring-indigo-500/5">
                                <BarChart2 className="w-10 h-10 text-indigo-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Performance Data Yet</h2>
                            <p className="text-slate-500 max-w-sm mx-auto mb-8">
                                Complete your first test or practice session to unlock advanced analytics and infographics.
                            </p>
                            <button
                                onClick={handleStartTest}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105 flex items-center gap-2"
                            >
                                <Trophy className="w-5 h-5" />
                                Start First Test
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <Footer />
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                htmlContent={reportHtml}
                isLoading={isGeneratingReport}
                onDownload={handleDownloadPdf}
            />
        </div >
    );
};

// --- Sub Components ---

const ActionButton = ({ icon: Icon, label, onClick }: any) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-xl shadow-sm transition-all text-sm"
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);

const MetricCard = ({ label, value, trend, icon: Icon, color }: any) => {
    const colorStyles: any = {
        indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
        slate: "bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-400",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
        rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${colorStyles[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend !== undefined && trend !== 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">{label}</div>
            </div>
        </div>
    );
};

const PremiumReadinessGauge = ({ score }: { score: number }) => {
    // Canvas/SVG logic for a premium gauge
    const radius = 90; // Increased to 90
    const stroke = 12;
    const normalizedScore = Math.min(100, Math.max(0, score));
    const circumference = radius * Math.PI;
    const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

    return (
        <div className="relative w-[200px] h-[120px] flex items-center justify-center overflow-hidden">

            <svg width="200" height="120" viewBox="0 0 200 120" className="rotate-0">
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                </defs>

                {/* Background Track */}
                <path
                    d="M 10 110 A 90 90 0 0 1 190 110" // Adjusted for radius 90
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    className="text-slate-100 dark:text-slate-800"
                />

                {/* Colored Progress */}
                <path
                    d="M 10 110 A 90 90 0 0 1 190 110" // Adjusted for radius 90
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                />

                {/* Ticks */}
                {[0, 25, 50, 75, 100].map((tick, i) => {
                    const angle = 180 + (tick / 100) * 180;
                    const rad = (angle * Math.PI) / 180;
                    const x1 = 100 + 80 * Math.cos(rad); // Adjusted for new radius (90-10)
                    const y1 = 110 + 80 * Math.sin(rad); // Center y is 110
                    const x2 = 100 + 70 * Math.cos(rad);
                    const y2 = 110 + 70 * Math.sin(rad);
                    return (
                        <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-slate-300 dark:text-slate-700"
                        />
                    )
                })}
            </svg>
        </div>
    );
};



const TopicSplitView = ({ topics, type, onPractice }: any) => {
    return (
        <div className="space-y-4">
            {topics.map((t: any, idx: number) => (
                <div key={idx} className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl border border-white/50 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <div className="font-bold text-slate-800 dark:text-white text-sm">{t.topic}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">{t.subject}</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className={`font-black text-lg ${type === 'strong' ? 'text-emerald-600' : 'text-rose-600'}`}>{t.accuracy}%</div>
                        </div>
                        {type === 'weak' && (
                            <button onClick={() => onPractice(t.subject)} className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm hover:scale-105 transition-transform">
                                <Zap className="w-4 h-4 text-rose-500" />
                            </button>
                        )}
                    </div>
                </div>
            ))}
            {topics.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${type === 'strong' ? 'bg-emerald-100/80 dark:bg-emerald-500/10' : 'bg-rose-100/80 dark:bg-rose-500/10'}`}>
                        {type === 'strong'
                            ? <CheckCircle className="w-6 h-6 text-emerald-400 opacity-60" />
                            : <AlertTriangle className="w-6 h-6 text-rose-400 opacity-60" />}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Nothing here yet</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[180px]">
                            Take classes & practice tests to see your {type === 'strong' ? 'strong zones' : 'weak areas'} here.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}



const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl">
                <p className="font-bold text-slate-900 dark:text-white mb-1">{label || payload[0].payload.name}</p>
                {payload.map((p: any, idx: number) => (
                    <p key={idx} className="text-xs font-medium" style={{ color: p.color || p.fill }}>
                        {p.name}: {p.value}{p.unit || ''}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};
