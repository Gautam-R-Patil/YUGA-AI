import mongoose from "mongoose";

import LessonProgress from "../shared/db/models/lessonProgress.js";
import AssessmentSubmission from "../shared/db/models/assessmentSubmission.js";

export const getProgress = async (userId, courseId) => {
    const course = await mongoose.model('Course').findOne({ id: courseId }).select('lessons');
    if (!course) {
        throw { status: 404, message: "Course not found" };
    }

    const allLessonIds = course.lessons.map((lesson) => lesson.id);
    const objectUserId = new mongoose.Types.ObjectId(userId);


    // Fetch completed lessons
    const completedLessons = await LessonProgress.find({
        user: objectUserId,
        lesson: { $in: allLessonIds },
        completed: true,
    }).lean();

    // Fetch assessments
    const submissions = await AssessmentSubmission.find({
        user: objectUserId,
        lesson: { $in: allLessonIds },
    }).lean();

    const completedLessonIds = completedLessons.map((lp) => lp.lesson);

    const progress = {
        totalLessons: allLessonIds.length,
        completedLessons: completedLessonIds.length,
        completedLessonIds,
        assessments: submissions.map((s) => ({
            lessonId: s.lesson,
            score: s.score,
            passed: s.passed,
        })),
        overallStatus:
            completedLessonIds.length === allLessonIds.length &&
                submissions.every((s) => s.passed)
                ? "Course Completed"
                : "In Progress",
    };

    return progress;
};
