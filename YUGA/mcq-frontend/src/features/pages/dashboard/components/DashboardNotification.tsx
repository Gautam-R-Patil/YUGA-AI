import React from "react";
import { X, ArrowRight } from "lucide-react";
import { NotificationAction } from "../hooks/useDashboardNotifications";

interface DashboardNotificationProps {
    notification: NotificationAction | null;
    onClose: () => void;
}

export const DashboardNotification: React.FC<DashboardNotificationProps> = ({ notification, onClose }) => {
    if (!notification) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:max-w-sm animate-slide-in-up sm:animate-slide-in-right">
            <div
                onClick={notification.action}
                className={`bg-gradient-to-r ${notification.gradient} rounded-2xl p-0.5 shadow-premium-xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] magnetic-hover`}
            >
                {/* Close Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="absolute top-2 right-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-all z-20"
                    aria-label="Close notification"
                >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

                <div className="bg-black/20 backdrop-blur-sm rounded-[0.9rem] p-4 sm:p-5 relative z-10 border border-white/10">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md shadow-inner">
                                <notification.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-bounce-slow" />
                            </div>
                            {notification.type === 'live' && (
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500"></span>
                                </span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/20">
                                    {notification.type === 'live' ? 'Live Now' : 'New Update'}
                                </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-white leading-tight mb-0.5 sm:mb-1 truncate pr-4">{notification.title}</h3>
                            <p className="text-white/90 text-xs font-medium leading-relaxed line-clamp-2">{notification.message}</p>
                        </div>
                    </div>

                    <button
                        className="w-full mt-3 sm:mt-4 bg-white text-gray-900 px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-lg font-bold text-xs uppercase tracking-wide shadow-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 group-hover:shadow-2xl active:scale-[0.98]"
                    >
                        {notification.actionLabel}
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};
