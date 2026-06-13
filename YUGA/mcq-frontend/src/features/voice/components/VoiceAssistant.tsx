import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Volume2, VolumeX, X, MessageCircle, Bot, ArrowUp, Activity, Lock } from "lucide-react";
import { trackAIEvent, trackEvent } from "../../../core/utils/analytics";
import { apiRequest } from "../../../core/utils/api";
import { createObjectUrlFromBase64Audio } from "../../../core/utils/audio";
import ReactMarkdown from 'react-markdown';

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  courseCategory?: string;
  onQuestionAsked?: (question: string) => void;
  language?: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  isOpen,
  onClose,
  courseCategory = "General",
  onQuestionAsked = () => { },
  language = 'english'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState<Array<{ role: string, content: string }>>([]);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [error, setError] = useState('');
  const [isChatMode, setIsChatMode] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isPremiumLocked, setIsPremiumLocked] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef<any>(null);

  // Track voice assistant open
  React.useEffect(() => {
    if (isOpen) {
      trackAIEvent('voice_assistant_opened', courseCategory);
      trackEvent('Voice Assistant', 'session_start', courseCategory);
    }
  }, [isOpen, courseCategory]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ref for conversation to avoid stale closures in callbacks
  const conversationRef = useRef(conversation);
  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  const startListening = async () => {
    try {
      setError('');
      setIsSpeaking(false);
      setInterimTranscript('');
      trackAIEvent('voice_recording_started', courseCategory);
      trackEvent('Voice Assistant', 'start_recording', courseCategory);

      // Stop any current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Start SpeechRecognition for real-time feedback
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'en-US';

          recognitionRef.current.onresult = (event: any) => {
            let currentInterim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                // We keep using MediaRecorder for the actual backend processing
                // but we can show final results here if we want.
              } else {
                currentInterim += event.results[i][0].transcript;
              }
            }
            setInterimTranscript(currentInterim);
          };

          recognitionRef.current.start();
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = sendAudioToBackend;

      mediaRecorder.start();
      setIsListening(true);

      // Auto-stop after 10 seconds (visual countdown could be added here)
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopListening();
        }
      }, 10000);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Microphone access denied. Please check permissions.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setInterimTranscript('');

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      trackAIEvent('voice_recording_stopped', courseCategory);
      trackEvent('Voice Assistant', 'stop_recording', courseCategory);

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsListening(false);
      setIsProcessing(true); // Transition to processing state
    }
  };

  const playAudioFromBase64 = (base64Audio: string, audioMime?: string) => {
    return new Promise<void>((resolve) => {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        const audioUrl = createObjectUrlFromBase64Audio(base64Audio, audioMime);
        const audioElement = new Audio(audioUrl);
        audioRef.current = audioElement;

        audioElement.onended = () => {
          setIsSpeaking(false);
          resolve();
        };

        setIsSpeaking(true);
        audioElement.play();
      } catch (err) {
        console.error('Error playing audio:', err);
        setIsSpeaking(false);
        resolve();
      }
    });
  };

  const handleSendText = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsProcessing(true);

    const newConversation = [
      ...conversation,
      { role: 'user', content: userMessage }
    ];
    setConversation(newConversation);

    try {
      const response = await apiRequest('/voice/query', 'POST', {
        audio: null,
        text: userMessage,
        messages: newConversation,
        courseCategory: courseCategory,
        language: language,
        source: 'voice_assistant'
      });

      if (response.ok) {
        const data = await response.json();
        setConversation([
          ...newConversation,
          { role: 'assistant', content: data.response || '' }
        ]);

        if (data.response) onQuestionAsked(data.response);
        // NO AUDIO PLAYBACK FOR TEXT REQUESTS
      } else if (response.status === 403) {
        setIsPremiumLocked(true);
      } else {
        throw new Error('Failed to process text');
      }
    } catch (err) {
      console.error('Error calling voice API:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const sendAudioToBackend = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
      const reader = new FileReader();

      reader.onload = async () => {
        const audioData = reader.result as string;
        const base64Audio = audioData.split(',')[1];

        try {
          // Use ref to get latest conversation state
          const currentConversation = conversationRef.current;

          const response = await apiRequest('/voice/query', 'POST', {
            audio: base64Audio,
            messages: currentConversation,
            courseCategory: courseCategory,
            language: language,
            source: 'voice_assistant'
          });

          if (response.ok) {
            const data = await response.json();
            setConversation([
              ...currentConversation,
              { role: 'user', content: data.transcription || '' },
              { role: 'assistant', content: data.response || '' }
            ]);

            if (data.response) onQuestionAsked(data.response);
            if (data.audio) await playAudioFromBase64(data.audio, data.audioMime);
          } else if (response.status === 403) {
            setIsPremiumLocked(true);
          } else {
            setError('Failed to understand audio. Please try again.');
          }
        } catch (err) {
          console.error('Error calling voice API:', err);
          setError('Network error. Please check backend.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Error processing audio.');
      setIsProcessing(false);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (audioRef.current) audioRef.current.volume = soundEnabled ? 0 : 1;
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isProcessing]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
      if (audioRef.current) audioRef.current.pause();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // Audio/Recording cleanup on close
  useEffect(() => {
    if (!isOpen) {
      if (isListening) stopListening();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsSpeaking(false);
      setInterimTranscript('');
    }
  }, [isOpen]);

  const formatAIResponse = (text: string) => {
    return (
      <div className="markdown-content">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    );
  };

  if (!isOpen) return null;

  // AI State Determination
  const getAIState = () => {
    if (isListening) return 'listening';
    if (isProcessing) return 'processing';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  const aiState = getAIState();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[10000] p-4 font-sans animate-fade-in">

      {/* Glow Effects Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full transition-all duration-1000 ${isListening ? 'bg-rose-500/20 scale-125' : ''}`}></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative bg-[#0a0a0f]/90 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5 rounded-[32px] shadow-[0_0_80px_rgba(0,0,0,0.5)] w-full max-w-md md:max-w-xl h-[80vh] flex flex-col overflow-hidden transform transition-all animate-scale-up">

        {/* Header */}
        <div className="relative z-10 px-6 py-5 flex items-center justify-between bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${aiState === 'listening' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            <div>
              <h3 className="font-bold text-lg text-white tracking-tight">AI Examiner</h3>
              <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">{courseCategory}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all transform hover:rotate-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent custom-scrollbar">

          {/* Welcome / Empty State */}
          {!isPremiumLocked && conversation.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center -mt-10">
              {/* Animated Orb */}
              <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${aiState === 'listening' ? 'bg-rose-500/40 animate-pulse scale-110' :
                  aiState === 'processing' ? 'bg-blue-500/40 animate-pulse' :
                    aiState === 'speaking' ? 'bg-blue-500/40 animate-pulse scale-105' :
                      'bg-blue-500/20'
                  }`}></div>

                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${aiState === 'listening' ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-[0_0_40px_rgba(244,63,94,0.4)]' :
                  aiState === 'processing' ? 'bg-gradient-to-br from-blue-500 to-cyan-600 animate-spin-slow' :
                    'bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                  }`}>
                  {aiState === 'listening' ? <Mic className="w-8 h-8 text-white animate-bounce" /> :
                    aiState === 'processing' ? <Activity className="w-8 h-8 text-white animate-pulse" /> :
                      <Bot className="w-8 h-8 text-white" />}
                </div>

                {/* Ripple rings for listening */}
                {aiState === 'listening' && (
                  <>
                    <div className="absolute inset-0 rounded-full border border-rose-500/30 animate-ping-slow"></div>
                    <div className="absolute inset-0 rounded-full border border-rose-500/10 animate-ping-slower"></div>
                  </>
                )}
              </div>

              <h4 className="text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 font-bold text-2xl mb-3 tracking-tight px-4">
                {aiState === 'listening' ? (interimTranscript || 'Listening...') :
                  aiState === 'processing' ? 'Thinking...' :
                    'How can I help?'}
              </h4>
              <p className="text-gray-400 text-sm max-w-[260px] leading-relaxed mb-8">
                {aiState === 'listening' ? 'I can hear you...' :
                  'Ask about concepts, formulas, or solving strategies.'}
              </p>

              {aiState === 'idle' && (
                <div className="flex flex-wrap gap-2 justify-center max-w-xs">
                  {["Entropy", "Kinetic Energy", "Exam Tips"].map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => { setIsChatMode(true); setInputText(`Explain ${topic}`); }}
                      className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-xs text-gray-300 transition-all hover:scale-105"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Premium Locked State */}
          {isPremiumLocked && (
            <div className="h-full flex flex-col items-center justify-center text-center -mt-10 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6 ring-1 ring-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <Lock className="w-10 h-10 text-purple-400" />
              </div>
              <h4 className="text-white font-bold text-2xl mb-3 tracking-tight">Interactive AI Tutor</h4>
              <p className="text-gray-400 text-sm max-w-[280px] leading-relaxed mb-8">
                Learn dynamically with an AI tutor that explains complex concepts and guides your studies through voice.
              </p>
              <a
                href="/premium"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-purple-900/40 hover:scale-105 transition-transform"
              >
                Upgrade to Premium
              </a>
            </div>
          )}

          {/* Chat Messages */}
          {!isPremiumLocked && conversation.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            >
              <div className={`flex flex-col gap-1 max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>

                <div className={`px-5 py-4 rounded-2xl shadow-sm backdrop-blur-sm text-sm ${message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white/5 border border-white/10 text-gray-100 rounded-bl-sm'
                  }`}>
                  {message.role === 'assistant' ? (
                    formatAIResponse(message.content)
                  ) : (
                    <p className="leading-relaxed">{message.content}</p>
                  )}
                </div>

                <span className="text-[10px] text-gray-500 font-medium px-1">
                  {message.role === 'user' ? 'You' : 'AI Examiner'}
                </span>
              </div>
            </div>
          ))}

          {/* Loading Indicator in chat flow */}
          {isProcessing && conversation.length > 0 && (
            <div className="flex justify-start animate-fade-in">
              <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/10 rounded-bl-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Notification */}
        {error && (
          <div className="absolute top-20 left-4 right-4 z-50 bg-red-500/90 backdrop-blur-md text-white px-4 py-3 rounded-xl text-xs font-medium shadow-lg animate-slide-down flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}><X className="w-3 h-3" /></button>
          </div>
        )}

        {/* Floating Control Bar */}
        <div className="p-5 relative z-20">

          {/* Text Input Overlay */}
          {isChatMode ? (
            <div className="flex items-center gap-2 animate-slide-up bg-[#0f111a] border border-white/10 rounded-2xl p-1.5 pl-4 shadow-2xl">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                placeholder="Type your doubt..."
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm font-medium"
                autoFocus
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsChatMode(false)}
                  className="p-2.5 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSendText}
                  disabled={!inputText.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">

              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border border-white/5 ${soundEnabled
                  ? 'bg-white/5 text-gray-200 hover:bg-white/10'
                  : 'bg-transparent text-gray-600 hover:text-gray-400'
                  }`}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* BIG MIC BUTTON */}
              <div className="relative group">
                {/* Ambient Glow */}
                <div className={`absolute inset-0 bg-blue-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity ${isListening ? 'bg-rose-500 opacity-60' : ''}`}></div>

                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`relative h-16 flex-1 px-8 rounded-3xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-white/10 shadow-2xl overflow-hidden ${isListening
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 w-full'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 w-[180px]'
                    }`}
                >
                  {/* Animated background noise */}
                  <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                  {isListening ? (
                    <>
                      <Square className="w-5 h-5 text-white fill-current animate-pulse" />
                      <span className="font-bold text-white tracking-wide">STOP</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 text-white" />
                      <span className="font-bold text-white tracking-wide">TAP TO SPEAK</span>
                    </>
                  )}
                </button>
              </div>

              {/* Chat Toggle */}
              <button
                onClick={() => setIsChatMode(true)}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all border border-white/5 bg-white/5 text-gray-200 hover:bg-white/10 hover:border-blue-500/30"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        @keyframes ping-slow {
            0% { transform: scale(1); opacity: 0.5; }
            100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes ping-slower {
            0% { transform: scale(1); opacity: 0.3; }
            100% { transform: scale(2); opacity: 0; }
        }
        .animate-ping-slow {
            animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping-slower {
            animation: ping-slower 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-spin-slow {
            animation: spin 3s linear infinite;
        }
        .markdown-content p {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }
        .markdown-content p:last-child {
          margin-bottom: 0;
        }
        .markdown-content strong {
          color: #93c5fd; /* light blue */
          font-weight: 700;
        }
        .markdown-content ul, .markdown-content ol {
          margin: 0.5rem 0;
          padding-left: 1.25rem;
          list-style-type: disc;
        }
        .markdown-content li {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
};

