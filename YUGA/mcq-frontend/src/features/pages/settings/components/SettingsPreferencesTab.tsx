import React from 'react';
import { Brain, Target, Bell, Palette, Sun, Moon, Eye } from 'lucide-react';
import { SettingsFormData } from '../types';
import { useTheme } from '../../../../core/ThemeContext';
import { PushSubscriptionButton } from '../../../user/components/PushSubscriptionButton';

interface SettingsPreferencesTabProps {
    formData: SettingsFormData;
    setFormData: React.Dispatch<React.SetStateAction<SettingsFormData>>;
}

export const SettingsPreferencesTab: React.FC<SettingsPreferencesTabProps> = ({ formData, setFormData }) => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="space-y-10 animate-fade-in text-left">
            {/* Header */}
            <div className="flex flex-col gap-2 pb-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <Palette className="w-6 h-6 text-purple-500" />
                    Look & Feel
                </h3>
                <p className="text-gray-500 font-medium">Customize your learning environment.</p>
            </div>

            {/* Theme Selection - Large Cards */}
            <div className="grid grid-cols-2 gap-6">
                <button
                    onClick={() => setTheme('light')}
                    className={`relative group p-6 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 ${theme === 'light'
                        ? "border-purple-500 bg-purple-50 dark:bg-slate-800"
                        : "border-gray-200 dark:border-slate-700 hover:border-purple-200 dark:hover:border-slate-600 bg-white dark:bg-slate-900"
                        }`}
                >
                    <div className={`p-4 rounded-full transition-colors ${theme === 'light' ? "bg-white shadow-lg text-amber-500" : "bg-gray-100 dark:bg-slate-800 text-gray-400"}`}>
                        <Sun className="w-8 h-8" fill={theme === 'light' ? "currentColor" : "none"} />
                    </div>
                    <span className={`font-bold ${theme === 'light' ? "text-purple-900 dark:text-purple-300" : "text-gray-500"}`}>Light Mode</span>
                    {theme === 'light' && (
                        <div className="absolute top-4 right-4 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                    )}
                </button>

                <button
                    onClick={() => setTheme('dark')}
                    className={`relative group p-6 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 ${theme === 'dark'
                        ? "border-blue-500 bg-blue-50/10 dark:bg-slate-800"
                        : "border-gray-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-slate-600 bg-white dark:bg-slate-900"
                        }`}
                >
                    <div className={`p-4 rounded-full transition-colors ${theme === 'dark' ? "bg-slate-700 shadow-lg text-blue-400" : "bg-gray-100 dark:bg-slate-800 text-gray-400"}`}>
                        <Moon className="w-8 h-8" fill={theme === 'dark' ? "currentColor" : "none"} />
                    </div>
                    <span className={`font-bold ${theme === 'dark' ? "text-blue-900 dark:text-blue-300" : "text-gray-500"}`}>Dark Mode</span>
                    {theme === 'dark' && (
                        <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    )}
                </button>
            </div>

            {/* Content Density / Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Brain className="w-4 h-4 text-pink-500" />
                        Explanation Depth
                    </h4>
                    <div className="relative">
                        <select
                            value={formData.learningStyle}
                            onChange={(e) => setFormData(prev => ({ ...prev, learningStyle: e.target.value }))}
                            className="w-full px-5 py-4 pl-12 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500/50 transition-all font-medium text-gray-900 dark:text-white appearance-none cursor-pointer"
                        >
                            <option value="visual">Visual - Diagrams & Videos</option>
                            <option value="auditory">Auditory - Lectures & TTS</option>
                            <option value="kinesthetic">Kinesthetic - Practice & Labs</option>
                        </select>
                        <Eye className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="transition-all">
                                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Target className="w-4 h-4 text-cyan-500" />
                        Question Difficulty
                    </h4>
                    <div className="relative">
                        <select
                            value={formData.difficulty}
                            onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                            className="w-full px-5 py-4 pl-12 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all font-medium text-gray-900 dark:text-white appearance-none cursor-pointer"
                        >
                            <option value="beginner">Beginner - Basics First</option>
                            <option value="intermediate">Standard - NEET Level</option>
                            <option value="advanced">Challenge - Advanced</option>
                        </select>
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="transition-all">
                                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Goal Slider */}
            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-gray-900 to-slate-900 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20" />

                <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="text-xl font-bold flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-400" />
                                Weekly Study Goal
                            </h4>
                            <p className="text-gray-400 text-sm mt-1">Consistency is key to cracking NEET.</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                {formData.weeklyGoal}h
                            </div>
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Target</div>
                        </div>
                    </div>

                    <div className="relative pt-6 pb-2">
                        <input
                            type="range"
                            min="5"
                            max="60"
                            step="5"
                            value={formData.weeklyGoal}
                            onChange={(e) => setFormData(prev => ({ ...prev, weeklyGoal: parseInt(e.target.value) }))}
                            className="w-full h-3 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500 relative z-10"
                            style={{
                                background: `linear-gradient(to right, #a855f7 0%, #3b82f6 ${(formData.weeklyGoal / 60) * 100}%, #1e293b ${(formData.weeklyGoal / 60) * 100}%, #1e293b 100%)`
                            }}
                        />
                        {/* Tick Marks */}
                        <div className="flex justify-between mt-2 px-1">
                            {[5, 20, 40, 60].map((val) => (
                                <span key={val} className="text-[10px] font-bold text-gray-500">{val}h</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications Toggle */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gray-50 dark:bg-slate-800/30 rounded-3xl border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-amber-500 shrink-0">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Smart Reminders</h4>
                        <p className="text-sm text-gray-500 font-medium">Subscribe to daily micro-learning and practice reminders.</p>
                    </div>
                </div>

                <PushSubscriptionButton />
            </div>
        </div>
    );
};


