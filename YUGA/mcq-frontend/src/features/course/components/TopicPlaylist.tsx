import React, { useState, useEffect } from "react";
import {
    Play,
    Clock,
    ArrowLeft,
    ListVideo,
    Sparkles
} from "lucide-react";
import { apiRequest } from "../../../core/utils/api";

interface TopicPlaylistProps {
    subject: string;
    courseType?: string;
    chapter: string;
    classLevel: string;
    onBack: () => void;
    onTopicSelect: (topic: string) => void;
}

export const TopicPlaylist: React.FC<TopicPlaylistProps> = ({
    subject,
    courseType = 'neet',
    chapter,
    classLevel,
    onBack,
    onTopicSelect
}) => {
    const [topics, setTopics] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTopics();
    }, [chapter]);

    const fetchTopics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const isJEECourse = courseType.toLowerCase().includes('jee');
            const isJEESubject = subject.toLowerCase().includes('jee');
            const type = (isJEECourse || isJEESubject) ? 'jee' : 'neet';
            const response = await apiRequest(`/curriculum/${type}/topics?subject=${encodeURIComponent(subject)}&classLevel=${encodeURIComponent(classLevel)}&chapter=${encodeURIComponent(chapter)}&type=${type}`, 'GET');

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error('Failed to fetch curriculum');
            }

            const data = await response.json();
            if (data.topics && Array.isArray(data.topics)) {
                setTopics(data.topics);
            } else {
                throw new Error('Invalid format received');
            }

        } catch (err) {
            console.error('Error details:', err);
            // Fallback topics if API fails (so user isn't stuck)
            setTopics([
                'Introduction to ' + chapter,
                'Key Concepts of ' + chapter,
                'Understanding the Fundamentals',
                'Solved Examples - Part 1',
                'Solved Examples - Part 2',
                'Advanced Applications',
                'Previous Year Questions Analysis',
                'Summary and Revision'
            ]);
            setError('Using offline mode');
        } finally {
            setIsLoading(false);
        }
    };

    const getTheme = (sub: string) => {
        if (sub.includes('Physics')) return {
            main: 'blue',
            gradient: 'from-blue-600 to-cyan-500',
            light: 'bg-blue-50',
            text: 'text-blue-600',
            border: 'group-hover:border-blue-200',
            shadow: 'shadow-blue-200',
            icon: 'text-blue-500'
        };
        if (sub.includes('Chemistry')) return {
            main: 'emerald',
            gradient: 'from-emerald-600 to-teal-600',
            light: 'bg-emerald-50',
            text: 'text-emerald-600',
            border: 'group-hover:border-emerald-200',
            shadow: 'shadow-emerald-200',
            icon: 'text-emerald-500'
        };
        if (sub.includes('Biology')) return {
            main: 'rose',
            gradient: 'from-rose-600 to-pink-600',
            light: 'bg-rose-50',
            text: 'text-rose-600',
            border: 'group-hover:border-rose-200',
            shadow: 'shadow-rose-200',
            icon: 'text-rose-500'
        };
        return {
            main: 'blue',
            gradient: 'from-blue-600 to-cyan-500',
            light: 'bg-blue-50',
            text: 'text-blue-600',
            border: 'group-hover:border-blue-200',
            shadow: 'shadow-blue-200',
            icon: 'text-blue-500'
        };
    };

    const theme = getTheme(subject);

    // Load progress for topics
    const getTopicProgress = (topicName: string) => {
        try {
            const topicId = `${subject}_${chapter}_${topicName}`.replace(/\s+/g, '_').toLowerCase();
            const savedData = localStorage.getItem(`yuga_progress_${topicId}`);
            // console.log(`Checking progress for ${topicId}:`, savedData ? "Found" : "Not Found");
            if (savedData) {
                const { progress, completed } = JSON.parse(savedData);
                return { progress: progress || 0, completed: !!completed };
            }
        } catch (e) {
            console.error("Error loading progress", e);
        }
        return { progress: 0, completed: false };
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] py-8 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Modern Header */}
                <div className="mb-12 animate-fade-in relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="font-bold text-sm">Back to Chapters</span>
                        </button>
                    </div>

                    <div className={`relative rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden bg-gradient-to-br ${theme.gradient} ${theme.shadow}`}>
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse-slow"></div>
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-black opacity-5 rounded-full -ml-20 -mb-20 blur-2xl"></div>

                        <div className="relative z-10 text-white flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 text-sm font-bold opacity-90 mb-4">
                                    <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 uppercase tracking-wider shadow-sm">{subject}</span>
                                    <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-sm">{classLevel}</span>
                                </div>

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight drop-shadow-lg break-words">
                                    {chapter}
                                </h1>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center text-sm font-bold bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl shadow-sm hover:bg-white/20 transition-colors">
                                        <ListVideo className="w-4 h-4 mr-2" />
                                        {isLoading ? 'Loading...' : `${topics.length} Videos`}
                                    </div>
                                    <div className="flex items-center text-sm font-bold bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl shadow-sm hover:bg-white/20 transition-colors">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {isLoading ? '...' : `~ ${(topics.reduce((acc, t) => acc + (typeof t === 'string' ? 15 : t.duration), 0) / 60).toFixed(1)} Hrs`}
                                    </div>
                                    <div className="flex items-center text-sm font-bold bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl shadow-sm hover:bg-white/20 transition-colors text-yellow-100">
                                        <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />
                                        AI Enhanced Content
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:block">
                                <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl transform rotate-6 group-hover:rotate-0 transition-transform">
                                    <Play className="w-10 h-10 text-white fill-current opacity-90" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Playlist Content */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse flex items-center gap-6">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl shrink-0"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-lg w-3/4"></div>
                                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-lg w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-8 px-2">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    Course Syllabus
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs px-3 py-1 rounded-full font-bold border border-slate-200 dark:border-slate-700">
                                        {topics.length} Topics
                                    </span>
                                </h2>
                                {error && (
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                        {error}
                                    </span>
                                )}
                            </div>

                            <div className="grid gap-4">
                                {topics.map((topicItem, index) => {
                                    const topicName = typeof topicItem === 'string' ? topicItem : topicItem.title;
                                    const topicDuration = typeof topicItem === 'string' ? 15 : topicItem.duration;
                                    const { progress, completed } = getTopicProgress(topicName);

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => onTopicSelect(topicName)}
                                            className={`group relative w-full bg-white dark:bg-slate-800 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-500 transition-all duration-300 flex items-center text-left transform hover:-translate-y-1 overflow-hidden z-0 hover:z-10`}
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            {/* Progress Background */}
                                            <div
                                                className="absolute inset-y-0 left-0 bg-blue-50/50 dark:bg-blue-900/10 transition-all duration-500 ease-out"
                                                style={{ width: `${completed ? '0%' : progress + '%'}` }}
                                            ></div>

                                            {/* Completed Background */}
                                            {completed && (
                                                <div className="absolute inset-0 bg-emerald-50/30 dark:bg-emerald-900/10 pointer-events-none"></div>
                                            )}

                                            <div className="relative mr-6 shrink-0">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black transition-all duration-300 shadow-sm ${completed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400' : 'bg-slate-50 text-slate-400 dark:bg-slate-700 dark:text-slate-500 group-hover:bg-blue-600 group-hover:text-white'}`}>
                                                    {completed ? (
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <span>{index + 1}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-1 relative z-10 min-w-0 pr-4">
                                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                                    {topicName}
                                                </h3>

                                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {completed ? 'Completed' : progress > 0 ? `${Math.round(progress)}% watched` : `${topicDuration} min`}
                                                    </div>
                                                    {completed && (
                                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border border-emerald-100">
                                                            Done
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border border-purple-100">
                                                        <Sparkles className="w-3 h-3 text-purple-500" />
                                                        AI
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="relative z-10 pl-4 shrink-0 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg text-white`}>
                                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

