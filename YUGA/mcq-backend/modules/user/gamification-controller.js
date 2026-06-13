import User from "../shared/db/models/user_schema.js";

// @desc    Get user gamification stats (XP, level, badges, streak)
// @route   GET /api/user/gamification/stats
// @access  Private
export const getGamificationStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(
            "xp badges progress.currentStreak progress.longestStreak fullName avatar"
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Calculate level based on XP (e.g., Level = floor(sqrt(XP / 100)) + 1)
        const level = Math.floor(Math.sqrt((user.xp || 0) / 100)) + 1;
        const nextLevelXp = Math.pow(level, 2) * 100;
        const currentLevelXp = Math.pow(level - 1, 2) * 100;
        const progressToNextLevel = ((user.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

        res.status(200).json({
            success: true,
            data: {
                xp: user.xp || 0,
                level,
                nextLevelXp,
                progressToNextLevel,
                badges: user.badges || [],
                currentStreak: user.progress?.currentStreak || 0,
                longestStreak: user.progress?.longestStreak || 0,
                fullName: user.fullName,
                avatar: user.avatar
            },
        });
    } catch (error) {
        console.error("Error fetching gamification stats:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get leaderboard (Top 50 users by XP)
// @route   GET /api/user/gamification/leaderboard
// @access  Public/Private
export const getLeaderboard = async (req, res) => {
    try {
        const topUsers = await User.find({})
            .sort({ xp: -1 })
            .limit(50)
            .select("fullName avatar xp badges progress.currentStreak");

        // Add rank and level to each user
        const leaderboard = topUsers.map((user, index) => {
            const level = Math.floor(Math.sqrt((user.xp || 0) / 100)) + 1;
            return {
                rank: index + 1,
                id: user._id,
                fullName: user.fullName,
                avatar: user.avatar,
                xp: user.xp || 0,
                level,
                badgesCount: user.badges?.length || 0,
                currentStreak: user.progress?.currentStreak || 0
            };
        });

        res.status(200).json({
            success: true,
            data: leaderboard,
            count: leaderboard.length
        });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Award XP to a user
// @route   POST /api/user/gamification/award-xp
// @access  Private
export const awardXp = async (req, res) => {
    try {
        const { amount, reason } = req.body;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ success: false, message: "Valid XP amount is required" });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Initialize if undefined
        if (typeof user.xp === 'undefined') user.xp = 0;

        const previousLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;

        // Add XP
        user.xp += amount;

        const newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
        const leveledUp = newLevel > previousLevel;

        await user.save();

        res.status(200).json({
            success: true,
            data: {
                newXpTotal: user.xp,
                addedXp: amount,
                leveledUp,
                newLevel,
                reason
            }
        });
    } catch (error) {
        console.error("Error awarding XP:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Award a badge to a user
// @route   POST /api/user/gamification/award-badge
// @access  Private (Internal/Admin mostly, or triggered by specific accomplishments)
export const awardBadge = async (req, res) => {
    try {
        const { badgeId } = req.body;

        if (!badgeId) {
            return res.status(400).json({ success: false, message: "Badge ID is required" });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Initialize if undefined
        if (!user.badges) user.badges = [];

        // Check if user already has this badge
        if (user.badges.includes(badgeId)) {
            return res.status(400).json({ success: false, message: "User already has this badge" });
        }

        // Add Badge
        user.badges.push(badgeId);

        // Optional: Award bonus XP for getting a badge
        const bonusXp = 50;
        if (typeof user.xp === 'undefined') user.xp = 0;
        user.xp += bonusXp;

        await user.save();

        res.status(200).json({
            success: true,
            message: `Badge ${badgeId} awarded successfully`,
            data: {
                badges: user.badges,
                newXpTotal: user.xp,
                bonusXp
            }
        });
    } catch (error) {
        console.error("Error awarding badge:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
