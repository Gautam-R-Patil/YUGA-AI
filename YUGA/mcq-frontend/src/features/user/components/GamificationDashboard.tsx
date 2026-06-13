import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Star, Award } from 'lucide-react';
import { apiRequest } from '../../../core/utils/api';

interface GamificationStats {
    xp: number;
    level: number;
    nextLevelXp: number;
    progressToNextLevel: number;
    badges: string[];
    currentStreak: number;
    longestStreak: number;
    fullName: string;
    avatar?: string;
}

export const GamificationDashboard = () => {
    const [stats, setStats] = useState<GamificationStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiRequest('/user/gamification/stats', 'GET');
                const data = await response.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch gamification stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="animate-pulse bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl h-64 flex items-center justify-center">
                <div className="text-slate-400 font-bold">Loading Stats...</div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Trophy className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Progress</h2>
                    <p className="text-sm text-slate-500 font-medium">Level {stats.level} Scholar</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* XP Bar */}
                <div>
                    <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-slate-600 dark:text-slate-400">Total XP</span>
                        <span className="text-purple-600 dark:text-purple-400">{stats.xp} / {stats.nextLevelXp}</span>
                    </div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.progressToNextLevel}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-800/50 flex flex-col items-center">
                        <Flame className="w-8 h-8 text-orange-500 mb-2" />
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.currentStreak}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Day Streak</span>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex flex-col items-center">
                        <Star className="w-8 h-8 text-emerald-500 mb-2" />
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.badges.length}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Badges</span>
                    </div>
                </div>

                {/* Badges Section */}
                {stats.badges.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recent Badges</h3>
                        <div className="flex gap-2 flex-wrap">
                            {stats.badges.slice(0, 3).map((badge, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                                    <Award className="w-4 h-4 text-purple-500" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{badge}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
