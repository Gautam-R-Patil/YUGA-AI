import { useState, useRef, useEffect } from 'react';
import { trackEvent } from '../../../core/utils/analytics';

interface UseVoiceDictationProps {
    courseCategory: string;
    language: string;
    onTranscription: (text: string) => void;
    onError?: (error: string) => void;
}

export const useVoiceDictation = ({
    courseCategory,
    language,
    onTranscription,
    onError
}: UseVoiceDictationProps) => {
    const [isDictating, setIsDictating] = useState(false);
    const [isProcessing] = useState(false); // Kept for interface compatibility

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = language === 'hindi' ? 'hi-IN' : 'en-US';

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onresult = (event: any) => {
                let fullTranscript = '';

                for (let i = 0; i < event.results.length; ++i) {
                    fullTranscript += event.results[i][0].transcript;
                }

                if (fullTranscript) {
                    onTranscription(fullTranscript);
                }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                if (onError) onError(event.error);
                setIsDictating(false);
            };

            recognition.onend = () => {
                setIsDictating(false);
                trackEvent('Voice Dictation', 'stop', courseCategory);
            };

            recognitionRef.current = recognition;
        }
    }, [language, courseCategory, onError, onTranscription]);

    const startDictation = () => {
        if (recognitionRef.current && !isDictating) {
            try {
                recognitionRef.current.start();
                setIsDictating(true);
                trackEvent('Voice Dictation', 'start', courseCategory);
            } catch (e) {
                console.error("Start error:", e);
            }
        } else if (!recognitionRef.current) {
            if (onError) onError("Speech Recognition not supported in this browser.");
        }
    };

    const stopDictation = () => {
        if (recognitionRef.current && isDictating) {
            recognitionRef.current.stop();
            setIsDictating(false);
        }
    };

    return {
        isDictating,
        isProcessing, // passive
        startDictation,
        stopDictation
    };
};
