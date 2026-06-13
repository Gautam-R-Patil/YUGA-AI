import React, { useEffect } from "react";
import {
    Sparkles,
    CheckCircle2,
    Clock,
    Brain,
    Zap,
    BookOpen,
    Target,
    TrendingUp,
    LogOut,
    Construction
} from "lucide-react";
import { useAuth } from "../../../core";

export const ComingSoonPage: React.FC = () => {
    const { logout, user } = useAuth();

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    const completedFeatures = [
        {
            title: "AI Avatar Teaching",
            description: "Interactive AI tutors that adapt to your learning pace.",
            icon: <Brain className="w-6 h-6 text-purple-400" />
        },
        {
            title: "Instant Doubt Solving",
            description: "24/7 support for all your academic questions.",
            icon: <Zap className="w-6 h-6 text-emerald-400" />
        },
        {
            title: "Comprehensive Content",
            description: "Over 1000+ video lessons and study materials.",
            icon: <BookOpen className="w-6 h-6 text-blue-400" />
        }
    ];

    const upcomingFeatures = [
        {
            title: "Mock Exams & Assessment",
            description: "Real-time exam simulations with detailed AI analysis.",
            icon: <Target className="w-6 h-6 text-orange-400" />
        },
        {
            title: "Performance Analytics",
            description: "Deep insights into your learning progress and growth.",
            icon: <TrendingUp className="w-6 h-6 text-pink-400" />
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 particles-bg flex flex-col items-center justify-center p-4">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
                <div className="absolute top-0 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
                <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
            </div>

            <div className="relative max-w-4xl w-full z-10">
                <div className="glass-ultra shadow-premium-xl rounded-[2.5rem] border border-white/10 overflow-hidden p-8 md:p-12 text-center">
                    {/* Header */}
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white mb-6 animate-bounce-in">
                            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                            <span className="text-sm font-semibold tracking-wider uppercase">Beta Access Only</span>
                        </div>

                        <div className="flex justify-center mb-8">
                            <div className="relative magnetic-hover">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                                <div className="relative w-24 h-24 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-premium">
                                    <Construction className="w-10 h-10 text-white animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-2xl">
                            Something <span className="text-gradient-premium">Extraordinary</span> is Coming
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                            Hi <span className="text-purple-300 font-bold">{user?.name || user?.email}</span>! We're currently in invite-only beta. Your account is registered, and we'll notify you once your access is activated.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 text-left">
                        {/* Completed Features */}
                        <div className="space-y-6">
                            <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                Features Ready for Launch
                            </h3>
                            <div className="space-y-4">
                                {completedFeatures.map((feature, index) => (
                                    <div key={index} className="glass-ultra p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                                        <div className="flex gap-4">
                                            <div className="shrink-0 p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <div className="text-white font-semibold mb-1">{feature.title}</div>
                                                <div className="text-gray-400 text-sm">{feature.description}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Features */}
                        <div className="space-y-6">
                            <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                                <Clock className="w-5 h-5 text-orange-400" />
                                Coming in Next Update
                            </h3>
                            <div className="space-y-4">
                                {upcomingFeatures.map((feature, index) => (
                                    <div key={index} className="glass-ultra p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all opacity-80 group">
                                        <div className="flex gap-4">
                                            <div className="shrink-0 p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <div className="text-white/80 font-semibold mb-1">{feature.title}</div>
                                                <div className="text-gray-400/80 text-sm">{feature.description}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => logout()}
                            className="group flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all border border-white/10"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-gray-400">
                    <p className="text-sm">© 2026 YUGA AI. Empowering India's Future with AI.</p>
                </div>
            </div>
        </div>
    );
};
