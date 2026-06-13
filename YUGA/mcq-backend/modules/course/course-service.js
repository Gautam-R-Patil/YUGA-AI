import Course from "../shared/db/models/course.js";

// List all courses (simplified)
export const listAll = async () => {
    try {
        const courses = await Course.find({}, { id: 1, title: 1, chapters: 1, duration: 1, category: 1, color: 1, image: 1, description: 1, lessons: 1 }).lean();
        return courses.map(course => ({
            id: course.id,
            name: course.category, // Mapping category to name for backward compatibility
            title: course.title,
            chapters: course.chapters ? course.chapters.length : 0,
            duration: course.duration,
            image: course.image,
            description: course.description,
            category: course.category,
            lessons: course.lessons || []
        }));
    } catch (error) {
        throw error;
    }
};

// Get a specific course by ID
export const getCourseById = async (id) => {
    try {
        return await Course.findOne({ id });
    } catch (error) {
        throw error;
    }
};

// Get all lessons for a specific course
export const getLessonsByCourse = async (id) => {
    try {
        const course = await Course.findOne({ id });
        return course ? course.lessons : null;
    } catch (error) {
        throw error;
    }
};

// Get a specific lesson by ID across all courses
export const getLessonById = async (id) => {
    try {
        const course = await Course.findOne({ "lessons.id": id });
        if (course) {
            return course.lessons.find((l) => l.id === id);
        }
        return null;
    } catch (error) {
        throw error;
    }
};

