import { useState, useEffect } from 'react';
import { Bell, BookOpen, Search, Trophy } from 'lucide-react';
import { getDynamicNotification } from '../../../../core/utils/mockData';
import { trackEvent } from '../../../../core/utils/analytics';
import { Course } from '../../../../core/types';

export interface NotificationAction {
    title: string;
    message: string;
    actionLabel: string;
    action: () => void;
    gradient: string;
    icon: React.ElementType;
    type: 'live' | 'reminder' | 'tip';
}

interface UseDashboardNotificationsProps {
    onCourseClick: (course: Course) => void;
    onDoubtSolverToggle: (isOpen: boolean) => void;
}

// Special Course Object for the Mock Test
const neetMockTestCourse: Course = {
    id: 'neet-mock-live-1',
    title: 'NEET AI Examiner - All India Mock Test',
    description: 'Live high-yield mock test covering Physics, Chemistry, and Biology. Challenge yourself against AI-generated questions.',
    category: 'NEET AI Examiner',
    level: 'Advanced',
    duration: '30 mins',
    lessons: [
        {
            id: 'mock-1',
            title: 'Full Syllabus Mock Test',
            content: 'Live assessment',
            type: 'quiz',
            duration: '30 min',
            completed: false,
            resources: [],
            dateAdded: 'Today',
            thumbnailUrl: '',
            images: []
        }
    ],
    progress: 0,
    image: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=400',
    color: 'bg-gradient-to-br from-red-600 to-rose-700',
    instructor: 'AI Examiner',
    rating: 5.0,
    notesCount: 0,
    students: 12500,
    tags: ['Live', 'Test', 'NEET'],
    chapters: []
};

export const useDashboardNotifications = ({ onCourseClick, onDoubtSolverToggle }: UseDashboardNotificationsProps) => {
    const [activeNotification, setActiveNotification] = useState<NotificationAction | null>(null);

    const handleStartMockTest = () => {
        trackEvent('Mock Test', 'start', 'NEET AIT 2024');
        onCourseClick(neetMockTestCourse);
    };

    useEffect(() => {
        const triggerNotification = () => {
            const dynamicNotif = getDynamicNotification();

            let IconV = Bell;
            let actionFn = () => { };

            if (dynamicNotif.title.includes('Mock')) {
                IconV = Bell;
                actionFn = handleStartMockTest;
            } else if (dynamicNotif.title.includes('Physics') || dynamicNotif.title.includes('Chemistry')) {
                IconV = BookOpen;
                actionFn = () => {
                    const coursesSection = document.getElementById('courses-section');
                    if (coursesSection) coursesSection.scrollIntoView({ behavior: 'smooth' });
                };
            } else if (dynamicNotif.title.includes('Doubt')) {
                IconV = Search;
                actionFn = () => onDoubtSolverToggle(true);
            } else if (dynamicNotif.title.includes('Achievement')) {
                IconV = Trophy;
            }

            setActiveNotification({
                ...dynamicNotif,
                icon: IconV,
                action: actionFn
            });

            setTimeout(() => {
                setActiveNotification(null);
            }, 10000);
        };

        const initialTimer = setTimeout(() => {
            triggerNotification();
        }, 3000);

        const interval = setInterval(triggerNotification, 60000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    return { activeNotification, setActiveNotification };
};
