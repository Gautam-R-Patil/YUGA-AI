import { useState, useEffect } from "react";
import {
    RefreshCw,
    Upload,
    CheckCircle,
    FileText,
    BookOpen,
    Sparkles,
    ChevronRight,
    Layers,
    Target,
    HelpCircle,
    BrainCircuit,
    Check,
    Clock,
    X,
    Calculator,
    Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, apiRequest } from "../../../core/utils/api";
import ReactMarkdown from "react-markdown";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { MCQQuestion } from "../../course/types";
import { useCourse } from "../../../core/contexts/CourseContext";

// Constant chapter data (Keeping it consistent with RevisionPage)
const chapterData: Record<string, Record<string, string[]>> = {
    "NEET Physics": {
        "Class 11": [
            "Units and Measurements", "Mathematical Tools", "Motion in a Straight Line", "Motion in a Plane",
            "Newton's Laws of Motion", "Work, Energy & Power", "Centre of Mass & System of Particles",
            "Rotational Motion", "Gravitation", "Mechanical Properties of Solids", "Mechanical Properties of Fluids",
            "Thermal Properties of Matter", "Kinetic Theory of Gases", "Thermodynamics", "Oscillations", "Waves"
        ],
        "Class 12": [
            "Electric Charges and Fields", "Electrostatic Potential and Capacitance", "Current Electricity",
            "Moving Charges and Magnetism", "Magnetism and Matter", "Electromagnetic Induction",
            "Alternating Current", "Electromagnetic Waves", "Ray Optics and Optical Instruments",
            "Wave Optics", "Dual Nature of Radiation and Matter", "Atoms", "Nuclei",
            "Semiconductor Electronics: Materials, Devices and Simple Circuits"
        ]
    },
    "NEET Chemistry": {
        "Class 11": [
            "Some Basic Concepts of Chemistry", "Redox Reactions", "Structure of Atom", "Thermodynamics",
            "Equilibrium", "Organic Chemistry - Some Basic Principles and Techniques", "Hydrocarbons",
            "Classification of Elements and Periodicity in Properties", "Chemical Bonding and Molecular Structure",
            "Principles Related To Practical Organic Chemistry", "The p-Block Elements Part 1"
        ],
        "Class 12": [
            "Solutions", "Chemical Kinetics", "Electrochemistry", "Haloalkanes and Haloarenes",
            "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids", "Amines",
            "Biomolecules", "Coordination Compounds", "The d- and f- Block Elements", "The p-Block Elements Part 2"
        ]
    },
    "NEET Biology": {
        "Class 11": [
            "The Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom",
            "Morphology of Flowering Plants", "Anatomy of Flowering Plants", "Structural Organisation in Animals",
            "Cell: The Unit of Life", "Biomolecules", "Cell Cycle and Cell Division", "Transport in Plants",
            "Mineral Nutrition", "Photosynthesis in Higher Plants", "Respiration in Plants",
            "Plant Growth and Development", "Digestion and Absorption", "Breathing and Exchange of Gases",
            "Body Fluids and Circulation", "Excretory Products and Their Elimination", "Locomotion and Movement",
            "Neural Control and Coordination", "Chemical Coordination and Integration"
        ],
        "Class 12": [
            "Reproduction in Organisms", "Sexual Reproduction in Flowering Plants", "Human Reproduction",
            "Reproductive Health", "Principles of Inheritance and Variation", "Molecular Basis of Inheritance",
            "Evolution", "Human Health and Disease", "Strategies for Enhancement in Food Production",
            "Microbes in Human Welfare", "Biotechnology – Principles and Processes", "Biotechnology and Its Applications",
            "Organisms and Populations", "Ecosystem", "Biodiversity and Conservation", "Environmental Issues"
        ]
    },
    "JEE Mains Physics": {
        "Class 11": [
            "Units and Measurements", "Kinematics", "Laws of Motion", "Work, Energy and Power",
            "Centre of Mass and System of Particles", "Rotational Motion", "Gravitation",
            "Properties of Solids and Liquids", "Thermodynamics", "Kinetic Theory of Gases",
            "Oscillations and Waves"
        ],
        "Class 12": [
            "Electrostatics", "Current Electricity", "Magnetic Effects of Current and Magnetism",
            "Electromagnetic Induction and Alternating Currents", "Electromagnetic Waves",
            "Optics (Ray + Wave)", "Dual Nature of Matter and Radiation", "Atoms and Nuclei",
            "Electronic Devices (Semiconductors)"
        ]
    },
    "JEE Mains Chemistry": {
        "Class 11": [
            "Some Basic Concepts of Chemistry", "Atomic Structure", "States of Matter", "Thermodynamics",
            "Chemical Equilibrium", "Ionic Equilibrium", "Redox Reactions",
            "Purification and Characterisation of Organic Compounds", "Basic Principles of Organic Chemistry (GOC)",
            "Hydrocarbons", "Classification of Elements and Periodicity", "Chemical Bonding and Molecular Structure",
            "Hydrogen", "s-Block Elements", "Some p-Block Elements"
        ],
        "Class 12": [
            "Solid State", "Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry",
            "Haloalkanes and Haloarenes", "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids",
            "Amines", "Biomolecules", "Polymers", "Chemistry in Everyday Life",
            "General Principles and Processes of Isolation of Metals", "p-Block Elements",
            "d- and f-Block Elements", "Coordination Compounds", "Environmental Chemistry"
        ]
    },
    "JEE Mains Mathematics": {
        "Class 11": [
            "Sets, Relations and Functions", "Complex Numbers and Quadratic Equations", "Linear Inequalities",
            "Permutations and Combinations", "Binomial Theorem", "Sequences and Series", "Straight Lines",
            "Conic Sections", "Trigonometric Functions", "Limits and Derivatives", "Mathematical Reasoning",
            "Statistics"
        ],
        "Class 12": [
            "Relations and Functions", "Inverse Trigonometric Functions", "Matrices", "Determinants",
            "Continuity and Differentiability", "Applications of Derivatives", "Integrals", "Differential Equations",
            "Vector Algebra", "Three-Dimensional Geometry", "Probability"
        ]
    },
    "JEE Advanced Physics": {
        "Class 11": [
            "Mechanics: Kinematics (1D, 2D, relative)", "Mechanics: Newton’s Laws of Motion", "Mechanics: Friction",
            "Mechanics: Work, Energy and Power", "Mechanics: Centre of Mass", "Mechanics: Linear Momentum and Collisions",
            "Mechanics: Rotational Mechanics", "Mechanics: Gravitation", "Thermal Physics: Thermal Expansion & Calorimetry",
            "Thermal Physics: Laws of Thermodynamics", "Thermal Physics: Kinetic Theory of Gases",
            "Oscillations & Waves: Simple Harmonic Motion", "Oscillations & Waves: Wave Motion & Doppler Effect"
        ],
        "Class 12": [
            "Electricity & Magnetism: Electrostatics", "Electricity & Magnetism: Capacitors",
            "Electricity & Magnetism: Current Electricity", "Electricity & Magnetism: Magnetic Fields & Forces",
            "Electricity & Magnetism: Electromagnetic Induction & AC", "Optics: Geometrical Optics",
            "Optics: Wave Optics", "Modern Physics: Photoelectric Effect & Atomic Models",
            "Modern Physics: Nuclear Physics & Radioactivity", "Modern Physics: Semiconductor Devices"
        ]
    },
    "JEE Advanced Chemistry": {
        "Class 11": [
            "Mole Concept", "Atomic Structure", "Gaseous State", "Thermodynamics", "Chemical Equilibrium",
            "Ionic Equilibrium", "Periodic Table and Trends", "Chemical Bonding (VBT, MOT)", "s-Block Elements",
            "p-Block Elements (Group 13, 14)", "General Organic Chemistry (Resonance, Aromaticity)",
            "Reaction Mechanisms (SN1, SN2, E1, E2)", "Hydrocarbons", "Stereochemistry"
        ],
        "Class 12": [
            "Solid State", "Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry",
            "Coordination Chemistry (CFT)", "d- and f-Block Elements", "Metallurgy",
            "Qualitative Salt Analysis", "Alkyl and Aryl Halides", "Alcohols, Phenols, Ethers",
            "Carbonyl Compounds", "Carboxylic Acids and Derivatives", "Amines", "Biomolecules",
            "Polymers", "Practical Organic Chemistry", "Qualitative Organic Analysis"
        ]
    },
    "JEE Advanced Mathematics": {
        "Class 11": [
            "Sets, Relations and Functions", "Trigonometric Functions and Equations", "Complex Numbers",
            "Quadratic Equations", "Sequences and Series", "Permutations and Combinations", "Binomial Theorem",
            "Coordinate Geometry: Straight Lines", "Coordinate Geometry: Circles",
            "Coordinate Geometry: Conic Sections", "Mathematical Induction", "Statistics"
        ],
        "Class 12": [
            "Inverse Trigonometric Functions", "Limits, Continuity, Differentiability",
            "Differential Calculus", "Integral Calculus", "Differential Equations", "Vectors",
            "Three-Dimensional Geometry", "Probability"
        ]
    }
};

interface UploadedExercise {
    id: string;
    imagePreview: string; // Base64
    name: string;
    uploadDate: number;
    status: 'processing' | 'completed' | 'failed';
    solution?: string;
}

export const StudyHubPage = () => {
    // --- Common State ---
    const [activeTab, setActiveTab] = useState<'questions' | 'exercises'>('questions');
    const { selectedCourse } = useCourse();

    // --- Personalization State ---
    const [predictedScore, setPredictedScore] = useState<number | null>(null);
    const [drivingFactors, setDrivingFactors] = useState<string[]>([]);

    useEffect(() => {
        const fetchPersonalizationData = async () => {
            try {
                const response = await apiRequest('/learning-analytics/predictive-score', 'GET');
                if (response.ok) {
                    const data = await response.json();
                    if (data.predictedScore) setPredictedScore(data.predictedScore);
                    if (data.drivingFactors) setDrivingFactors(data.drivingFactors);
                }
            } catch (error) {
                console.error("Failed to fetch personalization data:", error);
            }
        };
        fetchPersonalizationData();
    }, []);

    useEffect(() => {
        if (selectedCourse === 'neet') setExamType('NEET');
        else if (selectedCourse === 'jee') setExamType('JEE');
    }, [selectedCourse]);

    // --- Questions State ---
    // Exam Select State
    const [examType, setExamType] = useState<'NEET' | 'JEE'>("NEET");
    const [jeeLevel, setJeeLevel] = useState<'Mains' | 'Advanced'>("Mains");

    const [selectedSubject, setSelectedSubject] = useState<string>("NEET Physics");
    const [selectedClass, setSelectedClass] = useState<string>("Class 11");
    const [selectedChapter, setSelectedChapter] = useState<string>("");
    const [selectedCount, setSelectedCount] = useState<number>(10);
    const [generatedQuestions, setGeneratedQuestions] = useState<MCQQuestion[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSolutionFor, setShowSolutionFor] = useState<string | null>(null);

    // --- Exercises State ---
    const [exercises, setExercises] = useState<UploadedExercise[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isSolving, setIsSolving] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<UploadedExercise | null>(null);

    // --- Lifecycle ---
    useEffect(() => {
        // Load Exercises
        const savedExercises = localStorage.getItem("yuga_user_exercises");
        if (savedExercises) setExercises(JSON.parse(savedExercises));
    }, []);

    useEffect(() => {
        localStorage.setItem("yuga_user_exercises", JSON.stringify(exercises));
    }, [exercises]);

    // --- Question Handlers ---
    const handleGenerateQuestions = async () => {
        setIsGenerating(true);
        setGeneratedQuestions([]);
        try {
            // Mapping subject display name to backend expectations if necessary
            // In mcq-controller, 'practice' subject uses req.query.sub
            const subParam = selectedSubject.replace('NEET ', '');

            // Build the URL with personalization params if available
            let url = `/mcq/subject/practice?sub=${subParam}&topic=${selectedChapter}&count=${selectedCount}&mode=ai`;
            if (predictedScore) {
                url += `&score=${predictedScore}`;
                if (drivingFactors.length > 0) {
                    url += `&factors=${encodeURIComponent(drivingFactors.join(', '))}`;
                }
            }

            const response = await api.get(url);
            setGeneratedQuestions(response.data);
        } catch (err) {
            console.error("Failed to generate questions:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleSolution = (qId: string) => {
        setShowSolutionFor(showSolutionFor === qId ? null : qId);
    };

    const getSubjectBadgeColor = (subject: string) => {
        if (subject.includes('Physics')) return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
        if (subject.includes('Chemistry')) return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
        if (subject.includes('Biology')) return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
        return 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400';
    };

    // --- Exercise Handlers ---
    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        setIsSolving(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const result = e.target?.result as string;
            const newEx: UploadedExercise = {
                id: Date.now().toString(),
                imagePreview: result,
                name: file.name,
                uploadDate: Date.now(),
                status: 'processing'
            };
            setExercises(prev => [newEx, ...prev]);
            try {
                const response = await apiRequest('/ocr/solve', 'POST', { base64Image: result, contentType: file.type });
                const data = await response.json();
                setExercises(prev => prev.map(ex => ex.id === newEx.id
                    ? { ...ex, status: data.success ? 'completed' : 'failed', solution: data.solution }
                    : ex
                ));
            } catch (err) {
                setExercises(prev => prev.map(ex => ex.id === newEx.id ? { ...ex, status: 'failed', solution: "Error solving." } : ex));
            } finally { setIsSolving(false); }
        };
        reader.readAsDataURL(file);
    };

    const subjectsList = Object.keys(chapterData).filter(sub => {
        if (examType === 'NEET') return sub.startsWith('NEET');
        return sub.startsWith(`JEE ${jeeLevel}`);
    });
    const classesList = ["Class 11", "Class 12"];
    const chaptersList = chapterData[selectedSubject]?.[selectedClass] || [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] pb-8 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

                {/* Modern Hero Header */}
                <div className="mb-12 animate-fade-in relative z-10">
                    <div className="relative rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-600 shadow-violet-500/30">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse-slow"></div>
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-black opacity-10 rounded-full -ml-20 -mb-20 blur-2xl"></div>

                        <div className="relative z-10 text-white flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="hidden sm:flex w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 items-center justify-center shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <Layers className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-sm font-bold mb-4 shadow-sm">
                                        <Sparkles className="w-4 h-4 text-yellow-300" />
                                        <span>AI-Powered Learning</span>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight drop-shadow-lg">
                                        Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-indigo-100">Hub</span>
                                    </h1>
                                    <p className="text-white/80 text-lg font-medium max-w-xl leading-relaxed">
                                        One place for all your learning resources. Generate custom practice sets or solve doubts instantly.
                                    </p>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex bg-white/10 backdrop-blur-xl p-2 rounded-[2rem] border border-white/20 shadow-inner w-full lg:w-auto self-stretch lg:self-auto">
                                {[
                                    { id: 'questions', label: 'Questions', icon: HelpCircle },
                                    { id: 'exercises', label: 'Exercises', icon: BookOpen }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] font-bold text-sm transition-all relative overflow-hidden group ${activeTab === tab.id
                                            ? "text-violet-700 shadow-xl"
                                            : "text-white/70 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="active-tab"
                                                className="absolute inset-0 bg-white rounded-[1.5rem]"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                        <tab.icon className={`w-5 h-5 z-10 relative transition-colors ${activeTab === tab.id ? 'text-violet-600' : 'text-current'}`} />
                                        <span className="z-10 relative">{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'questions' ? (
                        <motion.div
                            key="questions"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                        >
                            {/* Selection Sidebar */}
                            <div className="lg:col-span-4 space-y-8">
                                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-700 sticky top-24">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/40 rounded-2xl flex items-center justify-center text-violet-600 dark:text-violet-400">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customize</h2>
                                            <p className="text-sm text-slate-500 font-medium">Configure your practice set</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Exam Select */}
                                        {(selectedCourse === 'both' || selectedCourse === 'jee') && (
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                <div className="flex gap-2 mb-2">
                                                    {(['NEET', 'JEE'] as const).map(type => (
                                                        <button
                                                            key={type}
                                                            onClick={() => {
                                                                setExamType(type);
                                                                const newPrefix = type === 'NEET' ? 'NEET' : `JEE ${jeeLevel}`;
                                                                const firstSub = Object.keys(chapterData).find(k => k.startsWith(newPrefix));
                                                                if (firstSub) setSelectedSubject(firstSub);
                                                            }}
                                                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${examType === type
                                                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                                                : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800'
                                                                }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                                {examType === 'JEE' && (
                                                    <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                                        {(['Mains', 'Advanced'] as const).map(level => (
                                                            <button
                                                                key={level}
                                                                onClick={() => {
                                                                    setJeeLevel(level);
                                                                    const firstSub = Object.keys(chapterData).find(k => k.startsWith(`JEE ${level}`));
                                                                    if (firstSub) setSelectedSubject(firstSub);
                                                                }}
                                                                className={`flex-1 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${jeeLevel === level
                                                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                                                                    : 'text-slate-400 hover:text-slate-600'
                                                                    }`}
                                                            >
                                                                {level}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Subject */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Subject</label>
                                            <div className="space-y-2">
                                                {subjectsList.map(sub => (
                                                    <button
                                                        key={sub}
                                                        onClick={() => setSelectedSubject(sub)}
                                                        className={`w-full px-5 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-between border ${selectedSubject === sub
                                                            ? "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700/50 text-violet-700 dark:text-violet-300"
                                                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-200 hover:shadow-sm"
                                                            }`}
                                                    >
                                                        {sub}
                                                        {selectedSubject === sub && <CheckCircle className="w-5 h-5 text-violet-500" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Class & Count */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Grade</label>
                                                <div className="flex flex-col gap-2">
                                                    {classesList.map(cls => (
                                                        <button
                                                            key={cls}
                                                            onClick={() => setSelectedClass(cls)}
                                                            className={`py-2.5 rounded-xl font-bold text-xs transition-all border ${selectedClass === cls
                                                                ? "bg-slate-800 text-white border-slate-800"
                                                                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                                                                }`}
                                                        >
                                                            {cls}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Questions</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[10, 20, 30, 40].map(cnt => (
                                                        <button
                                                            key={cnt}
                                                            onClick={() => setSelectedCount(cnt)}
                                                            className={`py-2.5 rounded-xl font-bold text-xs transition-all border ${selectedCount === cnt
                                                                ? "bg-slate-800 text-white border-slate-800"
                                                                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                                                                }`}
                                                        >
                                                            {cnt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chapter */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Chapter</label>
                                            <div className="relative">
                                                <select
                                                    value={selectedChapter}
                                                    onChange={(e) => setSelectedChapter(e.target.value)}
                                                    className="w-full pl-5 pr-10 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:ring-4 ring-violet-500/10 focus:border-violet-500 outline-none appearance-none cursor-pointer transition-all"
                                                >
                                                    <option value="">All Topics (Mixed)</option>
                                                    {chaptersList.map(chap => <option key={chap} value={chap}>{chap}</option>)}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                    <ChevronRight className="w-5 h-5 rotate-90" />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleGenerateQuestions}
                                            disabled={isGenerating}
                                            className="w-full py-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-[1.5rem] font-bold text-sm shadow-xl shadow-violet-500/30 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1 mt-4 relative overflow-hidden"
                                        >
                                            <div className="flex items-center gap-3">
                                                {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                                {isGenerating ? "Curating..." : "Generate Practice Set"}
                                            </div>
                                            {predictedScore && !isGenerating && (
                                                <div className="text-[10px] text-violet-200 font-medium flex items-center gap-1">
                                                    <Target className="w-3 h-3" /> Personalized for your {predictedScore}% predicted score
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Feed */}
                            <div className="lg:col-span-8 space-y-8">
                                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-100 dark:border-slate-700 min-h-[600px] relative">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <BrainCircuit className="w-6 h-6" />
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Questions Feed</h2>
                                        </div>
                                        {generatedQuestions.length > 0 && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => window.print()}
                                                    className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
                                                    title="Download PDF"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                                <span className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-black uppercase tracking-wider">
                                                    {generatedQuestions.length} Items
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        {isGenerating ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-[2.5rem] z-10">
                                                <div className="relative">
                                                    <div className="w-20 h-20 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                                                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-violet-600 animate-pulse" />
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Patterns...</h3>
                                                    <p className="text-slate-500 font-medium">Curating high-yield questions for you.</p>
                                                </div>
                                            </div>
                                        ) : generatedQuestions.length === 0 ? (
                                            <div className="py-32 text-center">
                                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-700/50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                                                    <HelpCircle className="w-10 h-10 text-slate-300" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ready to Practice?</h3>
                                                <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">Select your preferences on the left to generate a custom AI practice set tailored to your needs.</p>
                                            </div>
                                        ) : (
                                            generatedQuestions.map((q, idx) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    key={q.id}
                                                    className="group bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 transition-all hover:shadow-lg hover:shadow-violet-500/5"
                                                >
                                                    <div className="flex flex-wrap items-center gap-3 mb-6">
                                                        <span className="w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-violet-500/20">
                                                            {idx + 1}
                                                        </span>
                                                        <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide ${getSubjectBadgeColor(q.subject)}`}>
                                                            {q.subject}
                                                        </span>
                                                    </div>

                                                    <div className="prose prose-slate dark:prose-invert max-w-none mb-8 font-medium text-lg leading-relaxed">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkMath]}
                                                            rehypePlugins={[rehypeKatex]}
                                                            components={{ p: (props: any) => <p className="mb-4 last:mb-0" {...props} /> }}
                                                        >
                                                            {q.question}
                                                        </ReactMarkdown>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                                        {q.options.map((opt, oIdx) => (
                                                            <div
                                                                key={oIdx}
                                                                className={`p-4 rounded-xl border-2 transition-all font-medium text-sm flex items-start gap-4 ${showSolutionFor === q.id && opt === q.correctAnswer
                                                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300"
                                                                    : "border-white dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                                                    }`}
                                                            >
                                                                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 ${showSolutionFor === q.id && opt === q.correctAnswer
                                                                    ? "bg-emerald-500 text-white"
                                                                    : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                                                                    }`}>
                                                                    {String.fromCharCode(65 + oIdx)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <ReactMarkdown
                                                                        remarkPlugins={[remarkMath]}
                                                                        rehypePlugins={[rehypeKatex]}
                                                                    >
                                                                        {opt}
                                                                    </ReactMarkdown>
                                                                </div>
                                                                {showSolutionFor === q.id && opt === q.correctAnswer && <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700/50">
                                                        <button
                                                            onClick={() => toggleSolution(q.id)}
                                                            className="flex items-center gap-2 text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors group/btn"
                                                        >
                                                            <span>{showSolutionFor === q.id ? "Hide Solution" : "Reveal Answer & Explanation"}</span>
                                                            <ChevronRight className={`w-4 h-4 transition-transform ${showSolutionFor === q.id ? "rotate-90" : "group-hover/btn:translate-x-1"}`} />
                                                        </button>

                                                        <AnimatePresence>
                                                            {showSolutionFor === q.id && q.explanation && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                                    animate={{ height: "auto", opacity: 1, marginTop: 24 }}
                                                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="p-6 bg-violet-50 dark:bg-violet-900/10 rounded-2xl border border-violet-100 dark:border-violet-800/30">
                                                                        <div className="flex items-center gap-2 mb-4 text-violet-700 dark:text-violet-300">
                                                                            <Sparkles className="w-4 h-4" />
                                                                            <span className="text-xs font-black uppercase tracking-widest">AI Explanation</span>
                                                                        </div>
                                                                        <div className="prose prose-sm prose-violet dark:prose-invert max-w-none">
                                                                            <ReactMarkdown
                                                                                remarkPlugins={[remarkMath]}
                                                                                rehypePlugins={[rehypeKatex]}
                                                                            >{q.explanation}</ReactMarkdown>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="exercises"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="space-y-12"
                        >
                            <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-8 md:p-12 border border-slate-100 dark:border-slate-700 shadow-xl text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500"></div>
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e.dataTransfer.files); }}
                                    className={`relative rounded-[2rem] border-4 border-dashed transition-all duration-300 p-12 md:p-16 ${isDragging
                                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 scale-[0.99]"
                                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-violet-300 dark:hover:border-violet-700"
                                        }`}
                                >
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={(e) => handleFileUpload(e.target.files)}
                                        accept="image/*,.pdf"
                                    />
                                    <div className="flex flex-col items-center relative z-0 pointer-events-none">
                                        <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl transition-all duration-500 ${isSolving ? "bg-violet-600 text-white animate-pulse" : "bg-white dark:bg-slate-800 text-violet-600 rotate-6 group-hover:rotate-0"
                                            }`}>
                                            {isSolving ? <RefreshCw className="w-10 h-10 animate-spin" /> : <Upload className="w-10 h-10" />}
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                                            {isSolving ? "Analyzing your problem..." : "Solve anything instantly"}
                                        </h3>
                                        <p className="text-slate-500 font-medium text-lg max-w-md mx-auto leading-relaxed mb-8">
                                            Snap a photo of your homework, math problem, or textbook page. Our AI engine handles the rest.
                                        </p>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-xs font-bold text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-slate-600">
                                            <FileText className="w-4 h-4" />
                                            Supports PNG, JPG, PDF
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    Scan History
                                </h2>

                                {exercises.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700">
                                        <p className="text-slate-400 font-bold">No scans yet. Try uploading one above!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {exercises.map(ex => (
                                            <motion.div
                                                key={ex.id}
                                                onClick={() => ex.status === 'completed' && setSelectedExercise(ex)}
                                                className="group bg-white dark:bg-slate-800 p-4 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
                                            >
                                                <div className="aspect-square rounded-[2rem] bg-slate-100 dark:bg-slate-900 mb-5 overflow-hidden relative">
                                                    {ex.imagePreview ? <img src={ex.imagePreview} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" /> : <FileText className="w-12 h-12 text-slate-300 absolute inset-0 m-auto" />}
                                                    <div className="absolute top-4 right-4">
                                                        {ex.status === 'completed' ? (
                                                            <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/30">
                                                                <CheckCircle className="w-4 h-4" />
                                                            </div>
                                                        ) : ex.status === 'processing' ? (
                                                            <div className="bg-violet-500 text-white p-2 rounded-xl shadow-lg shadow-violet-500/30">
                                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                            </div>
                                                        ) : (
                                                            <div className="bg-rose-500 text-white p-2 rounded-xl shadow-lg shadow-rose-500/30">
                                                                <X className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="px-2 pb-2">
                                                    <h3 className="font-bold text-slate-900 dark:text-white truncate mb-1 text-lg">{ex.name}</h3>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                                        {new Date(ex.uploadDate).toLocaleDateString()}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${ex.status === 'completed' ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                                                            }`}>
                                                            {ex.status}
                                                        </span>
                                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- Printable Questions Section --- */}
            <div className="hidden print:block absolute top-0 left-0 w-full !bg-white z-[9999] p-8 !text-black print:!text-black print:!bg-white">
                <style>
                    {`
                        @media print {
                            body {
                                background-color: white !important;
                                color: black !important;
                            }
                            * {
                                color: black !important;
                                background-color: white !important;
                                border-color: #e5e7eb !important;
                            }
                            .print-force-bg-gray {
                                background-color: #f9fafb !important;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                            .print-force-bg-black {
                                background-color: black !important;
                                color: white !important;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                        }
                    `}
                </style>
                <div className="text-center mb-8 border-b-2 border-black pb-4">
                    <h1 className="text-3xl font-black !text-black mb-2">{examType} Practice Set</h1>
                    <p className="!text-black font-bold">{selectedSubject} • {selectedChapter || "Mixed Topics"} • {generatedQuestions.length} Questions</p>
                </div>

                <div className="space-y-12">
                    {generatedQuestions.map((q, idx) => (
                        <div key={q.id} className="break-inside-avoid">
                            <div className="flex gap-4 mb-4">
                                <span className="font-black !text-black text-lg">{idx + 1}.</span>
                                <div className="flex-1 text-lg !text-black font-medium prose prose-lg prose-p:my-0 max-w-none print:!text-black">
                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                        {q.question}
                                    </ReactMarkdown>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 ml-8 mb-6">
                                {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex gap-3 items-start !text-black">
                                        <span className="font-bold">({String.fromCharCode(65 + oIdx)})</span>
                                        <div className="prose prose-p:my-0 max-w-none print:!text-black">
                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                {opt}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="ml-8 p-5 rounded-xl !text-black border-2 border-gray-200 print-force-bg-gray">
                                <div className="font-black !text-black mb-2 flex flex-wrap gap-2 items-center">
                                    <span>Correct Answer:</span>
                                    <span className="px-3 py-1 rounded-md print-force-bg-black">
                                        {String.fromCharCode(65 + q.options.indexOf(q.correctAnswer))}
                                    </span>
                                </div>
                                {q.explanation && (
                                    <div className="mt-4 pt-4 border-t border-gray-300">
                                        <h4 className="font-bold !text-black mb-2 uppercase text-xs tracking-wider">Explanation:</h4>
                                        <div className="prose prose-sm max-w-none print:!text-black mt-2 print:!text-gray-800">
                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                {q.explanation}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Exercise Solution Modal --- */}
            <AnimatePresence>
                {selectedExercise && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6"
                        onClick={() => setSelectedExercise(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-violet-600" />
                                    AI Solution
                                </h2>
                                <button
                                    onClick={() => setSelectedExercise(null)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Original Problem</h3>
                                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                            <img src={selectedExercise.imagePreview} className="w-full h-auto" alt="Problem" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Step-by-Step Solution</h3>
                                        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkMath]}
                                                rehypePlugins={[rehypeKatex]}
                                            >
                                                {selectedExercise.solution || "Solution not available."}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
