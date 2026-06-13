export const normalizeCategory = (category: string): string => {
    const cat = category.toLowerCase().replace(/\s+/g, '');
    if (cat === 'neet' || cat === 'neetmcq') return 'NEET AI Examiner';
    if (cat === 'physicsmcq' || cat === 'physicsmcq' || cat === 'neetmcqphysics' || cat === 'neetphysicsmcq') return 'NEET Physics MCQs';
    if (cat === 'chemistrymcq' || cat === 'neetchemistrymcq') return 'NEET Chemistry MCQs';
    if (cat === 'biologymcq' || cat === 'neetbiologymcq') return 'NEET Biology MCQs';
    if (cat === 'mathematics' || cat === 'math') return 'Mathematics';
    if (cat === 'science') return 'Science';
    if (cat === 'socialscience') return 'SocialScience';
    if (cat === 'english') return 'English';
    if (cat === 'hindi') return 'Hindi';
    if (cat === 'computerscience') return 'ComputerScience';
    return 'NEET AI Examiner';
};

import { API_BASE_URL } from '../../../core/utils/api';

export const getApiUrl = () => {
    return `${API_BASE_URL}/voice/query`;
};
