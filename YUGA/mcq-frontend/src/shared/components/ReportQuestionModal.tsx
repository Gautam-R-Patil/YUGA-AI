import React, { useState } from 'react';
import { X, MessageSquare, Send, AlertCircle, ChevronRight } from 'lucide-react';
import { apiRequest } from '../../core/utils/api';
import { useAuth } from '../../core/contexts/AuthContext';

interface ReportQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    questionData: any;
    type: 'mock' | 'practice' | 'analysis';
    extraData?: {
        selectedAnswer?: string;
        explanation?: string;
    };
}

export const ReportQuestionModal: React.FC<ReportQuestionModalProps> = ({
    isOpen,
    onClose,
    questionData,
    type,
    extraData
}) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'choice' | 'feedback'>('choice');
    const [feedback, setFeedback] = useState('');

    if (!isOpen) return null;

    const cleanForWA = (text: string) => {
        if (!text) return "";
        return text
            .replace(/\\/g, '')
            .replace(/\$\$/g, '')
            .replace(/\$/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    };

    const handleSend = async (includeFeedback: boolean) => {
        const whatsappNumber = "918089846983";
        const q = questionData;

        let title = "REPORT: QUESTION";
        if (type === 'mock') title = "REPORT: MOCK EXAM QUESTION";
        if (type === 'practice') title = "REPORT: MCQ PRACTICE QUESTION";
        if (type === 'analysis') title = "REPORT: MOCK EXAM ANALYSIS";

        let message = `🚀 *${title}*\n`;
        message += `──────────────────────\n\n`;

        if (includeFeedback && feedback.trim()) {
            message += `💭 *USER FEEDBACK:*\n"${feedback.trim()}"\n\n`;
            message += `──────────────────────\n\n`;
        }

        message += `🆔 *Question ID:* ${q.id}\n\n`;
        message += `❓ *Question:*\n${cleanForWA(q.question || q.text || '')}\n\n`;

        message += `🔢 *Options:*\n`;
        const options = q.options || [];
        options.forEach((opt: string, i: number) => {
            message += `${String.fromCharCode(65 + i)}) ${cleanForWA(opt)}\n`;
        });
        message += `\n`;

        message += `✅ *Correct Answer:* ${q.correctAnswer}\n\n`;

        const userSelected = extraData?.selectedAnswer;
        if (userSelected) {
            message += `👤 *Student Selected:* ${userSelected}\n\n`;
        }

        // Handle images
        const images = q.images || [];
        if (images.length > 0) {
            const imgNames = images.map((img: any) => typeof img === 'string' ? img : img.filename || 'attached figure');
            message += `🖼️ *Images Attached:* ${imgNames.join(', ')}\n\n`;
        }

        const imgTags = (q.question || q.text || '').match(/\[IMG:\s*([^\]]+)\]/g);
        if (imgTags) {
            message += `🏷️ *Embedded Tags:*\n${imgTags.join('\n')}\n\n`;
        }

        const finalExp = extraData?.explanation || q.explanation;
        if (finalExp) {
            message += `💡 *Explanation:*\n${cleanForWA(finalExp)}\n\n`;
        }

        message += `──────────────────────\n`;
        message += `_Sent via YUGA ${type.charAt(0).toUpperCase() + type.slice(1)} Portal_`;

        // Send Email via Backend
        try {
            await apiRequest('/mcq/admin/report', 'POST', {
                reportText: message.replace(/\*/g, ''), // Strip WA bold for email
                evaluatorName: user?.name || 'Student / User',
                email: user?.email || 'N/A',
                subject: q.subject || type,
                questionNo: q.id
            });
        } catch (err) {
            console.error('Failed to send report email:', err);
        }

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        onClose();
        // Reset state for next time
        setTimeout(() => {
            setStep('choice');
            setFeedback('');
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white">Report Question</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {step === 'choice' ? (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                How would you like to report this question?
                            </p>

                            <button
                                type="button"
                                onClick={() => handleSend(false)}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50/30 dark:hover:bg-red-900/10 group transition-all"
                            >
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                        <Send className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 dark:text-white">Send Report Only</div>
                                        <div className="text-xs text-slate-500">Fast reporting for obvious errors</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-red-500" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('feedback')}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 group transition-all"
                            >
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 dark:text-white">Add Feedback</div>
                                        <div className="text-xs text-slate-500">Explain the issue in detail</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <label htmlFor="report-feedback" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Your Feedback
                            </label>
                            <textarea
                                id="report-feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Tell us what's wrong with this question..."
                                className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-sm"
                                autoFocus
                            />
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep('choice')}
                                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSend(true)}
                                    disabled={!feedback.trim()}
                                    className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Send with Feedback
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
