import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, X, Bot, User } from "lucide-react";
import { apiRequest } from "../../../core/utils/api";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'question' | 'clarification' | 'general';
}

interface RealTimeChatProps {
  onQuestionAsked: (question: string) => void;
  onClose: () => void;
  courseCategory?: string;
  maxSuggestions?: number;
  hideHeader?: boolean;
}

export const RealTimeChat: React.FC<RealTimeChatProps> = ({ onQuestionAsked, onClose, courseCategory = 'General', hideHeader = false }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI assistant. I'm here to help you during the lesson. Feel free to ask any questions about the topic we're covering!",
      sender: 'ai',
      timestamp: new Date(),
      type: 'general'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const quickQuestions = [
    "Can you explain this concept again?",
    "What's a real-world example?",
    "How does this relate to previous topics?",
    "Can you show this on the whiteboard?"
  ];

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const messageType = inputText.includes('?') ? 'question' : 'general';

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      type: messageType
    };

    setMessages(prev => [...prev, userMessage]);
    onQuestionAsked(inputText);
    setInputText('');
    setIsTyping(true);

    try {
      // Convert messages to format expected by backend
      const conversationHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      // Add current message
      conversationHistory.push({ role: 'user', content: userMessage.text });

      const response = await apiRequest('/voice/query', 'POST', {
        messages: conversationHistory,
        courseCategory: courseCategory
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: 'ai',
          timestamp: new Date(),
          type: 'general'
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Fallback if API fails
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm having trouble connecting to my brain right now. Please try again later.",
          sender: 'ai',
          timestamp: new Date(),
          type: 'general'
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting to my brain right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'general'
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = () => {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-[#0f111a]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex flex-col h-full overflow-hidden">
      {/* Header - Only show if not hidden */}
      {!hideHeader && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-3 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="font-semibold text-gray-100 text-sm">AI Assistant</span>
              <div className="flex items-center space-x-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide">ONLINE</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}



      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-1.5 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 shadow-md border border-white/10 ${message.sender === 'user' ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-gradient-to-br from-cyan-600 to-blue-600'
                }`}>
                {message.sender === 'user' ? (
                  <User className="w-2.5 h-2.5 text-white" />
                ) : (
                  <span className="text-[9px] font-bold text-white tracking-tighter leading-none">AI</span>
                )}
              </div>
              <div
                className={`rounded-2xl px-2 py-1.5 shadow-lg backdrop-blur-sm border transition-all ${message.sender === 'user'
                  ? 'bg-teal-600/80 text-white border-teal-400/50 shadow-teal-500/20 rounded-tr-none'
                  : 'bg-slate-700/80 text-gray-100 border-teal-500/30 shadow-teal-500/10 rounded-tl-none'
                  }`}
              >
                <p className="text-[11px] leading-snug">{message.text}</p>
                <p className={`text-[9px] mt-0.5 opacity-60 text-right ${message.sender === 'user' ? 'text-teal-200' : 'text-teal-300'
                  }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-1.5">
              <div className="w-5 h-5 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                <Bot className="w-2.5 h-2.5 text-cyan-400" />
              </div>
              <div className="bg-slate-800/50 rounded-lg rounded-tl-none px-2 py-1.5 border border-white/5">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-cyan-400/50 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-400/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-cyan-400/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-2 py-1.5 border-t border-white/10 bg-black/20 backdrop-blur-sm flex-shrink-0">
        {/* Quick Questions - Only show if user hasn't sent any messages yet */}
        {messages.filter(m => m.sender === 'user').length === 0 && (
          <div className="pb-1.5 mb-1.5 border-b border-white/5">
            <div className="flex flex-wrap gap-1">
              {quickQuestions.slice(0, 2).map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(question)}
                  className="px-2 py-0.5 bg-slate-800/50 text-cyan-300 border border-cyan-500/20 rounded text-[10px] hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-all text-left leading-tight"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center space-x-1.5">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question..."
              className="w-full px-2 py-1.5 bg-slate-900/50 border border-white/10 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500/50 text-[11px] text-gray-200 placeholder-gray-500 transition-all outline-none group-hover:border-white/20"
            />
          </div>
          <button
            onClick={handleVoiceInput}
            className={`p-1.5 rounded-lg transition-all border border-white/5 ${isListening
              ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
              : 'bg-slate-800/50 text-gray-400 hover:text-cyan-400 hover:bg-slate-800 hover:border-cyan-500/30'
              }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="p-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
