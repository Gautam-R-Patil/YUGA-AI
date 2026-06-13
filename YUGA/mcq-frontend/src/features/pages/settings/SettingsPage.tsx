
import React, { useState, useRef } from "react";
import {
    User,
    Crown,
    Save,
    Shield,
    Palette,
    Sparkles,
    LogOut,
    ChevronRight
} from "lucide-react";
import { useAuth } from "../../../core/contexts/AuthContext";
import { MembershipSection } from "../../user/components/MembershipSection";
import { useSettings } from "./hooks/useSettings";
import { SettingsProfileTab } from "./components/SettingsProfileTab";
import { SettingsPreferencesTab } from "./components/SettingsPreferencesTab";
import { SettingsSecurityTab } from "./components/SettingsSecurityTab";
import { motion, AnimatePresence, Variants } from "framer-motion";

const TabButton = ({ tab, activeTab, setActiveTab }: any) => {
    const isActive = activeTab === tab.id;
    const Icon = tab.icon;

    return (
        <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group relative w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 overflow-hidden ${isActive ? "shadow-lg shadow-purple-500/10" : "hover:bg-white/40 dark:hover:bg-slate-800/40"}`}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
        >
            {isActive && (
                <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-gradient-to-r from-white to-white/80 dark:from-slate-800 dark:to-slate-800/80 border border-purple-100 dark:border-purple-900/50 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}

            <div className={`relative z-10 p-2.5 rounded-xl transition-colors duration-300 ${isActive ? `${tab.bg} ${tab.color}` : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`}>
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
            </div>

            <div className="relative z-10 flex-1 text-left">
                <span className={`block text-sm font-bold transition-colors ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"}`}>
                    {tab.label}
                </span>
                <span className={`block text-[10px] font-medium transition-colors ${isActive ? "text-purple-500 dark:text-purple-400" : "text-gray-400 dark:text-gray-500"}`}>
                    {tab.desc}
                </span>
            </div>

            {isActive && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative z-10"
                >
                    <ChevronRight className={`w-4 h-4 ${tab.color}`} />
                </motion.div>
            )}
        </motion.button>
    );
};

export const SettingsPage: React.FC = () => {
    const { user, updateProfile, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "security" | "membership">("profile");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        formData,
        setFormData,
        passwordData,
        setPasswordData,
        isSaving,
        handleReset,
        handleDeleteAccount,
        handleSubmit
    } = useSettings({ user, updateProfile, logout });

    if (!user) return null;

    const tabs = [
        { id: "profile", label: "Profile", icon: User, desc: "Account Details", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
        { id: "preferences", label: "Preferences", icon: Palette, desc: "Look & Feel", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
        { id: "security", label: "Security", icon: Shield, desc: "Password & Data", color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
        { id: "membership", label: "Membership", icon: Crown, desc: "Pro Access", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    ];

    const contentVariants: Variants = {
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1]
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            scale: 0.98,
            transition: { duration: 0.2 }
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Dynamic Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -left-[10%] w-[70vh] h-[70vh] bg-purple-500/10 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -60, 0],
                        opacity: [0.3, 0.4, 0.3]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[60vh] h-[60vh] bg-blue-500/10 rounded-full blur-[100px]"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                {/* Header */}
                <div className="mb-10 sm:mb-14">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/20">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                    Settings
                                </h1>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium pl-1">
                                Customize your experience and manage your journey.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-5 py-2.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-red-500 font-bold rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                onClick={logout}
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
                    {/* Floating Sidebar */}
                    <div className="w-full lg:w-72 shrink-0 space-y-6">
                        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-3 border border-white/40 dark:border-slate-800 shadow-xl shadow-purple-900/5 sticky top-24">
                            <div className="space-y-1">
                                {tabs.map((tab) => (
                                    <TabButton
                                        key={tab.id}
                                        tab={tab}
                                        activeTab={activeTab}
                                        setActiveTab={setActiveTab}
                                    />
                                ))}
                            </div>

                            {/* Motivation Card */}
                            <div className="mt-4 pt-4 border-t border-purple-100/50 dark:border-slate-800 px-2 pb-1">
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-slate-900 dark:from-black dark:to-slate-900 p-5 text-white shadow-lg shadow-gray-900/20"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full blur-xl -mr-6 -mt-6" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
                                            <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">Goal Status</span>
                                        </div>
                                        <div className="font-bold text-lg mb-1 leading-none">Target NEET</div>
                                        <div className="text-xs text-gray-400 mb-3">Keep pushing limits!</div>
                                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "72%" }}
                                                transition={{ delay: 0.5, duration: 1.5, ease: "circOut" }}
                                                className="h-full bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Stage */}
                    <div className="flex-1 w-full min-h-[600px]">
                        <form onSubmit={handleSubmit} className="h-full flex flex-col relative w-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    variants={contentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-purple-900/5 border border-white/60 dark:border-slate-700/60 p-6 sm:p-10 min-h-[500px]"
                                >
                                    {activeTab === "profile" && (
                                        <div className="h-full">
                                            <SettingsProfileTab
                                                formData={formData}
                                                setFormData={setFormData}
                                                fileInputRef={fileInputRef}
                                                joinedDate={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024'}
                                            />
                                        </div>
                                    )}

                                    {activeTab === "preferences" && (
                                        <SettingsPreferencesTab
                                            formData={formData}
                                            setFormData={setFormData}
                                        />
                                    )}

                                    {activeTab === "security" && (
                                        <SettingsSecurityTab
                                            passwordData={passwordData}
                                            setPasswordData={setPasswordData}
                                            handleDeleteAccount={handleDeleteAccount}
                                        />
                                    )}

                                    {activeTab === "membership" && (
                                        <div className="py-2">
                                            <MembershipSection
                                                user={user}
                                                onUpgrade={async () => {
                                                    try {
                                                        await updateProfile({
                                                            membership: {
                                                                plan: "premium",
                                                                status: "active",
                                                                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                                            }
                                                        });
                                                    } catch (err) {
                                                        console.error("Failed to upgrade membership", err);
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Sticky Save Bar */}
                            <AnimatePresence>
                                {activeTab !== "membership" && (
                                    <motion.div
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 50, opacity: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="fixed bottom-6 right-6 lg:absolute lg:bottom-0 lg:right-0 mt-6 z-50 pointer-events-none flex justify-end px-2 pb-2"
                                    >
                                        <div className="pointer-events-auto p-2 pr-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-premium-lg border border-white/20 dark:border-slate-600 flex gap-3 transform hover:scale-[1.02] transition-transform duration-300">
                                            <button
                                                type="button"
                                                onClick={handleReset}
                                                className="px-5 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold text-sm transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700"
                                            >
                                                Reset
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="relative overflow-hidden px-8 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 text-sm flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100 group"
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                                                {isSaving ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4 group-hover:animate-pulse" />
                                                )}
                                                <span className="relative z-10">Save Changes</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};



