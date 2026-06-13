import * as CourseService from "./course-service.js";

// List all courses (simplified)
export const listAll = async (req, res) => {
    try {
        const courses = await CourseService.listAll();
        res.json(courses);
    } catch (error) {
        console.error("Error listing courses:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get a specific course by ID
export const getCourseById = async (req, res) => {
    try {
        const course = await CourseService.getCourseById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.json(course);
    } catch (error) {
        console.error("Error getting course:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all lessons for a specific course
export const getLessonsByCourse = async (req, res) => {
    try {
        const lessons = await CourseService.getLessonsByCourse(req.params.id);
        if (!lessons) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.json(lessons);
    } catch (error) {
        console.error("Error getting lessons:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get a specific lesson by ID across all courses
export const getLessonById = async (req, res) => {
    try {
        const lesson = await CourseService.getLessonById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        res.json(lesson);
    } catch (error) {
        console.error("Error getting lesson:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

