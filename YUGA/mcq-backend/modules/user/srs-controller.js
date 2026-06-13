import SRSItem from "../shared/db/models/srs_schema.js";

// @desc    Get all SRS items due for review today
// @route   GET /api/srs/due
// @access  Private
export const getDueItems = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all items where nextReviewDate is less than or equal to now
        const dueItems = await SRSItem.find({
            userId,
            nextReviewDate: { $lte: new Date() }
        }).sort({ nextReviewDate: 1 });

        res.status(200).json({
            success: true,
            count: dueItems.length,
            data: dueItems
        });
    } catch (error) {
        console.error("Error fetching due SRS items:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Initialize a specific chapter into the SRS queue (if it doesn't exist)
// @route   POST /api/srs/init
// @access  Private
// Body: { subject: string, chapter: string }
export const initItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subject, chapter } = req.body;

        if (!subject || !chapter) {
            return res.status(400).json({
                success: false,
                message: "Subject and chapter are required to initialize an item"
            });
        }

        let item = await SRSItem.findOne({ userId, subject, chapter });

        // Only initialize if it doesn't exist
        if (!item) {
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + 1); // Set review for tomorrow by default

            item = new SRSItem({
                userId,
                subject,
                chapter,
                repetition: 0,
                easeFactor: 2.5,
                interval: 1, // 1 day initial interval
                nextReviewDate: nextDate
            });
            await item.save();
        }

        res.status(200).json({
            success: true,
            message: "Item initialized in SRS queue",
            data: item
        });
    } catch (error) {
        console.error("Error initializing SRS item:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Submit a review for a specific chapter
// @route   POST /api/srs/review
// @access  Private
// Body: { subject: string, chapter: string, score: number (0-5) }
// Used SM-2 algorithm
export const submitReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subject, chapter, score } = req.body;

        if (!subject || !chapter || score === undefined || score < 0 || score > 5) {
            return res.status(400).json({
                success: false,
                message: "Subject, chapter, and a valid score (0-5) are required"
            });
        }

        // Find or create the SRS item
        let item = await SRSItem.findOne({ userId, subject, chapter });

        if (!item) {
            item = new SRSItem({
                userId,
                subject,
                chapter,
                repetition: 0,
                easeFactor: 2.5,
                interval: 0,
            });
        }

        // SM-2 Algorithm Implementation
        let { repetition, easeFactor, interval } = item;

        if (score >= 3) {
            // Correct response
            if (repetition === 0) {
                interval = 1;
            } else if (repetition === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * easeFactor);
            }
            repetition += 1;
        } else {
            // Incorrect response
            repetition = 0;
            interval = 1;
        }

        // Calculate new Ease Factor
        easeFactor = easeFactor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3;

        // Save updated values
        item.repetition = repetition;
        item.easeFactor = easeFactor;
        item.interval = interval;
        item.lastReviewedAt = new Date();

        // Set next review date
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + interval);
        item.nextReviewDate = nextDate;

        await item.save();

        res.status(200).json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error("Error submitting SRS review:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
