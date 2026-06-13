import User from '../shared/db/models/user_schema.js';

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const notifications = [];
        let idCounter = 1;

        // 1. Streak Notification
        const streak = user.progress?.currentStreak || 0;
        if (streak > 0) {
            notifications.push({
                id: idCounter++,
                message: `Study streak: ${streak} days! 🔥`,
                read: false,
                time: "Today"
            });
        }

        // 2. XP Notification
        const xp = user.xp || 0;
        if (xp > 0) {
            notifications.push({
                id: idCounter++,
                message: `You have reached ${xp} XP! 🎯`,
                read: true,
                time: "Recently"
            });
        }

        // 3. Premium Status Notification
        const isPremium = user.membership?.plan === 'premium';
        if (isPremium) {
            notifications.push({
                id: idCounter++,
                message: "👑 Premium active! Build your future.",
                read: true,
                time: "Always"
            });
        } else {
            notifications.push({
                id: idCounter++,
                message: "Unlock AI Premium to boost your score!",
                read: false,
                time: "Now"
            });
        }

        // 4. Default welcome
        if (notifications.length < 3) {
            notifications.push({
                id: idCounter++,
                message: `Welcome back, ${user.fullName || 'Student'}!`,
                read: true,
                time: "Recently"
            });
        }

        res.status(200).json(notifications);

    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
