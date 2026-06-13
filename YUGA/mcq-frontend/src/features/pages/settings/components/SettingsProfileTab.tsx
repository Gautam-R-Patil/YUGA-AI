import React from 'react';
import { Camera, User, Mail, GraduationCap, Sparkles, Trophy, Calendar } from 'lucide-react';
import { SettingsFormData } from '../types';

interface SettingsProfileTabProps {
    formData: SettingsFormData;
    setFormData: React.Dispatch<React.SetStateAction<SettingsFormData>>;
    fileInputRef: React.RefObject<HTMLInputElement>;
    joinedDate: string;
}

export const SettingsProfileTab: React.FC<SettingsProfileTabProps> = ({ formData, setFormData, fileInputRef, joinedDate }) => {

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Holographic ID Card Header */}
            <div className="relative group overflow-hidden rounded-[2rem] shadow-premium-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-90 transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8 z-10">
                    <div className="relative group/avatar cursor-pointer" onClick={handleAvatarClick}>
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full opacity-75 blur group-hover/avatar:opacity-100 transition-opacity duration-500 animate-spin-slow" />
                        <div className="relative w-32 h-32 rounded-full border-4 border-white/20 bg-white/10 backdrop-blur-md overflow-hidden shadow-2xl">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/10 text-white">
                                    <User className="w-12 h-12" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <Camera className="w-8 h-8 text-white drop-shadow-md" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>

                    <div className="text-center sm:text-left text-white space-y-2 flex-1">
                        <div className="flex flex-col sm:items-start items-center">
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
                                    {formData.fullName || "Student"}
                                </h2>
                                <div className="px-2.5 py-1 rounded-full bg-white/20 border border-white/30 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                                    <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                                    <span>Pro Scholar</span>
                                </div>
                            </div>

                            <p className="text-indigo-100 font-medium flex items-center gap-2 text-sm opacity-90">
                                <Mail className="w-3.5 h-3.5" /> {formData.email || "student@example.com"}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-6 justify-center sm:justify-start">
                                <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10 flex items-center gap-3">
                                    <div className="p-1.5 bg-white/10 rounded-lg text-amber-300">
                                        <Trophy className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold opacity-80">Focus</p>
                                        <p className="font-bold text-sm leading-none mt-0.5">NEET 2025</p>
                                    </div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10 flex items-center gap-3">
                                    <div className="p-1.5 bg-white/10 rounded-lg text-emerald-300">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold opacity-80">Joined</p>
                                        <p className="font-bold text-sm leading-none mt-0.5">{joinedDate}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                    <label htmlFor="settings-name" className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-500" />
                        Full Name
                    </label>
                    <input
                        id="settings-name"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/50 transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800"
                        placeholder="e.g. Rahul Sharma"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="settings-email" className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-500" />
                        Email Address
                    </label>
                    <input
                        id="settings-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800"
                        placeholder="student@example.com"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label htmlFor="settings-class" className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-indigo-500" />
                        Academic Status
                    </label>
                    <div className="relative group">
                        <select
                            id="settings-class"
                            value={formData.studentClass}
                            onChange={(e) => setFormData(prev => ({ ...prev, studentClass: e.target.value }))}
                            className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium text-gray-900 dark:text-white appearance-none cursor-pointer focus:bg-white dark:focus:bg-slate-800"
                        >
                            <option value="Class 11">Class 11 - Building Fundamentals</option>
                            <option value="Class 12">Class 12 - Board & Competitive Focus</option>
                            <option value="Dropper">Dropper - dedicated Preparation</option>
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 transition-transform group-focus-within:rotate-180">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="transition-all">
                                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 ml-1 mt-1">This helps us tailor the difficulty and curriculum for you.</p>
                </div>
            </div>
        </div>
    );
};


