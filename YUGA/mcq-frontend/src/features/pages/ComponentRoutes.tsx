import React, { lazy, Suspense } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
// Lazy load modals to reduce initial payload
const AuthModal = lazy(() => import("../auth/components/AuthModal").then(module => ({ default: module.AuthModal })));
const ProfileModal = lazy(() => import("../user/components/ProfileModal").then(module => ({ default: module.ProfileModal })));
const ChatInterface = lazy(() => import("../../shared/components/ChatInterface").then(module => ({ default: module.ChatInterface })));
const DoubtSolver = lazy(() => import("../doubts/components/DoubtSolver").then(module => ({ default: module.DoubtSolver })));

const YugaTimerPopup = lazy(() => import("../../shared/components/YugaTimerPopup").then(module => ({ default: module.YugaTimerPopup })));
import { AIClassroom } from "../course/components/AIClassroom";
import { NEETPracticeInterface } from "../course/components/NEETPracticeInterface";
import { ChapterSelection } from "../course/components/ChapterSelection";
import { Course, Lesson } from "../../core/types";
import { useCourse } from "../../core/contexts/CourseContext";

// Auth Wrapper
export const AuthPage = () => {
    const navigate = useNavigate();
    // Default to login, but could parse query param ?mode=signup
    return (
        <Suspense fallback={<div className="min-h-screen bg-[rgb(var(--background))]" />}>
            <AuthModal
                isOpen={true}
                onClose={() => navigate('/')}
                initialMode="login"
            />
        </Suspense>
    );
};

// Profile Wrapper
export const ProfilePage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--text-primary))] p-4 transition-colors duration-300">
            <Suspense fallback={null}>
                <ProfileModal
                    isOpen={true}
                    onClose={() => navigate('/')}
                />
            </Suspense>
        </div>
    );
};

// Chat Wrapper
export const ChatPage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--text-primary))] transition-colors duration-300">
            <Suspense fallback={null}>
                <ChatInterface
                    isOpen={true}
                    onClose={() => navigate('/')}
                />
            </Suspense>
        </div>
    );
};

// Doubt Solver Wrapper
export const DoubtPage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--text-primary))] transition-colors duration-300">
            <Suspense fallback={null}>
                <DoubtSolver
                    isOpen={true}
                    onClose={() => navigate('/')}
                />
            </Suspense>
        </div>
    );
};

// Planner Wrapper
export const PlannerPage = () => {
    const navigate = useNavigate();
    return (
        <Suspense fallback={<div className="min-h-screen bg-[rgb(var(--background))]" />}>
            <YugaTimerPopup
                isOpen={true}
                onClose={() => navigate('/')}
            />
        </Suspense>
    );
};

// Chapter Selection Page
export const ChapterSelectionPage = () => {
    const navigate = useNavigate();
    const { subject } = useParams<{ subject: string }>();
    const { selectedCourse } = useCourse();

    const handleChapterSelect = (chapter: string, className: string, topic?: string) => {
        // We'll navigate to the classroom with state
        // Construct the AI course object similar to App.tsx logic
        const lessonTitle = topic ? `${topic}` : `${chapter} - ${className}`;
        const lessonId = topic
            ? `topic-${topic.toLowerCase().replace(/\s+/g, '-')}`
            : `chapter-${chapter.toLowerCase().replace(/\s+/g, '-')}`;

        const chapterLesson = {
            id: lessonId,
            title: lessonTitle,
            content: topic ? `Generating lecture for ${topic}...` : `Welcome to ${chapter}...`,
            type: "interactive" as const,
            duration: "15 mins",
            completed: false,
            dateAdded: new Date().toISOString().split('T')[0],
            isAIGenerated: !!topic,
            isDynamic: !!topic,
            originalChapter: chapter,
            originalSubject: subject,
            originalClass: className
        };

        const chapterCourse: Course = {
            id: `course-${subject?.toLowerCase().replace(/\s+/g, '-')}-${className.toLowerCase().replace(/\s+/g, '-')}`,
            title: `${subject} - ${chapter}`,
            description: `Chapter ${chapter}`,
            image: "",
            category: subject || '',
            duration: "45 mins",
            lessons: [chapterLesson],
            level: "Intermediate",
            progress: 0,
            color: "bg-blue-500",
            chapters: [{ title: chapter }],
            instructor: "AI Tutor",
            rating: 4.5,
            students: 1000,
            tags: [subject || '', className, chapter],
            notesCount: 0
        };

        navigate('/classroom', { state: { course: chapterCourse, lesson: chapterLesson } });
    };

    if (!subject) {
        navigate('/');
        return null;
    }

    // Decode subject if URL encoded
    const decodedSubject = decodeURIComponent(subject);

    return (
        <ChapterSelection
            subject={decodedSubject}
            courseType={selectedCourse}
            onBack={() => navigate('/')}
            onChapterSelect={handleChapterSelect}
        />
    );
};

import { PracticeSetSelection } from "../course/components/PracticeSetSelection";

// Practice Wrapper
export const NEETPracticePage = () => {
    const { subject } = useParams<{ subject: string }>();
    const navigate = useNavigate();
    const [selectedSet, setSelectedSet] = React.useState<number | null>(null);
    const [initialQuestionIndex, setInitialQuestionIndex] = React.useState(0);

    // If no subject, redirect
    if (!subject) {
        navigate('/');
        return null;
    }

    const decodedSubject = decodeURIComponent(subject);

    if (selectedSet) {
        return (
            <NEETPracticeInterface
                subjectProp={decodedSubject}
                initialSet={selectedSet}
                initialQuestionIndex={initialQuestionIndex}
                onExit={() => {
                    setSelectedSet(null);
                    setInitialQuestionIndex(0);
                }}
            />
        );
    }

    return (
        <PracticeSetSelection
            subject={decodedSubject}
            onBack={() => navigate('/')}
            onSelectSet={(setNum, startIndex = 0) => {
                setSelectedSet(setNum);
                setInitialQuestionIndex(startIndex);
            }}
        />
    );
};

// Classroom Page
export const ClassroomPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { course: Course; lesson: Lesson } | undefined;

    if (!state || !state.course || !state.lesson) {
        // If accessed directly without state, redirect to dashboard
        // Ideally we would fetch by ID, but without backend API for single lesson, we redirect
        React.useEffect(() => {
            navigate('/');
        }, [navigate]);
        return null;
    }

    return (
        <AIClassroom
            course={state.course}
            lesson={state.lesson}
            isOpen={true}
            onClose={() => navigate('/')}
        />
    );
};

