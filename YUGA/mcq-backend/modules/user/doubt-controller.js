import { processVoiceQuery } from "./doubt-service.js";
import User from "../shared/db/models/user_schema.js";
import { getWeekNumber, getTodayStr } from "../shared/utils/date-utils.js";

export const handleVoiceQuery = async (req, res) => {
  try {
    const { audio, messages = [] } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const plan = user.membership?.plan || 'free';
    const now = new Date();
    const todayStr = getTodayStr(now);
    const [currentYear, currentWeek] = getWeekNumber(now);

    // --- MEMBERSHIP LIMITS CHECK ---
    if (plan !== 'pro' && plan !== 'premium') {
        const stats = user.usageStats || {};
        
        if (plan === 'free') {
            // Free: 5 Doubts per Week
            if (stats.lastDoubtDate) {
                const [lastYear, lastWeek] = getWeekNumber(new Date(stats.lastDoubtDate));
                if (lastYear === currentYear && lastWeek === currentWeek) {
                    if (stats.doubtsAskedThisWeek >= 5) {
                        return res.status(403).json({ 
                            error: "Free tier limit reached: 5 AI Doubts per Week. Upgrade to Student Pro for 10 daily doubts!",
                            limitReached: true,
                            type: 'weekly'
                        });
                    }
                }
            }
        } else if (plan === 'student') {
            // Student: 10 Doubts per Day
            const lastDate = stats.lastDoubtDate ? getTodayStr(new Date(stats.lastDoubtDate)) : null;
            if (lastDate === todayStr && stats.doubtsAskedToday >= 10) {
                return res.status(403).json({ 
                    error: "Student Pro limit reached: 10 AI Doubts per Day. Upgrade to Ultimate Elite for unlimited access!",
                    limitReached: true,
                    type: 'daily'
                });
            }
        }
    }

    const result = await processVoiceQuery(audio, messages);

    // --- UPDATE USAGE STATS ---
    if (!user.usageStats) user.usageStats = {};
    const stats = user.usageStats;

    // Reset counts if new day/week
    const lastDate = stats.lastDoubtDate ? getTodayStr(new Date(stats.lastDoubtDate)) : null;
    if (lastDate !== todayStr) {
        stats.doubtsAskedToday = 0;
    }
    
    if (stats.lastDoubtDate) {
        const [lastYear, lastWeek] = getWeekNumber(new Date(stats.lastDoubtDate));
        if (lastYear !== currentYear || lastWeek !== currentWeek) {
            stats.doubtsAskedThisWeek = 0;
        }
    } else {
        stats.doubtsAskedThisWeek = 0;
    }

    stats.doubtsAskedToday += 1;
    stats.doubtsAskedThisWeek += 1;
    stats.lastDoubtDate = now;

    await user.save();

    res.json(result);
  } catch (error) {
    console.error('Voice query error:', error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};