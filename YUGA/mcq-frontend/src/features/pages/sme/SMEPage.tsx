import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../core';
import { apiRequest } from '../../../core/utils/api';
import { Course, Lesson } from '../../../core/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    AlertCircle,
    PlayCircle,
    Check,
    X,
    Save,
    ChevronRight,
    ClipboardCheck,
    LayoutTemplate,
    ChevronLeft,
    BookOpen,
    FileText,
    Download,
    Lock,
    RefreshCw
} from 'lucide-react';

import { getThumbnail, getCourseDescription } from '../../../shared/components/CourseCard';
import { NEETPracticeInterface } from '../../course/components/NEETPracticeInterface';
import { AIClassroom } from '../../course/components/AIClassroom';

type TabType = 'mcq' | 'classes' | 'mock_test' | 'oneshorts';
type CourseType = 'NEET' | 'JEE';

interface ReportData {
    evaluatorName: string;
    email: string;
    subject: string;
    questionNo: string;
    qErrors: string;
    qImageFine: string;
    qRemarks: string;
    optCorrect: string;
    optRight: string;
    optRemarks: string;
    shortLogic: string;
    shortPronunciation: string;
    shortRemarks: string;
    detailLogic: string;
    detailPronunciation: string;
    detailRemarks: string;
    doubtVoice: 'Yes' | 'No' | 'NA' | '';
    doubtPronunciation: 'Yes' | 'No' | 'NA' | '';
    doubtRemarks: string;
}

interface RecheckData {
    evaluatorName: string;
    email: string;
    subject: string;
    questionNo: string;
    hasIssues: 'Yes' | 'No' | '';
    remarks: string;
}

const initialReportData: ReportData = {
    evaluatorName: '', email: '', subject: '', questionNo: '',
    qErrors: '', qImageFine: '', qRemarks: '',
    optCorrect: '', optRight: '', optRemarks: '',
    shortLogic: '', shortPronunciation: '', shortRemarks: '',
    detailLogic: '', detailPronunciation: '', detailRemarks: '',
    doubtVoice: '', doubtPronunciation: '', doubtRemarks: ''
} as ReportData;

const initialRecheckData: RecheckData = {
    evaluatorName: '',
    email: '',
    subject: '',
    questionNo: '',
    hasIssues: '',
    remarks: ''
};

interface ItemData {
    id: string;
    title: string;
    status: string;
    type?: 'folder' | 'file';
    children?: ItemData[];
    isDynamic?: boolean;
    originalSubject?: string | null;
    originalClass?: string;
    originalChapter?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fullData?: any;
    password?: string;
}

interface HierarchicalData {
    mcq: {
        NEET: Record<string, ItemData[]>;
        JEE: Record<string, ItemData[]>;
    };
    classes: {
        NEET: Record<string, ItemData[]>;
        JEE: Record<string, ItemData[]>;
    };
    mock_test: {
        NEET: Record<string, ItemData[]>;
        JEE: Record<string, ItemData[]>;
    };
    oneshorts: {
        NEET: Record<string, ItemData[]>;
        JEE: Record<string, ItemData[]>;
    };
}

export function SMEPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('mock_test');
    const [activeCourse, setActiveCourse] = useState<CourseType>('NEET');
    const [activeSubject, setActiveSubject] = useState<string | null>(null);
    const [activeSet, setActiveSet] = useState<ItemData | null>(null);
    const [folderStack, setFolderStack] = useState<ItemData[]>([]);
    const [activeClass, setActiveClass] = useState<ItemData | null>(null);

    const [data, setData] = useState<HierarchicalData>({ 
        mcq: { NEET: {}, JEE: {} }, 
        classes: { NEET: {}, JEE: {} }, 
        mock_test: { NEET: {}, JEE: {} },
        oneshorts: { NEET: {}, JEE: {} } 
    });
    const [isLoading, setIsLoading] = useState(true);

    // Questions specifically fetched when a Set is clicked
    const [setQuestions, setSetQuestions] = useState<ItemData[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

    const [selectedReportItem, setSelectedReportItem] = useState<ItemData | null>(null);
    const [selectedRecheckItem, setSelectedRecheckItem] = useState<ItemData | null>(null);
    const [reportData, setReportData] = useState<ReportData>(initialReportData);
    const [recheckData, setRecheckData] = useState<RecheckData>(initialRecheckData);
    const [showToast, setShowToast] = useState(false);

    // Saved Reports State
    const [savedReports, setSavedReports] = useState<{ id: string; date: string; content: string; subject: string; qid: string }[]>(() => {
        const localData = localStorage.getItem('sme_saved_reports');
        return localData ? JSON.parse(localData) : [];
    });
    const [showSavedReports, setShowSavedReports] = useState(false);

    useEffect(() => {
        let isMounted = true;
        async function fetchRealData() {
            try {
                const res = await apiRequest('/mcq/admin/data');

                if (!res.ok) throw new Error('Failed to fetch SME data');
                const smeJson = await res.json();

                if (isMounted) {
                    const processedData = { ...smeJson };

                    setData(processedData);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Failed compiling actual platform data: ", err);
                if (isMounted) setIsLoading(false);
            }
        }
        fetchRealData();
        return () => { isMounted = false; };
    }, []);

    // Fetch questions when a set is selected (supports mcq and mock_test)
    useEffect(() => {
        let isMounted = true;
        if (!activeSet || (activeTab !== 'mcq' && activeTab !== 'mock_test')) return;

        async function fetchQuestions() {
            setIsLoadingQuestions(true);
            try {
                if (activeTab === 'mcq') {
                    const setNumStr = activeSet?.fullData?.setId?.replace('Set', '') || '1';
                    const subjectQuery = activeSubject?.toLowerCase();
                    const res = await apiRequest(`/mcq/subject/practice?subject=${subjectQuery}&set=${setNumStr}&count=100`);
                    if (res.ok) {
                        const qs = await res.json();
                        if (isMounted) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const mcqItems: ItemData[] = qs.map((q: any, index: number) => {
                                // Enhanced normalization for Biology-specific SME roles
                                if (q.subject === 'Biology' && activeSubject) {
                                    if (activeSubject.toLowerCase().includes('botany')) q.subject = 'Botany';
                                    else if (activeSubject.toLowerCase().includes('zoology')) q.subject = 'Zoology';
                                }
                                return {
                                    id: String(q._id || q.id || Math.random()) + `-${index}`,
                                    title: `[${q.subject || 'MCQ'}] ${(q.question || q.text) ? ((q.question || q.text).replace(/\[IMG:.*?\]/g, '').substring(0, 80) + '...') : 'Unknown Question'}`,
                                    status: 'pending',
                                    fullData: q
                                };
                            });
                            setSetQuestions(mcqItems);
                            setIsLoadingQuestions(false);
                        }
                    } else {
                        if (isMounted) {
                            setSetQuestions([]);
                            setIsLoadingQuestions(false);
                        }
                    }
                } else if (activeTab === 'mock_test') {
                    // mock tests are exposed as subjects like 'neet-mock-1' handled by backend
                    const mockId = activeSet?.fullData?.mockId || activeSet?.fullData?.mock_id || activeSet?.id;
                    if (!mockId) {
                        setIsLoadingQuestions(false);
                        return;
                    }
                    const res = await apiRequest(`/mcq/subject/${encodeURIComponent(mockId)}?count=500`);
                    if (res.ok) {
                        const qs = await res.json();
                        if (isMounted) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const mcqItems: ItemData[] = qs.map((q: any, index: number) => {
                                // Ensure mock questions also reflect the specific subject for reporting
                                if (q.subject === 'Biology' && activeSubject) {
                                    if (activeSubject.toLowerCase().includes('botany')) q.subject = 'Botany';
                                    else if (activeSubject.toLowerCase().includes('zoology')) q.subject = 'Zoology';
                                }
                                return {
                                    id: String(q._id || q.original_id || q.id || Math.random()) + `-${index}`,
                                    title: `[${q.subject || 'MCQ'}] ${(q.question || q.text) ? ((q.question || q.text).replace(/\[IMG:.*?\]/g, '').substring(0, 80) + '...') : 'Unknown Question'}`,
                                    status: 'pending',
                                    fullData: q
                                };
                            });
                            setSetQuestions(mcqItems);
                            setIsLoadingQuestions(false);
                        }
                    } else {
                        if (isMounted) {
                            setSetQuestions([]);
                            setIsLoadingQuestions(false);
                        }
                    }
                }
            } catch (e) {
                console.error('Error fetching questions for set:', e);
                if (isMounted) {
                    setSetQuestions([]);
                    setIsLoadingQuestions(false);
                }
            }
        }
        fetchQuestions();
        return () => { isMounted = false; };
    }, [activeSet, activeTab, activeSubject]);


    // Handle Tab/Course change reset
    useEffect(() => {
        setActiveSubject(null);
        setActiveSet(null);
        setFolderStack([]);
        setActiveClass(null);
        setSetQuestions([]);
    }, [activeTab, activeCourse]);


    const handleCheckItem = (id: string, isQuestion: boolean = false) => {
        if (isQuestion) {
            setSetQuestions(prev => prev.map(item =>
                item.id === id ? { ...item, status: item.status === 'checked' ? 'pending' : 'checked' } : item
            ));
        } else {
            // Update the set or class status locally
            const itemsRecord = data[activeTab][activeCourse];
            if (activeSubject && itemsRecord[activeSubject]) {
                const mapped = itemsRecord[activeSubject].map(item =>
                    item.id === id ? { ...item, status: item.status === 'checked' ? 'pending' : 'checked' } : item
                );
                setData(prev => ({
                    ...prev,
                    [activeTab]: {
                        ...prev[activeTab],
                        [activeCourse]: {
                            ...prev[activeTab][activeCourse],
                            [activeSubject]: mapped
                        }
                    }
                }));
            }
        }
    };

    const handleReportSubmit = async () => {
        // Extract plain text or raw HTML for question and options if available
        const rawText = selectedReportItem?.fullData?.question || selectedReportItem?.fullData?.text || selectedReportItem?.fullData?.question_text || '';
        const questionText = rawText ? rawText.replace(/<[^>]*>?/gm, '') : 'N/A';

        const optionsList = selectedReportItem?.fullData?.options
            ? selectedReportItem.fullData.options.map((opt: string, i: number) => `    ${String.fromCharCode(65 + i)}. ${opt.replace(/<[^>]*>?/gm, '')}`).join('\n')
            : 'N/A';

        const setName = activeSet?.title || 'Unknown Set';

        const formattedReport = `Mock Test\nCourse: ${activeCourse}\nSet: ${setName}\n\nName of the evaluator: ${reportData.evaluatorName}\nEmail: ${reportData.email}\nSubject: ${reportData.subject}\nQuestion No.: ${reportData.questionNo}\n\n------------- QUESTION DETAILS -------------\n${questionText}\n\nOptions:\n${optionsList}\n------------------------------------------\n\n(A) Question:\n(i) Errors on the question: ${reportData.qErrors}\n(ii) If there are any images, is the image fine?: ${reportData.qImageFine}\n(iii) Remarks, if any: ${reportData.qRemarks}\n\n(B) Options?\n(i) are the options correct: ${reportData.optCorrect}\n(ii) is the answer given as correct is right?: ${reportData.optRight}\n(iii) Remarks, if any: ${reportData.optRemarks}\n\n(C) Short Explanation\n(i) Is the logic of the short answer correct: ${reportData.shortLogic}\n(ii) is the pronunciation of the Avatar correct: ${reportData.shortPronunciation}\n(iii) is there any Remarks/Improvements: ${reportData.shortRemarks}\n\n(D) Detailed Explanation\n(i) Is the logic of the answer correct: ${reportData.detailLogic}\n(ii) is the pronunciation of the Avatar correct: ${reportData.detailPronunciation}\n(iii) is there any Remarks/Improvements: ${reportData.detailRemarks}\n\n(E) Ask Doubt\n(i) Is the voice coming?: ${reportData.doubtVoice}\n(ii) is the pronunciation of the Avatar correct: ${reportData.doubtPronunciation}\n(iii) is there any Remarks/Improvements: ${reportData.doubtRemarks}\n`;

        // Save to LocalStorage
        const newReport = {
            id: Date.now().toString(),
            date: new Date().toLocaleString(),
            content: formattedReport,
            subject: reportData.subject,
            qid: reportData.questionNo
        };
        const updatedReports = [newReport, ...savedReports];
        setSavedReports(updatedReports);
        localStorage.setItem('sme_saved_reports', JSON.stringify(updatedReports));

        // Send Email via Backend
        try {
            await apiRequest('/mcq/admin/report', 'POST', {
                reportText: formattedReport,
                evaluatorName: reportData.evaluatorName,
                email: reportData.email,
                subject: reportData.subject,
                questionNo: reportData.questionNo
            });
        } catch (err) {
            console.error('Failed to send report email:', err);
        }

        console.log(formattedReport);
        setSelectedReportItem(null);
        setReportData(initialReportData);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleRecheckSubmit = async () => {
        const rawText = selectedRecheckItem?.fullData?.question || selectedRecheckItem?.fullData?.text || '';
        const questionText = rawText ? rawText.replace(/<[^>]*>?/gm, '') : 'N/A';
        const setName = activeSet?.title || 'Unknown Set';

        const formattedRecheck = `RECHECK REQUEST\nCourse: ${activeCourse}\nSet: ${setName}\n\n------------- EVALUATOR DETAILS -------------\nName: ${recheckData.evaluatorName}\nEmail: ${recheckData.email}\nSubject: ${recheckData.subject}\nQuestion No: ${recheckData.questionNo}\n\n------------- RECHECK FINDINGS -------------\nAre there any issues?: ${recheckData.hasIssues}\nRemarks: ${recheckData.remarks}\n\n------------- QUESTION CONTENT -------------\n${questionText}\n------------------------------------------\n`;

        try {
            await apiRequest('/mcq/admin/report', 'POST', {
                reportText: formattedRecheck,
                evaluatorName: recheckData.evaluatorName,
                email: recheckData.email,
                subject: `${recheckData.subject} (RECHECK)`,
                questionNo: recheckData.questionNo
            });
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (err) {
            console.error('Failed to send recheck email:', err);
        }

        setSelectedRecheckItem(null);
        setRecheckData(initialRecheckData);
    };

    // Memoized questions array for NEETPracticeInterface to prevent re-initialization on every render
    const memoizedSetQuestions = React.useMemo(() => {
        return setQuestions.map(q => ({
            ...q.fullData,
            id: q.id // Ensure ID matches the item mapping
        }));
    }, [setQuestions]);

    // Render Logic helpers
    const currentSubjects = Object.keys(data?.[activeTab]?.[activeCourse] || {});

    const topFolder = folderStack.length > 0 ? folderStack[folderStack.length - 1] : null;
    let currentItems: ItemData[] = [];

    const handleFolderClick = (item: ItemData) => {
        if (item.password) {
            const storageKey = `unlocked_folders_${user?.id || user?.email || 'user'}`;
            const unlockedFolders = JSON.parse(localStorage.getItem(storageKey) || '[]');

            if (!unlockedFolders.includes(item.id)) {
                const pw = window.prompt(`Enter password for ${item.title}:`);
                if (pw !== item.password) {
                    if (pw !== null) alert("Incorrect Password");
                    return;
                }
                unlockedFolders.push(item.id);
                localStorage.setItem(storageKey, JSON.stringify(unlockedFolders));
            }
        }
        setFolderStack([...folderStack, item]);
    };

    if (activeSubject && data?.[activeTab]?.[activeCourse]?.[activeSubject]) {
        if (topFolder) {
            currentItems = topFolder.children || [];
        } else if (activeTab === 'mock_test') {
            const originalItems = data[activeTab][activeCourse][activeSubject];
            const oddItems: ItemData[] = [];
            const evenItems: ItemData[] = [];
            const otherItems: ItemData[] = [];

            originalItems.forEach(item => {
                const match = item.title.match(/(\d+)/);
                const num = match ? parseInt(match[0], 10) : NaN;
                if (isNaN(num)) {
                    otherItems.push(item);
                } else if (num % 2 !== 0) {
                    oddItems.push(item);
                } else {
                    evenItems.push(item);
                }
            });

            currentItems = [
                {
                    id: 'mpt_odd_folder',
                    title: 'MPT-SIGMA',
                    status: 'grouped',
                    type: 'folder',
                    children: oddItems,
                    password: '567842'
                },
                {
                    id: 'mpt_even_folder',
                    title: 'MPT-ZETA',
                    status: 'grouped',
                    type: 'folder',
                    children: evenItems,
                    password: '875230'
                },
                ...otherItems
            ];
        } else {
            currentItems = data[activeTab][activeCourse][activeSubject];
        }
    }

    currentItems = [...currentItems].sort((a, b) => {
        // Folders first
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;

        const numA = parseInt(a.title.replace(/[^\d]/g, ''), 10);
        const numB = parseInt(b.title.replace(/[^\d]/g, ''), 10);
        if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
            return numA - numB;
        }
        return a.title.localeCompare(b.title);
    });

    const handleSMEAction = (action: 'check' | 'report' | 'recheck', questionId: string) => {
        const item = setQuestions.find(q => String(q.id) === String(questionId));
        if (!item) return;

        if (action === 'check') {
            handleCheckItem(questionId, true);
        } else if (action === 'recheck') {
            const index = setQuestions.findIndex(q => String(q.id) === String(questionId));
            const questionNumberStr = index !== -1 ? `Question ${index + 1}` : String(item.id).substring(0, 8);

            setSelectedRecheckItem(item);
            setRecheckData({
                ...initialRecheckData,
                evaluatorName: user?.fullName || user?.name || '',
                email: user?.email || '',
                subject: item.fullData?.subject || item.fullData?.Subject || (activeSubject || activeTab),
                questionNo: questionNumberStr
            });
        } else if (action === 'report') {
            const index = setQuestions.findIndex(q => String(q.id) === String(questionId));
            const questionNumberStr = index !== -1 ? `Question ${index + 1}` : String(item.id).substring(0, 8);

            setSelectedReportItem(item);
            setReportData({
                ...initialReportData,
                evaluatorName: user?.fullName || user?.name || '',
                email: user?.email || '',
                subject: item.fullData?.subject || item.fullData?.Subject || (activeSubject || activeTab),
                questionNo: questionNumberStr
            });
        }
    };

    const handleReviewClass = (item: ItemData) => {
        const coursePath = activeCourse.toLowerCase();
        let relativePath = item.fullData?.relativeSubPath;
        
        // Resilience: If the relative path doesn't include the subject folder, prepend it
        if (relativePath && !relativePath.includes('/') && activeSubject) {
            relativePath = `${activeSubject}/${relativePath}`;
        }
        
        const oneshortsPrefix = activeTab === 'oneshorts' ? `ONESHORTS::/${coursePath}/${relativePath}` : (item.fullData?.content || '');

        setActiveClass({
            ...item,
            isDynamic: true,
            originalSubject: activeSubject,
            originalClass: folderStack[0]?.title?.replace(' ', '_'),
            originalChapter: (() => {
                const chFolder = folderStack.find(f => f.title.toLowerCase().includes('chapter'));
                if (!chFolder) return undefined;
                const parts = chFolder.title.split(' ');
                if (parts[0].toLowerCase() === 'chapter' && parts.length > 2) {
                    return parts.slice(2).join(' ');
                }
                return chFolder.title;
            })(),
            fullData: {
                ...item.fullData,
                content: oneshortsPrefix,
                isDynamic: true,
                originalSubject: activeSubject,
                type: activeCourse.toLowerCase(),
                originalClass: folderStack[0]?.title?.replace(' ', '_'),
                originalChapter: (() => {
                    const chFolder = folderStack.find(f => f.title.toLowerCase().includes('chapter'));
                    if (!chFolder) return undefined;
                    const parts = chFolder.title.split(' ');
                    if (parts[0].toLowerCase() === 'chapter' && parts.length > 2) {
                        return parts.slice(2).join(' ');
                    }
                    return chFolder.title;
                })()
            }
        });
    };

    // List Item Card (Class or Set)
    const renderListCard = (item: ItemData, index: number = 0) => {
        let theme = 'purple';
        if (activeSubject?.toLowerCase().includes('biology')) theme = 'teal';
        else if (activeSubject?.toLowerCase().includes('chemistry')) theme = 'emerald';
        else if (activeSubject?.toLowerCase().includes('physics')) theme = 'violet';
        else if (activeSubject?.toLowerCase().includes('math')) theme = 'indigo';

        const gradients: Record<string, any> = {
            teal: { from: 'from-teal-500', to: 'to-emerald-500', shadow: 'shadow-teal-500/20', btnShadow: 'shadow-teal-500/40', text: 'text-teal-600', light: 'bg-teal-50', border: 'border-teal-100' },
            indigo: { from: 'from-indigo-600', to: 'to-blue-600', shadow: 'shadow-indigo-500/20', btnShadow: 'shadow-indigo-500/40', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-100' },
            violet: { from: 'from-violet-600', to: 'to-purple-600', shadow: 'shadow-violet-500/20', btnShadow: 'shadow-violet-500/40', text: 'text-violet-600', light: 'bg-violet-50', border: 'border-violet-100' },
            emerald: { from: 'from-emerald-500', to: 'to-teal-500', shadow: 'shadow-emerald-500/20', btnShadow: 'shadow-emerald-500/40', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-100' },
            purple: { from: 'from-purple-600', to: 'to-pink-600', shadow: 'shadow-purple-500/20', btnShadow: 'shadow-purple-500/40', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-100' },
        };

        const palette = gradients[theme] || gradients['purple'];
        const isClass = activeTab === 'classes';

        let displayTitle = item.title;
        let displayImage = getThumbnail(`${activeCourse} ${activeSubject} ${activeTab} ${index}`) || 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8';
        let displayDuration = '';

        // Extract detailed class properties if available
        if (isClass && item.fullData) {
            displayTitle = item.fullData.title || displayTitle;
            if (item.fullData.image) {
                displayImage = item.fullData.image;
            } else if (item.fullData.thumbnailUrl) {
                displayImage = item.fullData.thumbnailUrl;
            } else if (item.fullData.videoUrl) { // Fallback to extract video ID thumbnail if youtube
                const videoIdMatch = item.fullData.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                if (videoIdMatch && videoIdMatch[1]) {
                    displayImage = `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
                }
            }
            displayDuration = item.fullData.duration || '';
        }

        return (
            <div
                key={item.id}
                onClick={() => {
                    if (item.type === 'folder') {
                        handleFolderClick(item);
                    } else if (activeTab === 'mcq' || activeTab === 'mock_test') {
                        setActiveSet(item);
                    } else if (activeTab === 'classes' || activeTab === 'oneshorts') {
                        handleReviewClass(item);
                    }
                }}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`group relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-${theme}-500/10 dark:hover:shadow-${theme}-500/5 transition-all duration-500 border border-slate-200 dark:border-slate-800 cursor-pointer w-full hover:-translate-y-1.5 flex flex-col`}
            >
                <div className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-br ${palette.from} ${palette.to} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none`}></div>

                <div className="relative h-48 overflow-hidden shrink-0">
                    <img
                        src={`${displayImage}${displayImage.includes('youtube') ? '' : '?auto=format&fit=crop&w=800&q=75'}`}
                        alt={displayTitle}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90"></div>

                    <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex gap-2">
                                {item.type === 'folder' && (
                                    <div className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-white/10 backdrop-blur-md text-white flex items-center gap-1.5">
                                        <LayoutTemplate className="w-3.5 h-3.5" />
                                        {item.children?.length || 0} items
                                    </div>
                                )}
                                {item.password && (
                                    <div className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 backdrop-blur-md text-amber-500 flex items-center gap-1.5 border border-amber-500/30">
                                        <Lock className="w-3.5 h-3.5" />
                                        Locked
                                    </div>
                                )}
                                {displayDuration && (
                                    <div className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-black/40 backdrop-blur-md text-white flex items-center gap-1.5">
                                        <PlayCircle className="w-3.5 h-3.5" />
                                        {displayDuration}
                                    </div>
                                )}
                                {item.type !== 'folder' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleCheckItem(item.id, false); }}
                                        className={`p-1.5 rounded-full backdrop-blur-md border border-white/20 hover:scale-110 active:scale-95 transition-all ${item.status === 'checked' ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white shadow-lg'}`}
                                    >
                                        {item.status === 'checked' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>
                        </div>
                        <h3 className="text-xl font-extrabold text-white leading-snug tracking-tight drop-shadow-md line-clamp-2">
                            {displayTitle}
                        </h3>
                    </div>
                </div>

                <div className="relative p-5 flex-grow flex flex-col justify-between bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between mt-auto">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${item.status === 'checked' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                            {item.status}
                        </span>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (item.type === 'folder') {
                                    handleFolderClick(item);
                                } else if (activeTab === 'classes' || activeTab === 'oneshorts') {
                                    handleReviewClass(item);
                                } else {
                                    setActiveSet(item);
                                }
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors group-hover:bg-violet-600 group-hover:text-white"
                        >
                            <span>{item.type === 'folder' ? 'Explore' : (activeTab === 'mcq' ? 'Review' : (activeTab === 'mock_test' ? 'Take Test' : 'Watch'))}</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div >
        );
    };

    return (
        <div className="relative min-h-screen bg-slate-50 dark:bg-[#0b0f19] overflow-hidden py-8 font-sans transition-colors duration-300">
            {/* Premium Background Effects */}
            <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[80%] bg-violet-600/10 dark:bg-violet-600/20 blur-[120px] rounded-[100%] mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[70%] bg-indigo-600/10 dark:bg-indigo-600/20 blur-[100px] rounded-[100%] mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-fuchsia-600/10 dark:bg-fuchsia-600/20 blur-[130px] rounded-[100%] mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 lg:space-y-12 mt-[2rem]">
                {/* Premium Hero Card (Dark Theme Enforced) */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 border border-slate-800/80 shadow-2xl p-8 sm:p-10 lg:p-14">
                    {/* Immersive Inner Glows */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none transform -translate-x-1/3 translate-y-1/3" />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/50 via-transparent to-slate-900/50 pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700/50 text-slate-300 text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-md shadow-inner">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Quality Assurance
                            </div>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-5 drop-shadow-lg">
                                SME <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Terminal</span>
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                                Evaluate, review, and ensure the highest quality of educational content across the platform.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                            {/* Saved Reports Button */}
                            <button
                                onClick={() => setShowSavedReports(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all duration-300 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 hover:shadow-lg hover:-translate-y-1 backdrop-blur-md group"
                            >
                                <FileText className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                My Reports
                                <span className="bg-emerald-500/20 text-emerald-300 ml-1 px-3 py-1 rounded-full text-xs font-black border border-emerald-500/20">
                                    {savedReports.length}
                                </span>
                            </button>

                            {/* Main Tabs Segmented Control */}
                            <div className="flex items-center p-1.5 bg-slate-900/80 rounded-2xl border border-slate-800 w-full sm:w-auto backdrop-blur-md shadow-inner">
                                {[
                                    { id: 'mock_test', label: 'Mock Test', icon: ClipboardCheck },
                                    { id: 'mcq', label: 'Questions', icon: LayoutTemplate },
                                    { id: 'classes', label: 'Classes', icon: PlayCircle },
                                    { id: 'oneshorts', label: 'One Shot', icon: PlayCircle }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as TabType)}
                                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 relative ${activeTab === tab.id
                                            ? 'text-white'
                                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                            }`}
                                    >
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="active-main-tab"
                                                className="absolute inset-0 bg-violet-600 rounded-xl"
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        <span className="relative z-10 flex items-center gap-2">
                                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                                            {tab.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Selection Sub - Tabs */}
                <div className="flex items-center justify-center pb-4">
                    <div className="inline-flex bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50 p-1.5 rounded-2xl shadow-inner backdrop-blur-sm">
                        {(['NEET', 'JEE'] as CourseType[]).map(course => (
                            <button
                                key={course}
                                onClick={() => setActiveCourse(course)}
                                className={`flex items-center justify-center gap-2 px-12 py-3.5 rounded-xl font-black text-sm tracking-widest uppercase transition-all duration-300 relative overflow-hidden ${activeCourse === course
                                    ? 'text-white shadow-md'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                {activeCourse === course && (
                                    <motion.div
                                        layoutId="active-course"
                                        className="absolute inset-0 bg-slate-900 dark:bg-slate-700 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{course}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                {isLoading ? (
                    <div className="flex items-center justify-center p-20 text-purple-500">
                        <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin" />
                        <span className="ml-4 font-bold text-lg">Fetching platform data...</span>
                    </div>
                ) : (
                    <motion.div
                        key={`${activeTab}-${activeCourse}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Drill-down Breadcrumb / Back button */}
                        {(activeSubject || activeSet || folderStack.length > 0) && (
                            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))] font-medium mb-6">
                                <button onClick={() => { setActiveSubject(null); setActiveSet(null); setFolderStack([]); }} className="hover:text-purple-500 transition-colors">Subjects</button>
                                <ChevronRight className="w-4 h-4" />
                                {activeSubject && (
                                    <button
                                        onClick={() => { setActiveSet(null); setFolderStack([]); }}
                                        className={`transition-colors ${(activeSet || folderStack.length > 0) ? 'hover:text-purple-500' : 'text-[rgb(var(--text-primary))]'}`}
                                    >
                                        {activeSubject}
                                    </button>
                                )}
                                {folderStack.length > 0 && (
                                    <>
                                        {folderStack.map((folder, fIdx) => (
                                            <div key={folder.id} className="flex items-center gap-2">
                                                <ChevronRight className="w-4 h-4" />
                                                <span
                                                    className={`${activeSet || fIdx < folderStack.length - 1 ? 'hover:text-purple-500 transition-colors cursor-pointer' : 'text-[rgb(var(--text-primary))]'}`}
                                                    onClick={() => {
                                                        setActiveSet(null);
                                                        setFolderStack(folderStack.slice(0, fIdx + 1));
                                                    }}
                                                >
                                                    {folder.title}
                                                </span>
                                            </div>
                                        ))}
                                    </>
                                )}
                                {activeSet && (
                                    <>
                                        <ChevronRight className="w-4 h-4" />
                                        <span className="text-[rgb(var(--text-primary))]">{activeSet.title}</span>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Level 1: Subject Cards */}
                        {!activeSubject && !activeSet && (
                            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                                {currentSubjects.length > 0 ? currentSubjects.map((sub, idx) => {
                                    // Construct an approximate category path to fetch the right thumbnail/description
                                    const categoryMatch = `${activeCourse} ${sub} ${activeTab === 'mcq' ? 'MCQs' : (activeTab === 'mock_test' ? 'AI Examiner' : 'Class')}`;

                                    const thumbnail = getThumbnail(categoryMatch) || 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8';
                                    const description = getCourseDescription(categoryMatch);

                                    let theme = 'purple';
                                    if (activeCourse === 'NEET' || sub.includes('Biology')) theme = 'teal';
                                    else if (activeCourse === 'JEE' || sub.includes('Mathematics')) theme = 'indigo';
                                    else if (sub.includes('Physics')) theme = 'violet';
                                    else if (sub.includes('Chemistry')) theme = 'emerald';

                                    const gradients: Record<string, any> = {
                                        teal: { from: 'from-teal-500', to: 'to-emerald-500', shadow: 'shadow-teal-500/20', btnShadow: 'shadow-teal-500/40' },
                                        indigo: { from: 'from-indigo-600', to: 'to-blue-600', shadow: 'shadow-indigo-500/20', btnShadow: 'shadow-indigo-500/40' },
                                        violet: { from: 'from-violet-600', to: 'to-purple-600', shadow: 'shadow-violet-500/20', btnShadow: 'shadow-violet-500/40' },
                                        emerald: { from: 'from-emerald-500', to: 'to-teal-500', shadow: 'shadow-emerald-500/20', btnShadow: 'shadow-emerald-500/40' },
                                        purple: { from: 'from-purple-600', to: 'to-pink-600', shadow: 'shadow-purple-500/20', btnShadow: 'shadow-purple-500/40' },
                                    };

                                    const palette = gradients[theme] || gradients['purple'];
                                    const delay = idx * 100;
                                    const isLocked = activeCourse === 'JEE' && (activeTab === 'mcq' || activeTab === 'oneshorts');

                                    return (
                                        <div
                                            key={sub}
                                            onClick={() => {
                                                if (!isLocked) {
                                                    setActiveSubject(sub);
                                                }
                                            }}
                                            style={{ animationDelay: `${delay}ms` }}
                                            className={`group relative overflow-hidden bg-white dark:bg-slate-900 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-${theme}-500/10 transition-all duration-500 border border-slate-200 dark:border-slate-800 w-full sm:w-[48%] md:w-[31%] max-w-[30rem] ${isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:-translate-y-2'} animate-fade-in-up flex flex-col`}
                                        >
                                            <div className={`absolute inset-0 rounded-[32px] border border-transparent bg-gradient-to-br ${palette.from} ${palette.to} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none z-10`}></div>

                                            <div className="relative h-60 overflow-hidden shrink-0">
                                                <img
                                                    src={`${thumbnail}?auto=format&fit=crop&w=800&q=75`}
                                                    alt={sub}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent opacity-95"></div>
                                                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 z-20">
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest mb-3 bg-white/20 backdrop-blur-md text-white shadow-sm border border-white/10">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'mcq' ? 'bg-amber-400' : (activeTab === 'mock_test' ? 'bg-violet-400' : (activeTab === 'oneshorts' ? 'bg-cyan-400' : 'bg-rose-400'))} animate-pulse`} />
                                                        {activeTab === 'mcq' ? 'PRACTICE MODE' : (activeTab === 'mock_test' ? 'MOCK EXAM' : (activeTab === 'oneshorts' ? 'ONE SHOT' : 'LIVE CLASSES'))}
                                                    </div>
                                                    <h3 className="text-3xl font-extrabold text-white mb-1 leading-tight tracking-tight drop-shadow-md">
                                                        {sub}
                                                    </h3>
                                                    <span className="font-semibold text-white/70 text-sm tracking-wide block uppercase">
                                                        {activeCourse} {activeTab === 'mcq' ? 'Question Bank' : (activeTab === 'mock_test' ? 'Mock Assessments' : (activeTab === 'oneshorts' ? 'Crash Courses' : 'Master Classes'))}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="relative p-6 sm:p-8 pt-6 flex-grow flex flex-col justify-between bg-white dark:bg-slate-900 z-20">
                                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">
                                                    {description}
                                                </p>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors">
                                                        <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                                        <span>{(data?.[activeTab]?.[activeCourse]?.[sub] || []).length} {activeTab === 'mcq' ? 'Sets' : (activeTab === 'mock_test' ? 'Tests' : (activeTab === 'oneshorts' ? 'Lectures' : 'Classes'))}</span>
                                                    </div>

                                                    {isLocked ? (
                                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs shadow-inner">
                                                            <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                                                            Locked
                                                        </div>
                                                    ) : (
                                                        <button className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-md">
                                                            <ChevronRight className="w-5 h-5 pointer-events-none" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {isLocked && (
                                                <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/70 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
                                                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border border-slate-200 dark:border-slate-700 mb-4 animate-bounce-slow">
                                                        <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-2">Locked by System</h3>
                                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl backdrop-blur-md shadow-inner border border-slate-200 dark:border-slate-700">
                                                        {activeCourse} {activeTab === 'oneshorts' ? 'One Shots' : 'Questions'} are restricted.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }) : (
                                    <div className="w-full py-12 text-center text-[rgb(var(--text-secondary))] bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))] rounded-2xl border-dashed">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p className="font-semibold text-lg">No {activeTab === 'mcq' ? 'MCQ sets' : (activeTab === 'mock_test' ? 'Mock Tests' : (activeTab === 'oneshorts' ? 'One Shots' : 'Classes'))} available for {activeCourse}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Level 2: List of Sets / Classes */}
                        {activeSubject && !activeSet && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-6">
                                    <button
                                        onClick={() => folderStack.length > 0 ? setFolderStack(prev => prev.slice(0, -1)) : setActiveSubject(null)}
                                        className="p-2 hover:bg-[rgb(var(--bg-secondary))] rounded-full transition-colors"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-[rgb(var(--text-primary))]" />
                                    </button>
                                    <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                                        {topFolder ? topFolder.title : activeSubject} {activeTab === 'mcq' ? 'Sets' : (activeTab === 'mock_test' ? 'Tests' : (activeTab === 'oneshorts' ? 'One Shots' : 'Classes'))}
                                    </h2>
                                </div>
                                {currentItems.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {currentItems.map((item, index) => renderListCard(item, index))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-[rgb(var(--text-secondary))]">No items available.</div>
                                )}
                            </div>
                        )}

                        {/* Level 3: Questions List (MCQ Only) */}
                        {activeSet && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-6">
                                    <button onClick={() => setActiveSet(null)} className="p-2 hover:bg-[rgb(var(--bg-secondary))] rounded-full transition-colors">
                                        <ChevronLeft className="w-6 h-6 text-[rgb(var(--text-primary))]" />
                                    </button>
                                    <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">{activeSet.title} - Questions Preview</h2>
                                </div>

                                {isLoadingQuestions ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-purple-500">
                                        <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin mb-4" />
                                        <span className="font-bold">Fetching set questions...</span>
                                    </div>
                                ) : setQuestions.length > 0 ? (
                                    <div className="w-full bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))] rounded-3xl overflow-hidden shadow-xl">
                                        <NEETPracticeInterface
                                            questionsData={memoizedSetQuestions}
                                            initialSet={parseInt(activeSet.title.replace(/[^\d]/g, ''), 10) || 1}
                                            isSMEReviewMode={true}
                                            onSMEAction={handleSMEAction}
                                            onExit={() => setActiveSet(null)}
                                        />
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-[rgb(var(--text-secondary))] border border-[rgb(var(--border))] border-dashed rounded-2xl">
                                        Failed to load or no questions available in this set.
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Report Modal */}
            <AnimatePresence>
                {selectedReportItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 rounded-[32px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
                        >
                            {/* Header (Fixed) */}
                            <div className="p-6 sm:p-8 pb-6 border-b border-slate-200 dark:border-slate-800/60 shrink-0 relative z-20 bg-white dark:bg-slate-900">
                                <button
                                    onClick={() => {
                                        setSelectedReportItem(null);
                                        setReportData(initialReportData);
                                    }}
                                    className="absolute top-6 sm:top-8 right-6 sm:right-8 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest mb-3 bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
                                        Evaluation Mode
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 pr-12 tracking-tight">
                                        <ClipboardCheck className="w-8 h-8 text-violet-500 shrink-0" />
                                        Quality Report
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm">
                                        Reporting concerns for: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedReportItem.title}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Body (Scrollable) */}
                            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 relative z-0 bg-slate-50/50 dark:bg-slate-950/50">
                                <div className="space-y-8">
                                    {/* Meta Info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm">
                                        {[
                                            { key: 'evaluatorName', label: 'Evaluator Name', placeholder: 'John Doe' },
                                            { key: 'email', label: 'Email Address', placeholder: 'evaluator@yuga.com' },
                                            { key: 'subject', label: 'Subject / Course', placeholder: 'Physics' },
                                            { key: 'questionNo', label: 'Reference ID', placeholder: 'Q1' },
                                        ].map(field => (
                                            <div key={field.key} className="space-y-2">
                                                <label htmlFor={`sme-report-${field.key}`} className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    {field.label}
                                                </label>
                                                <input
                                                    id={`sme-report-${field.key}`}
                                                    type="text"
                                                    value={reportData[field.key as keyof ReportData]}
                                                    onChange={(e) => setReportData({ ...reportData, [field.key]: e.target.value })}
                                                    placeholder={field.placeholder}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Form Sections Array config */}
                                    {[
                                        {
                                            title: '(A) Question / Class Content',
                                            fields: [
                                                { key: 'qErrors', label: '(i) Are there any errors on the question or material?', type: 'radio' },
                                                { key: 'qImageFine', label: '(ii) If there are any images, is the image fine?', type: 'radio' },
                                                { key: 'qRemarks', label: '(iii) Remarks, if any', type: 'text' },
                                            ]
                                        },
                                        {
                                            title: '(B) Options',
                                            fields: [
                                                { key: 'optCorrect', label: '(i) Are the options correct?', type: 'radio' },
                                                { key: 'optRight', label: '(ii) Is the answer given as correct actually right?', type: 'radio' },
                                                { key: 'optRemarks', label: '(iii) Remarks, if any', type: 'text' },
                                            ]
                                        },
                                        {
                                            title: '(C) Short Explanation',
                                            fields: [
                                                { key: 'shortLogic', label: '(i) Is the logic of the short answer correct?', type: 'radio' },
                                                { key: 'shortPronunciation', label: '(ii) Is the pronunciation of the Avatar correct?', type: 'radio' },
                                                { key: 'shortRemarks', label: '(iii) Remarks/Improvements', type: 'text' },
                                            ]
                                        },
                                        {
                                            title: '(D) Detailed Explanation',
                                            fields: [
                                                { key: 'detailLogic', label: '(i) Is the logic of the answer correct?', type: 'radio' },
                                                { key: 'detailPronunciation', label: '(ii) Is the pronunciation of the Avatar correct?', type: 'radio' },
                                                { key: 'detailRemarks', label: '(iii) Remarks/Improvements', type: 'text' },
                                            ]
                                        },
                                        {
                                            title: '(E) Ask Doubt',
                                            fields: [
                                                { key: 'doubtVoice', label: '(i) Is the voice audible/clear?', type: 'radio' },
                                                { key: 'doubtPronunciation', label: '(ii) Is the pronunciation of the Avatar correct?', type: 'radio' },
                                                { key: 'doubtRemarks', label: '(iii) Remarks/Improvements', type: 'text' },
                                            ]
                                        }
                                    ].map((section, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-[24px] p-6 lg:p-8 shadow-sm">
                                            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800/60 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                                                    <span className="text-sm font-black">{idx + 1}</span>
                                                </div>
                                                {section.title.replace(/^\([A-Z]\)\s/, '')}
                                            </h3>
                                            <div className="space-y-6">
                                                {section.fields.map((field) => {
                                                    return (
                                                        <div key={field.key} className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 py-2">
                                                            <label htmlFor={`sme-field-${field.key}`} className="text-sm font-bold text-slate-700 dark:text-slate-300 flex-1 pt-2">
                                                                {field.label}
                                                            </label>
                                                            {field.type === 'textarea' ? (
                                                                <textarea
                                                                    id={`sme-field-${field.key}`}
                                                                    value={reportData[field.key as keyof ReportData]}
                                                                    onChange={(e) => setReportData({ ...reportData, [field.key]: e.target.value })}
                                                                    rows={2}
                                                                    className="w-full lg:w-2/3 xl:w-3/4 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 hover:border-slate-300 dark:hover:border-slate-700 outline-none transition-all resize-y custom-scrollbar placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                                                                    placeholder="Type your observations here..."
                                                                />
                                                            ) : field.type === 'radio' ? (
                                                                <div className="flex items-center gap-2 lg:w-2/3 xl:w-3/4 shrink-0">
                                                                    {['Yes', 'No', 'NA'].map(opt => (
                                                                        <label
                                                                            key={opt}
                                                                            className={`flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all duration-300 text-xs font-black uppercase tracking-wider ${reportData[field.key as keyof ReportData] === opt ?
                                                                                (opt === 'Yes' ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' :
                                                                                    opt === 'No' ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20' :
                                                                                        'bg-slate-600 border-slate-600 text-white shadow-md scale-[1.02]') :
                                                                                'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'}`}
                                                                        >
                                                                            <input
                                                                                type="radio"
                                                                                name={field.key}
                                                                                value={opt}
                                                                                checked={reportData[field.key as keyof ReportData] === opt}
                                                                                onChange={(e) => setReportData({ ...reportData, [field.key]: e.target.value })}
                                                                                className="hidden"
                                                                            />
                                                                            {opt}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <textarea
                                                                    id={`sme-field-${field.key}`}
                                                                    value={reportData[field.key as keyof ReportData]}
                                                                    onChange={(e) => setReportData({ ...reportData, [field.key]: e.target.value })}
                                                                    onInput={(e) => {
                                                                        e.currentTarget.style.height = 'auto';
                                                                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                                                                    }}
                                                                    rows={1}
                                                                    className="w-full lg:w-2/3 xl:w-3/4 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 hover:border-slate-300 dark:hover:border-slate-700 outline-none transition-shadow resize-none overflow-hidden min-h-[44px] placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                                                                    placeholder="Provide remarks..."
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                </div>

                                <div className="pt-8 flex flex-col sm:flex-row justify-end gap-3 pb-4">
                                    <button
                                        onClick={() => {
                                            setSelectedReportItem(null);
                                            setReportData(initialReportData);
                                        }}
                                        className="px-6 py-3 rounded-xl font-bold text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-300 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                                    >
                                        Cancel Evaluation
                                    </button>
                                    <button
                                        onClick={handleReportSubmit}
                                        className="px-8 py-3 text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 border border-violet-500/20"
                                    >
                                        <Save className="w-5 h-5" />
                                        Submit Report Document
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recheck Modal */}
            <AnimatePresence>
                {selectedRecheckItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 rounded-[24px] w-full max-w-xl flex flex-col shadow-2xl relative overflow-hidden my-4 max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-4 sm:p-6 pb-4 border-b border-slate-200 dark:border-slate-800/60 shrink-0 relative z-20 bg-white dark:bg-slate-900">
                                <button
                                    onClick={() => {
                                        setSelectedRecheckItem(null);
                                        setRecheckData(initialRecheckData);
                                    }}
                                    className="absolute top-4 sm:top-6 right-4 sm:right-6 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div>
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest mb-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                        Recheck Request
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 pr-10 tracking-tight">
                                        <RefreshCw className="w-6 h-6 text-emerald-500 shrink-0" />
                                        Review Findings
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-xs line-clamp-1">
                                        Submitting recheck for: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedRecheckItem.title}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 relative z-0 bg-slate-50/50 dark:bg-slate-950/50">
                                <div className="space-y-4">
                                    {/* Evaluation Details */}
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-[16px] p-4 sm:p-5 shadow-sm">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label htmlFor="sme-recheck-name" className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                    Evaluator Name
                                                </label>
                                                <input
                                                    id="sme-recheck-name"
                                                    type="text"
                                                    value={recheckData.evaluatorName}
                                                    onChange={(e) => setRecheckData({ ...recheckData, evaluatorName: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 text-xs font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="sme-recheck-email" className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                    Email Address
                                                </label>
                                                <input
                                                    id="sme-recheck-email"
                                                    type="email"
                                                    value={recheckData.email}
                                                    onChange={(e) => setRecheckData({ ...recheckData, email: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 text-xs font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                                    placeholder="your.email@example.com"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="sme-recheck-subject" className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                    Subject / Course
                                                </label>
                                                <input
                                                    id="sme-recheck-subject"
                                                    type="text"
                                                    value={recheckData.subject}
                                                    onChange={(e) => setRecheckData({ ...recheckData, subject: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 text-xs font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="sme-recheck-qid" className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                    Reference ID
                                                </label>
                                                <input
                                                    id="sme-recheck-qid"
                                                    type="text"
                                                    value={recheckData.questionNo}
                                                    onChange={(e) => setRecheckData({ ...recheckData, questionNo: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 text-xs font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-[16px] p-4 sm:p-5 shadow-sm">
                                        <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800/60 flex items-center gap-2">
                                            Are there any issues?
                                        </h3>
                                        
                                        <div className="space-y-4">
                                            {/* Yes/No Radio */}
                                            <div className="flex items-center gap-3">
                                                {['Yes', 'No'].map(opt => (
                                                    <label
                                                        key={opt}
                                                        className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-300 text-xs font-black uppercase tracking-wider ${recheckData.hasIssues === opt ?
                                                            (opt === 'Yes' ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20' :
                                                                'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20') :
                                                            'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="hasIssues"
                                                            value={opt}
                                                            checked={recheckData.hasIssues === opt}
                                                            onChange={(e) => setRecheckData({ ...recheckData, hasIssues: e.target.value as any })}
                                                            className="hidden"
                                                        />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>

                                            {/* Remarks */}
                                            <div className="space-y-1.5">
                                                <label htmlFor="sme-recheck-remarks" className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                                    Remarks
                                                </label>
                                                <textarea
                                                    id="sme-recheck-remarks"
                                                    value={recheckData.remarks}
                                                    onChange={(e) => setRecheckData({ ...recheckData, remarks: e.target.value })}
                                                    rows={3}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                                                    placeholder="Provide detailed remarks..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex flex-col sm:flex-row justify-end gap-2.5 pb-2">
                                    <button
                                        onClick={() => {
                                            setSelectedRecheckItem(null);
                                            setRecheckData(initialRecheckData);
                                        }}
                                        className="px-5 py-2.5 rounded-lg font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-300 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRecheckSubmit}
                                        disabled={!recheckData.hasIssues}
                                        className="px-6 py-2.5 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        <Check className="w-4 h-4" />
                                        Submit Recheck
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 font-semibold"
                    >
                        <CheckCircle2 className="w-6 h-6" />
                        Report details saved properly.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Saved Reports Modal */}
            <AnimatePresence>
                {showSavedReports && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 rounded-[32px] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 sm:p-8 pb-6 border-b border-slate-200 dark:border-slate-800/60 shrink-0 relative bg-white dark:bg-slate-900 z-20">
                                <button
                                    onClick={() => setShowSavedReports(false)}
                                    className="absolute top-6 sm:top-8 right-6 sm:right-8 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight pr-12">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center shrink-0">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    My Sent Reports
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium text-sm">
                                    You have submitted <span className="font-bold text-slate-700 dark:text-slate-300">{savedReports.length}</span> evaluation documents.
                                </p>
                            </div>

                            {/* Body */}
                            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 relative z-0 bg-slate-50/50 dark:bg-slate-950/50">
                                {savedReports.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center justify-center mb-6">
                                            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-2 tracking-tight">No Reports Filed Yet</h3>
                                        <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium leading-relaxed">
                                            When you submit an issue report from the evaluation panel, it will securely appear here for download.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {savedReports.map((report) => (
                                            <div key={report.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 p-5 rounded-[20px] shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col md:flex-row gap-5 justify-between items-start md:items-center hover:-translate-y-1">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2.5">
                                                        <span className="px-3 py-1 bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-100 dark:border-violet-800/30 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                            {report.subject}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                            {report.date}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                                        Evaluation For: {report.qid}
                                                    </h4>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const blob = new Blob([report.content], { type: "text/plain" });
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement("a");
                                                        a.href = url;
                                                        a.download = `SME_Report_${report.qid}_${report.id}.txt`;
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        document.body.removeChild(a);
                                                        URL.revokeObjectURL(url);
                                                    }}
                                                    className="shrink-0 flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold transition-all hover:border-slate-300 dark:hover:border-slate-600 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 group-hover:border-emerald-200 dark:group-hover:border-emerald-800/50"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download .txt
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Classroom Viewer */}
            {
                activeClass && (
                    <AIClassroom
                        isOpen={!!activeClass}
                        onClose={() => setActiveClass(null)}
                        onReport={() => {
                            if (activeClass) {
                                setSelectedReportItem(activeClass);
                                if (activeClass.fullData?.subject) {
                                    setActiveSubject(activeClass.fullData.subject);
                                }
                            }
                        }}
                        course={activeClass.fullData?.lessons ? activeClass.fullData as Course : {
                            id: activeCourse,
                            title: `${activeCourse} ${activeSubject || ''}`,
                            category: `${activeCourse} ${activeSubject || ''} Classes`,
                            description: '',
                            image: '',
                            duration: '',
                            lessons: [],
                            level: 'Intermediate',
                            progress: 0,
                            color: 'purple',
                            chapters: [],
                            instructor: 'AI Teacher',
                            rating: 5,
                            students: 0,
                            tags: [],
                            notesCount: 0
                        } as Course}
                        lesson={activeClass.fullData?.lessons?.length > 0 ? {
                            ...activeClass,
                            ...activeClass.fullData.lessons[0],
                            id: activeClass.fullData.lessons[0].id || `l-${activeClass.id}-1`,
                            title: activeClass.fullData.lessons[0].title || activeClass.title,
                            isDynamic: true
                        } as Lesson : {
                            ...activeClass,
                            ...activeClass.fullData,
                            id: activeClass.id,
                            title: activeClass.title,
                            content: activeClass.fullData?.content || '',
                            type: activeClass.fullData?.type || 'video',
                            duration: activeClass.fullData?.duration || '',
                            completed: false,
                            dateAdded: new Date().toISOString(),
                            isDynamic: true
                        } as Lesson}
                    />
                )
            }
        </div>
    )
}
