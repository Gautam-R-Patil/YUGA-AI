import { useState, useCallback, useEffect } from 'react';
import { api } from '../utils/api';
import { Course } from '../types';
import { useCourse } from '../contexts/CourseContext';
import { getCourseDescription } from '../../shared/components/CourseCard';

// Define RawCourse locally or import if available
interface RawCourse {
    id: string;
    name: string;
    title?: string;
    image: string;
    chapters: number;
    duration: string | number;
    lessons?: any[];
}

export const useCourseData = () => {
    const { config, selectedCourse } = useCourse();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const transformCourse = useCallback((raw: RawCourse): Course => {
        const realLessons = (raw.lessons && raw.lessons.length > 0)
            ? raw.lessons
            : Array.from({ length: raw.chapters || 0 }, (_, i) => ({ title: `Lesson ${i + 1}` }));

        let description = config.descriptions[raw.name] || "Learn effectively with our AI-powered content.";
        // Fallback to helper if available, but for now we use config.descriptions primarily. 
        // Note: getCourseDescription is in CourseCard, might be circular if we use it here.
        // Let's duplicate the fallback or use the exported one if careful.
        // Actually, importing from component file is risky for circular deps. 
        // Ideally getCourseDescription should be in a util. 
        // For now, I will use a simple fallback.

        let progress = 0;
        let tags = [raw.name, config.label, "AI-Powered"];

        if (raw.name.includes("AI Examiner")) {
            tags = ["Live Rank", "High Yield"];
        } else if (raw.name.includes("MCQs")) {
            realLessons.length = 0;
            for (let i = 1; i <= 10; i++) {
                realLessons.push({ title: `Practice Set ${i}`, duration: '10 Qs' });
            }
        }

        return {
            id: raw.id,
            title: raw.title || raw.name,
            description: description,
            image: raw.image,
            category: raw.name,
            duration: String(raw.duration).includes("min") ? String(raw.duration) : `${raw.duration} mins`,
            lessons: realLessons,
            level: "Beginner",
            progress: progress,
            color: config.colors[raw.name] || "bg-gray-500",
            chapters: Array.from({ length: raw.chapters || 0 }, (_, i) => ({ title: `Chapter ${i + 1}` })),
            instructor: "AI Tutor",
            rating: 4.8,
            students: 0,
            tags: tags,
            notesCount: 0,
        };
    }, [config]);

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get<RawCourse[]>("/course/courses");
            const transformed = response.data.map(transformCourse);

            // Filter logic
            const filtered = transformed.filter(course => {
                if (config.id === 'both') return true;
                return course.category.startsWith(config.coursePrefix) || course.category === "Your Scheduled Classes";
            });

            // Add personalized courses if missing
            const hasPersonalizedClasses = filtered.some(c => c.category === "Your Scheduled Classes");
            const hasScheduleQuiz = filtered.some(c => c.category === "Your Schedule Quiz");
            const hasWeeklyMock = filtered.some(c => c.category === "Your Weekly Mock Test");

            const finalList = [...filtered];

            if (!hasPersonalizedClasses) {
                finalList.push({
                    id: `personalized-${selectedCourse}`,
                    title: "Your Scheduled Classes",
                    description: config.descriptions["Your Scheduled Classes"],
                    image: "",
                    category: "Your Scheduled Classes",
                    duration: "Daily",
                    lessons: Array(3).fill({ title: "Session" }),
                    level: "Advanced",
                    progress: 0,
                    color: "bg-purple-600",
                    chapters: [],
                    instructor: "Yuga Timer",
                    rating: 5.0,
                    students: 0,
                    tags: ["Schedule", "Live", "Daily"],
                    notesCount: 0
                });
            }

            if (!hasScheduleQuiz) {
                finalList.push({
                    id: "personalized-quiz-001",
                    title: "Your Schedule Quiz",
                    description: "Quick daily quizzes to test your retention of yesterday's topics.",
                    image: "",
                    category: "Your Schedule Quiz",
                    duration: "15 mins",
                    lessons: [{ title: "Daily Quiz", duration: "10 Questions" }],
                    level: "Intermediate",
                    progress: 0,
                    color: "bg-amber-500",
                    chapters: [],
                    instructor: "AI Tutor",
                    rating: 4.9,
                    students: 0,
                    tags: ["Quiz", "Daily", "Practice"],
                    notesCount: 0
                });
            }

            if (!hasWeeklyMock) {
                finalList.push({
                    id: "personalized-mock-001",
                    title: "Your Weekly Mock Test",
                    description: "Comprehensive weekly mock exams to simulate real test conditions and track progress.",
                    image: "",
                    category: "Your Weekly Mock Test",
                    duration: "3 Hours",
                    lessons: [{ title: "Access Weekly Mock", duration: "180 mins" }],
                    level: "Advanced",
                    progress: 0,
                    color: "bg-rose-500",
                    chapters: [],
                    instructor: "Exam Board",
                    rating: 5.0,
                    students: 0,
                    tags: ["Mock", "Weekly", "Exam"],
                    notesCount: 0
                });
            }

            setCourses(finalList);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        } finally {
            setLoading(false);
        }
    }, [transformCourse, config, selectedCourse]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    return { courses, loading, refetch: fetchCourses };
};
