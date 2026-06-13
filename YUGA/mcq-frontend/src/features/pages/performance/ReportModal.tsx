import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Loader2 } from 'lucide-react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    htmlContent: string | null;
    isLoading: boolean;
    onDownload: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, htmlContent, isLoading, onDownload }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await onDownload();
        } finally {
            setIsDownloading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Performance Report Preview</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Review your insights before downloading</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleDownload}
                                        disabled={isLoading || isDownloading || !htmlContent}
                                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDownloading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        {isDownloading ? 'Downloading...' : 'Download PDF'}
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 relative overflow-hidden">
                                {isLoading ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                        <div className="w-16 h-16 mb-6 relative">
                                            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
                                            <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Performance...</h4>
                                        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                                            Our AI engine is crunching your numbers to generate a personalized strategy roadmap.
                                        </p>
                                    </div>
                                ) : htmlContent ? (
                                    <iframe
                                        srcDoc={htmlContent}
                                        title="Report Preview"
                                        className="w-full h-full border-0"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-500">
                                        Failed to load report.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
