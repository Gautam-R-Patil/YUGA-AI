import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, Clock, X, ArrowRight } from "lucide-react";

interface RescheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: any;
    onReschedule: (newDate: string, newTime: string) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({ isOpen, onClose, session, onReschedule }) => {
    const getLocalDateString = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const [date, setDate] = useState(getLocalDateString(new Date()));
    const [time, setTime] = useState(session?.time.split('-')[0].trim() || "09:00");

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-scale-up border border-white/20 relative z-[10000]">
                {/* Header Section */}
                <div className="relative p-8 pb-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                            <Clock className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Reschedule Class</h2>
                            <p className="text-blue-100 text-sm font-medium opacity-90">Move your session to a better time</p>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mt-2">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1">Current Session</div>
                        <h3 className="font-bold text-lg leading-tight line-clamp-1">{session?.topic}</h3>
                        <div className="flex items-center gap-2 mt-2 text-xs font-medium text-blue-100">
                            <span className="px-2 py-0.5 bg-white/20 rounded-md capitalize">{session?.subject}</span>
                            <span>•</span>
                            <span>{session?.time}</span>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="p-8 space-y-6 bg-white">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">New Date</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">New Start Time</label>
                            <div className="relative group">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={() => onReschedule(date, time)}
                            className="w-full group bg-slate-900 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 hover:shadow-blue-200 transform active:scale-[0.98]"
                        >
                            Confirm Reschedule
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-center text-[11px] text-slate-400 mt-4 font-medium">
                            This will move today's session and update your master plan.
                        </p>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

