import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType, duration = 4000) => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type, duration }]);

        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, [removeToast]);

    const success = useCallback((msg: string, dur?: number) => showToast(msg, 'success', dur), [showToast]);
    const error = useCallback((msg: string, dur?: number) => showToast(msg, 'error', dur), [showToast]);
    const info = useCallback((msg: string, dur?: number) => showToast(msg, 'info', dur), [showToast]);
    const warning = useCallback((msg: string, dur?: number) => showToast(msg, 'warning', dur), [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl min-w-[320px] max-w-md
              transform transition-all duration-300 animate-slide-in-right
              backdrop-blur-md border border-white/20
              ${toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500/90 to-teal-600/90 text-white' : ''}
              ${toast.type === 'error' ? 'bg-gradient-to-r from-red-500/90 to-rose-600/90 text-white' : ''}
              ${toast.type === 'info' ? 'bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white' : ''}
              ${toast.type === 'warning' ? 'bg-gradient-to-r from-amber-500/90 to-orange-600/90 text-white' : ''}
            `}
                    >
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                            {toast.type === 'info' && <Info className="w-5 h-5" />}
                            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <p className="font-medium text-sm leading-relaxed">
                                {toast.message}
                            </p>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Progress Bar (Pure CSS Animation) */}
                        <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-shrink origin-left" style={{ width: '100%', animationDuration: `${toast.duration}ms` }}></div>
                    </div>
                ))}
            </div>
            <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        .animate-shrink {
          animation-name: shrink;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>
        </ToastContext.Provider>
    );
};

