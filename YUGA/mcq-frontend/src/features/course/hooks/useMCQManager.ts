import { useState } from 'react';
import { apiRequest } from '../../../core/utils/api';
import { trackEvent, trackAssessmentEvent, trackAIEvent } from '../../../core/utils/analytics';
import { useToast } from '../../../core/contexts/ToastContext';
import { MCQQuestion } from '../types';
import { neetPhysicsQuestions, neetChemistryQuestions, neetBiologyQuestions } from '../data/questions';

export const useMCQManager = (courseCategory: string) => {
    const { error: toastError } = useToast();
    const [neetAIExaminerQuestions, setNeetAIExaminerQuestions] = useState<MCQQuestion[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [currentNEET2Question, setCurrentNEET2Question] = useState<MCQQuestion | null>(null);
    const [currentNEET2QuestionIndex, setCurrentNEET2QuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [isCorrect, setIsCorrect] = useState<boolean>(false);
    const [explanationText, setExplanationText] = useState('');
    const [isExplaining, setIsExplaining] = useState(false);
    const [showClarityPopup, setShowClarityPopup] = useState(false);
    const [waitingForClarityResponse, setWaitingForClarityResponse] = useState(false);
    const [shouldShowClarityPopup, setShouldShowClarityPopup] = useState(false);

    const fetchNEETAIExaminerQuestions = async (retryCount = 0) => {
        if (neetAIExaminerQuestions.length > 0 && retryCount === 0) return;

        setIsLoadingQuestions(true);
        try {
            const encodedSubject = encodeURIComponent('NEET AI Examiner');
            const response = await apiRequest(`/mcq/subject/${encodedSubject}`, 'GET');

            if (response.ok) {
                const data = await response.json();
                setNeetAIExaminerQuestions(data);
                setIsLoadingQuestions(false);
            } else if (response.status === 503 && retryCount < 3) {
                const delay = 1000 * (retryCount + 1);
                setTimeout(() => {
                    fetchNEETAIExaminerQuestions(retryCount + 1);
                }, delay);
                return;
            } else if (response.status === 404) {
                console.warn('No NEET AI Examiner questions found in database');
                toastError('No exam questions available at this time.');
                setIsLoadingQuestions(false);
            } else {
                toastError('Failed to load exam questions. Please try again.');
                setIsLoadingQuestions(false);
            }
        } catch (error) {
            if (retryCount < 3) {
                const delay = 1000 * (retryCount + 1);
                setTimeout(() => {
                    fetchNEETAIExaminerQuestions(retryCount + 1);
                }, delay);
                return;
            }
            toastError('Failed to load exam questions after multiple attempts.');
            setIsLoadingQuestions(false);
        }
    };

    const generateMCQForSubject = (subjectCat: string): MCQQuestion[] => {
        const subjectMapping: Record<string, string> = {
            'Mathematics': 'Mathematics',
            'Math': 'Mathematics',
            'Science': 'Science',
            'Physics': 'Science',
            'Chemistry': 'Science',
            'Biology': 'Science',
            'Social Science': 'Social Science',
            'History': 'Social Science',
            'Geography': 'Social Science',
            'English': 'English',
            'Literature': 'English',
            'Language Arts': 'English',
            'NEET': 'NEET AI Examiner',
            'NEET AI Examiner': 'NEET AI Examiner',
            'NEET Physics MCQs': 'NEET Physics MCQs',
            'NEET Chemistry MCQs': 'NEET Chemistry MCQs',
            'NEET Biology MCQs': 'NEET Biology MCQs',
        };

        const subject = subjectMapping[subjectCat] || 'Mathematics';

        if (subject === 'NEET AI Examiner') {
            if (neetAIExaminerQuestions.length > 0) {
                const allPhysicsQuestions = neetAIExaminerQuestions.filter(q =>
                    q.type_of_question && q.type_of_question.toLowerCase() === 'physics'
                );

                const allChemistryQuestions = neetAIExaminerQuestions.filter(q =>
                    q.type_of_question && q.type_of_question.toLowerCase() === 'chemistry'
                );

                const allBiologyQuestions = neetAIExaminerQuestions.filter(q =>
                    q.type_of_question && q.type_of_question.toLowerCase() === 'biology'
                );

                const sections: MCQQuestion[][] = [];

                for (let sectionNum = 1; sectionNum <= 3; sectionNum++) {
                    const sectionQuestions: MCQQuestion[] = [];
                    const physicsCount = 3;
                    const chemistryCount = 3;
                    const biologyCount = 4;

                    const physicsStart = (sectionNum - 1) * physicsCount;
                    const physicsEnd = physicsStart + physicsCount;
                    const sectionPhysics = allPhysicsQuestions.slice(physicsStart, physicsEnd);

                    const chemistryStart = (sectionNum - 1) * chemistryCount;
                    const chemistryEnd = chemistryStart + chemistryCount;
                    const sectionChemistry = allChemistryQuestions.slice(chemistryStart, chemistryEnd);

                    const biologyStart = (sectionNum - 1) * biologyCount;
                    const biologyEnd = biologyStart + biologyCount;
                    const sectionBiology = allBiologyQuestions.slice(biologyStart, biologyEnd);

                    sectionQuestions.push(...sectionPhysics);
                    sectionQuestions.push(...sectionChemistry);
                    sectionQuestions.push(...sectionBiology);

                    sectionQuestions.forEach((q, index) => {
                        q.section = sectionNum;
                        q.sectionQuestionIndex = index + 1;
                    });

                    sections.push(sectionQuestions);
                }
                const combinedQuestions = sections.flat();
                return combinedQuestions.map(question => ({
                    ...question,
                    explanation: ''
                }));
            } else {
                return [];
            }
        }

        const mcqQuestions: Record<string, MCQQuestion[]> = {
            'Mathematics': [
                {
                    id: 'MATH-MCQ-1',
                    question: 'What is the value of √16?',
                    options: ['2', '4', '8', '16'],
                    correctAnswer: '4',
                    explanation: '√16 = 4 because 4 × 4 = 16.',
                    subject: 'Mathematics'
                }
            ],
            'Science': [
                {
                    id: 'SCI-MCQ-1',
                    question: 'What is the chemical symbol for water?',
                    options: ['H₂O', 'CO₂', 'O₂', 'H₂'],
                    correctAnswer: 'H₂O',
                    explanation: 'Water has the chemical formula H₂O.',
                    subject: 'Science'
                }
            ],
            'Social Science': [
                {
                    id: 'SS-MCQ-1',
                    question: 'In which year did World War II end?',
                    options: ['1944', '1945', '1946', '1947'],
                    correctAnswer: '1945',
                    explanation: 'World War II ended in 1945.',
                    subject: 'Social Science'
                }
            ],
            'English': [
                {
                    id: 'ENG-MCQ-1',
                    question: 'Who wrote "Romeo and Juliet"?',
                    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
                    correctAnswer: 'William Shakespeare',
                    explanation: '"Romeo and Juliet" is one of William Shakespeare\'s most famous plays.',
                    subject: 'English'
                }
            ],
            'NEET Physics MCQs': neetPhysicsQuestions,
            'NEET Chemistry MCQs': neetChemistryQuestions,
            'NEET Biology MCQs': neetBiologyQuestions
        };

        return mcqQuestions[subject] || mcqQuestions['Mathematics'];
    };

    const getQuestions = () => {
        switch (courseCategory) {
            case 'NEET Physics MCQs':
                return neetPhysicsQuestions;
            case 'NEET Chemistry MCQs':
                return neetChemistryQuestions;
            case 'NEET Biology MCQs':
                return neetBiologyQuestions;
            case 'NEET AI Examiner':
                return generateMCQForSubject(courseCategory);
            default:
                return neetPhysicsQuestions;
        }
    };

    const handleAnswer = (selectedAnswer: string, correctAnswer: string) => {
        setUserAnswer(selectedAnswer);
        const correct = selectedAnswer === correctAnswer;
        setIsCorrect(correct);

        trackAssessmentEvent('mcq_answer', correct ? 1 : 0, 1);
        trackEvent('NEET MCQ', correct ? 'correct_answer' : 'wrong_answer', `${courseCategory} - Question ${currentNEET2QuestionIndex + 1}`);

        return correct;
    };

    const prepareExplanationRequest = () => {
        trackEvent('NEET MCQ', 'request_explanation', `${courseCategory} - Question ${currentNEET2QuestionIndex + 1}`);
        trackAIEvent('explanation_request', 'NEET MCQ');

        setIsExplaining(true);
        setExplanationText('');
        setShowClarityPopup(false);
        setWaitingForClarityResponse(false);
        setShouldShowClarityPopup(true);
    };

    return {
        neetAIExaminerQuestions,
        isLoadingQuestions,
        currentNEET2Question,
        setCurrentNEET2Question,
        currentNEET2QuestionIndex,
        setCurrentNEET2QuestionIndex,
        userAnswer,
        setUserAnswer,
        isCorrect,
        setIsCorrect,
        explanationText,
        setExplanationText,
        isExplaining,
        setIsExplaining,
        showClarityPopup,
        setShowClarityPopup,
        waitingForClarityResponse,
        setWaitingForClarityResponse,
        shouldShowClarityPopup,
        setShouldShowClarityPopup,
        fetchNEETAIExaminerQuestions,
        getQuestions,
        handleAnswer,
        prepareExplanationRequest
    };
};
