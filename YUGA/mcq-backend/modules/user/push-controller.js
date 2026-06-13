import User from "../shared/db/models/user_schema.js";

// @desc    Save a push subscription object
// @route   POST /api/push/subscribe
// @access  Private
// Body: { subscription: object }
export const saveSubscription = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subscription } = req.body;

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ success: false, message: "Invalid subscription object" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Initialize array if it doesn't exist
        if (!user.pushSubscriptions) {
            user.pushSubscriptions = [];
        }

        // Check if subscription already exists based on endpoint
        const exists = user.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);

        if (!exists) {
            user.pushSubscriptions.push(subscription);
            await user.save();
        }

        res.status(200).json({ success: true, message: "Subscription saved successfully" });
    } catch (error) {
        console.error("Error saving push subscription:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Remove a push subscription object
// @route   POST /api/push/unsubscribe
// @access  Private
// Body: { endpoint: string }
export const removeSubscription = async (req, res) => {
    try {
        const userId = req.user.id;
        const { endpoint } = req.body;

        if (!endpoint) {
            return res.status(400).json({ success: false, message: "Endpoint required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.pushSubscriptions) {
            user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub.endpoint !== endpoint);
            await user.save();
        }

        res.status(200).json({ success: true, message: "Subscription removed successfully" });
    } catch (error) {
        console.error("Error removing push subscription:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
