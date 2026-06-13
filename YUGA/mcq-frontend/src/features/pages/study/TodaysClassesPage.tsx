import React, { useState, useEffect } from "react";
import { Clock, BookOpen, Play, Calendar, CheckCircle, ArrowLeft, CalendarClock } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Course } from "../../../core/types";
import { RescheduleModal } from "../../course/components/RescheduleModal";

interface ScheduleSession {
    time: string;
    duration: string;
    subject: string;
    chapter: string;
    topic: string;
    subtopics: string[];
    activities: string[];
    breakAfter?: string;
}

interface DailySchedule {
    day: number;
    dayName: string;
    totalHours: number;
    sessions: ScheduleSession[];
    mockTest?: {
        time: string;
        subjects: string[];
        topics: string[];
    };
}

interface DashboardContext {
    onCourseClick: (course: Course) => void;
}

const parseTimeToMinutes = (timeString: string) => {
    if (!timeString) return 0;
    const cleanTime = timeString.split('-')[0].trim().toLowerCase();
    const isPM = cleanTime.includes('pm');
    const isAM = cleanTime.includes('am');

    let [hours, minutes] = cleanTime.replace(/[ap]m/, '').trim().split(':').map(Number);
    if (isNaN(hours)) hours = 0;
    if (isNaN(minutes)) minutes = 0;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return hours * 60 + minutes;
};

const formatTimeTo12h = (timeString: string) => {
    if (!timeString) return '';
    if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
        const parts = timeString.split('-');
        const start = parts[0].trim().toUpperCase();
        return start;
    }

    const minutes = parseTimeToMinutes(timeString);
    let hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${String(mins).padStart(2, '0')} ${ampm}`;
};

export const TodaysClassesPage = () => {
    const navigate = useNavigate();
    const { onCourseClick } = useOutletContext<DashboardContext>();
    const [todaysSchedule, setTodaysSchedule] = useState<DailySchedule | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [sessionToReschedule, setSessionToReschedule] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const savedData = localStorage.getItem('yugaTimerData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.detailedSchedule && parsed.detailedSchedule.schedule && parsed.detailedSchedule.schedule.length > 0) {
                    const getLocalDateString = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    const todayDateString = getLocalDateString(new Date());
                    const baseSchedule = { ...parsed.detailedSchedule.schedule[0] };

                    const baseSessionsWithIndex = baseSchedule.sessions.map((s: ScheduleSession, idx: number) => ({
                        ...s,
                        originalIndex: idx,
                        isBaseSession: true
                    }));

                    const rescheduledSessions = parsed.rescheduledSessions || [];
                    const filteredBaseSessions = baseSessionsWithIndex.filter((s: any) => {
                        const sessionId = `day0-session${s.originalIndex}`;
                        return !rescheduledSessions.some((rs: any) =>
                            rs.sessionId === sessionId && rs.originalDate === todayDateString
                        );
                    });

                    const addedSessions = rescheduledSessions
                        .filter((rs: any) => rs.newDate === todayDateString)
                        .map((rs: any) => ({
                            ...rs.session,
                            time: rs.newTime + ' - ' + (rs.session.duration || '1h'),
                            isRescheduled: true,
                            rescheduleId: rs.id,
                            originalDate: rs.originalDate
                        }));

                    setTodaysSchedule({
                        ...baseSchedule,
                        sessions: [...filteredBaseSessions, ...addedSessions].sort((a, b) => {
                            return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
                        })
                    });
                }
            } catch (e) {
                console.error("Error loading saved schedule", e);
            }
        }
        setLoading(false);
    };

    const handleRescheduleClick = (e: React.MouseEvent, session: ScheduleSession) => {
        e.stopPropagation();
        setSessionToReschedule(session);
        setIsRescheduleModalOpen(true);
    };

    const handleReschedule = (newDate: string, newTime: string) => {
        const savedData = localStorage.getItem('yugaTimerData');
        if (!savedData || !sessionToReschedule) return;

        try {
            const parsed = JSON.parse(savedData);
            const getLocalDateString = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const todayDateString = getLocalDateString(new Date());
            const rescheduledSessions = parsed.rescheduledSessions || [];

            if ((sessionToReschedule as any).isRescheduled && (sessionToReschedule as any).rescheduleId) {
                const recordIndex = rescheduledSessions.findIndex((rs: any) => rs.id === (sessionToReschedule as any).rescheduleId);
                if (recordIndex !== -1) {
                    rescheduledSessions[recordIndex].newDate = newDate;
                    rescheduledSessions[recordIndex].newTime = newTime;
                }
            } else {
                const originalIdx = (sessionToReschedule as any).originalIndex;
                const sessionId = `day0-session${originalIdx}`;
                const newRescheduledSession = {
                    id: `rs-${Date.now()}`,
                    sessionId,
                    originalDate: todayDateString,
                    newDate,
                    newTime,
                    session: sessionToReschedule
                };
                rescheduledSessions.push(newRescheduledSession);
            }

            parsed.rescheduledSessions = rescheduledSessions;
            localStorage.setItem('yugaTimerData', JSON.stringify(parsed));
            setIsRescheduleModalOpen(false);
            loadData();
        } catch (e) {
            console.error("Error rescheduling session", e);
        }
    };

    const handleSessionClick = (session: ScheduleSession) => {
        const sessionCourse: Course = {
            id: `personalized-${session.subject}-${session.chapter}`.replace(/\s+/g, '-').toLowerCase(),
            title: `${session.subject} - ${session.chapter}`,
            description: `Personalized session on ${session.topic}`,
            image: "https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=800",
            category: "Personalized Class",
            level: "Advanced",
            duration: session.duration,
            lessons: [
                {
                    id: `lesson-${session.topic}`.replace(/\s+/g, '-').toLowerCase(),
                    title: session.topic,
                    content: `In this personalized session, we will cover ${session.topic}. Focus areas: ${session.subtopics.join(', ')}.`,
                    type: 'video',
                    duration: session.duration,
                    completed: false,
                    resources: [],
                    dateAdded: 'Today',
                    thumbnailUrl: '',
                    images: []
                }
            ],
            progress: 0,
            color: 'bg-purple-600',
            instructor: 'AI Tutor',
            rating: 5.0,
            notesCount: 0,
            students: 1,
            tags: ['Personalized', session.subject, 'NEET'],
            chapters: [{ title: session.chapter }]
        };

        onCourseClick(sessionCourse);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!todaysSchedule) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl text-center max-w-md border border-gray-100 dark:border-gray-700">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Classes Scheduled Today</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Create a study plan to see your personalized classes here.</p>
                    <button
                        onClick={() => navigate('/timetable')}
                        className="w-full py-3 bg-slate-900 dark:bg-purple-600 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-purple-700 transition-colors"
                    >
                        Go to Time Table
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] p-3 sm:p-4 md:p-8 font-sans animate-fade-in transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4 sm:mb-6 font-medium text-sm sm:text-base"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
                            <span className="bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">Today's Focus</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 font-medium text-xs sm:text-base">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {todaysSchedule.totalHours} Hours Planned
                        </p>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-auto">
                        <div className="px-3 py-1 sm:px-4 sm:py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border border-transparent dark:border-green-800">
                            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            On Track
                        </div>
                    </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    {todaysSchedule.sessions.map((session, index) => {
                        const subjectLower = session.subject.toLowerCase();
                        const isPhysics = subjectLower.includes('physics');
                        const isChemistry = subjectLower.includes('chemistry');
                        const isBiology = subjectLower.includes('biology') || subjectLower.includes('botany') || subjectLower.includes('zoology');

                        const cardTheme = isPhysics
                            ? 'from-purple-500 to-blue-600'
                            : isChemistry
                                ? 'from-teal-500 to-emerald-600'
                                : isBiology
                                    ? 'from-rose-500 to-pink-600'
                                    : 'from-purple-500 to-blue-600';

                        const bgLight = isPhysics ? 'bg-purple-50' : isChemistry ? 'bg-teal-50' : isBiology ? 'bg-rose-50' : 'bg-purple-50';
                        const textDark = isPhysics ? 'text-purple-700' : isChemistry ? 'text-teal-700' : isBiology ? 'text-rose-700' : 'text-purple-700';

                        return (
                            <div
                                key={index}
                                onClick={() => handleSessionClick(session)}
                                className="group relative bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-1 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transform active:scale-[0.98]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                                <div className="flex flex-col md:flex-row gap-4 sm:gap-6 p-4 sm:p-5 relative z-10">
                                    <div className="absolute top-4 right-4 md:static md:flex md:items-center md:justify-end md:pl-4 gap-2">
                                        <button
                                            onClick={(e) => handleRescheduleClick(e, session)}
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100/50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center group/reschedule transition-all duration-300"
                                            title="Reschedule Class"
                                        >
                                            <CalendarClock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-slate-300 group-hover/reschedule:text-purple-600 dark:group-hover/reschedule:text-purple-400" />
                                        </button>
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${bgLight} dark:bg-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm md:shadow-none bg-opacity-50 md:bg-opacity-100`}>
                                            <Play className={`w-4 h-4 sm:w-5 sm:h-5 ${textDark} dark:text-white fill-current ml-0.5`} />
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:justify-center md:w-24 shrink-0 gap-2 sm:gap-3 md:gap-1 md:border-r border-slate-100 dark:border-slate-700 md:pr-6">
                                        <div className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg ${bgLight} dark:bg-slate-700 ${textDark} dark:text-slate-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider`}>
                                            {formatTimeTo12h(session.time)}
                                        </div>
                                        <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">{session.duration}</div>
                                    </div>

                                    <div className="flex-1 min-w-0 pr-10 md:pr-0">
                                        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                                            <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded shadow-sm bg-gradient-to-r ${cardTheme}`}>
                                                {session.subject}
                                            </span>
                                            {(session as any).isRescheduled && (
                                                <span className="text-[9px] sm:text-[10px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-800 flex items-center gap-1 shadow-sm">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    Moved from {(session as any).originalDate === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}` ? 'Earlier Today' : (session as any).originalDate}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2 truncate group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                                            {session.topic}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                                            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            Chapter: {session.chapter}
                                        </p>

                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {session.subtopics.slice(0, 3).map((sub, i) => (
                                                <span key={i} className="text-[10px] sm:text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md font-medium">
                                                    {sub}
                                                </span>
                                            ))}
                                            {session.subtopics.length > 3 && (
                                                <span className="text-[10px] sm:text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md font-medium">
                                                    +{session.subtopics.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <RescheduleModal
                isOpen={isRescheduleModalOpen}
                onClose={() => setIsRescheduleModalOpen(false)}
                session={sessionToReschedule}
                onReschedule={handleReschedule}
            />
        </div>
    );
};
