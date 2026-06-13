import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import {
    Clock,
    RefreshCw,
    Download,
    ChevronRight,
    Sun,
    Moon,
    Sunrise,
    Coffee,
    ChevronLeft,
    Target,
    Bell,
    BellRing,
    Sparkles,
    Calendar as CalendarIcon,
    Layout,
    CheckCircle,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const YugaTimerPopup = lazy(() => import("../../../shared/components/YugaTimerPopup").then(module => ({ default: module.YugaTimerPopup })));

import { AdjustScheduleModal } from "../../course/components/AdjustScheduleModal";
import { useToast } from "../../../core/contexts/ToastContext";
import { useCourse } from "../../../core/contexts/CourseContext";

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

interface DetailedSchedule {
    schedule: DailySchedule[];
}

const generateDateRange = (startDate: Date, endDate: Date): Date[] => {
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

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
        return parts[0].trim().toUpperCase();
    }

    const minutes = parseTimeToMinutes(timeString);
    let hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${String(mins).padStart(2, '0')} ${ampm}`;
};

export const TimeTablePage = () => {
    const toast = useToast();
    const { config } = useCourse();
    const isJEE = config.id === 'jee';

    const isBoth = config.id === 'both';

    const [detailedSchedule, setDetailedSchedule] = useState<DetailedSchedule | null>(null);
    const [fullSchedule, setFullSchedule] = useState<{ date: Date; schedule: DailySchedule }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWizard, setShowWizard] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewDate, setViewDate] = useState<Date>(new Date());
    const [isExporting, setIsExporting] = useState(false);
    const [examDate, setExamDate] = useState<Date | null>(null);
    const [daysRemaining, setDaysRemaining] = useState<number>(0);
    const [alarms, setAlarms] = useState<Set<string>>(new Set());

    useEffect(() => {
        const saved = localStorage.getItem('yuga_alarms');
        if (saved) {
            try {
                setAlarms(new Set(JSON.parse(saved)));
            } catch (e) { }
        }
    }, []);

    const toggleAlarm = (sessionId: string, time: string) => {
        const newAlarms = new Set(alarms);
        if (newAlarms.has(sessionId)) {
            newAlarms.delete(sessionId);
            toast.info("Alarm removed");
        } else {
            newAlarms.add(sessionId);
            toast.success(`Alarm scheduled for ${time}`);
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification(`Alarm Set`, { body: `We will remind you at ${time}` });
            }
        }
        setAlarms(newAlarms);
        localStorage.setItem('yuga_alarms', JSON.stringify(Array.from(newAlarms)));
    };

    const generateFullSchedule = useCallback((details: DetailedSchedule, sClass?: string) => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const examMonth = 4;
        const examDay = 3;

        let targetYear = currentYear;
        if (today.getMonth() > examMonth || (today.getMonth() === examMonth && today.getDate() > examDay)) {
            targetYear += 1;
        }

        let finalTargetYear = targetYear;
        if (sClass === 'plus-one') finalTargetYear += 1;

        const calculatedExamDate = new Date(finalTargetYear, 4, 3);
        setExamDate(calculatedExamDate);
        setDaysRemaining(Math.ceil(Math.abs(calculatedExamDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

        const dates = generateDateRange(today, calculatedExamDate);
        const cycleLength = details.schedule.length;

        const savedData = localStorage.getItem('yugaTimerData');
        let rescheduledSessions: any[] = [];
        if (savedData) {
            try {
                rescheduledSessions = JSON.parse(savedData).rescheduledSessions || [];
            } catch (e) { }
        }

        const mappedSchedule = dates.map((date, index) => {
            const getLocalDateString = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const dateString = getLocalDateString(date);
            const scheduleIndex = index % cycleLength;

            let sessions = [...details.schedule[scheduleIndex].sessions];
            sessions = sessions.filter((_, idx) => {
                const sessionId = `day${scheduleIndex}-session${idx}`;
                return !rescheduledSessions.some((rs: any) => rs.sessionId === sessionId && rs.originalDate === dateString);
            });

            const addedSessions = rescheduledSessions
                .filter((rs: any) => rs.newDate === dateString)
                .map((rs: any) => ({
                    ...rs.session,
                    time: rs.newTime + ' - ' + (rs.session.duration || '1h'),
                    isRescheduled: true,
                    originalDate: rs.originalDate
                }));

            return {
                date: date,
                schedule: {
                    ...details.schedule[scheduleIndex],
                    sessions: [...sessions, ...addedSessions].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time))
                }
            };
        });

        setFullSchedule(mappedSchedule);
    }, []);

    const loadData = useCallback(() => {
        const savedData = localStorage.getItem('yugaTimerData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.detailedSchedule) {
                    setDetailedSchedule(parsed.detailedSchedule);
                    generateFullSchedule(parsed.detailedSchedule, parsed.studentClass);
                    return true;
                }
            } catch (e) { }
        }
        return false;
    }, [generateFullSchedule]);

    useEffect(() => {
        if (!loadData()) {
            // Default calculation if no data
            const today = new Date();
            const calculatedExamDate = new Date(today.getFullYear() + (today.getMonth() > 4 ? 1 : 0), 4, 3);
            setExamDate(calculatedExamDate);
            setDaysRemaining(Math.ceil(Math.abs(calculatedExamDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        }
        setLoading(false);
    }, [loadData]);

    const handleWizardClose = () => {
        loadData();
        setShowWizard(false);
    };

    const handleExportSchedule = async () => {
        if (fullSchedule.length === 0) return;
        setIsExporting(true);
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        let yPos = 20;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;

        doc.setFontSize(20).setFont('helvetica', 'bold').text('YUGA Master Plan', margin, yPos);
        yPos += 20;

        for (let i = 0; i < Math.min(fullSchedule.length, 30); i++) {
            const item = fullSchedule[i];
            if (yPos + 40 > pageHeight) { doc.addPage(); yPos = 20; }
            doc.setFillColor(245, 247, 250).rect(margin, yPos - 5, 170, 8, 'F');
            doc.setFont('helvetica', 'bold').text(item.date.toDateString(), margin + 2, yPos);
            yPos += 10;
            item.schedule.sessions.forEach(s => {
                doc.setFont('helvetica', 'normal').text(`• ${s.time}: ${s.subject} - ${s.topic}`, margin + 5, yPos);
                yPos += 6;
            });
            yPos += 5;
        }
        doc.save('YUGA_Schedule_Plan.pdf');
        setIsExporting(false);
    };

    const getSessionIcon = (time: string, subject: string) => {
        if (subject.toLowerCase().includes('break')) return <Coffee className="w-5 h-5 text-amber-500" />;
        const hour = parseTimeToMinutes(time) / 60;
        if (hour < 11) return <Sunrise className="w-5 h-5 text-orange-500" />;
        if (hour < 16) return <Sun className="w-5 h-5 text-yellow-500" />;
        return <Moon className="w-5 h-5 text-blue-500" />;
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><RefreshCw className="w-8 h-8 text-purple-600 animate-spin" /></div>;


    const { days, firstDay } = ((date: Date) => ({ days: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(), firstDay: new Date(date.getFullYear(), date.getMonth(), 1).getDay() }))(viewDate);
    const currentSchedule = fullSchedule.find(s => s.date.toDateString() === selectedDate.toDateString());

    return (
        <div className="min-h-screen pb-20 bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-300">
            {/* --- Premium Header --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 mb-8">
                <div className="mb-12 animate-fade-in relative z-10">
                    <div className="relative rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-600 shadow-violet-500/30">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse-slow"></div>
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-black opacity-10 rounded-full -ml-20 -mb-20 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-6 sm:gap-8">
                                <div className="hidden sm:flex w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <Clock className="w-10 h-10 text-white" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-sm font-bold mb-4 shadow-sm text-white">
                                        <Sparkles className="w-4 h-4 text-yellow-300" />
                                        <span>AI Strategic Planner</span>
                                    </div>
                                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3 drop-shadow-lg">
                                        Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-indigo-100">Planner</span>
                                    </h1>
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <p className="text-white/80 font-medium text-lg max-w-xl leading-relaxed">
                                            Your personalized master plan.
                                        </p>
                                        <div className="h-6 w-px bg-white/20 hidden sm:block"></div>
                                        <div className="h-6 w-px bg-white/20 hidden sm:block"></div>
                                        {isBoth ? (
                                            <>
                                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                                    <Target className="w-4 h-4 text-violet-200" />
                                                    <span className="text-white font-bold text-sm">{(Date.parse("2026-05-03") - Date.now()) / (1000 * 60 * 60 * 24) > 0 ? Math.ceil((Date.parse("2026-05-03") - Date.now()) / (1000 * 60 * 60 * 24)) : 0} Days</span>
                                                    <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">Left for NEET 2026</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                                    <Target className="w-4 h-4 text-violet-200" />
                                                    <span className="text-white font-bold text-sm">
                                                        {(() => {
                                                            const now = Date.now();
                                                            const d1 = Date.parse("2026-01-24");
                                                            // If Jan 24 passed, target Apr 2
                                                            const target = now < d1 ? d1 : Date.parse("2026-04-02");
                                                            const diff = target - now;
                                                            return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                                                        })()} Days
                                                    </span>
                                                    <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">Left for JEE 2026</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                                <Target className="w-4 h-4 text-violet-200" />
                                                <span className="text-white font-bold text-sm">{daysRemaining} Days</span>
                                                <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">Left for {isJEE ? 'JEE' : 'NEET'} {examDate?.getFullYear()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <button
                                    onClick={handleExportSchedule}
                                    disabled={isExporting}
                                    className="px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-[1.5rem] font-bold text-white hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <Download className="w-5 h-5" />
                                    <span>Export PDF</span>
                                </button>
                                <button
                                    onClick={() => setIsAdjustModalOpen(true)}
                                    className="px-8 py-4 bg-white text-violet-600 rounded-[1.5rem] font-black shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <Layout className="w-5 h-5" />
                                    <span>Adjust Plan</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 align-start">
                    {/* Left Column: Calendar & Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Calendar Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl sticky top-24"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors group">
                                    <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                                </button>
                                <h3 className="font-black text-slate-800 dark:text-white text-lg uppercase tracking-wide">
                                    {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h3>
                                <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors group">
                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-2 text-center mb-4">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                    <div key={`${d}-${i}`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                                {Array.from({ length: days }).map((_, i) => {
                                    const d = i + 1;
                                    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
                                    const isSel = date.toDateString() === selectedDate.toDateString();
                                    const isTod = date.toDateString() === new Date().toDateString();
                                    return (
                                        <button
                                            key={d}
                                            onClick={() => setSelectedDate(date)}
                                            className={`aspect-square flex items-center justify-center rounded-2xl text-sm font-black transition-all ${isSel
                                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 ring-2 ring-violet-600 ring-offset-2 dark:ring-offset-slate-900'
                                                : isTod
                                                    ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 border border-violet-100 dark:border-violet-800'
                                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-violet-600" />
                                        <span>Selected</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800" />
                                        <span>Today</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>


                    </div>

                    {/* Right Column: Timeline */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 dark:border-slate-800 shadow-xl min-h-[600px]"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 border-b border-slate-100 dark:border-slate-800 pb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </h2>
                                    <div className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                                        Daily strategic objectives & deep work sessions.
                                    </div>
                                </div>
                                {selectedDate.toDateString() !== new Date().toDateString() && (
                                    <button
                                        onClick={() => { setSelectedDate(new Date()); setViewDate(new Date()); }}
                                        className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Return to Today
                                    </button>
                                )}
                            </div>

                            <AnimatePresence mode="wait">
                                {currentSchedule ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="relative"
                                    >
                                        {/* Vertical Timeline Line */}
                                        <div className="absolute left-[5.5rem] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800 hidden sm:block" />

                                        <div className="space-y-8">
                                            {currentSchedule.schedule.sessions.map((session, idx) => {
                                                const isBreak = session.subject.toLowerCase().includes('break');
                                                const isPhysics = session.subject.toLowerCase().includes('physics');
                                                const isChemistry = session.subject.toLowerCase().includes('chemistry');


                                                const themeColor = isPhysics ? 'violet' : isChemistry ? 'emerald' : 'rose';

                                                // Dynamic classes based on subject
                                                const borderClass = isPhysics ? 'border-violet-100 dark:border-violet-900/30' : isChemistry ? 'border-emerald-100 dark:border-emerald-900/30' : 'border-rose-100 dark:border-rose-900/30';
                                                const bgClass = isPhysics ? 'bg-violet-50/50 dark:bg-violet-900/10' : isChemistry ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'bg-rose-50/50 dark:bg-rose-900/10';
                                                const textClass = isPhysics ? 'text-violet-600' : isChemistry ? 'text-emerald-600' : 'text-rose-600';


                                                if (isBreak) return (
                                                    <div key={idx} className="flex items-center gap-6 opacity-60 ml-0 sm:ml-4">
                                                        <div className="hidden sm:block w-[4.5rem] text-right">
                                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{formatTimeTo12h(session.time)}</span>
                                                        </div>
                                                        <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 relative z-10 border-2 border-white dark:border-slate-900 hidden sm:block" />
                                                        <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700 relative h-px mx-4">
                                                            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-[60%] px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                                <Coffee className="w-3 h-3" /> Respite &bull; {session.duration}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );

                                                const alarmId = `${selectedDate.toDateString()}-${session.time}-${session.subject}`;

                                                return (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        key={idx}
                                                        className="flex flex-col sm:flex-row gap-4 sm:gap-8 group relative z-10"
                                                    >
                                                        <div className="min-w-[4.5rem] pt-6 text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1 pl-4 sm:pl-0">
                                                            <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{formatTimeTo12h(session.time)}</p>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{session.duration}</p>
                                                        </div>

                                                        <div className="hidden sm:block w-3 h-3 mt-8 -ml-1.5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 z-10" />

                                                        <div className={`flex-1 ${bgClass} rounded-[2rem] p-6 sm:p-8 border ${borderClass} shadow-sm hover:shadow-lg transition-all group-hover:translate-x-1 relative overflow-hidden`}>
                                                            {/* Subject Stripe */}
                                                            <div className={`absolute top-0 left-0 bottom-0 w-1.5 bg-${themeColor}-500`} />

                                                            <div className="flex justify-between items-start mb-6">
                                                                <div className="flex items-start gap-4">
                                                                    <div className={`w-12 h-12 bg-white dark:bg-slate-800 rounded-[1rem] flex items-center justify-center shadow-sm text-${themeColor}-500 group-hover:scale-110 transition-transform`}>
                                                                        {getSessionIcon(session.time, session.subject)}
                                                                    </div>
                                                                    <div>
                                                                        <p className={`text-[10px] font-black uppercase tracking-widest ${textClass} mb-1 opacity-80`}>
                                                                            {session.subject}
                                                                        </p>
                                                                        <h4 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-tight">
                                                                            {session.topic || session.chapter}
                                                                        </h4>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => toggleAlarm(alarmId, formatTimeTo12h(session.time))}
                                                                    className={`p-3 rounded-2xl transition-all ${alarms.has(alarmId)
                                                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                                                        : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-violet-600 hover:bg-violet-50'
                                                                        }`}
                                                                >
                                                                    {alarms.has(alarmId) ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                                                </button>
                                                            </div>

                                                            <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                                                                {session.activities.map((act, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2 border border-slate-100 dark:border-slate-700 shadow-sm"
                                                                    >
                                                                        <CheckCircle className={`w-3 h-3 ${textClass}`} />
                                                                        {act}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}


                                        </div>
                                    </motion.div>
                                ) : !detailedSchedule ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="py-16 px-6 text-center border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] bg-slate-50/50 dark:bg-slate-900/30"
                                    >
                                        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-200 dark:shadow-slate-900">
                                            <Sparkles className="w-10 h-10 text-violet-600" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Initialize Your Journey</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 max-w-md mx-auto leading-relaxed">
                                            Your strategic master plan is ready to be drafted. Let's align your study hours with your goals.
                                        </p>
                                        <button
                                            onClick={() => setShowWizard(true)}
                                            className="px-10 py-5 bg-violet-600 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-violet-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
                                        >
                                            <CalendarIcon className="w-5 h-5" />
                                            Draft My Master Plan
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <div className="py-24 text-center border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] bg-slate-50/50 dark:bg-slate-900/30">
                                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Coffee className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-400">Rest Day</h3>
                                        <p className="text-slate-400 font-medium text-sm mt-2">Recharging for the upcoming week.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </main>


            {showWizard && (
                <Suspense fallback={null}>
                    <YugaTimerPopup isOpen={showWizard} onClose={handleWizardClose} />
                </Suspense>
            )}
            {isAdjustModalOpen && <AdjustScheduleModal isOpen={true} onClose={() => setIsAdjustModalOpen(false)} onUpdate={loadData} />}
        </div>
    );
};
