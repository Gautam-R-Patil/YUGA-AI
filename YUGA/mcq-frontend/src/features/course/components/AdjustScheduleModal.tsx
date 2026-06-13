import React, { useState, useEffect } from "react";
import {
    X,
    Clock,
    Calendar,
    Loader2,
    AlertCircle,
    RefreshCw,
    BarChart2,
    ChevronRight,
    Zap,
    Coffee,
    BookOpen,
    Layout,
    PieChart,
    Sparkles,
    Target,
    Check,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { scheduleAPI } from "../../../core/services/scheduleAPI";

interface AdjustScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export const AdjustScheduleModal: React.FC<AdjustScheduleModalProps> = ({ isOpen, onClose, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [hours, setHours] = useState(4);
    const [minutes, setMinutes] = useState(0);
    const [cycleDays, setCycleDays] = useState(14);
    const [dailyHours, setDailyHours] = useState<{ [key: string]: number } | null>(null);
    const [availableDays, setAvailableDays] = useState<string[]>([]);

    // UI State
    const [activeTab, setActiveTab] = useState<'uniform' | 'variable'>('uniform');

    useEffect(() => {
        if (isOpen) {
            const savedData = localStorage.getItem('yugaTimerData');
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    const availability = parsed.availability;
                    if (availability) {
                        setHours(Math.floor(availability.hoursPerDay || 4));
                        setMinutes(Math.round(((availability.hoursPerDay || 4) % 1) * 60));
                        setCycleDays(availability.cycleDays || parsed.detailedSchedule?.schedule?.length || 14);

                        if (availability.dailyHours) {
                            setDailyHours(availability.dailyHours);
                            setActiveTab('variable');
                        } else {
                            setActiveTab('uniform');
                        }

                        if (availability.availableDays && availability.availableDays.length > 0) {
                            setAvailableDays(availability.availableDays);
                        } else {
                            setAvailableDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
                        }
                    }
                } catch (e) {
                    console.error("Failed to load current settings", e);
                }
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (activeTab === 'uniform') {
            setDailyHours(null);
        } else if (activeTab === 'variable' && !dailyHours) {
            const currentTotal = hours + (minutes / 60);
            const initial: { [key: string]: number } = {};
            availableDays.forEach(day => initial[day] = currentTotal);
            setDailyHours(initial);
        }
    }, [activeTab]);

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        try {
            const savedData = localStorage.getItem('yugaTimerData');
            if (!savedData) throw new Error("No existing schedule data found.");

            const parsed = JSON.parse(savedData);
            const totalHours = hours + (minutes / 60);

            let finalDailyHours = null;
            if (activeTab === 'variable' && dailyHours) {
                finalDailyHours = {} as { [key: string]: number };
                availableDays.forEach(day => {
                    if (dailyHours[day] !== undefined) {
                        finalDailyHours![day] = dailyHours[day];
                    } else {
                        finalDailyHours![day] = totalHours;
                    }
                });
            }

            const updatedAvailability = {
                ...parsed.availability,
                hoursPerDay: totalHours,
                cycleDays: cycleDays,
                dailyHours: finalDailyHours
            };

            const response = await scheduleAPI.generateSchedule({
                availability: updatedAvailability,
                subjectStrengths: parsed.subjectStrengths,
                assessmentResults: parsed.assessmentResults,
                daysUntilExam: 100,
                studentClass: parsed.studentClass
            });

            if (response.success && response.schedule) {
                const newData = {
                    ...parsed,
                    availability: updatedAvailability,
                    detailedSchedule: response.schedule,
                    updatedAt: new Date().toISOString(),
                    rescheduledSessions: []
                };
                localStorage.setItem('yugaTimerData', JSON.stringify(newData));
                onUpdate();
                onClose();
            } else {
                setError("AI failed to regenerate schedule. Please try again.");
            }
        } catch (err: any) {
            console.error("Error updating schedule:", err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const applyPreset = (type: 'relaxed' | 'balanced' | 'intense') => {
        if (type === 'relaxed') {
            setHours(2);
            setMinutes(0);
        } else if (type === 'balanced') {
            setHours(4);
            setMinutes(30);
        } else if (type === 'intense') {
            setHours(8);
            setMinutes(0);
        }
        setActiveTab('uniform');
    };

    const getTotalWeeklyHours = () => {
        if (activeTab === 'uniform') {
            const daily = hours + (minutes / 60);
            return (daily * availableDays.length).toFixed(1);
        } else {
            if (!dailyHours) return "0.0";
            return Object.values(dailyHours).reduce((a, b) => a + b, 0).toFixed(1);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-hidden font-jakarta">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-2xl"
                        onClick={onClose}
                    />

                    {/* Main Modal Container - Compacted */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        transition={{ type: "spring", damping: 30, stiffness: 350 }}
                        className="relative w-full h-auto max-w-5xl max-h-[85vh] bg-[#f8fafc] dark:bg-[#0f172a] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10 ring-1 ring-white/5"
                    >
                        {/* LEFT SIDEBAR - CONTROLS (Narrower) */}
                        <div className="w-full md:w-[320px] bg-white dark:bg-[#1e293b]/50 border-r border-slate-100 dark:border-slate-800/60 flex flex-col h-full relative z-20 shadow-xl backdrop-blur-md">
                            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                                {/* Header */}
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-[0.8rem] flex items-center justify-center shadow-lg shadow-violet-500/20 text-white transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                        <Layout className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 ">System Config</div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">Planner<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-500">Architect</span></h2>
                                    </div>
                                </div>

                                {/* Strategy Toggle */}
                                <div className="mb-8">
                                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                        <PieChart className="w-3 h-3" /> Distribution
                                    </label>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-1 rounded-[1.2rem] border border-slate-200 dark:border-slate-800 flex relative">
                                        <motion.div
                                            className="absolute top-1 bottom-1 bg-white dark:bg-slate-800 rounded-[0.9rem] shadow-sm border border-slate-100 dark:border-slate-700/50 z-0"
                                            initial={false}
                                            animate={{
                                                left: activeTab === 'uniform' ? '4px' : '50%',
                                                width: 'calc(50% - 4px)',
                                                x: activeTab === 'variable' ? 0 : 0
                                            }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                        <button
                                            onClick={() => setActiveTab('uniform')}
                                            className={`flex-1 py-2.5 px-3 rounded-[0.9rem] text-[10px] font-black transition-colors relative z-10 flex flex-col items-center gap-1 ${activeTab === 'uniform' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                        >
                                            <PieChart className="w-3.5 h-3.5" />
                                            <span>UNIFORM</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('variable')}
                                            className={`flex-1 py-2.5 px-3 rounded-[0.9rem] text-[10px] font-black transition-colors relative z-10 flex flex-col items-center gap-1 ${activeTab === 'variable' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                        >
                                            <BarChart2 className="w-3.5 h-3.5" />
                                            <span>VARIABLE</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Presets Layout */}
                                <div className="mb-6">
                                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" /> Quick Presets
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { id: 'relaxed', label: 'Relaxed Pace', time: '2.0h', desc: 'Sustainable', icon: Coffee, color: 'emerald', bg: 'bg-emerald-500' },
                                            { id: 'balanced', label: 'Balanced Flow', time: '4.5h', desc: 'Optimal', icon: BookOpen, color: 'blue', bg: 'bg-blue-500' },
                                            { id: 'intense', label: 'Elite Mode', time: '8.0h', desc: 'Max Output', icon: Zap, color: 'violet', bg: 'bg-violet-600' }
                                        ].map((preset: any) => (
                                            <button
                                                key={preset.id}
                                                onClick={() => applyPreset(preset.id)}
                                                className="group relative overflow-hidden flex items-center gap-3 p-3 rounded-[1.2rem] bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left"
                                            >
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${preset.bg}`} />
                                                <div className={`w-8 h-8 rounded-lg bg-${preset.color}-100 dark:bg-${preset.color}-500/10 text-${preset.color}-600 dark:text-${preset.color}-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                                    <preset.icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-0.5">
                                                        <span className="font-bold text-slate-800 dark:text-white tracking-tight text-[11px]">{preset.label}</span>
                                                        <span className={`text-[9px] font-black ${preset.bg} text-white px-1.5 py-0.5 rounded-full`}>{preset.time}</span>
                                                    </div>
                                                    <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{preset.desc}</div>
                                                </div>
                                                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Controls Footer */}
                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-sm">
                                <div className="bg-white dark:bg-slate-800/80 rounded-[1.2rem] p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> Cycle Duration
                                    </div>
                                    <div className="flex justify-between gap-1.5">
                                        {[7, 14, 21, 30].map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setCycleDays(d)}
                                                className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all border ${cycleDays === d
                                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg transform -translate-y-0.5'
                                                    : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                            >
                                                {d}D
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT CONTENT - VISUALIZATION */}
                        <div className="flex-1 bg-[#f8fafc] dark:bg-[#0f172a] relative flex flex-col h-full overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

                            {/* Subtle Grid */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

                            {/* Top Actions */}
                            <div className="absolute top-0 right-0 p-6 z-30">
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-all duration-300 shadow-md border border-slate-200 dark:border-slate-700/50"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 lg:p-10 flex flex-col relative z-20">
                                {/* Error Message */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="absolute top-6 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 z-50 font-bold text-[10px] tracking-wide"
                                        >
                                            <AlertCircle className="w-3 h-3 text-white" />
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Dynamic Content Area */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'uniform' ? (
                                            <motion.div
                                                key="uniform"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                                className="w-full max-w-2xl mx-auto"
                                            >
                                                <div className="text-center mb-8">
                                                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Daily <span className="text-violet-600">Commitment</span></h3>
                                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Define your baseline study duration.</p>
                                                </div>

                                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 shadow-premium-xl border border-white/60 dark:border-slate-800 relative overflow-hidden group">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 group-hover:from-violet-500/10 group-hover:to-indigo-500/10 transition-colors duration-700" />

                                                    <div className="relative z-10 flex items-baseline justify-center gap-3 sm:gap-6 select-none">
                                                        <div className="flex flex-col items-center">
                                                            <div className="text-[5rem] sm:text-[7rem] leading-[0.8] font-black text-slate-900 dark:text-white tracking-tighter tabular-nums drop-shadow-sm">
                                                                {hours}
                                                            </div>
                                                            <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] mt-3">Hours</span>
                                                        </div>
                                                        <span className="text-4xl sm:text-6xl font-thin text-slate-300 dark:text-slate-700 self-start mt-3 animate-pulse duration-[3s]">:</span>
                                                        <div className="flex flex-col items-center">
                                                            <div className="text-[5rem] sm:text-[7rem] leading-[0.8] font-black text-slate-900 dark:text-white tracking-tighter tabular-nums drop-shadow-sm">
                                                                {minutes.toString().padStart(2, '0')}
                                                            </div>
                                                            <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] mt-3">Minutes</span>
                                                        </div>
                                                    </div>

                                                    {/* Sliders Area */}
                                                    <div className="mt-10 space-y-6 max-w-sm mx-auto relative z-20">
                                                        {/* Hour Slider */}
                                                        <div className="relative group/slider">
                                                            <div className="flex justify-between mb-2 items-end">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration</span>
                                                                <span className="text-[9px] font-black text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-md tabular-nums">{hours}h</span>
                                                            </div>
                                                            <div className="relative h-4 flex items-center">
                                                                <div className="absolute inset-x-0 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(hours / 16) * 100}%` }} />
                                                                </div>
                                                                <input
                                                                    type="range"
                                                                    min="0" max="16"
                                                                    value={hours}
                                                                    onChange={(e) => setHours(parseInt(e.target.value))}
                                                                    className="relative w-full h-full opacity-0 cursor-pointer z-10"
                                                                />
                                                                <div
                                                                    className="absolute h-3 w-3 bg-white shadow-sm border border-violet-500 rounded-full pointer-events-none transition-all box-content"
                                                                    style={{ left: `calc(${(hours / 16) * 100}% - 6px)` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Minute Slider */}
                                                        <div className="relative group/slider">
                                                            <div className="flex justify-between mb-2 items-end">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Precision</span>
                                                                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md tabular-nums">{minutes}m</span>
                                                            </div>
                                                            <div className="relative h-4 flex items-center">
                                                                <div className="absolute inset-x-0 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(minutes / 55) * 100}%` }} />
                                                                </div>
                                                                <input
                                                                    type="range"
                                                                    min="0" max="55" step="5"
                                                                    value={minutes}
                                                                    onChange={(e) => setMinutes(parseInt(e.target.value))}
                                                                    className="relative w-full h-full opacity-0 cursor-pointer z-10"
                                                                />
                                                                <div
                                                                    className="absolute h-3 w-3 bg-white shadow-sm border border-indigo-500 rounded-full pointer-events-none transition-all box-content"
                                                                    style={{ left: `calc(${(minutes / 55) * 100}% - 6px)` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="variable"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="w-full h-full flex flex-col"
                                            >
                                                <div className="text-center mb-6">
                                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Intensity Sculpting</h3>
                                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Fine-tune your daily load distribution.</p>
                                                </div>

                                                <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 relative overflow-hidden shadow-inner w-full max-w-3xl mx-auto flex items-end justify-center gap-2 sm:gap-4">
                                                    {/* Background Grid */}
                                                    <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none opacity-40">
                                                        {[16, 12, 8, 4, 0].map((val) => (
                                                            <div key={val} className="w-full h-px border-t border-dashed border-slate-200 dark:border-slate-700 relative">
                                                                <span className="absolute -left-6 -top-2 text-[8px] font-black text-slate-300 dark:text-slate-600">{val}h</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {availableDays.map((day, dIdx) => {
                                                        const dayHours = dailyHours?.[day] !== undefined ? dailyHours[day] : (hours + minutes / 60);
                                                        const heightPercent = Math.min(100, (dayHours / 16) * 100);
                                                        const isWeekend = day === 'Saturday' || day === 'Sunday';

                                                        return (
                                                            <motion.div
                                                                key={day}
                                                                initial={{ height: 0 }}
                                                                animate={{ height: `${Math.max(5, heightPercent)}%` }}
                                                                transition={{ delay: dIdx * 0.05, type: 'spring', stiffness: 100 }}
                                                                className="relative flex-1 max-w-[60px] group h-full flex items-end z-10"
                                                            >
                                                                {/* Tooltip */}
                                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-lg transform translate-y-1 group-hover:translate-y-0">
                                                                    {dayHours.toFixed(1)}h
                                                                </div>

                                                                {/* Bar */}
                                                                <div className={`w-full h-full rounded-t-xl relative overflow-hidden transition-all duration-300 ${isWeekend ? 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-violet-500'}`}>
                                                                    <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/30 to-transparent" />

                                                                    {/* Input overlay for drag feel */}
                                                                    <input
                                                                        type="range"
                                                                        min="0" max="16" step="0.5"
                                                                        value={dayHours}
                                                                        onChange={(e) => {
                                                                            const val = parseFloat(e.target.value) || 0;
                                                                            setDailyHours(prev => ({ ...prev!!, [day]: val }));
                                                                        }}
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize z-30"
                                                                    />
                                                                </div>

                                                                {/* Label */}
                                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                                                    {day.substring(0, 1)}
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Bottom Action Bar */}
                                <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                                            <Target className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weekly Capacity</div>
                                            <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                                                {getTotalWeeklyHours()} <span className="text-[10px] text-slate-400 font-bold ml-1">HRS</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all overflow-hidden flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />

                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <span>Update Master Plan</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
            <style>{`
                .shadow-premium-xl {
                    box-shadow: 0 25px 50px -12px rgba(124, 58, 237, 0.12);
                }
            `}</style>
        </AnimatePresence>
    );
};
