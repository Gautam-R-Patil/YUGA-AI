import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Clock, Target, Award, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function AnalyticsDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [weakAreas, setWeakAreas] = useState([]);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [analyticsRes, weakAreasRes, trendsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/learning-analytics/overview`, { withCredentials: true }),
                axios.get(`${API_BASE_URL}/api/learning-analytics/weak-areas`, { withCredentials: true }),
                axios.get(`${API_BASE_URL}/api/learning-analytics/trends?period=week`, { withCredentials: true })
            ]);

            setAnalytics(analyticsRes.data);
            setWeakAreas(weakAreasRes.data);
            setTrends(trendsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-10 h-10 text-blue-400" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Performance Analytics
                    </h1>
                </div>
                <p className="text-gray-400 ml-13">Deep insights into your learning journey</p>
            </div>

            {/* Subject Distribution */}
            <div className="max-w-7xl mx-auto mb-10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Target className="w-6 h-6 text-green-400" />
                    Subject Performance
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {analytics?.subjectBreakdown?.map((subject, index) => (
                        <div
                            key={index}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">{subject.subject}</h3>
                                <div className="text-3xl font-bold text-cyan-400">
                                    {subject.accuracy}%
                                </div>
                            </div>

                            {/* Mastery Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-400 mb-1">
                                    <span>Average Mastery</span>
                                    <span>{subject.averageMastery}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-1000"
                                        style={{ width: `${subject.averageMastery}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
                                <div>
                                    <p className="text-xs text-gray-500">Attempts</p>
                                    <p className="text-lg font-semibold text-white">{subject.attempts}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Topics</p>
                                    <p className="text-lg font-semibold text-white">{subject.topicsCount}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance Trends */}
            <div className="max-w-7xl mx-auto mb-10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                    Weekly Performance Trends
                </h2>

                <div className="bg-gradient-to-br from-purple-500/10 to-pink-900/10 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20">
                    {trends.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">No practice data this week yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {trends.map((trend, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-24 text-sm text-gray-400">
                                        {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-300">{trend.attempts} questions</span>
                                            <span className="text-purple-400 font-semibold">{trend.accuracy.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-4">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                                style={{ width: `${trend.accuracy}%` }}
                                            >
                                                {trend.accuracy >= 20 && (
                                                    <span className="text-xs font-semibold text-white">
                                                        {trend.accuracy.toFixed(0)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Strengths & Weaknesses</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weaknesses */}
                    <div className="bg-gradient-to-br from-red-500/10 to-rose-900/10 backdrop-blur-xl rounded-2xl p-8 border border-red-500/20">
                        <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                            <h3 className="text-xl font-bold text-red-400">Areas Needing Focus</h3>
                        </div>

                        {weakAreas.length === 0 ? (
                            <div className="text-center py-8">
                                <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400">Excellent! No weak areas identified.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {weakAreas.map((item, index) => (
                                    <div key={index} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-800 text-gray-300 mb-2">
                                                    {item.subject}
                                                </span>
                                                <h4 className="font-semibold text-white">{item.topic}</h4>
                                            </div>
                                            <span className="text-2xl font-bold text-red-400">{item.masteryScore}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{item.attempts} attempts</span>
                                            <span>{item.accuracy}% accuracy</span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                                            <div
                                                className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full"
                                                style={{ width: `${item.masteryScore}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Strengths */}
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-900/10 backdrop-blur-xl rounded-2xl p-8 border border-green-500/20">
                        <div className="flex items-center gap-3 mb-6">
                            <Award className="w-6 h-6 text-green-400" />
                            <h3 className="text-xl font-bold text-green-400">Your Strengths</h3>
                        </div>

                        <div className="space-y-4">
                            {analytics?.subjectBreakdown
                                ?.filter(s => s.averageMastery >= 70)
                                .map((subject, index) => (
                                    <div key={index} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-white">{subject.subject}</h4>
                                            <span className="text-2xl font-bold text-green-400">{subject.averageMastery}</span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                                                style={{ width: `${subject.averageMastery}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {subject.accuracy}% accuracy • {subject.attempts} attempts
                                        </p>
                                    </div>
                                ))}

                            {analytics?.subjectBreakdown?.filter(s => s.averageMastery >= 70).length === 0 && (
                                <div className="text-center py-8">
                                    <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400">Keep practicing to build your strengths!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Overall Stats Summary */}
            <div className="max-w-7xl mx-auto mt-10">
                <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-8 border border-gray-700">
                    <h3 className="text-xl font-bold mb-6 text-center">Overall Performance Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-400">{analytics?.totalAttempts || 0}</p>
                            <p className="text-sm text-gray-400 mt-1">Total Questions</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-400">{analytics?.overallAccuracy || 0}%</p>
                            <p className="text-sm text-gray-400 mt-1">Overall Accuracy</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-purple-400">{analytics?.topicsMastered || 0}</p>
                            <p className="text-sm text-gray-400 mt-1">Topics Mastered</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-yellow-400">{analytics?.studyTimeThisWeek || 0}</p>
                            <p className="text-sm text-gray-400 mt-1">Minutes This Week</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
