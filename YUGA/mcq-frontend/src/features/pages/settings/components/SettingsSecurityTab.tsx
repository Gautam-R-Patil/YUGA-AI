import React, { useState } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle, Key } from 'lucide-react';
import { PasswordData } from '../types';

interface SettingsSecurityTabProps {
    passwordData: PasswordData;
    setPasswordData: React.Dispatch<React.SetStateAction<PasswordData>>;
    handleDeleteAccount: () => void;
}

export const SettingsSecurityTab: React.FC<SettingsSecurityTabProps> = ({ passwordData, setPasswordData, handleDeleteAccount }) => {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    return (
        <div className="space-y-8 animate-fade-in text-left">
            {/* Header */}
            <div className="flex flex-col gap-2 pb-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <Shield className="w-6 h-6 text-red-500" />
                    Security & Privacy
                </h3>
                <p className="text-gray-500 font-medium">Protect your account and personal data.</p>
            </div>

            {/* Password Change Card */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-900/30 dark:to-blue-900/30 rounded-[2rem] opacity-50 blur-lg group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative bg-white dark:bg-slate-800 rounded-[1.8rem] p-8 border border-gray-100 dark:border-slate-700 shadow-premium">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h4>
                            <p className="text-sm text-gray-400">Ensure your account uses a strong, unique password.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3 md:col-span-2">
                            <label htmlFor="settings-current-password" rural-label="Current Password" className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Current Password</label>
                            <div className="relative group/input">
                                <input
                                    id="settings-current-password"
                                    type={showCurrent ? "text" : "password"}
                                    value={passwordData.currentPassword || ''}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-900/50 border border-transparent rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:bg-white dark:focus:bg-slate-800"
                                    placeholder="Enter your current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label htmlFor="settings-new-password" className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">New Password</label>
                            <div className="relative group/input">
                                <input
                                    id="settings-new-password"
                                    type={showNew ? "text" : "password"}
                                    value={passwordData.newPassword || ''}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-900/50 border border-transparent rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/50 transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:bg-white dark:focus:bg-slate-800"
                                    placeholder="Create a new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label htmlFor="settings-confirm-password" className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    id="settings-confirm-password"
                                    type={showNew ? "text" : "password"}
                                    value={passwordData.confirmPassword || ''}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className={`w-full px-5 py-4 bg-gray-50 dark:bg-slate-900/50 border rounded-2xl focus:ring-4 transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:bg-white dark:focus:bg-slate-800 ${passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                                            ? 'border-red-200 focus:border-red-500 focus:ring-red-500/10'
                                            : 'border-transparent focus:border-purple-500/50 focus:ring-purple-500/10'
                                        }`}
                                    placeholder="Confirm your new password"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone - Premium Glass Style */}
            <div className="pt-8 border-t border-gray-100 dark:border-gray-700">
                <div className="relative overflow-hidden rounded-[2rem] border border-red-100 dark:border-red-900/30 group">
                    {/* Background Gradients */}
                    <div className="absolute inset-0 bg-red-50/80 dark:bg-red-900/10 backdrop-blur-sm transition-colors group-hover:bg-red-100/50 dark:group-hover:bg-red-900/20" />
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="p-4 bg-white dark:bg-red-900/20 rounded-2xl shadow-sm text-red-500 ring-4 ring-red-50 dark:ring-red-900/10">
                            <AlertTriangle className="w-8 h-8" />
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <h4 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Danger Zone</h4>
                            <p className="text-red-600/80 dark:text-red-400/70 text-sm mb-6 leading-relaxed max-w-xl">
                                Deleting your account is permanent. This action will erase all your progress, saved questions, and personal data. We cannot recover this information once deleted.
                            </p>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                className="px-8 py-3 bg-white dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl font-bold shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 hover:scale-105 active:scale-95 transition-all duration-300"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


