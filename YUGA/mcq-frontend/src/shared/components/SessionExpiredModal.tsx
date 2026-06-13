import React, { useEffect } from "react";
import { LogOut, Smartphone, AlertCircle } from "lucide-react";

interface SessionExpiredModalProps {
    isOpen: boolean;
    onConfirm: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
    isOpen,
    onConfirm,
}) => {
    // Auto-confirm after 10 seconds
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onConfirm();
            }, 10000); // 10 seconds

            return () => clearTimeout(timer);
        }
    }, [isOpen, onConfirm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xl"></div>

            {/* Modal */}
            <div className="relative w-full max-w-md animate-scale-in">
                {/* Outer Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-3xl blur-2xl opacity-30 animate-pulse-slow"></div>

                {/* Card Container */}
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute w-64 h-64 bg-orange-400 rounded-full -top-20 -left-20 blur-3xl animate-pulse-slow"></div>
                        <div className="absolute w-64 h-64 bg-red-400 rounded-full -bottom-20 -right-20 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                    </div>

                    {/* Content */}
                    <div className="relative p-8 text-center">
                        {/* Icon */}
                        <div className="relative mx-auto w-20 h-20 mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur opacity-40 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-orange-500 to-red-500 w-20 h-20 rounded-2xl flex items-center justify-center">
                                <Smartphone className="w-10 h-10 text-white" />
                            </div>
                            {/* Alert Badge */}
                            <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                                <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Account Accessed Elsewhere
                        </h2>

                        {/* Description */}
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Your account has been logged in on another device. For security reasons, you've been logged out of this session.
                        </p>

                        {/* Info Box */}
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-orange-900 mb-1">
                                        Single Device Policy
                                    </p>
                                    <p className="text-xs text-orange-700">
                                        To protect your account, only one device can be logged in at a time. If this wasn't you, please secure your account immediately.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={onConfirm}
                            className="relative w-full group overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white py-3.5 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                                <LogOut className="w-5 h-5" />
                                <span>Understood</span>
                            </div>
                        </button>

                        {/* Auto-dismiss notice */}
                        <p className="text-xs text-gray-500 mt-4">
                            This modal will auto-close in 10 seconds
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
