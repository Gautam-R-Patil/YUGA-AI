import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, X, Sparkles } from "lucide-react";
import { ChatMessage } from "../../core/types";
import { apiRequest } from "../../core/utils/api";
import { useAuth } from "../../core/contexts/AuthContext";
import { AIAvatar } from "./AIAvatar";

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  courseCategory?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose, courseCategory = 'General Knowledge' }) => {
  const { user } = useAuth();

  // Resolve effective category based on user profile if generic default
  const effectiveCategory = React.useMemo(() => {
    if (courseCategory !== 'General Knowledge' && courseCategory !== 'General') {
      return courseCategory;
    }

    // Auto-detect based on user profile
    if (user?.preferences?.subjects) {
      const subjects = user.preferences.subjects.map(s => s.toLowerCase());
      if (subjects.some(s => s.includes('math') || s.includes('engineering') || s.includes('jee'))) {
        return 'IIT-JEE';
      }
      if (subjects.some(s => s.includes('bio') || s.includes('medical') || s.includes('neet'))) {
        return 'NEET';
      }
    }

    // Default fallback
    return 'NEET';
  }, [courseCategory, user]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm Educore, your personal AI Tutor. I can solve your doubts, explain complex topics, or help you plan your studies. What can I help you with today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [currentSpeech, setCurrentSpeech] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setInputMessage(prev => prev + finalTranscript);
        } else if (interimTranscript) {
          // We don't want to permanently append interim results, 
          // but we want to show them. For now, let's just update the message.
          // Better logic: store "base" message and add current interim.
          setInputMessage(prev => {
            // This is a simple implementation. A better one would track the 
            // stable part of the message separate from the active interim.
            return finalTranscript || interimTranscript;
          });
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Audio cleanup on close
  useEffect(() => {
    if (!isOpen) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setCurrentSpeech('');
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      conversationHistory.push({ role: 'user', content: userMessage.content });

      const response = await apiRequest('/voice/query', 'POST', {
        messages: conversationHistory,
        courseCategory: effectiveCategory
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponseText = data.response;

        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: aiResponseText,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);

        if (speechEnabled) {
          setCurrentSpeech(aiResponseText);
        }
      } else {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: "I'm having trouble connecting to my brain right now. Please try again later.",
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting to my brain right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMicrophoneToggle = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition error:', error);
      }
    }
  };

  const handleSpeechToggle = () => {
    setSpeechEnabled(!speechEnabled);
    if (!speechEnabled) {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      setCurrentSpeech('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[9999] flex items-center justify-center p-2 sm:p-4 animate-fadeIn font-sans">
      <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl w-[95%] sm:w-full max-w-4xl h-[90vh] sm:h-[85vh] overflow-hidden relative animate-scaleUp flex flex-col border border-white/20 dark:border-slate-800">

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 rotate-3 transform hover:rotate-0 transition-all duration-300">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-transparent bg-clip-text">Educore</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800/50">Online</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">Your Personal AI Tutor & Doubt Solver</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeechToggle}
              className={`p-2 sm:p-3 rounded-xl transition-all duration-200 ${speechEnabled
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              title={speechEnabled ? 'Disable AI Speech' : 'Enable AI Speech'}
            >
              {speechEnabled ? <Volume2 className="w-5 h-5 sm:w-5 sm:h-5" /> : <VolumeX className="w-5 h-5 sm:w-5 sm:h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-200"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}
            >
              <div className={`flex items-end gap-2 sm:gap-3 max-w-[90%] sm:max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                {message.sender === 'ai' && (
                  <div className="flex-shrink-0 mb-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden">
                      <AIAvatar
                        size="small"
                        emotion="explaining"
                        isSpeaking={currentSpeech === message.content}
                      />
                    </div>
                  </div>
                )}

                <div
                  className={`rounded-2xl p-3 sm:p-5 shadow-sm relative group ${message.sender === 'user'
                    ? 'bg-gradient-to-br from-emerald-600 to-cyan-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none'
                    }`}
                >
                  <p className="leading-relaxed text-sm sm:text-[15px]">{message.content}</p>
                  <p className={`text-[10px] mt-1 sm:mt-2 font-medium uppercase tracking-wider ${message.sender === 'user' ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fadeIn">
              <div className="flex items-end gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm overflow-hidden mb-1">
                  <AIAvatar size="small" emotion="thinking" isActive />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none p-3 sm:p-4 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-end gap-2 sm:gap-3">
            <div className="flex-1 relative group">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="w-full p-3 sm:p-4 pr-10 sm:pr-14 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl resize-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all text-sm sm:text-base text-slate-800 dark:text-white placeholder-slate-400 outline-none"
                rows={1}
              />
              <button
                onClick={handleMicrophoneToggle}
                className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 p-1.5 sm:p-2.5 rounded-xl transition-all duration-300 ${isListening
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-500 animate-pulse'
                  : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 shadow-sm border border-slate-100 dark:border-slate-700'
                  }`}
                title={isListening ? 'Stop Listening' : 'Start Voice Input'}
              >
                {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="bg-slate-900 dark:bg-emerald-600 text-white p-3 sm:p-4 rounded-2xl hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div >
  );
};

