import React, { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";

interface LoadingScreenProps {
    loadingProgress: number;
    currentLoadingMessage: string;
    currentFunFact: number;
    funFacts: string[];
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
    loadingProgress,
    currentLoadingMessage,
    currentFunFact,
    funFacts
}) => {
    return (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center font-sans select-none">
            {/* Modern Loader Design */}
            <div className="w-full max-w-md p-8 flex flex-col items-center relative">
                {/* Floating Background Elements */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-cyan-100 rounded-full blur-2xl opacity-20 animate-pulse delay-1000"></div>

                <div className="w-24 h-24 mb-10 relative flex items-center justify-center">
                    {/* Outer Ring */}
                    <div className="absolute inset-0 border-[6px] border-blue-50 rounded-full"></div>
                    {/* Spinning Inner Ring */}
                    <div className="absolute inset-0 border-[6px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    {/* Logo/Icon or Percent */}
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-blue-900 font-mono">
                        {Math.round(loadingProgress)}%
                    </div>
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Setting up Exam</h3>

                <div className="h-6 mb-8 flex items-center justify-center">
                    <p className="text-slate-500 text-sm font-medium animate-pulse text-center">
                        {currentLoadingMessage}
                    </p>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner relative ring-1 ring-slate-200">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-full transition-all duration-500 ease-out relative"
                        style={{ width: `${loadingProgress}%`, backgroundSize: '200% 100%', animation: 'gradientMove 2s linear infinite' }}
                    >
                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>

                {/* Fun Fact Section */}
                <div className="mt-8 bg-gradient-to-br from-blue-50 to-cyan-50/50 border border-blue-100 p-5 rounded-xl max-w-sm w-full backdrop-blur-sm shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-blue-600">
                        <span className="bg-blue-100 p-1.5 rounded-md"><BookOpen className="w-4 h-4" /></span>
                        <span className="text-xs font-bold uppercase tracking-wider">Did You Know?</span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed transition-all duration-500 min-h-[50px]">
                        {funFacts[currentFunFact]}
                    </p>
                </div>

                <div className="mt-8 flex items-center gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse"></span>
                        Secure Environment
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50 animate-pulse delay-75"></span>
                        Optimizing Assets
                    </span>
                </div>

                <style>{`
                    @keyframes gradientMove {
                        0% { background-position: 100% 0; }
                        100% { background-position: -100% 0; }
                    }
                `}</style>
            </div>
        </div>
    );
};
