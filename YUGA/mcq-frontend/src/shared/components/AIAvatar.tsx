import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Sparkles, Brain, Heart, Volume2, VolumeX, Mic, MicOff } from "lucide-react";

interface AIAvatarProps {
  isActive?: boolean;
  emotion?: 'happy' | 'thinking' | 'explaining' | 'encouraging' | 'teaching';
  size?: 'small' | 'medium' | 'large' | 'xl';
  isSpeaking?: boolean;
  onToggleSound?: () => void;
  onMicrophoneToggle?: (isListening: boolean) => void;
  onChatOpen?: () => void;
  speechText?: string;
  enableInteraction?: boolean;
}

// Define SpeechRecognition type
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Extend Window interface
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const AIAvatar: React.FC<AIAvatarProps> = ({
  isActive = false,
  emotion = 'happy',
  size = 'medium',
  isSpeaking = false,
  onToggleSound,
  onMicrophoneToggle,
  onChatOpen,
  speechText = '',
  enableInteraction = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentExpression, setCurrentExpression] = useState(emotion);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check for speech synthesis support
    if ('speechSynthesis' in window) {
      setSpeechSupported(true);
    }

    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log('Speech recognized:', transcript);
        // You can handle the speech input here
        setIsListening(false);
        onMicrophoneToggle?.(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        onMicrophoneToggle?.(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        onMicrophoneToggle?.(false);
      };
    }

    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onMicrophoneToggle]);

  useEffect(() => {
    setCurrentExpression(emotion);
    if (isActive) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [emotion, isActive]);

  useEffect(() => {
    // Handle text-to-speech
    if (speechText && soundEnabled && speechSupported && isSpeaking) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      // Sanitize text to prevent TTS from reading raw markdown or literal "\n" characters
      // Also format large numbers with commas to prevent TTS from reading "20000" as "20 zero"
      const sanitizedText = speechText
        .replace(/(\\n|\\r|[\r\n])+/gi, '. ') // Catch literal \n, \r, \\n, and actual newlines
        .replace(/\s+-\s+/g, ', ')     // Replace " - " with a comma/pause
        .replace(/^-\s+/gm, ', ')      // Replace leading "- " (bullets) with a comma/pause
        .replace(/[*#_]/g, '')         // Remove markdown artifacts
        .replace(/(^|[^\d.])(\d{5,})/g, (_match, p1, p2) => p1 + p2.replace(/\B(?=(\d{3})+(?!\d))/g, ","))
        .replace(/(\.\s*){2,}/g, '. ') // Remove double dots
        .replace(/\bions\b/gi, ' eye-ons ')
        .replace(/\bion\b/gi, ' eye-on ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(sanitizedText);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;

      // Try to use a more natural voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.name.includes('Google') ||
        voice.name.includes('Microsoft') ||
        voice.name.includes('Alex') ||
        voice.name.includes('Samantha')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        console.log('AI Avatar started speaking');
      };

      utterance.onend = () => {
        console.log('AI Avatar finished speaking');
      };

      speechSynthesisRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  }, [speechText, soundEnabled, speechSupported, isSpeaking]);

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const getAvatarColor = () => {
    switch (currentExpression) {
      case 'thinking': return 'from-purple-400 via-purple-500 to-blue-600';
      case 'explaining': return 'from-purple-400 via-blue-500 to-purple-600';
      case 'encouraging': return 'from-emerald-400 via-green-500 to-emerald-600';
      case 'teaching': return 'from-orange-400 via-amber-500 to-orange-600';
      default: return 'from-purple-400 via-purple-500 to-blue-500';
    }
  };

  const getEyeIcon = () => {
    switch (currentExpression) {
      case 'thinking': return <Brain className="w-3 h-3 text-white" />;
      case 'explaining': return <MessageCircle className="w-3 h-3 text-white" />;
      case 'encouraging': return <Heart className="w-3 h-3 text-white" />;
      case 'teaching': return <Sparkles className="w-3 h-3 text-white" />;
      default: return <Sparkles className="w-3 h-3 text-white" />;
    }
  };

  const handleSoundToggle = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);

    if (!newSoundState) {
      speechSynthesis.cancel();
    }

    onToggleSound?.();
  };

  const handleMicrophoneToggle = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      onMicrophoneToggle?.(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        onMicrophoneToggle?.(true);
      } catch (error) {
        console.error('Speech recognition error:', error);
      }
    }
  };

  return (
    <div className={`relative ${isActive ? 'z-10' : ''}`}>
      {/* Premium Glow Effect */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 rounded-full blur-2xl opacity-40 animate-pulse-glow -z-10"></div>
      )}

      {/* Outer Ring for Interaction */}
      {isActive && (
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-purple-500 to-blue-500 rounded-full animate-spin-slow opacity-60 -z-10 blur-sm"></div>
      )}

      <div
        className={`
          ${sizeClasses[size]} rounded-full bg-gradient-to-br ${getAvatarColor()}
          flex items-center justify-center relative overflow-hidden
          transition-all duration-500 ease-in-out
          ${isActive ? 'scale-110 shadow-premium-lg ring-2 ring-white/20' : 'shadow-lg'}
          ${isAnimating ? 'animate-pulse' : ''}
          ${isSpeaking ? 'animate-bounce-slight' : ''}
          backdrop-blur-sm
        `}
      >
        {/* Shine effect on the avatar itself */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-60"></div>

        {/* Abstract AI Core (Replacing the face) */}
        <div className="relative w-full h-full flex items-center justify-center z-10">
          <div className={`
            p-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30
            shadow-[0_0_15px_rgba(255,255,255,0.3)]
            transition-all duration-500
            ${isSpeaking ? 'scale-125 rotate-12 bg-white/40' : 'scale-100'}
            ${isAnimating ? 'animate-pulse' : ''}
          `}>
            {getEyeIcon()}
          </div>
        </div>

        {/* Speaking indicator (Ripples) */}
        {isSpeaking && (
          <>
            <div className="absolute inset-0 border-2 border-white/40 rounded-full animate-ping-slow"></div>
            <div className="absolute inset-0 border border-white/20 rounded-full animate-ping-slower"></div>
          </>
        )}

        {/* Listening indicator */}
        {isListening && (
          <div className="absolute inset-0 border-2 border-green-400/60 rounded-full animate-pulse opacity-75 shadow-[0_0_15px_rgba(74,222,128,0.5)]"></div>
        )}
      </div>

      {/* Interactive Controls for larger avatars */}
      {(size === 'large' || size === 'xl') && enableInteraction && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {/* Sound control */}
          {speechSupported && (
            <button
              onClick={handleSoundToggle}
              className="bg-white/90 backdrop-blur-md shadow-premium-sm rounded-full p-2.5 hover:bg-white hover:scale-110 transition-all duration-300 border border-purple-100"
              title={soundEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-purple-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
            </button>
          )}

          {/* Microphone control */}
          {recognitionRef.current && (
            <button
              onClick={handleMicrophoneToggle}
              className={`shadow-premium-sm rounded-full p-2.5 transition-all duration-300 hover:scale-110 border ${isListening
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse border-green-400 shadow-green-200'
                : 'bg-white/90 backdrop-blur-md text-purple-600 hover:bg-white border-purple-100'
                }`}
              title={isListening ? 'Stop Listening' : 'Start Voice Input'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Chat control */}
          {onChatOpen && (
            <button
              onClick={onChatOpen}
              className="bg-white/90 backdrop-blur-md shadow-premium-sm rounded-full p-2.5 hover:bg-white hover:scale-110 transition-all duration-300 border border-purple-100"
              title="Open Chat"
            >
              <MessageCircle className="w-4 h-4 text-purple-600" />
            </button>
          )}
        </div>
      )}

      {/* Premium Floating particles */}
      {(size === 'large' || size === 'xl') && isActive && (
        <div className="absolute -inset-10 pointer-events-none overflow-hidden rounded-full">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`
                absolute w-1.5 h-1.5 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full animate-float-particles opacity-60
              `}
              style={{
                top: `${50 + Math.random() * 40 - 20}%`,
                left: `${50 + Math.random() * 40 - 20}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Name tag for teaching mode */}
      {currentExpression === 'teaching' && (size === 'large' || size === 'xl') && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 glass-premium px-4 py-1.5 rounded-full border border-white/30 shadow-premium-sm">
          <span className="text-xs font-bold text-gradient-premium">YUGA AI</span>
        </div>
      )}

      {/* Speech bubble for speaking */}
      {isSpeaking && speechText && (size === 'large' || size === 'xl') && (
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 glass-ultra rounded-2xl px-4 py-3 max-w-xs shadow-premium-lg animate-fade-in-up z-20">
          <div className="text-xs sm:text-sm text-gray-800 font-medium text-center leading-relaxed">
            {speechText.length > 60 ? `${speechText.substring(0, 60)}...` : speechText}
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-white/20"></div>
        </div>
      )}
    </div>
  );
};

