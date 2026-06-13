import { useState, useEffect } from "react";
import { useCourse } from "../../../core/contexts/CourseContext";

import {
    RefreshCw,
    Sparkles,
    Target,
    BookOpen,
    Play,
    Pause,
    FileText,
    Download,
    User,
    MessageSquare,
    Library,
    Mic,
    CheckCircle,
    ChevronRight,
    BrainCircuit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, apiRequest } from "../../../core/utils/api";
import ReactMarkdown from "react-markdown";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { RealisticAvatar } from "../../course/components/RealisticAvatar";
import { GamificationDashboard } from "../../user/components/GamificationDashboard";
import { SRSReviewComponent } from "./SRSReviewComponent";

// Chapter data for selection
const chapterData = {
    // --- NEET ---
    "NEET Physics": {
        "Class 11": [
            "Units and Measurements",
            "Mathematical Tools",
            "Motion in a Straight Line",
            "Motion in a Plane",
            "Newton's Laws of Motion",
            "Work, Energy & Power",
            "Centre of Mass & System of Particles",
            "Rotational Motion",
            "Gravitation",
            "Mechanical Properties of Solids",
            "Mechanical Properties of Fluids",
            "Thermal Properties of Matter",
            "Kinetic Theory of Gases",
            "Thermodynamics",
            "Oscillations",
            "Waves"
        ],
        "Class 12": [
            "Electric Charges and Fields",
            "Electrostatic Potential and Capacitance",
            "Current Electricity",
            "Moving Charges and Magnetism",
            "Magnetism and Matter",
            "Electromagnetic Induction",
            "Alternating Current",
            "Electromagnetic Waves",
            "Ray Optics and Optical Instruments",
            "Wave Optics",
            "Dual Nature of Radiation and Matter",
            "Atoms",
            "Nuclei",
            "Semiconductor Electronics: Materials, Devices and Simple Circuits"
        ]
    },
    "NEET Chemistry": {
        "Class 11": [
            "Some Basic Concepts of Chemistry",
            "Redox Reactions",
            "Structure of Atom",
            "Thermodynamics",
            "Equilibrium",
            "Organic Chemistry - Some Basic Principles and Techniques",
            "Hydrocarbons",
            "Classification of Elements and Periodicity in Properties",
            "Chemical Bonding and Molecular Structure",
            "Principles Related To Practical Organic Chemistry",
            "The p-Block Elements Part 1"
        ],
        "Class 12": [
            "Solutions",
            "Chemical Kinetics",
            "Electrochemistry",
            "Haloalkanes and Haloarenes",
            "Alcohols, Phenols and Ethers",
            "Aldehydes, Ketones and Carboxylic Acids",
            "Amines",
            "Biomolecules",
            "Coordination Compounds",
            "The d- and f- Block Elements",
            "The p-Block Elements Part 2"
        ]
    },
    "NEET Biology": {
        "Class 11": [
            "The Living World",
            "Biological Classification",
            "Plant Kingdom",
            "Animal Kingdom",
            "Morphology of Flowering Plants",
            "Anatomy of Flowering Plants",
            "Structural Organisation in Animals",
            "Cell: The Unit of Life",
            "Biomolecules",
            "Cell Cycle and Cell Division",
            "Transport in Plants",
            "Mineral Nutrition",
            "Photosynthesis in Higher Plants",
            "Respiration in Plants",
            "Plant Growth and Development",
            "Digestion and Absorption",
            "Breathing and Exchange of Gases",
            "Body Fluids and Circulation",
            "Excretory Products and Their Elimination",
            "Locomotion and Movement",
            "Neural Control and Coordination",
            "Chemical Coordination and Integration"
        ],
        "Class 12": [
            "Reproduction in Organisms",
            "Sexual Reproduction in Flowering Plants",
            "Human Reproduction",
            "Reproductive Health",
            "Principles of Inheritance and Variation",
            "Molecular Basis of Inheritance",
            "Evolution",
            "Human Health and Disease",
            "Strategies for Enhancement in Food Production",
            "Microbes in Human Welfare",
            "Biotechnology – Principles and Processes",
            "Biotechnology and Its Applications",
            "Organisms and Populations",
            "Ecosystem",
            "Biodiversity and Conservation",
            "Environmental Issues"
        ]
    },

    // --- JEE Mains ---
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
        "Physical Chemistry": [
            "Some Basic Concepts of Chemistry", "Atomic Structure", "States of Matter",
            "Thermodynamics", "Chemical Equilibrium", "Ionic Equilibrium", "Redox Reactions",
            "Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry"
        ],
        "Inorganic Chemistry": [
            "Periodic Table and Periodicity", "Chemical Bonding", "Hydrogen", "s-Block Elements",
            "p-Block Elements (Groups 13–18)", "d- and f-Block Elements", "Coordination Compounds",
            "Metallurgy", "Environmental Chemistry"
        ],
        "Organic Chemistry": [
            "Basic Organic Chemistry", "Hydrocarbons", "Haloalkanes and Haloarenes",
            "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids",
            "Amines", "Biomolecules", "Polymers", "Chemistry in Everyday Life"
        ]
    },
    "JEE Mains Mathematics": {
        "Class 11": [
            "Sets, Relations and Functions", "Complex Numbers and Quadratic Equations", "Linear Inequalities",
            "Permutations and Combinations", "Binomial Theorem", "Sequences and Series", "Straight Lines",
            "Conic Sections", "Trigonometry", "Limits and Derivatives", "Mathematical Reasoning",
            "Statistics"
        ],
        "Class 12": [
            "Matrices and Determinants", "Continuity and Differentiability", "Applications of Derivatives",
            "Integrals", "Applications of Integrals", "Differential Equations", "Vector Algebra",
            "Three-Dimensional Geometry", "Probability"
        ]
    },

    // --- JEE Advanced ---
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

export const RevisionPage = () => {
    const [activeTab, setActiveTab] = useState<'notes' | 'ai-teacher'>('ai-teacher');
    const { selectedCourse } = useCourse();

    // Form Selection State
    const [examType, setExamType] = useState<'NEET' | 'JEE'>(
        selectedCourse === 'jee' ? 'JEE' : 'NEET'
    );
    const [jeeLevel, setJeeLevel] = useState<'Mains' | 'Advanced'>("Mains");
    const [selectedSubject, setSelectedSubject] = useState<string>("Physics");
    const [selectedClass, setSelectedClass] = useState<string>("Class 11");
    const [selectedChapter, setSelectedChapter] = useState<string>("");
    const [isOneShot, setIsOneShot] = useState<boolean>(false);

    // Notes Section State
    const [generatedNotes, setGeneratedNotes] = useState<string>("");
    const [isGeneratingNotes, setIsGeneratingNotes] = useState<boolean>(false);

    // AI Teacher State
    const [isTeaching, setIsTeaching] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [currentSpeech, setCurrentSpeech] = useState<string>("");
    const [explanationTranscript, setExplanationTranscript] = useState<string>("");
    const [isGeneratingExplanation, setIsGeneratingExplanation] = useState<boolean>(false);
    const [explainingChapter, setExplainingChapter] = useState<string>("");

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

    // Sync with global preference
    useEffect(() => {
        if (selectedCourse === 'neet') setExamType('NEET');
        else if (selectedCourse === 'jee') setExamType('JEE');
    }, [selectedCourse]);

    useEffect(() => {
        // Initialize with default
        const defaultKey = "NEET Physics";
        // Safe access to chapter data
        const firstClass = Object.keys(chapterData[defaultKey as keyof typeof chapterData] || {})[0];
        if (firstClass) {
            const firstChap = (chapterData as any)[defaultKey][firstClass][0];
            setSelectedChapter(firstChap);
        }
    }, []);

    // Helper to get current db key
    const getDbKey = (sub: string) => {
        if (examType === 'NEET') return `NEET ${sub}`;
        return `JEE ${jeeLevel} ${sub}`;
    };

    const handleSrsTopicSelect = (subject: string, chapter: string) => {
        // Map from DB Subject (e.g. "NEET Physics") back to UI state
        if (subject.includes('NEET')) {
            setExamType('NEET');
            setSelectedSubject(subject.replace('NEET ', ''));
        } else if (subject.includes('JEE Advanced')) {
            setExamType('JEE');
            setJeeLevel('Advanced');
            setSelectedSubject(subject.replace('JEE Advanced ', ''));
        } else if (subject.includes('JEE Mains')) {
            setExamType('JEE');
            setJeeLevel('Mains');
            setSelectedSubject(subject.replace('JEE Mains ', ''));
        }

        setSelectedChapter(chapter);
        setActiveTab('notes');

        // Auto-scroll to top so they see the notes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Clear generated notes when topic changes
    useEffect(() => {
        setGeneratedNotes("");
    }, [selectedChapter, selectedSubject, examType, jeeLevel]);

    const handleGenerateNotes = async () => {
        if (!selectedChapter) return;
        setIsGeneratingNotes(true);
        setGeneratedNotes("");

        const currentDbKey = getDbKey(selectedSubject);
        let basePrompt = isOneShot
            ? `Generate a comprehensive 'One Shot' revision summary for the entire chapter '${selectedChapter}' in ${currentDbKey}.
               Target Exam: ${examType} ${examType === 'JEE' ? jeeLevel : ''} 2025.
               Coverage: All major topics concisely but thoroughly.
               Focus: High-yield points, previous year trends for ${examType}.
               Format: STRICT MARKDOWN. Use H1 for chapter title, H2 for major topics, H3 for subtopics. 
               Include: Key formulas (properly formatted), important laws, and exam definitions. 
               Aesthetic: Use bullet points and bold text for crucial keywords.`
            : `Generate highly detailed, examination-ready revision notes for the topic '${selectedChapter}' in ${currentDbKey}. 
               Target Exam: ${examType} ${examType === 'JEE' ? jeeLevel : ''} 2025.
               Coverage: Comprehensive depth matching the official syllabus.
               Focus: Scoring top marks in ${examType}. Include conceptual depth, derivations (where relevant), and application points.
               Format: STRICT MARKDOWN with clear visual hierarchy (H1, H2, H3).
               Include: Key formulas, diagrams descriptions, and critical pointers.
               Tone: Academic, precise, and encouraging.`;

        if (predictedScore) {
            basePrompt += `\n\nPERSONALIZATION CONTEXT:\nThis student currently has a predicted score of ${predictedScore}% in this subject.\n`;
            if (drivingFactors.length > 0) {
                basePrompt += `Their relevant factors are: ${drivingFactors.join(', ')}.\n`;
            }
            basePrompt += `Please tailor the depth, complexity, and specific focus areas of the notes to match their proficiency level. Give them exactly what they need to improve from this baseline without being too basic or overly complex.`;
        }

        const prompt = basePrompt;

        try {
            const response = await api.post('/voice/query', {
                messages: [{ role: 'user', content: prompt }],
                courseCategory: currentDbKey,
                source: 'revision_notes'
            });
            const data = response.data;
            if (data.success) {
                setGeneratedNotes(data.response);
                // Save to local storage for history
                const savedNotes = JSON.parse(localStorage.getItem("yuga_user_notes") || "[]");
                localStorage.setItem("yuga_user_notes", JSON.stringify([
                    {
                        id: Date.now().toString(),
                        title: `${selectedChapter} ${isOneShot ? '(One Shot)' : '(Detailed)'}`,
                        content: data.response,
                        courseTitle: currentDbKey,
                        updatedAt: Date.now()
                    },
                    ...savedNotes
                ]));

                // Add to SRS Queue
                try {
                    await api.post('/srs/init', {
                        subject: currentDbKey,
                        chapter: selectedChapter
                    });
                } catch (srsError) {
                    console.error("Failed to initialize SRS tracking:", srsError);
                }
            }
        } catch (error) {
            console.error("Failed to generate notes:", error);
        } finally {
            setIsGeneratingNotes(false);
        }
    };

    const handleExplanationToggle = async () => {
        if (!selectedChapter) return;

        // If currently teaching normally, pause it.
        if (isTeaching && !isPaused) {
            if (explainingChapter !== selectedChapter) {
                // Topic changed! Stop old, start new.
                await startNewExplanation();
            } else {
                // Pause it
                setIsPaused(true);
            }
        }
        // If paused or not teaching at all
        else {
            if (explainingChapter !== selectedChapter || !explanationTranscript) {
                // Start a brand new explanation
                await startNewExplanation();
            } else {
                // Resume
                setIsPaused(false);
                setIsTeaching(true);
            }
        }
    };

    const startNewExplanation = async () => {
        setIsTeaching(true);
        setIsPaused(false);
        setIsGeneratingExplanation(true);
        setCurrentSpeech("");
        setExplanationTranscript("");
        setExplainingChapter(selectedChapter);

        const currentDbKey = getDbKey(selectedSubject);
        let basePrompt = isOneShot
            ? `Provide a 'One Shot' marathon explanation for the entire chapter '${selectedChapter}' in ${currentDbKey}. 
               Tone: Enthusiastic expert teacher, clear and professional.
               Flow: Introduction -> Core Concepts -> High-Yield Topics -> Quick Conclusion. 
               Note: Speak as if you are teaching a live classroom preparing for ${examType} 2025.`
            : `Explain the topic '${selectedChapter}' in ${currentDbKey} like a world-class AI Mentor. 
               Method: Start with basics, connect to practical applications, and highlight exam importance for ${examType}.
               Tone: Professional, calm, and interactive.
               Focus: Conceptual clarity and helping the student visualize the topic internally.`;

        if (predictedScore) {
            basePrompt += `\n\nPERSONALIZATION CONTEXT:\nThe student listening to this explanation currently has a predicted score of ${predictedScore}%.\n`;
            if (drivingFactors.length > 0) {
                basePrompt += `Their performance factors: ${drivingFactors.join(', ')}.\n`;
            }
            basePrompt += `Speak directly to their level. Use analogies and depth appropriate for this score to elevate their understanding directly from this baseline.`;
        }

        const prompt = basePrompt;

        try {
            const response = await api.post('/voice/query', {
                messages: [{ role: 'user', content: prompt }],
                courseCategory: currentDbKey,
                source: 'revision_notes'
            });
            const data = response.data;
            if (data.success) {
                setCurrentSpeech(data.response);
                setExplanationTranscript(data.response);

                try {
                    await api.post('/srs/init', {
                        subject: currentDbKey,
                        chapter: selectedChapter
                    });
                } catch (srsError) {
                    console.error("Failed to initialize SRS tracking:", srsError);
                }
            } else {
                setIsTeaching(false);
                setIsPaused(false);
                console.error("API Error:", data.error);
            }
        } catch (error) {
            console.error("Failed to generate explanation:", error);
            setIsTeaching(false);
            setIsPaused(false);
        } finally {
            setIsGeneratingExplanation(false);
        }
    };

    const handleStopExplanation = () => {
        setIsTeaching(false);
        setIsPaused(false);
        setCurrentSpeech("");
    };

    const subjectsList = ['Physics', 'Chemistry', examType === 'NEET' ? 'Biology' : 'Mathematics'];

    return (
        <div className="min-h-screen pb-20 bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-300">
            {/* --- Premium Header --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 mb-8">
                <div className="mb-12 animate-fade-in relative z-10">
                    <div className="relative rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 shadow-purple-500/30">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse-slow"></div>
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-black opacity-10 rounded-full -ml-20 -mb-20 blur-2xl"></div>

                        <div className="relative z-10 text-white flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="hidden sm:flex w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <Library className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-sm font-bold mb-4 shadow-sm">
                                        <Sparkles className="w-4 h-4 text-yellow-300" />
                                        <span>AI-Powered Learning</span>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight drop-shadow-lg">
                                        Revision <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-100">Center</span>
                                    </h1>
                                    <p className="text-white/80 text-lg font-medium max-w-xl leading-relaxed">
                                        Generate comprehensive notes and learn with your personal AI teacher.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Selection Panel */}
                    <div className="lg:col-span-4 space-y-8">
                        <GamificationDashboard />
                        <SRSReviewComponent onSelectTopic={handleSrsTopicSelect} />

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl sticky top-24"
                        >
                            <div className="space-y-4 mb-8">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Learning Mode</label>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-[2rem] flex gap-1 shadow-inner border border-slate-100 dark:border-slate-700">
                                    {[
                                        { id: 'ai-teacher', label: 'AI Teacher', icon: User },
                                        { id: 'notes', label: 'Detailed Notes', icon: FileText }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveTab(tab.id as any);
                                                if (isTeaching) handleStopExplanation();
                                            }}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] font-black text-[11px] transition-all relative ${activeTab === tab.id
                                                ? "text-white shadow-lg shadow-purple-500/30"
                                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                                }`}
                                        >
                                            {activeTab === tab.id && (
                                                <motion.div
                                                    layoutId="sidebar-tab-active"
                                                    className="absolute inset-0 bg-purple-600 rounded-[1.5rem]"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <tab.icon className="w-3.5 h-3.5 z-10 relative" />
                                            <span className="z-10 relative">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customize</h2>
                                    <p className="text-sm text-slate-500 font-medium">Configure your session</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Exam Selection Toggles */}
                                {(selectedCourse === 'both' || selectedCourse === 'jee') && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl space-y-4 border border-slate-100 dark:border-slate-700">
                                        {/* Main Toggle */}
                                        {selectedCourse === 'both' && (
                                            <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                                {(['NEET', 'JEE'] as const).map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => {
                                                            setExamType(type);
                                                            if (type === 'JEE' && selectedSubject === 'Biology') setSelectedSubject('Mathematics');
                                                            if (type === 'NEET' && selectedSubject === 'Mathematics') setSelectedSubject('Biology');
                                                            // Reset chapter on switch
                                                            const newSub = (type === 'NEET' && selectedSubject === 'Mathematics') ? 'Biology' :
                                                                (type === 'JEE' && selectedSubject === 'Biology') ? 'Mathematics' : selectedSubject;
                                                            const key = type === 'NEET' ? `NEET ${newSub}` : `JEE ${jeeLevel} ${newSub}`;
                                                            const firstClass = Object.keys((chapterData as any)[key] || {})[0];
                                                            if (firstClass) setSelectedChapter((chapterData as any)[key][firstClass][0]);
                                                        }}
                                                        className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${examType === type
                                                            ? 'bg-purple-600 text-white shadow-md'
                                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Conditional Sub Toggle for JEE */}
                                        <AnimatePresence>
                                            {examType === 'JEE' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                                        {(['Mains', 'Advanced'] as const).map(level => (
                                                            <button
                                                                key={level}
                                                                onClick={() => {
                                                                    setJeeLevel(level);
                                                                    // Reset chapter logic
                                                                    const key = `JEE ${level} ${selectedSubject}`;
                                                                    const firstClass = Object.keys((chapterData as any)[key] || {})[0];
                                                                    if (firstClass) setSelectedChapter((chapterData as any)[key][firstClass][0]);
                                                                }}
                                                                className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${jeeLevel === level
                                                                    ? 'bg-indigo-600 text-white shadow-md'
                                                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                                                    }`}
                                                            >
                                                                {level}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Subject */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                                    <div className="space-y-2">
                                        {subjectsList.map(sub => (
                                            <button
                                                key={sub}
                                                onClick={() => {
                                                    setSelectedSubject(sub);
                                                    const key = getDbKey(sub);
                                                    const availableClasses = Object.keys(chapterData[key as keyof typeof chapterData] || {});
                                                    const firstClass = availableClasses[0];
                                                    if (firstClass) {
                                                        setSelectedClass(firstClass);
                                                        setSelectedChapter((chapterData as any)[key][firstClass][0]);
                                                    }
                                                }}
                                                className={`w-full px-5 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-between border ${selectedSubject === sub
                                                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700/50 text-purple-700 dark:text-purple-300"
                                                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-purple-200 hover:shadow-sm"
                                                    }`}
                                            >
                                                {sub}
                                                {selectedSubject === sub && <CheckCircle className="w-5 h-5 text-purple-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Class */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Class</label>
                                    <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl gap-2 font-bold">
                                        {["Class 11", "Class 12"].map(cls => (
                                            <button
                                                key={cls}
                                                onClick={() => {
                                                    setSelectedClass(cls);
                                                    const key = getDbKey(selectedSubject);
                                                    if ((chapterData as any)[key][cls]) {
                                                        setSelectedChapter((chapterData as any)[key][cls][0]);
                                                    }
                                                }}
                                                className={`flex-1 py-3 rounded-xl transition-all ${selectedClass === cls
                                                    ? "bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-400"
                                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                                            >
                                                {cls}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Chapter */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Chapter</label>
                                    <div className="relative">
                                        <select
                                            value={selectedChapter}
                                            onChange={(e) => setSelectedChapter(e.target.value)}
                                            className="w-full pl-5 pr-10 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:ring-4 ring-purple-500/10 focus:border-purple-500 outline-none appearance-none cursor-pointer transition-all"
                                        >
                                            {((chapterData as any)[getDbKey(selectedSubject)]?.[selectedClass] || []).map((chap: string) => (
                                                <option key={chap} value={chap}>{chap}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <ChevronRight className="w-5 h-5 rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <label className="flex items-center gap-4 cursor-pointer group select-none">
                                        <div
                                            onClick={() => setIsOneShot(!isOneShot)}
                                            className={`w-14 h-8 rounded-full transition-colors relative ${isOneShot ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                        >
                                            <motion.div
                                                animate={{ x: isOneShot ? 28 : 4 }}
                                                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-800 dark:text-white text-sm group-hover:text-purple-600 transition-colors">One Shot Mode</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Concise Chapter Marathon</span>
                                        </div>
                                    </label>
                                </div>

                                <button
                                    onClick={activeTab === 'notes' ? handleGenerateNotes : handleExplanationToggle}
                                    disabled={isGeneratingNotes || isGeneratingExplanation}
                                    className={`w-full py-5 rounded-[1.5rem] font-black text-sm transition-all flex flex-col items-center justify-center gap-1 shadow-lg active:scale-[0.98] mt-4 relative overflow-hidden ${activeTab === 'notes'
                                        ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25"
                                        : isTeaching && !isPaused && explainingChapter === selectedChapter
                                            ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25"
                                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {isGeneratingNotes || isGeneratingExplanation ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                                Reading Syllabus...
                                            </>
                                        ) : activeTab === 'notes' ? (
                                            <>
                                                <FileText className="w-5 h-5" />
                                                Generate Notes
                                            </>
                                        ) : isTeaching && !isPaused && explainingChapter === selectedChapter ? (
                                            <>
                                                <Pause className="w-5 h-5" />
                                                Pause Explanation
                                            </>
                                        ) : isPaused && explainingChapter === selectedChapter ? (
                                            <>
                                                <Play className="w-5 h-5" />
                                                Resume Explanation
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-5 h-5" />
                                                Start Explanation
                                            </>
                                        )}
                                    </div>
                                    {predictedScore && !isGeneratingNotes && !isGeneratingExplanation && !isTeaching && (
                                        <div className="text-[10px] text-white/80 font-medium flex items-center gap-1">
                                            <Target className="w-3 h-3" /> Personalized for your {predictedScore}% score
                                        </div>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Content Panel */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {activeTab === 'notes' ? (
                                <motion.div
                                    key="notes-content"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-xl min-h-[700px] relative overflow-hidden"
                                >
                                    {isGeneratingNotes ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 p-12 text-center rounded-[2.5rem]">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="w-20 h-20 bg-purple-600 rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-purple-500/30"
                                            >
                                                <RefreshCw className="w-10 h-10" />
                                            </motion.div>
                                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-4">Curating High-Quality Notes</h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-sm">Our AI is analyzing the {examType} syllabus to provide you with the most accurate revision material.</p>
                                        </div>
                                    ) : !generatedNotes ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-50">
                                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-6 shadow-inner">
                                                <BookOpen className="w-10 h-10" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No notes generated</h3>
                                            <p className="text-slate-500 font-medium">Select a chapter on the left to begin.</p>
                                        </div>
                                    ) : (
                                        <div className="prose prose-slate dark:prose-invert max-w-none">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
                                                <div>
                                                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{selectedChapter}</h2>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-lg text-xs font-black uppercase tracking-widest">{getDbKey(selectedSubject)}</span>
                                                        <span className="text-slate-400 text-xs font-bold">•</span>
                                                        <span className="text-slate-400 text-xs font-bold">{examType} 2025</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setGeneratedNotes("")}
                                                        className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 rounded-xl transition-all"
                                                        title="Clear"
                                                    >
                                                        <RefreshCw className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => window.print()}
                                                        className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 rounded-xl transition-all group"
                                                        title="Download PDF"
                                                    >
                                                        <Download className="w-5 h-5 group-hover:animate-bounce" />
                                                        <span className="font-bold text-sm">Save PDF</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <ReactMarkdown
                                                remarkPlugins={[remarkMath]}
                                                rehypePlugins={[rehypeKatex]}
                                                components={{
                                                    h1: (props) => <h1 className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-12 mb-6" {...props} />,
                                                    h2: (props) => <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-10 mb-5 pb-2 border-b-2 border-slate-100 dark:border-slate-800" {...props} />,
                                                    h3: (props) => <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4 flex items-center gap-2" {...props} />,
                                                    p: (props) => <p className="text-lg text-slate-600 dark:text-slate-300 leading-[1.8] mb-6 font-medium" {...props} />,
                                                    ul: (props) => <ul className="space-y-4 mb-8 list-none pl-0" {...props} />,
                                                    li: (props) => (
                                                        <li className="flex items-start gap-3 text-lg text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-hover hover:shadow-md">
                                                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                                                            <div>{props.children}</div>
                                                        </li>
                                                    ),
                                                    strong: (props) => <strong className="font-black text-slate-900 dark:text-white" {...props} />,
                                                    code: (props) => <code className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-800/50 font-black text-sm" {...props} />
                                                }}
                                            >
                                                {generatedNotes}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="ai-teacher-content"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex flex-col gap-8 h-full"
                                >
                                    {/* Avatar Card */}
                                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-xl aspect-square sm:aspect-video relative overflow-hidden flex items-center justify-center group">
                                        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                                        {!isTeaching ? (
                                            <div className="text-center z-10">
                                                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-[2rem] flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-6 shadow-xl shadow-emerald-500/20 transform group-hover:scale-105 transition-transform duration-500">
                                                    <BrainCircuit className="w-12 h-12" />
                                                </div>
                                                <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-3">AI Mentor Ready</h3>
                                                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">Click "Start Explanation" for a personalized deep dive into {selectedChapter}.</p>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full relative">
                                                <RealisticAvatar
                                                    gender="female"
                                                    isTeaching={isTeaching}
                                                    currentSpeech={currentSpeech}
                                                    emotion="teaching"
                                                    soundEnabled={true}
                                                    onQuestionAsked={() => { }}
                                                    onSpeechEnd={() => setIsTeaching(false)}
                                                    language="english"
                                                    courseCategory={getDbKey(selectedSubject)}
                                                    isPaused={isPaused}
                                                />

                                                {/* Pause/Resume Overlay */}
                                                {!isGeneratingExplanation && isTeaching && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsPaused(!isPaused);
                                                        }}
                                                        className="absolute top-6 right-6 z-50 p-3 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md border border-white/20 rounded-full text-white shadow-xl transition-all active:scale-95 group"
                                                        title={isPaused ? "Resume Explanation" : "Pause Explanation"}
                                                    >
                                                        {isPaused ? (
                                                            <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
                                                        ) : (
                                                            <Pause className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
                                                        )}
                                                    </button>
                                                )}

                                                {isGeneratingExplanation && (
                                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-[2.5rem]">
                                                        <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6" />
                                                        <p className="text-white font-black text-xl tracking-tight">Preparing Lesson...</p>
                                                        <p className="text-white/60 font-medium text-sm mt-2">Connecting to AI Neural Engine</p>
                                                    </div>
                                                )}

                                                {/* Live Visualizer Overlay */}
                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-1 h-12 px-8 py-3 bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-white/10 pointer-events-none shadow-2xl">
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                        Live
                                                    </div>
                                                    {[...Array(8)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            animate={{ height: isTeaching ? [6, 24, 32, 12, 6] : 6 }}
                                                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                                            className="w-1.5 bg-gradient-to-t from-purple-500 to-indigo-400 rounded-full"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Transcript Card */}
                                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl flex-1 relative flex flex-col overflow-hidden min-h-[400px]">
                                        <div className="flex items-center gap-4 mb-6 shrink-0">
                                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <MessageSquare className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Live Transcript</h3>
                                        </div>

                                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 text-lg text-slate-600 dark:text-slate-300 font-medium leading-[1.8] min-h-0">
                                            {!explanationTranscript ? (
                                                <div className="flex flex-col items-center justify-center py-10 opacity-30">
                                                    <Mic className="w-8 h-8 mb-2" />
                                                    <p className="italic">Transcript will appear here...</p>
                                                </div>
                                            ) : (
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkMath]}
                                                        rehypePlugins={[rehypeKatex]}
                                                        components={{
                                                            p: (props) => <p className="mb-2 last:mb-0" {...props} />,
                                                            strong: (props) => <span className="font-bold text-indigo-600 dark:text-indigo-400" {...props} />,
                                                            ul: (props) => <ul className="list-disc pl-4 space-y-1 mb-2" {...props} />,
                                                            ol: (props) => <ol className="list-decimal pl-4 space-y-1 mb-2" {...props} />,
                                                            li: (props) => <li className="pl-1" {...props} />,
                                                            h1: (props) => <h3 className="text-lg font-black mt-4 mb-2" {...props} />,
                                                            h2: (props) => <h4 className="text-base font-bold mt-3 mb-1" {...props} />,
                                                            h3: (props) => <h5 className="text-sm font-bold mt-2 mb-1" {...props} />,
                                                        }}
                                                    >
                                                        {explanationTranscript}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* --- Printable Notes Section (Visible strictly only during print) --- */}
            {generatedNotes && (
                <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-12 overflow-y-auto w-full h-full text-black print:!text-black">
                    <div className="mb-8 border-b-2 border-black pb-6">
                        <h1 className="text-4xl font-black text-black mb-2">{selectedChapter}</h1>
                        <p className="text-black font-bold text-lg uppercase tracking-widest">{getDbKey(selectedSubject)} • {examType} Syllabus 2025</p>
                    </div>

                    <div className="prose prose-lg max-w-none text-black print:text-black">
                        <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                                h1: (props) => <h1 className="text-3xl font-black text-black mt-12 mb-6" {...props} />,
                                h2: (props) => <h2 className="text-2xl font-black text-black mt-10 mb-5 pb-2 border-b-2 border-black" {...props} />,
                                h3: (props) => <h3 className="text-xl font-bold text-black mt-8 mb-4" {...props} />,
                                p: (props) => <p className="text-lg text-black leading-[1.8] mb-6 font-medium" {...props} />,
                                ul: (props) => <ul className="space-y-2 mb-8 list-disc pl-8 text-black" {...props} />,
                                li: (props) => <li className="pl-2 text-lg text-black font-medium" {...props} />,
                                strong: (props) => <strong className="font-black text-black" {...props} />,
                                blockquote: (props) => <blockquote className="border-l-4 border-black pl-4 py-2 italic bg-gray-50 text-black my-6" {...props} />,
                                code: (props) => <code className="bg-gray-100 text-black px-2 py-1 rounded font-bold" {...props} />
                            }}
                        >
                            {generatedNotes}
                        </ReactMarkdown>
                    </div>

                    <div className="mt-16 pt-8 border-t border-slate-300 flex justify-between items-center text-slate-500 font-bold text-sm">
                        <span>Generated by Yuga AI Educational Platform</span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(139, 92, 246, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 92, 246, 0.4);
                }
                @media print {
                    @page { margin: 2cm; }
                    body * {
                        visibility: hidden;
                    }
                    .print\\:block, .print\\:block * {
                        visibility: visible;
                    }
                    .print\\:block {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        background: white;
                    }
                }
            `}</style>
        </div>
    );
};
