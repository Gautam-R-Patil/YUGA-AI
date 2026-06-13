import { Course, Lesson } from "../../../core/types";

export interface MCQQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    basicAnswer?: string;
    subject: string;
    topic?: string;
    tags?: string[];
    type_of_question?: string;
    section?: number;
    sectionQuestionIndex?: number;
    image?: string;
    imageContentType?: string;
    imageOcrText?: string;
    answerImage?: string;
    answerImageContentType?: string;
    answerImageOcrText?: string;
}

export interface AIClassroomProps {
    course: Course;
    lesson: Lesson;
    isOpen: boolean;
    onClose: () => void;
    onReport?: () => void;
}

export const Languages: { [key: string]: { label: string; native: string; badge: string } } = {
    'english': { label: 'English', native: 'English', badge: 'EN' },
    'hindi': { label: 'Hindi', native: 'हिंदी', badge: 'HIN' },
    'bengali': { label: 'Bengali', native: 'বাংলা', badge: 'BEN' },
    'malayalam': { label: 'Malayalam', native: 'മലയാളം', badge: 'MAL' },
    'telugu': { label: 'Telugu', native: 'తెలుగు', badge: 'TEL' },
    'marathi': { label: 'Marathi', native: 'मराठी', badge: 'MAR' },
    'tamil': { label: 'Tamil', native: 'தமிழ்', badge: 'TAM' },
    'kannada': { label: 'Kannada', native: 'ಕನ್ನಡ', badge: 'KAN' },
    'gujarati': { label: 'Gujarati', native: 'ગુજરાતી', badge: 'GUJ' },
};
