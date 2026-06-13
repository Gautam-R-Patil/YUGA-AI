import React, { useState, useEffect } from "react";
import { Send, Mic, MicOff, X, Sparkles, MessageSquare, History, CheckCircle, Clock, Laptop, Briefcase, Microscope, Calculator, Code, Palette } from "lucide-react";
import { Doubt } from "../../../core/types";
import { AIAvatar } from "../../../shared/components/AIAvatar";
import { apiRequest } from "../../../core/utils/api";

interface DoubtSolverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DoubtSolver: React.FC<DoubtSolverProps> = ({ isOpen, onClose }) => {
  const [doubts, setDoubts] = useState<Doubt[]>(() => {
    try {
      const history = localStorage.getItem('yuga_doubts_history');
      if (history) {
        return JSON.parse(history).map((d: any) => ({
          ...d,
          timestamp: new Date(d.timestamp)
        }));
      }
    } catch (e) { console.error(e); }

    return [{
      id: '1',
      question: 'What is the difference between machine learning and deep learning?',
      subject: 'Technology',
      course: 'Introduction to Machine Learning',
      answer: 'Machine learning is a broader field that includes various algorithms for pattern recognition, while deep learning is a subset that uses neural networks with multiple layers.',
      status: 'answered',
      timestamp: new Date(Date.now() - 3600000),
      tags: ['ML', 'Deep Learning', 'AI'],
      difficulty: 'medium'
    }];
  });

  useEffect(() => {
    localStorage.setItem('yuga_doubts_history', JSON.stringify(doubts));
  }, [doubts]);

  const [currentQuestion, setCurrentQuestion] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ask' | 'history'>('ask');
  const [error, setError] = useState<string | null>(null);

  const subjects = [
    { id: 'tech', name: 'Technology', icon: <Laptop className="w-6 h-6" />, color: 'blue' },
    { id: 'biz', name: 'Business', icon: <Briefcase className="w-6 h-6" />, color: 'emerald' },
    { id: 'sci', name: 'Science', icon: <Microscope className="w-6 h-6" />, color: 'blue' },
    { id: 'math', name: 'Mathematics', icon: <Calculator className="w-6 h-6" />, color: 'amber' },
    { id: 'prog', name: 'Programming', icon: <Code className="w-6 h-6" />, color: 'cyan' },
    { id: 'design', name: 'Design', icon: <Palette className="w-6 h-6" />, color: 'pink' }
  ];

  const quickPrompts = [
    "Explain Quantum Computing simply",
    "How does a neural network learn?",
    "What is the Golden Ratio?",
    "Tips for time management"
  ];

  const handleSubmitDoubt = async () => {
    if (!currentQuestion.trim() || !selectedSubject) return;

    setError(null);
    setIsProcessing(true);

    const newDoubt: Doubt = {
      id: Date.now().toString(),
      question: currentQuestion,
      subject: selectedSubject,
      status: 'pending',
      timestamp: new Date(),
      tags: [],
      difficulty: 'medium'
    };

    setDoubts(prev => [newDoubt, ...prev]);

    try {
      const messages = [{ role: 'user', content: newDoubt.question }];
      const response = await apiRequest('/voice/query', 'POST', {
        messages: messages,
        courseCategory: selectedSubject,
        source: 'doubt_solver',
        taskType: 'doubt_clarification'
      });

      if (response.ok) {
        const data = await response.json();
        setDoubts(prev => prev.map(doubt =>
          doubt.id === newDoubt.id
            ? { ...doubt, answer: data.response, status: 'answered' }
            : doubt
        ));
        setCurrentQuestion('');
        setActiveTab('history');
      } else if (response.status === 403) {
        // Handle premium limit error
        const errorData = await response.json();
        setError(errorData.message || 'You have reached your limit for doubts. Upgrade your plan for more.');
        setDoubts(prev => prev.filter(d => d.id !== newDoubt.id));
      } else {
        const fallbackAnswer = "Great question! Let me break this down for you step by step...";
        setDoubts(prev => prev.map(doubt =>
          doubt.id === newDoubt.id
            ? { ...doubt, answer: fallbackAnswer + " (Offline Mode)", status: 'answered' }
            : doubt
        ));
        setCurrentQuestion('');
        setActiveTab('history');
      }
    } catch (error) {
      console.error("Error fetching answer:", error);
      const fallbackAnswer = "Great question! Let me break this down for you step by step...";
      setDoubts(prev => prev.map(doubt =>
        doubt.id === newDoubt.id
          ? { ...doubt, answer: fallbackAnswer + " (Offline Mode)", status: 'answered' }
          : doubt
      ));
      setCurrentQuestion('');
      setActiveTab('history');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setCurrentQuestion("What is the difference between supervised and unsupervised learning?");
        setIsRecording(false);
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[9999] flex items-center justify-center p-2 sm:p-4 animate-fadeIn font-sans">
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl w-[95%] sm:w-full max-w-4xl h-[90vh] sm:h-[85vh] overflow-hidden relative animate-scaleUp flex flex-col">

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                Ask YUGA AI
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Beta</span>
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm">Get instant, detailed answers to your doubts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-200"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-0 border-b border-slate-100 bg-slate-50/50">
          <div className="flex gap-4 sm:gap-6">
            <button
              onClick={() => setActiveTab('ask')}
              className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 relative ${activeTab === 'ask' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ASK QUESTION
              </div>
              {activeTab === 'ask' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full animate-scaleUp" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 relative ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <div className="flex items-center gap-2">
                <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                HISTORY ({doubts.length})
              </div>
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full animate-scaleUp" />
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
          {activeTab === 'ask' ? (
            <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-3xl mx-auto">
              {/* Subject Selection */}
              <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
                <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-3 sm:mb-4 uppercase tracking-wider">Select Subject</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {subjects.map(subject => (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject.name)}
                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all duration-300 relative overflow-hidden group border-2 ${selectedSubject === subject.name
                        ? `bg-${subject.color}-50 border-${subject.color}-500 shadow-lg shadow-${subject.color}-100`
                        : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'
                        }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl mb-2 sm:mb-3 transition-colors ${selectedSubject === subject.name
                        ? `bg-${subject.color}-100 text-${subject.color}-600`
                        : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                        }`}>
                        {subject.icon}
                      </div>
                      <span className={`font-bold text-sm sm:text-base block ${selectedSubject === subject.name ? `text-${subject.color}-900` : 'text-slate-700'}`}>
                        {subject.name}
                      </span>

                      {selectedSubject === subject.name && (
                        <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 text-${subject.color}-500 animate-scaleUp`}>
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Input */}
              <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
                <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-3 sm:mb-4 uppercase tracking-wider">Your Question</label>
                <div className="relative group">
                  <textarea
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder="Type your question here... or use voice input"
                    className="w-full h-32 sm:h-40 p-4 sm:p-6 bg-white border-2 border-slate-200 rounded-2xl resize-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm sm:text-base text-slate-800 placeholder-slate-400 outline-none shadow-sm group-hover:border-slate-300"
                  />
                  <button
                    onClick={handleVoiceInput}
                    className={`absolute bottom-3 right-3 sm:bottom-4 sm:right-4 p-2 sm:p-3 rounded-xl transition-all duration-300 shadow-sm border ${isRecording
                      ? 'bg-red-50 text-red-500 border-red-200 animate-pulse'
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>

                {/* Quick Prompts */}
                <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestion(prompt)}
                      className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] sm:text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-slideUp">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmitDoubt}
                disabled={!currentQuestion.trim() || !selectedSubject || isProcessing}
                className="w-full bg-slate-900 text-white py-4 sm:py-5 px-6 rounded-2xl font-bold text-base sm:text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 animate-slideUp"
                style={{ animationDelay: '0.3s' }}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    Ask YUGA AI
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 max-w-3xl mx-auto">
              {doubts.length === 0 ? (
                <div className="text-center py-16 sm:py-20 animate-fadeIn">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">No questions yet</h3>
                  <p className="text-sm sm:text-base text-slate-500">Ask your first question to get started!</p>
                </div>
              ) : (
                doubts.map((doubt, idx) => (
                  <div
                    key={doubt.id}
                    className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 animate-slideUp"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-blue-100">
                            {doubt.subject}
                          </span>
                          <span className="text-[10px] sm:text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {doubt.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug">{doubt.question}</h3>
                      </div>
                      <div className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 ${doubt.status === 'answered'
                        ? 'bg-green-50 text-green-700 border border-green-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                        {doubt.status === 'answered' && <CheckCircle className="w-3 h-3" />}
                        {doubt.status}
                      </div>
                    </div>

                    {doubt.answer && (
                      <div className="mt-3 sm:mt-4 p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-500"></div>
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="shrink-0 mt-1">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden">
                              <AIAvatar size="small" emotion="explaining" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] sm:text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">YUGA AI Answer</p>
                            <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">{doubt.answer}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};
