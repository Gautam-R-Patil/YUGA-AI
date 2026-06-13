import React from "react";
import { ArrowRight } from "lucide-react";
import { trackAIEvent } from "../../../../core/utils/analytics";
import { User } from "../../../../core/types";
import { useCourse } from "../../../../core/contexts/CourseContext";


interface DashboardHeroProps {
    user: User | null;
    onChatToggle: (isOpen: boolean) => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({ user, onChatToggle }) => {
    const { config } = useCourse();



    return (
        <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 rounded-3xl p-5 sm:p-6 md:p-8 text-white mb-8 overflow-hidden shadow-premium-xl particles-bg">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent"></div>

            <div className="relative flex flex-col md:flex-row items-center justify-between z-10">
                <div className="w-full md:flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold animate-fade-in leading-tight">
                            Welcome Back, {user?.fullName?.split(' ')[0] || user?.fullName}!
                        </h1>
                    </div>

                    <p className="text-purple-100 text-sm sm:text-base md:text-lg mb-6 max-w-xl animate-fade-in animate-delay-200 leading-relaxed">
                        Ready to continue your AI-powered {config.label} journey?
                    </p>
                    <div className="flex gap-4 animate-fade-in animate-delay-500">
                        <button
                            onClick={() => {
                                const plan = user?.membership?.plan || 'free';
                                if (plan === 'free') {
                                    trackAIEvent('premium_locked_click', 'educore_chat');
                                    // Optionally navigate to premium
                                    // navigate('/premium'); 
                                    // For now just toggle and let the backend handle the 403, 
                                    // but we can be more proactive.
                                    onChatToggle(true); 
                                } else {
                                    onChatToggle(true);
                                    trackAIEvent('open_from_dashboard', 'educore_chat');
                                }
                            }}
                            className={`bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md px-4 sm:px-6 py-4 rounded-xl font-bold text-sm sm:text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 group transform hover:-translate-y-1 w-full sm:w-auto relative`}
                        >
                            <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text font-black text-lg sm:text-xl">Educore</span>
                            <span className="hidden sm:block w-px h-6 bg-white/20 mx-1"></span>
                            <span className="text-center flex items-center gap-2">
                                AI {config.label} Tutor
                                {user?.membership?.plan === 'free' && (
                                    <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                )}
                            </span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform hidden sm:block" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
