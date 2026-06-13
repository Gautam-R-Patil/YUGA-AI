import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Monitor } from "lucide-react";
import avatarVideo from "../../../assets/avatar.mp4";
import { apiRequest } from "../../../core/utils/api";
import { processScientificText } from "../../../core/utils/scientific-tts";
import { createObjectUrlFromBase64Audio } from "../../../core/utils/audio";

interface RealisticAvatarProps {
  gender: 'male' | 'female';
  isTeaching: boolean;
  currentSpeech: string;
  emotion: 'friendly' | 'teaching' | 'explaining' | 'encouraging';
  soundEnabled: boolean;
  onQuestionAsked: (question: string) => void;
  onSpeechEnd?: () => void;
  introText?: string;
  onOpenVoiceAssistant?: () => void;
  language: string;
  isExternalAudioPlaying?: boolean; // New prop to prevent video pause
  courseCategory?: string;
  onSpeechProgress?: (charIndex: number) => void;
  isPaused?: boolean;
}

export interface RealisticAvatarHandle {
  startRecording: () => void;
  playAudioFromBase64: (base64: string) => Promise<void>;
  stopAudio: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const RealisticAvatar = forwardRef<RealisticAvatarHandle, RealisticAvatarProps>(({
  gender,
  isTeaching,
  currentSpeech,
  soundEnabled,
  onQuestionAsked,
  onSpeechEnd,
  introText = '',
  onOpenVoiceAssistant,
  language,
  isExternalAudioPlaying,
  courseCategory = 'NEET', // Default to NEET
  onSpeechProgress,
  isPaused = false
}, ref) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shouldPauseAfterSpeech, setShouldPauseAfterSpeech] = useState(false);
  const [hasPausedAfterContinueLearning, setHasPausedAfterContinueLearning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Store the selected voice to ensure consistency
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);


  // Expose the startRecording method and videoRef to parent component
  useImperativeHandle(ref, () => ({
    startRecording: () => {
      startRecording();
    },
    playAudioFromBase64: async (base64: string, text?: string) => {
      await playAudioFromBase64(base64, text);
    },
    stopAudio: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    },
    videoRef: videoRef
  }));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  const preprocessTextForTTS = (text: string): string => {
    if (!text) return text;

    // 1. STRICT SCIENTIFIC CONVERSION (Run this first to protect formulas & English)
    let processedText = processScientificText(text);

    return processedText
      // Handle literal and actual newlines with a pause to prevent speaking "n" or "nn"
      .replace(/(\\n|\\r|[\r\n])+/gi, '. ') 
      .replace(/\s+-\s+/g, ', ')     // Replace " - " with a comma/pause
      .replace(/^-\s+/gm, ', ')      // Replace leading "- " (bullets) with a comma/pause
      // Format large numbers with commas to prevent TTS from reading "20000" as "20 zero"
      .replace(/(^|[^\d.])(\d{5,})/g, (_match, p1, p2) => p1 + p2.replace(/\B(?=(\d{3})+(?!\d))/g, ","))
      .replace(/(\.\s*){2,}/g, '. ') // Remove double dots
      // Fix pronunciation of 'ion' and 'ions'
      .replace(/\bions\b/gi, ' eye-ons ')
      .replace(/\bion\b/gi, ' eye-on ')
      // Remove markdown bold/italic (**text**, *text*, __text__, _text_)
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold **
      .replace(/\*(.*?)\*/g, '$1')     // Italic *
      .replace(/__(.*?)__/g, '$1')     // Bold __
      .replace(/_(.*?)_/g, '$1')       // Italic _
      // Remove headers (## Text)
      .replace(/#{1,6}\s?/g, '')
      // Remove list markers (- item, * item, 1. item)
      .replace(/^[\s-]*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Remove horizontal rules (---, ===)
      .replace(/[-=]{3,}/g, '')
      // Remove code blocks (```code```) and inline code (`code`)
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove math delimiters if they weren't handled
      .replace(/\$\$/g, '')
      .replace(/\$/g, '')
      // Collapse multiple spaces/newlines
      .replace(/\s+/g, ' ')
      .trim();
  };

  const startRecording = async () => {
    try {
      setErrorMessage('');

      // Stop any ongoing speech or audio before starting recording
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);

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
      setIsRecording(true);

      setTimeout(() => {
        if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
        }
      }, 5000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setErrorMessage('Microphone access denied. Please check permissions.');
      if (onOpenVoiceAssistant) {
        onOpenVoiceAssistant();
      }
    }
  };

  const playAudioFromBase64 = (base64Audio: string, textToSync?: string, audioMime?: string) => {
    return new Promise<void>((resolve) => {
      try {
        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        // Create audio element from base64 data
        const audioUrl = createObjectUrlFromBase64Audio(base64Audio, audioMime);
        const audioElement = new Audio(audioUrl);
        audioRef.current = audioElement;

        // Sync video playback with audio START event
        const video = videoRef.current;

        audioElement.onplay = () => {
          setIsSpeaking(true);
          // Reset the pause flag when new audio starts (including doubt responses)
          setHasPausedAfterContinueLearning(false);
          // Ensure video is playing ONLY when audio actually starts
          if (video) {
            video.play().catch(error => {
              console.error('Error playing avatar video on audio start:', error);
            });
          }
        };

        audioElement.ontimeupdate = () => {
          if (textToSync && audioElement.duration && onSpeechProgress) {
            const progress = audioElement.currentTime / audioElement.duration;
            // Calculate progress based on text length
            const charIndex = Math.ceil(progress * textToSync.length);
            onSpeechProgress(charIndex);
          }
        };

        audioElement.onended = () => {
          setIsSpeaking(false);
          // FIX: Immediately pause the avatar video when audio ends
          const video = videoRef.current;
          if (video) {
            video.pause();
          }
          if (onSpeechEnd) {
            onSpeechEnd();
          }
          resolve();
        };

        audioElement.onerror = () => {
          setIsSpeaking(false);
          console.error('Error playing audio response');
          // FIX: Also pause video on audio error
          const video = videoRef.current;
          if (video) {
            video.pause();
          }
          resolve();
        };

        audioElement.play();
      } catch (err) {
        console.error('Error playing audio:', err);
        setIsSpeaking(false);
        // FIX: Pause video on any error
        const video = videoRef.current;
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
        resolve();
      }
    });
  };

  const sendAudioToBackend = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
      const reader = new FileReader();

      reader.onload = async () => {
        const audioData = reader.result as string;
        const base64Audio = audioData.split(',')[1];

        try {
          // Use apiRequest for consistent configuration
          const response = await apiRequest('/voice/query', 'POST', {
            audio: base64Audio,
            messages: [],
            courseCategory: courseCategory,
            language: language
          });

          if (response.ok) {
            const data = await response.json();

            console.log('User said:', data.transcription);
            console.log('Assistant replied:', data.response);

            // Use the Groq API response for the avatar's speech
            if (data.response) {
              onQuestionAsked(data.response);

              // For Hindi, we rely on the backend to provide audio.
              // If data.audio is present, it will be played below.
              // If not, we might want to try browser TTS or just silent display.
              if (language === 'hindi' && !data.audio) {
                console.warn("No audio returned for Hindi response");
              }

              // Preprocess text for TTS (for English or fallback)
              const processedResponse = preprocessTextForTTS(data.response);

              // Play the audio response if available
              if (data.audio) {
                await playAudioFromBase64(data.audio, undefined, data.audioMime);
              } else if (language === 'english') {
                // Fallback to text-to-speech with consistent voice
                speakText(processedResponse);
              }
            } else if (data.transcription) {
              onQuestionAsked(data.transcription);
            }
          } else {
            const errorData = await response.json();
            console.error('Failed to process audio:', errorData);
            setErrorMessage('Failed to process audio. Please try again.');
            // Removed fallback: onQuestionAsked("Can you explain this concept in more detail?");
          }
        } catch (err) {
          console.error('Error calling voice API:', err);
          setErrorMessage('Network error. Please check if the backend server is running.');
          // Removed fallback on network error
        }
      };

      reader.readAsDataURL(audioBlob);
    } catch (err) {
      console.error('Error processing audio:', err);
      setErrorMessage('Error processing audio. Please try again.');
    }
  };



  // Reset selected voice when gender changes
  useEffect(() => {
    selectedVoiceRef.current = null;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [gender]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoLoaded) return;

    // If we've paused after the "Continue Learning" speech, keep the video paused
    // unless we're starting a new speech or changing teaching mode
    if (hasPausedAfterContinueLearning && !currentSpeech) {
      video.pause();
      video.currentTime = 0; // FIX: Reset to beginning
      return;
    }

    const shouldPlay = (isTeaching && !shouldPauseAfterSpeech && !hasPausedAfterContinueLearning && isSpeaking) || (isTeaching && isExternalAudioPlaying);

    if (shouldPlay) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing avatar video:', error);
          document.addEventListener('click', () => {
            video.play().catch(e => console.error('Still cannot play video:', e));
          }, { once: true });
        });
      }
    } else {
      // Pause only if we shouldn't be playing
      video.pause();
      if (shouldPauseAfterSpeech) {
        setShouldPauseAfterSpeech(false);
      }
    }
  }, [isTeaching, videoLoaded, shouldPauseAfterSpeech, hasPausedAfterContinueLearning, currentSpeech, isSpeaking, isExternalAudioPlaying, isPaused]);

  // Handle Pause and Resume
  useEffect(() => {
    if (isPaused) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.pause();
      }
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
      setIsSpeaking(false);
    } else if (isTeaching && !isPaused && currentSpeech) {
      if (audioRef.current && audioRef.current.paused && audioRef.current.currentTime > 0 && audioRef.current.currentTime < audioRef.current.duration) {
        audioRef.current.play().catch(console.error);
        setIsSpeaking(true);
      } else if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsSpeaking(true);
      } else if (!isSpeaking && !audioRef.current && typeof window !== 'undefined' && window.speechSynthesis && !window.speechSynthesis.speaking) {
        // It might have ended or been cancelled, if that's the case `currentSpeech` effect handles it? 
        // ACTUALLY we don't trigger restarting from here.
      }
    }
  }, [isPaused, isTeaching, currentSpeech]);

  // MODIFIED: Only use browser TTS for English, not for Malayalam
  const selectAndStoreVoice = (): SpeechSynthesisVoice | undefined => {
    // For Hindi, we don't use browser TTS (unless we want to enable fallback)
    if (language === 'hindi') {
      return undefined;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return undefined;
    }

    // If we already selected a voice for English, use it consistently
    if (selectedVoiceRef.current) {
      return selectedVoiceRef.current;
    }

    const voices = window.speechSynthesis.getVoices();

    // Priority list for English female voices only (since we don't use Malayalam TTS here)
    // Priority list based on gender
    // Priority 1: Specific high-quality female voices (Soft/Natural)
    const priorityNames = [
      'Diya', 'Google US English Female', 'Microsoft Zira', 'Samantha', 'Google UK English Female'
    ];

    for (const name of priorityNames) {
      // Use relaxed 'includes' instead of strict equality to capture variations
      const voice = voices.find(v => v.name.includes(name));
      if (voice) {
        console.log('Selected Priority Voice:', voice.name);
        selectedVoiceRef.current = voice;
        return voice;
      }
    }

    // Priority 2: Any Google Voice (usually high quality) - prefer Female if indicated
    // This matches AIAvatar's logic which prioritizes Google/Microsoft but refines it for Female preference
    const googleFemale = voices.find(v => v.name.includes('Google') && v.name.toLowerCase().includes('female'));
    if (googleFemale) {
      console.log('Selected Google Female:', googleFemale.name);
      selectedVoiceRef.current = googleFemale;
      return googleFemale;
    }

    // Priority 3: Any identifiable Female voice
    const genericFemale = voices.find(v =>
      v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('woman') ||
      v.name.includes('Zira')
    );

    if (genericFemale) {
      console.log('Selected Generic Female Voice:', genericFemale.name);
      selectedVoiceRef.current = genericFemale;
      return genericFemale;
    }

    // Priority 4: AIAvatar style fallback (Any Google/Microsoft voice)
    // The user specifically said the Quiz voice (AIAvatar) is correct. AIAvatar uses:
    // voice.name.includes('Google') || voice.name.includes('Microsoft')
    // We add this as a high-quality fallback if no specific "Female" tag is found.
    const highQualityFallback = voices.find(v =>
      v.name.includes('Google') ||
      (v.name.includes('Microsoft') && !v.name.includes('David') && !v.name.includes('Mark'))
    );

    if (highQualityFallback) {
      console.log('Selected High-Quality Fallback (AIAvatar style):', highQualityFallback.name);
      selectedVoiceRef.current = highQualityFallback;
      return highQualityFallback;
    }

    const fallbackVoice = voices.find(v => v.lang.startsWith('en')) || (voices.length > 0 ? voices[0] : undefined);

    if (fallbackVoice) {
      console.log('Using fallback voice:', fallbackVoice.name);
      selectedVoiceRef.current = fallbackVoice;
    }

    return fallbackVoice;
  };

  // Ref to track the current sentence index for chunking
  const currentSentenceIndexRef = useRef(0);
  const sentencesRef = useRef<string[]>([]);
  const audioRequestIdRef = useRef(0);

  const speakText = React.useCallback(async (text: string, onEndCallback?: () => void) => {
    // Take a snapshot of request ID to prevent overlaps
    const requestId = ++audioRequestIdRef.current;

    // --- PRE-SPEAKING CLEANUP ---
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const processedText = preprocessTextForTTS(text);
    if (!processedText || !soundEnabled || !isTeaching) { // Re-added soundEnabled and isTeaching checks
      if (onEndCallback) onEndCallback();
      if (onSpeechEnd) onSpeechEnd();
      return;
    }

    console.log('Avatar speaking:', processedText.substring(0, 50) + '...', requestId);
    // REMOVED: setIsSpeaking(true) - this was triggering video before audio was ready

    // Check if this is the "Continue Learning" speech that should pause the video
    const isContinueLearningSpeech = processedText.includes("How were the questions?") &&
      processedText.includes("Ask Doubt") &&
      processedText.includes("I'm here to help");

    // --- PREMIUM BACKEND TTS FLOW (English) ---
    if (language === 'english') {
      try {
        setHasPausedAfterContinueLearning(false);

        // Call backend for premium Google Cloud voice (en-IN-Standard-D)
        const response = await apiRequest('/voice/speak', 'POST', {
          text: processedText,
          language: 'english'
        });

        // If request ID changed, ignore this response (newer request started)
        if (requestId !== audioRequestIdRef.current) return;

        if (response.ok) {
          const data = await response.json();
          if (data.audio && requestId === audioRequestIdRef.current) {
            // Internal playAudioFromBase64 handles setIsSpeaking(true) on actual start
            await playAudioFromBase64(data.audio, processedText, data.audioMime);

            // Handle completion logic
            if (requestId === audioRequestIdRef.current) {
              setIsSpeaking(false);
              const video = videoRef.current;
              if (video) {
                video.pause();
              }
              if (isContinueLearningSpeech) {
                setShouldPauseAfterSpeech(true);
                setHasPausedAfterContinueLearning(true);
              }
              if (onEndCallback) onEndCallback();
              if (onSpeechEnd) onSpeechEnd();
            }
            return;
          }
        }
      } catch (err) {
        console.error("Backend TTS Error, falling back to browser:", err);
      }
    }

    // --- FALLBACK BROWSER TTS FLOW ---
    // (Used if Backend TTS fails OR for other languages like Malayalam if enabled)

    // For Hindi, we don't use browser TTS at all (relying on backend)
    if (language === 'hindi') {
      console.log('Hindi text received for TTS, but browser TTS is disabled (relying on backend)');
      if (onEndCallback) onEndCallback();
      return;
    }

    // Split text into chunks (sentences) for reliable TTS
    const rawSentences = processedText.match(/[^.!?]+[.!?]+/g) || [processedText];
    const sentences = rawSentences.map(s => s.trim()).filter(s => s.length > 0);

    // CRITICAL RESUME FIX: Only reset the index if the TEXT HAS CHANGED
    // If we are resuming, the text is the same, so we keep the index where it was!
    const isNewText = sentencesRef.current.join('|') !== sentences.join('|');
    if (isNewText) {
      console.log("RealisticAvatar: New text detected for Browser TTS, resetting index to 0");
      sentencesRef.current = sentences;
      currentSentenceIndexRef.current = 0;
    } else {
      console.log("RealisticAvatar: Same text detected, resuming from sentence index", currentSentenceIndexRef.current);
    }

    const speakNextSentence = () => {
      if (requestId !== audioRequestIdRef.current) return;

      if (currentSentenceIndexRef.current >= sentencesRef.current.length) {
        setIsSpeaking(false);
        const video = videoRef.current;
        if (video) {
          video.pause();
        }
        if (isContinueLearningSpeech) {
          setShouldPauseAfterSpeech(true);
          setHasPausedAfterContinueLearning(true);
        }
        if (onEndCallback) onEndCallback();
        if (onSpeechEnd) onSpeechEnd();
        return;
      }

      const sentence = sentencesRef.current[currentSentenceIndexRef.current];
      const utterance = new SpeechSynthesisUtterance(sentence);

      utterance.rate = 0.92;
      utterance.pitch = 1.02;
      utterance.volume = 0.88;
      utterance.lang = 'en-IN'; // Prefer Indian English if available locally

      // Use stored voice or select one
      const voices = window.speechSynthesis.getVoices();
      const voiceCandidate = selectedVoiceRef.current || voices.find(v => v.lang.startsWith('en')) || voices[0];
      if (voiceCandidate) utterance.voice = voiceCandidate;

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const currentSentenceStart = sentencesRef.current.slice(0, currentSentenceIndexRef.current).join(' ').length;
          const globalIndex = (currentSentenceIndexRef.current > 0 ? currentSentenceStart + 1 : 0) + event.charIndex + event.charLength;
          if (onSpeechProgress) onSpeechProgress(globalIndex);
        }
      };

      utterance.onstart = () => {
        setIsSpeaking(true);
        setHasPausedAfterContinueLearning(false);
        const video = videoRef.current;
        if (video && video.paused && isTeaching) {
          video.play().catch(console.error);
        }
      };

      utterance.onend = () => {
        currentSentenceIndexRef.current++;
        speakNextSentence();
      };

      utterance.onerror = (err: SpeechSynthesisErrorEvent) => {
        console.error("TTS Error:", err);
        currentSentenceIndexRef.current++;
        speakNextSentence();
      };

      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    speakNextSentence();
  }, [language, soundEnabled, isTeaching, onSpeechEnd, onSpeechProgress]);

  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // Load voices when they become available and select consistent voice (English only)
  useEffect(() => {
    const loadVoicesAndSelect = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis && language === 'english') {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
          // Pre-select and store the voice for consistent use
          selectAndStoreVoice();
          setVoicesLoaded(true);
        }
      }
    };

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoicesAndSelect;
      loadVoicesAndSelect();
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    if (introText && language === 'english' && !isExternalAudioPlaying) {
      speakText(introText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introText, soundEnabled, isTeaching, language, isExternalAudioPlaying]);

  useEffect(() => {
    // 1. GUARD: If external audio (blob/lecture) is playing, we MUST NOT speak browser/local TTS
    if (isExternalAudioPlaying) {
      if (isSpeaking) {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
      }
      return;
    }

    // 2. TRIGGER: Only start speech if we have text, are in teaching mode, and NO external audio is active
    if (currentSpeech && language === 'english' && isTeaching && soundEnabled) {
      // Don't restart if already speaking the same text (prevents looping/restart)
      // Check both speechSynthesis and our tracking ref
      if (isSpeaking && (currentSpeech === speechSynthesisRef.current?.text || currentSpeech === sentencesRef.current.join(' '))) {
        return;
      }

      // EXTRA GUARD: If we just resumed or started, wait a tiny bit to see if external audio takes over
      const timeout = setTimeout(() => {
        // Re-check external audio state after delay
        if (!isExternalAudioPlaying && isTeaching && currentSpeech && soundEnabled) {
          console.log("RealisticAvatar: Triggering speakText after transition check");
          speakText(currentSpeech);
        }
      }, 200);

      return () => clearTimeout(timeout);
    }

    // 3. CLEANUP: If nothing should be playing, stop everything
    if (!currentSpeech || !isTeaching || !soundEnabled) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsSpeaking(false);
    }

    // Reset the flag when a new speech starts
    const isContinueLearningSpeech = currentSpeech.includes("How were the questions?") &&
      currentSpeech.includes("Ask Doubt") &&
      currentSpeech.includes("I'm here to help");

    if (!isContinueLearningSpeech && currentSpeech) {
      setHasPausedAfterContinueLearning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSpeech, soundEnabled, isTeaching, language, voicesLoaded, isExternalAudioPlaying]);

  useEffect(() => {
    if (!isTeaching) {
      setHasPausedAfterContinueLearning(false);
      setIsSpeaking(false);

      // 1. Pause Video and reset
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.currentTime = 0;
      }

      // 2. Clear Internal Audio Ref (Backend TTS)
      if (audioRef.current) {
        console.log("RealisticAvatar: Pausing internal audioRef because isTeaching=false");
        audioRef.current.pause();
        audioRef.current = null;
      }

      // 3. Clear Browser TTS
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isTeaching]);

  const handleVideoLoadedData = () => {
    setVideoLoaded(true);
  };

  const handleVideoEnded = () => {
    const video = videoRef.current;
    if (video && isTeaching && isSpeaking) {
      video.currentTime = 0;
      video.play().catch(error => {
        console.error('Error restarting avatar video:', error);
      });
    }
  };

  const handleVideoError = (error: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Avatar video error:', error);
    setVideoLoaded(false);
  };

  const handleVideoCanPlay = () => {
    setVideoLoaded(true);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Premium Recording Indicator */}
      {/* Premium Recording Indicator - Sleek */}
      {isRecording && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-40 animate-bounce">
          <div className="relative bg-black/60 backdrop-blur-xl px-6 py-2 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.4)] border border-red-500/30">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent rounded-full"></div>
            <div className="flex items-center space-x-3 relative z-10">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-sm font-semibold text-red-100 tracking-wide">Listening...</span>
            </div>
          </div>
        </div>
      )}

      {/* Modern Error Message */}
      {errorMessage && (
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-4 rounded-2xl shadow-2xl border border-red-300/50">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
          </div>
        </div>
      )}

      <div className="relative transition-all duration-500">
        {/* Enhanced Animated Glow Effect */}
        {isTeaching && (
          <>
            <div className="absolute -inset-8 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-[2rem] opacity-20 blur-2xl animate-pulse"></div>
            <div className="absolute -inset-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 rounded-[1.5rem] opacity-30 blur-xl animate-pulse" style={{ animationDelay: '500ms' }}></div>
          </>
        )}

        {/* Premium Avatar Card */}
        <div className="relative group">
          {/* Gradient Border Effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-[2rem] opacity-75 blur-sm group-hover:opacity-100 transition duration-500"></div>

          {/* Main Avatar Container */}
          <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-[#0f111a]/80 backdrop-blur-2xl border border-white/5 ring-1 ring-white/5 flex items-center justify-center">
            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none z-10"></div>



            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              muted
              loop
              playsInline
              preload="metadata"
              onLoadedData={handleVideoLoadedData}
              onCanPlay={handleVideoCanPlay}
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              style={{
                filter: isTeaching ? 'brightness(1.15) contrast(1.1) saturate(1.1)' : 'brightness(0.9) contrast(0.95)'
              }}
            >
              <source src={avatarVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Premium Loading State */}
            {!videoLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-xl opacity-50"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                      <Monitor className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <p className="text-sm font-medium text-white">Loading Avatar...</p>
                    <p className="text-xs text-blue-300">Preparing AI Teacher</p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Speaking & Teaching Overlays */}
            <div className="absolute inset-0 pointer-events-none">
              {isSpeaking && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-transparent to-cyan-500/20 animate-pulse"></div>
                  <div className="absolute inset-0 border-2 border-blue-500/30 rounded-3xl animate-pulse"></div>
                </>
              )}

              {/* Premium Status Indicator */}
              {isTeaching && videoLoaded && (
                <div className="absolute top-4 right-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full blur-md opacity-50 animate-pulse"></div>
                    <div className="relative w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg border-2 border-white/30"></div>
                  </div>
                </div>
              )}

              {/* Professor Name Overlay */}

            </div>

            {/* Corner Accent Lines */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-blue-400/50 rounded-tl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-cyan-400/50 rounded-br-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
});

RealisticAvatar.displayName = 'RealisticAvatar';

