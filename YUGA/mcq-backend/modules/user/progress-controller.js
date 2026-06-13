import * as ProgressService from "./progress-service.js";

export const getCourseProgress = async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user.id; // Comes from verifyToken middleware

    try {
        const progress = await ProgressService.getProgress(userId, courseId);
        res.status(200).json(progress);
    } catch (err) {
        console.error("Error fetching progress:", err);
        if (err.status) {
            return res.status(err.status).json({ message: err.message });
        }
        res
            .status(500)
            .json({ message: "Error fetching progress", error: err.message });
    }
};
