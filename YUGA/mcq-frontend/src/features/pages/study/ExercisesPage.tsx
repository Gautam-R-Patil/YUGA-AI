import React, { useState, useEffect } from "react";
import { Upload, X, CheckCircle, RefreshCw, Image, FileText, Calculator, Clock, BookOpen, Sparkles } from "lucide-react";
import { trackEvent } from "../../../core/utils/analytics";
import { apiRequest } from "../../../core/utils/api";
import ReactMarkdown from "react-markdown";

interface UploadedExercise {
    id: string;
    imagePreview: string; // Base64
    name: string;
    uploadDate: number;
    status: 'processing' | 'completed' | 'failed';
    solution?: string; // Placeholder for solution text
}

export const ExercisesPage = () => {
    const [exercises, setExercises] = useState<UploadedExercise[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<UploadedExercise | null>(null);

    // Load exercises from localStorage
    useEffect(() => {
        const savedExercises = localStorage.getItem("yuga_user_exercises");
        if (savedExercises) {
            setExercises(JSON.parse(savedExercises));
        }
    }, []);

    // Save exercises to localStorage
    useEffect(() => {
        localStorage.setItem("yuga_user_exercises", JSON.stringify(exercises));
    }, [exercises]);

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        if (!file.type.match('image.*') && !file.type.match('application/pdf')) {
            alert('Please upload an image or PDF file.');
            return;
        }

        setIsProcessing(true);
        trackEvent('Exercises', 'upload_start', file.name);

        try {
            // Read file as base64 for preview and local storage
            const reader = new FileReader();
            reader.onload = async (e) => {
                const result = e.target?.result as string;

                const newExercise: UploadedExercise = {
                    id: Date.now().toString(),
                    imagePreview: result,
                    name: file.name,
                    uploadDate: Date.now(),
                    status: 'processing'
                };

                setExercises(prev => [newExercise, ...prev]);

                // Call Backend AI to solve the problem
                try {
                    const response = await apiRequest('/ocr/solve', 'POST', {
                        base64Image: result,
                        contentType: file.type || 'image/jpeg'
                    });

                    const data = await response.json();

                    if (response.ok && data.success) {
                        setExercises(prev => prev.map(ex =>
                            ex.id === newExercise.id
                                ? { ...ex, status: 'completed', solution: data.solution }
                                : ex
                        ));
                        trackEvent('Exercises', 'solve_success', file.name);
                    } else {
                        throw new Error(data.error || 'Failed to solve');
                    }
                } catch (err: any) {
                    console.error('AI Solving Error:', err);
                    setExercises(prev => prev.map(ex =>
                        ex.id === newExercise.id
                            ? { ...ex, status: 'failed', solution: "Sorry, I couldn't solve this problem. Please try a clearer image." }
                            : ex
                    ));
                    trackEvent('Exercises', 'solve_failed', file.name);
                } finally {
                    setIsProcessing(false);
                }
            };
            reader.readAsDataURL(file);

        } catch (error) {
            console.error(error);
            setIsProcessing(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e.dataTransfer.files);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-12 animate-fade-in font-sans text-slate-700 dark:text-slate-300">
            {/* Soft Modern Header - Inspired by TimeTable */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mb-8">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-full blur-3xl opacity-60 -mr-16 -mt-16 transition-opacity group-hover:opacity-80"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-100 dark:ring-blue-800">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold text-slate-800 dark:text-white tracking-tight mb-2">
                                    Homework Helper
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                                    AI-powered solutions for your handwritten & printed problems
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-medium border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                AI Scanner Ready
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Upload Area - Fills 7 columns */}
                    <div className="lg:col-span-7 flex flex-col h-full">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-1 h-full flex flex-col hover:shadow-md transition-shadow duration-500">
                            <div className="bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-800/50 dark:to-slate-900 rounded-[1.4rem] p-8 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Upload Question</h2>
                                    </div>
                                    <span className="text-sm text-slate-400 font-medium bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
                                        JPG, PNG, PDF
                                    </span>
                                </div>

                                <div
                                    className={`
                                        group relative flex-grow flex flex-col items-center justify-center
                                        border-[3px] border-dashed rounded-3xl p-10 text-center transition-all duration-300
                                        ${isDragging
                                            ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.01]'
                                            : 'border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 hover:border-blue-300 hover:bg-blue-50/10 dark:hover:bg-blue-900/10'
                                        }
                                    `}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                                        onChange={(e) => handleFileUpload(e.target.files)}
                                        accept="image/*,.pdf"
                                        disabled={isProcessing}
                                    />

                                    <div className="relative z-10 flex flex-col items-center pointer-events-none">
                                        <div className={`
                                            w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm transition-all duration-500
                                            ${isProcessing ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : isDragging ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 group-hover:scale-110'}
                                        `}>
                                            {isProcessing ? (
                                                <RefreshCw className="w-8 h-8 animate-spin" />
                                            ) : (
                                                <Image className="w-8 h-8" />
                                            )}
                                        </div>

                                        <h3 className="text-xl font-medium text-slate-700 dark:text-slate-200 mb-2">
                                            {isProcessing ? 'Analyzing your image...' : isDragging ? 'Drop it now' : 'Drag & drop to upload'}
                                        </h3>
                                        <p className="text-slate-400 dark:text-slate-500 max-w-xs mx-auto mb-8 text-sm font-medium">
                                            {isProcessing ? 'Identifying problems & extracting text' : 'or click to browse your files'}
                                        </p>

                                        {!isProcessing && (
                                            <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all flex items-center gap-2 group-hover:translate-y-[-2px]">
                                                <Upload className="w-4 h-4" />
                                                Choose File
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Recent Scans - Fills 5 columns */}
                    <div className="lg:col-span-5 flex flex-col h-full">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 h-full flex flex-col hover:shadow-md transition-shadow duration-500">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-3">
                                    <span className="w-2 h-8 bg-cyan-500 rounded-full"></span>
                                    Recent Solutions
                                </h2>
                                <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4 overflow-y-auto custom-scrollbar flex-grow pr-1 max-h-[600px]">
                                {exercises.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                                            <Clock className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <p className="font-medium text-slate-500 dark:text-slate-400">No history yet</p>
                                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-[150px]">Your solved problems will appear here</p>
                                    </div>
                                ) : (
                                    exercises.map((ex) => (
                                        <div
                                            key={ex.id}
                                            className="group relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-3 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-300 cursor-pointer"
                                            onClick={() => ex.status === 'completed' && setSelectedExercise(ex)}
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700 relative">
                                                    {ex.imagePreview.includes('data:image') ? (
                                                        <img src={ex.imagePreview} alt="Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-500">
                                                            <FileText className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                    {ex.status === 'completed' && (
                                                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h3 className="font-medium text-slate-800 dark:text-white truncate pr-2 text-base" title={ex.name}>
                                                            {ex.name}
                                                        </h3>
                                                        <div className="flex-shrink-0">
                                                            {ex.status === 'completed' ? (
                                                                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                                </div>
                                                            ) : ex.status === 'processing' ? (
                                                                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                                                            ) : (
                                                                <X className="w-5 h-5 text-red-500" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-2">
                                                        {new Date(ex.uploadDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>

                                                    {ex.status === 'completed' && (
                                                        <span className="inline-flex text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                                                            View Solution
                                                        </span>
                                                    )}
                                                    {ex.status === 'processing' && (
                                                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1 mt-1 overflow-hidden">
                                                            <div className="bg-blue-500 h-1 rounded-full animate-progress"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workflow Cards */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Upload', desc: 'Take a clear photo', icon: Upload, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { title: 'Analyze', desc: 'AI extracts text', icon: RefreshCw, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
                        { title: 'Solve', desc: 'Get instant solution', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
                    ].map((step, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                            <div className={`w-12 h-12 rounded-xl ${step.bg} ${step.color} flex items-center justify-center`}>
                                <step.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{step.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Clean Modal */}
            {selectedExercise && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-slide-in-up ring-1 ring-slate-900/5">
                        {/* Modal Header */}
                        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-8 py-5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Calculator className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Solution</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium truncate max-w-xs">{selectedExercise.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedExercise(null)}
                                className="w-8 h-8 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex flex-col md:flex-row flex-1 overflow-hidden h-full bg-slate-50/50 dark:bg-slate-950/50">
                            {/* Left: Original Image */}
                            <div className="w-full md:w-5/12 p-6 overflow-y-auto custom-scrollbar border-r border-slate-100 dark:border-slate-800">
                                <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700">
                                    <div className="mb-3 px-2 pt-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                        <h4 className="font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                            Question Image
                                        </h4>
                                    </div>
                                    <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                        <img
                                            src={selectedExercise.imagePreview}
                                            alt="Problem"
                                            className="w-full h-auto object-contain"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right: Solution */}
                            <div className="w-full md:w-7/12 p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                                <div className="prose prose-slate dark:prose-invert prose-headings:font-semibold prose-p:font-normal prose-p:text-slate-600 dark:prose-p:text-slate-300 max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-slate-800" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-3 flex items-center gap-2" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-slate-800 dark:text-slate-300 mt-4 mb-2" {...props} />,
                                            p: ({ node, ...props }) => <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 text-slate-600 dark:text-slate-300 space-y-1" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 text-slate-600 dark:text-slate-300 space-y-1" {...props} />,
                                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900 dark:text-white" {...props} />,
                                            blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-blue-500 pl-4 py-1 my-4 bg-blue-50/30 dark:bg-blue-900/20 text-slate-700 dark:text-slate-300 italic" {...props} />,
                                            code: ({ node, ...props }) => <code className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-sm font-medium border border-slate-200 dark:border-slate-700" {...props} />,
                                        }}
                                    >
                                        {selectedExercise.solution
                                            // Basic LaTeX cleanup
                                            ?.replace(/\\boxed\{([^}]+)\}/g, '**$1**')
                                            .replace(/\\times/g, '×')
                                            .replace(/\\sqrt\{([^}]+)\}/g, '√$1')
                                            .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)')
                                            .replace(/\\circ/g, '°')
                                            .replace(/\\sin/g, 'sin')
                                            .replace(/\\cos/g, 'cos')
                                            .replace(/\\tan/g, 'tan')
                                            .replace(/\$([^$]+)\$/g, '`$1`')
                                        }
                                    </ReactMarkdown>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 opacity-60">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">AI generated content can make mistakes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

