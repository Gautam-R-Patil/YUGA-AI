import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Clock, BookOpen } from 'lucide-react';
import { useCourseData } from '../../../core/hooks/useCourseData';
import { useAuth } from '../../../core/contexts/AuthContext';
import { Course } from '../../../core/types';
import { getThumbnail } from '../../../shared/components/CourseCard';

export const CourseFolderPage = () => {
    const { type, exam } = useParams<{ type: string; exam: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { courses, loading } = useCourseData();
    const [searchQuery, setSearchQuery] = React.useState("");

    const plan = user?.membership?.plan || 'free';
    const isPremium = plan === 'student' || plan === 'pro' || plan === 'premium';
    const hasAccess = type === 'practice' || isPremium;

    const folderTitle = useMemo(() => {
        const examLabel = exam?.toUpperCase();
        const typeLabel = type === 'classes' ? 'Classes' : 'Practice';
        return `${examLabel} ${typeLabel}`;
    }, [exam, type]);

    const displayCourses = useMemo(() => {
        if (!exam || !type) return [];

        const examKey = exam.toUpperCase();
        return courses.filter(course => {
            const matchesExam = course.category.includes(examKey);
            const matchesType = type === 'classes'
                ? !course.category.includes('MCQ') && (course.category.includes('Classes') || course.category.includes('Class'))
                : course.category.includes('MCQ') || course.category.includes('Practice');

            const isPersonalized = course.category === "Your Scheduled Classes" ||
                course.category === "Your Schedule Quiz" ||
                course.category === "Your Weekly Mock Test";

            if (isPersonalized) return false;

            if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

            return matchesExam && matchesType;
        });
    }, [courses, exam, type, searchQuery]);

    const handleCourseClick = (course: Course) => {
        if (!hasAccess) {
            navigate('/premium');
            return;
        }
        if (course.category === 'Your Scheduled Classes') { navigate('/todays-classes'); return; }
        if (course.category === 'Your Schedule Quiz') { navigate('/ai-assessment', { state: { type: 'quiz', subject: 'General Science' } }); return; }
        if (course.category === 'Your Weekly Mock Test') { navigate('/ai-assessment', { state: { type: 'mock', subject: 'NEET' } }); return; }

        if (course.category.includes("AI Examiner")) {
            navigate("/mock-neet");
            return;
        }

        if (course.category.includes("MCQs")) {
            navigate(`/practice/${encodeURIComponent(course.category)}`);
            return;
        }

        if (course.category.includes("Class")) {
            navigate(`/select-chapter/${encodeURIComponent(course.category)}`);
            return;
        }

        navigate("/classroom", { state: { course, lesson: course.lessons?.[0] } });
    };

    if (loading) return <div className="text-center py-12 text-gray-500"><p>Loading courses...</p></div>;

    return (
        <div className="animate-fade-in p-4 sm:p-6 lg:p-8">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-6 group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Dashboard</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{folderTitle}</h1>
                    <p className="text-gray-500">Explore all {folderTitle} content</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 w-full md:w-64 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayCourses.length > 0 ? displayCourses.map((course, index) => {
                    let theme = 'purple';
                    if (course.title.includes('NEET') || course.category.includes('Biology')) theme = 'teal';
                    else if (course.title.includes('JEE') || course.category.includes('Mathematics')) theme = 'indigo';
                    else if (course.category.includes('Physics')) theme = 'violet';
                    else if (course.category.includes('Chemistry')) theme = 'emerald';

                    const gradients: Record<string, any> = {
                        teal: { from: 'from-teal-500', to: 'to-emerald-500', shadow: 'shadow-teal-500/20', btnShadow: 'shadow-teal-500/40', text: 'text-teal-600', light: 'bg-teal-50', border: 'border-teal-100' },
                        indigo: { from: 'from-indigo-600', to: 'to-blue-600', shadow: 'shadow-indigo-500/20', btnShadow: 'shadow-indigo-500/40', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-100' },
                        violet: { from: 'from-violet-600', to: 'to-purple-600', shadow: 'shadow-violet-500/20', btnShadow: 'shadow-violet-500/40', text: 'text-violet-600', light: 'bg-violet-50', border: 'border-violet-100' },
                        emerald: { from: 'from-emerald-500', to: 'to-teal-500', shadow: 'shadow-emerald-500/20', btnShadow: 'shadow-emerald-500/40', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-100' },
                        purple: { from: 'from-purple-600', to: 'to-pink-600', shadow: 'shadow-purple-500/20', btnShadow: 'shadow-purple-500/40', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-100' },
                    };

                    const palette = gradients[theme] || gradients['purple'];
                    const actionText = 'Start Learning';

                    return (
                        <div
                            key={course.id}
                            onClick={() => handleCourseClick(course)}
                            style={{ animationDelay: `${index * 100}ms` }}
                            className={`group relative overflow-hidden bg-white dark:bg-[#0b0f19] rounded-[2.5rem] shadow-lg ${palette.shadow} hover:shadow-2xl hover:shadow-${theme}-500/30 transition-all duration-500 border border-gray-100 dark:border-slate-800 cursor-pointer w-full hover:-translate-y-2 animate-fade-in-up opacity-0 flex flex-col`}
                        >
                            <div className={`absolute inset-0 rounded-[2.5rem] border-2 border-transparent bg-gradient-to-br ${palette.from} ${palette.to} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}></div>

                            <div className="relative h-60 overflow-hidden shrink-0">
                                <img
                                    src={getThumbnail(course.category) || "/images/placeholder.png"}
                                    alt={course.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/50 to-transparent opacity-90"></div>

                                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-sm`}>
                                        {course.category.includes('Class') ? 'Live Classes' : 'Practice Mode'}
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2 leading-tight tracking-tight drop-shadow-lg">
                                        {course.title.replace(' Classes', '').replace(' Class', '')}
                                    </h3>
                                </div>
                            </div>

                            <div className="relative p-8 pt-4 flex-grow flex flex-col justify-between bg-white dark:bg-[#0b0f19]">
                                <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">
                                    {course.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                                        {course.lessons && (
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${palette.light} ${palette.text}`}>
                                                <BookOpen className="w-4 h-4" />
                                                <span>{course.lessons.length}</span>
                                            </div>
                                        )}
                                        {course.duration && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                <span>{course.duration}</span>
                                            </div>
                                        )}
                                    </div>

                                    <button className={`relative overflow-hidden pl-6 pr-5 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r ${palette.from} ${palette.to} ${palette.btnShadow} group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-md ${!hasAccess ? 'opacity-50' : ''}`}>
                                        <span>{!hasAccess ? 'Locked' : actionText}</span>
                                        {!hasAccess ? (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No courses found in this folder.
                    </div>
                )}
            </div>
        </div>
    );
};
