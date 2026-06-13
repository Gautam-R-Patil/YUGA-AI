import { useEffect } from "react";
import { useAuth } from "../../../core/contexts/AuthContext";
import { Course } from "../../../core/types";
import { useLocation, useOutletContext } from "react-router-dom";
import { DashboardHero } from "./components/DashboardHero";
import { DashboardCourses } from "./components/DashboardCourses";
import { CrashCoursesSection } from "./components/CrashCoursesSection";
import { DashboardNotification } from "./components/DashboardNotification";
import { IQQuizSection } from "./components/IQQuizSection";
import { useDashboardNotifications } from "./hooks/useDashboardNotifications";
import { useCourseData } from "../../../core/hooks/useCourseData";

interface DashboardContext {
    onCourseClick: (course: Course) => void;
    onDoubtSolverToggle: (isOpen: boolean) => void;
    onChatToggle: (isOpen: boolean) => void;
}

export const DashboardPage = () => {
    const { onCourseClick, onDoubtSolverToggle, onChatToggle } = useOutletContext<DashboardContext>();
    const { user } = useAuth();
    const location = useLocation();

    // Notification Hook
    const { activeNotification, setActiveNotification } = useDashboardNotifications({
        onCourseClick,
        onDoubtSolverToggle
    });

    // Data Fetching (Lifted state)
    const { courses, loading } = useCourseData();



    // Prevent accidental back exit
    useEffect(() => {
        // Push a state so that popping it just brings us back here
        window.history.pushState(null, "", window.location.href);

        const handlePopState = () => {
            // Check if we want to confirm exit? For now just stay.
            // If user presses back, we just push state again effectively cancelling it.
            window.history.pushState(null, "", window.location.href);
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    return (
        <div className="animate-fade-in">
            {/* Dynamic Notification Popup */}
            <DashboardNotification
                notification={activeNotification}
                onClose={() => setActiveNotification(null)}
            />

            {/* IQ Quiz Banner - Separate Section at the top */}
            <IQQuizSection />

            {/* Hero Section */}
            <DashboardHero user={user} onChatToggle={onChatToggle} />

            {/* Course Search & List */}
            <DashboardCourses
                onCourseClick={onCourseClick}
                courses={courses}
                loading={loading}
            />

            {/* Crash Courses Classes (One-shot classes per chapter) */}
            <CrashCoursesSection
                initialSubjectKey={(location.state as any)?.crashSubjectKey || null}
            />

            {/* Add shine animation to global styles */}
            <style>{`
                @keyframes shine {
                    to {
                        left: 150%;
                    }
                }
                .animate-shine {
                    animation: shine 1.5s ease-in-out;
                }
                @keyframes slide-in-top {
                    0% { transform: translateY(-20px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-in-top {
                    animation: slide-in-top 0.5s ease-out forwards;
                }
                .animate-bounce-slow {
                    animation: bounce 2s infinite;
                }
                @keyframes slide-in-right {
                    0% { transform: translateX(100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

