import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Brain, Target, TrendingUp, Calendar, Award, Flame,
    Atom, FlaskConical
} from 'lucide-react';
import { StudyIntensity } from './components/StudyIntensity';
import { WeakAreas } from './components/WeakAreas';
import { RecentSessions } from './components/RecentSessions';
import { SubjectAnalysis } from './components/SubjectAnalysis';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ... (existing helper functions)

// ... (existing helper functions)

// ... (existing helper functions)

interface TopicMaster {
    subject: string;
    topic: string;
    masteryScore: number;
    totalAttempts: number;
    correctAttempts: number;
    averageTimeSpent: number;
    difficultyLevel: string;
    lastPracticedAt: Date;
}

interface SubjectBreakdown {
    subject: string;
    attempts: number;
    accuracy: number;
    averageMastery: number;
    topicsCount: number;
}

interface Analytics {
    totalAttempts: number;
    correctAttempts: number;
    overallAccuracy: number;
    overallMastery: number;
    subjectBreakdown: SubjectBreakdown[];
    recentAttempts: number;
    studyTimeThisWeek: number;
    topicsMastered: number;
    topicsInProgress: number;
}

interface MasteryData {
    [key: string]: TopicMaster[];
}

export default function LearningPathDashboard() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [masteryData, setMasteryData] = useState<MasteryData>({ Biology: [], Chemistry: [], Physics: [] });
    const [loading, setLoading] = useState(true);
    const [activeSubject, setActiveSubject] = useState<'Biology' | 'Chemistry' | 'Physics'>('Biology');

    useEffect(() => {
        fetchAnalytics();
        fetchMasteryData();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/learning-analytics/overview`, {
                withCredentials: true
            });
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const fetchMasteryData = async () => {
        try {
            const subjects = ['Biology', 'Chemistry', 'Physics'];
            const data: MasteryData = { Biology: [], Chemistry: [], Physics: [] };

            for (const subject of subjects) {
                const response = await axios.get(`${API_BASE_URL}/api/learning-analytics/mastery/${subject}`, {
                    withCredentials: true
                });
                data[subject] = response.data;
            }

            setMasteryData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching mastery data:', error);
            setLoading(false);
        }
    };

    const getMasteryColor = (score: number): string => {
        if (score >= 70) return 'from-green-500/20 to-emerald-500/10 border-green-500/30';
        if (score >= 40) return 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
        return 'from-red-500/20 to-rose-500/10 border-red-500/30';
    };

    const getMasteryTextColor = (score: number): string => {
        if (score >= 70) return 'text-green-400';
        return score >= 40 ? 'text-yellow-400' : 'text-red-400';
    };


    const getAllSessions = () => {
        const allSessions: any[] = [];
        const subjects: Array<'Biology' | 'Chemistry' | 'Physics'> = ['Biology', 'Chemistry', 'Physics'];

        subjects.forEach(subject => {
            if (masteryData[subject]) {
                masteryData[subject].forEach((topic: TopicMaster, idx: number) => {
                    // Mocking session data from mastery data for now
                    if (topic.lastPracticedAt) {
                        allSessions.push({
                            id: `${subject}-${idx}`,
                            subject: subject,
                            topic: topic.topic,
                            date: new Date(topic.lastPracticedAt),
                            score: topic.masteryScore,
                            duration: Math.round(topic.averageTimeSpent / 60)
                        });
                    }
                });
            }
        });

        // Sort by date desc
        return allSessions.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-10 h-10 text-purple-400" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Your Personalized Learning Path
                    </h1>
                </div>
                <p className="text-gray-400 ml-13">AI-powered study plan tailored to your performance</p>
            </div>

            {/* Progress Overview Cards */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Overall Mastery */}
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-900/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                        <Target className="w-8 h-8 text-purple-400" />
                        <span className="text-3xl font-bold text-purple-400">
                            {analytics?.overallMastery || 0}%
                        </span>
                    </div>
                    <h3 className="text-sm text-gray-400 mb-1">Overall Mastery</h3>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${analytics?.overallMastery || 0}%` }}
                        ></div>
                    </div>
                </div>

                {/* Questions Attempted */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-900/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="w-8 h-8 text-blue-400" />
                        <span className="text-3xl font-bold text-blue-400">
                            {analytics?.recentAttempts || 0}
                        </span>
                    </div>
                    <h3 className="text-sm text-gray-400">Questions This Week</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        {analytics?.totalAttempts || 0} total attempts
                    </p>
                </div>

                {/* Study Time */}
                <div className="bg-gradient-to-br from-green-500/10 to-green-900/10 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                        <Calendar className="w-8 h-8 text-green-400" />
                        <span className="text-3xl font-bold text-green-400">
                            {analytics?.studyTimeThisWeek || 0}
                        </span>
                    </div>
                    <h3 className="text-sm text-gray-400">Minutes This Week</h3>
                    <p className="text-xs text-gray-500 mt-1">Keep up the momentum!</p>
                </div>

                {/* Topics Mastered */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-900/10 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                        <Award className="w-8 h-8 text-yellow-400" />
                        <span className="text-3xl font-bold text-yellow-400">
                            {analytics?.topicsMastered || 0}
                        </span>
                    </div>
                    <h3 className="text-sm text-gray-400">Topics Mastered</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        {analytics?.topicsInProgress || 0} in progress
                    </p>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="max-w-7xl mx-auto space-y-8 mb-8">
                {/* Row 1: Activity & Focus */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-[500px]">
                        <StudyIntensity />
                    </div>
                    <div className="h-[500px]">
                        <WeakAreas
                            areas={analytics?.subjectBreakdown?.map((s: SubjectBreakdown) => ({
                                subject: s.subject.toUpperCase(),
                                topic: `${s.subject} Revision`,
                                accuracy: s.accuracy,
                                urgent: s.accuracy < 40
                            })).sort((a: any, b: any) => a.accuracy - b.accuracy).slice(0, 3)}
                        />
                    </div>
                </div>

                {/* Row 2: Analysis & History */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="h-[650px]">
                        <SubjectAnalysis
                            data={analytics?.subjectBreakdown?.map((s: SubjectBreakdown) => ({
                                subject: s.subject,
                                mastery: s.averageMastery,
                                color: s.subject === 'Physics' ? '#a855f7' : s.subject === 'Biology' ? '#f43f5e' : '#10b981',
                                icon: s.subject === 'Physics' ? <Atom className="w-6 h-6" /> : s.subject === 'Biology' ? <Brain className="w-6 h-6" /> : <FlaskConical className="w-6 h-6" />
                            }))}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <RecentSessions sessions={getAllSessions().length > 0 ? getAllSessions() : undefined} />
                    </div>
                </div>
            </div>

            {/* Subject Tabs */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex gap-4 bg-gray-900/50 backdrop-blur-xl rounded-xl p-2 border border-gray-800">
                    {['Biology', 'Chemistry', 'Physics'].map((subject) => (
                        <button
                            key={subject}
                            onClick={() => setActiveSubject(subject as 'Biology' | 'Chemistry' | 'Physics')}
                            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeSubject === subject
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }`}
                        >
                            {subject}
                        </button>
                    ))}
                </div>
            </div>

            {/* Topic Mastery Grid */}
            <div className="max-w-7xl mx-auto mb-10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-400" />
                    Topic Mastery - {activeSubject}
                </h2>

                {masteryData[activeSubject].length === 0 ? (
                    <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-12 border border-gray-800 text-center">
                        <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No practice data yet for {activeSubject}</p>
                        <p className="text-gray-500 text-sm mt-2">Start practicing to see your progress!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {masteryData[activeSubject].map((topic: TopicMaster, index: number) => (
                            <div
                                key={index}
                                className={`bg-gradient-to-br ${getMasteryColor(topic.masteryScore)} backdrop-blur-xl rounded-xl p-6 border hover:scale-105 transition-all duration-300 cursor-pointer`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold text-white text-lg flex-1 pr-2">
                                        {topic.topic}
                                    </h3>
                                    <span className={`text-2xl font-bold ${getMasteryTextColor(topic.masteryScore)}`}>
                                        {topic.masteryScore}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-1000 ${topic.masteryScore >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                            topic.masteryScore >= 40 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                                                'bg-gradient-to-r from-red-500 to-rose-500'
                                            }`}
                                        style={{ width: `${topic.masteryScore}%` }}
                                    ></div>
                                </div>

                                {/* Stats */}
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>{topic.totalAttempts} attempts</span>
                                    <span>{topic.correctAttempts}/{topic.totalAttempts} correct</span>
                                </div>

                                {/* Difficulty Badge */}
                                <div className="mt-3">
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-800/80 text-gray-300">
                                        {topic.difficultyLevel}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            {/* End of Dashboard */}
            <div className="h-10"></div>
        </div>
    );
}
