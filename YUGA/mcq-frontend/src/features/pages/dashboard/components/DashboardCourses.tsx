import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { trackEvent } from "../../../../core/utils/analytics";
import { CourseCard } from "../../../../shared/components/CourseCard";
import { Course } from "../../../../core/types";
import { useCourse } from "../../../../core/contexts/CourseContext";

interface DashboardCoursesProps {
    onCourseClick: (course: Course) => void;
    courses: Course[];
    loading: boolean;
}

export const DashboardCourses: React.FC<DashboardCoursesProps> = ({ onCourseClick, courses, loading }) => {
    const [courseSearchQuery, setCourseSearchQuery] = useState("");
    const { config } = useCourse();

    return (
        <div className="mb-8" id="courses-section">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white shadow-sm">
                        {config.label} Hub
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
                        Explore {config.label} subjects or continue your learning journey
                    </p>
                </div>
                <div className="relative w-full lg:w-auto">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder={config.searchPlaceholder}
                        value={courseSearchQuery}
                        onChange={(e) => {
                            setCourseSearchQuery(e.target.value);
                            if (e.target.value) {
                                trackEvent('Search', 'course_search', e.target.value);
                            }
                        }}
                        className="w-full lg:w-96 pl-12 pr-12 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-purple-500 transition-all duration-300 shadow-sm hover:shadow-md text-gray-900 dark:text-white"
                    />
                    {courseSearchQuery && (
                        <button
                            onClick={() => setCourseSearchQuery("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="w-full">
                <CourseCard
                    onCourseClick={onCourseClick}
                    searchQuery={courseSearchQuery}
                    courses={courses}
                    loading={loading}
                />
            </div>
        </div>
    );
};
