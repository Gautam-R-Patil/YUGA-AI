import { useState, useRef, MutableRefObject, useMemo, useEffect } from 'react';
import { getApiUrl } from '../utils/helpers';
import { getChapterTopics } from '../data/syllabus';
import { API_BASE_URL, apiRequest } from '../../../core/utils/api';
import { createObjectUrlFromBase64Audio } from '../../../core/utils/audio';
import { Course, Lesson } from '../../../core/types';

interface UseLectureManagerProps {
    course: Course;
    lesson: Lesson;
    language: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    avatarRef: MutableRefObject<any>;
    onLectureGenerated?: (lecture: string, keyPoints: string[], summary: string) => void;
    onLectureEnd?: () => void;
}

export const useLectureManager = ({ course, lesson, language, avatarRef, onLectureGenerated, onLectureEnd }: UseLectureManagerProps) => {

    // State
    const [lectureContent, setLectureContent] = useState<string>('');
    const [keyPoints, setKeyPoints] = useState<string[]>([]);
    const [summary, setSummary] = useState<string>('');
    const [hasGeneratedIntroduction, setHasGeneratedIntroduction] = useState(false);
    const [isGeneratingLecture, setIsGeneratingLecture] = useState(false);
    const [topicData, setTopicData] = useState<any>(null);

    // Audio State
    const [lectureAudio, setLectureAudio] = useState<string | null>(null);
    const [lectureAudioMime, setLectureAudioMime] = useState<string>('audio/mp3');
    const [isLectureAudioPlaying, setIsLectureAudioPlaying] = useState(false);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [lectureAudioCurrentTime, setLectureAudioCurrentTime] = useState(0);
    const [lectureAudioDuration, setLectureAudioDuration] = useState(0);
    const [currentSubtitle, setCurrentSubtitle] = useState('');
    const [currentSpeech, setCurrentSpeech] = useState('');
    const [speechCommand, setSpeechCommand] = useState(''); // New: Full text to be spoken by Avatar

    // Refs
    const lectureAudioRef = useRef<HTMLAudioElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null); // For short responses
    const lectureTextRef = useRef('');
    const subtitleTimingsRef = useRef<{ text: string; start: number; end: number }[]>([]);
    const isGeneratingRef = useRef(false);
    const isTeachingEnabledRef = useRef(false);
    const lastReportedTimeRef = useRef(0);

    // Helpers
    const getSubjectIntroduction = (category: string, title: string) => {
        return `Welcome to the unit on ${title}. In this session, we will explore key concepts of ${category}.`;
    };

    const stopAllMedia = () => {
        console.log("LectureManager: stopAllMedia requested");

        // 1. Explicitly stop fallback TTS first
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        // 2. Stop main lecture audio
        if (lectureAudioRef.current) {
            lectureAudioRef.current.pause();
            // Important: Don't set ref to null here, we need it for resume!
        }

        // 3. Stop short effect audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        // 4. Update states
        setIsLectureAudioPlaying(false);
        setIsAudioPlaying(false);

        // 5. Sync Avatar Video
        const video = avatarRef.current?.videoRef?.current;
        if (video) {
            video.pause();
        }
    };

    const playLectureAudio = async (base64Audio: string, textToSync?: string, startTime = 0, audioMime?: string): Promise<void> => {
        return new Promise((resolve) => {
            try {
                // If there's existing audio, stop it thoroughly
                if (lectureAudioRef.current) {
                    lectureAudioRef.current.pause();
                    lectureAudioRef.current.onplay = null;
                    lectureAudioRef.current.onended = null;
                    lectureAudioRef.current.onerror = null;
                    lectureAudioRef.current.ontimeupdate = null;
                    lectureAudioRef.current.oncanplay = null;
                }

                console.log("LectureManager: Initializing new audio element", { startTime });
                const audioUrl = createObjectUrlFromBase64Audio(base64Audio, audioMime);
                const audioElement = new Audio(audioUrl);

                // IMPORTANT: Ensure the ref is set BEFORE we start playing or setting events
                lectureAudioRef.current = audioElement;

                // Sync start time once metadata/buffer is ready
                const seekToStart = () => {
                    if (startTime > 0 && Math.abs(audioElement.currentTime - startTime) > 0.5) {
                        console.log("LectureManager: Seeking to", startTime);
                        audioElement.currentTime = startTime;
                    }
                };

                audioElement.oncanplay = seekToStart;
                audioElement.onloadedmetadata = seekToStart;

                // Prepare speech tracking
                if (textToSync) {
                    lectureTextRef.current = textToSync;
                    const sentences = textToSync.match(/[^.!?]+[.!?]+/g) || [textToSync];
                    if (sentences.length > 0) {
                        // Only set to first sentence if we are actually at the start
                        if (startTime === 0) {
                            setCurrentSubtitle(sentences[0]);
                        } else {
                            // Find approximating sentence based on startTime
                            // For now, let ontimeupdate handle it, but don't force reset
                        }
                    }

                    if (startTime === 0) {
                        setCurrentSpeech('');
                    }
                }

                audioElement.onplay = () => {
                    console.log("LectureManager: Audio playing");
                    setIsLectureAudioPlaying(true);
                    setIsAudioPlaying(true);

                    const video = avatarRef.current?.videoRef?.current;
                    if (video && isTeachingEnabledRef.current) {
                        video.play().catch((e: any) => console.error('Video play error:', e));
                    }
                    resolve();
                };

                audioElement.onerror = (e: any) => {
                    console.error("LectureManager: Audio error", e);
                    setIsLectureAudioPlaying(false);
                    setIsAudioPlaying(false);
                    resolve();
                };

                audioElement.onended = () => {
                    console.log("LectureManager: Audio ended");
                    setIsLectureAudioPlaying(false);
                    setIsAudioPlaying(false);
                    const video = avatarRef.current?.videoRef?.current;
                    if (video) video.pause();
                    if (onLectureEnd) onLectureEnd();
                    resolve();
                };

                audioElement.ontimeupdate = () => {
                    const currentTime = audioElement.currentTime;
                    const duration = audioElement.duration || 0;
                    lastReportedTimeRef.current = currentTime; // High precision ref
                    setLectureAudioCurrentTime(currentTime);
                    setLectureAudioDuration(duration);

                    // 1. Text Progress Tracking (for visual board/subtitles)
                    if (textToSync && duration > 0) {
                        const progress = currentTime / duration;
                        const textLength = textToSync.length;
                        const currentLength = Math.ceil(progress * textLength);

                        if (currentLength >= 0) {
                            setCurrentSpeech(prev => {
                                // Only update if progress is moving forward
                                if (currentLength > prev.length) {
                                    return textToSync.substring(0, currentLength);
                                }
                                return prev;
                            });
                        }
                    }

                    // 2. Subtitle Tracking
                    if (subtitleTimingsRef.current.length > 0) {
                        const current = subtitleTimingsRef.current.find(
                            s => currentTime >= s.start && currentTime < s.end
                        );
                        if (current && current.text !== currentSubtitle) {
                            setCurrentSubtitle(current.text);
                        }
                    }
                };

                audioElement.volume = 1.0;
                audioElement.muted = false;

                audioElement.play().catch((e: Error) => {
                    console.error("LectureManager: Play failed", e);
                    setIsLectureAudioPlaying(false);
                    setIsAudioPlaying(false);
                    resolve();
                });

            } catch (err) {
                console.error("LectureManager: playLectureAudio critical error", err);
                resolve();
            }
        });
    };

    const playAudioFromBase64 = async (base64Audio: string, startTime = 0, audioMime?: string): Promise<void> => {
        return new Promise((resolve) => {
            try {
                // If it's a fresh play, stop all other media
                if (startTime === 0) {
                    stopAllMedia();
                } else if (audioRef.current) {
                    audioRef.current.pause();
                }

                const audioUrl = createObjectUrlFromBase64Audio(base64Audio, audioMime);
                const audioElement = new Audio(audioUrl);
                audioRef.current = audioElement;

                // Sync start time
                const seekToStart = () => {
                    if (startTime > 0 && Math.abs(audioElement.currentTime - startTime) > 0.5) {
                        console.log("LectureManager: Seeking standard audio to", startTime);
                        audioElement.currentTime = startTime;
                    }
                };

                audioElement.oncanplay = seekToStart;
                audioElement.onloadedmetadata = seekToStart;

                const video = avatarRef.current?.videoRef?.current;

                audioElement.onplay = () => {
                    setIsAudioPlaying(true);
                    if (video && isTeachingEnabledRef.current) {
                        video.play().catch(() => { });
                    }
                };

                audioElement.onended = () => {
                    setIsAudioPlaying(false);
                    if (video) video.pause();
                    if (onLectureEnd) onLectureEnd();
                    resolve();
                };
                audioElement.onerror = () => {
                    setIsAudioPlaying(false);
                    if (video) video.pause();
                    resolve();
                };

                audioElement.volume = 1.0;
                audioElement.play().catch(e => {
                    console.error("Standard audio play failed", e);
                    resolve();
                });
            } catch (err) {
                console.error("Critical error in playAudioFromBase64", err);
                setIsAudioPlaying(false);
                resolve();
            }
        });
    };

    const generateKeyPointsAndSummary = async (lecture: string) => {
        try {
            const keyPointsPrompt = `Extract key points from:\n${lecture}\nKEY POINTS:`;
            const keyPointsResponse = await apiRequest(getApiUrl(), 'POST', {
                audio: null,
                messages: [{ role: 'user', content: keyPointsPrompt }],
                courseCategory: course.category
            });
            if (keyPointsResponse.ok) {
                const data = await keyPointsResponse.json();
                const points = (data.response || '').split('\n').filter((l: string) => l.trim().startsWith('-')).map((l: string) => l.replace(/^- /, ''));
                if (points.length) setKeyPoints(points);
            }

            const summaryPrompt = `Summarize:\n${lecture}\nSUMMARY:`;
            const summaryResponse = await apiRequest(getApiUrl(), 'POST', {
                audio: null,
                messages: [{ role: 'user', content: summaryPrompt }],
                courseCategory: course.category
            });
            if (summaryResponse.ok) {
                const data = await summaryResponse.json();
                if (data.response) setSummary(data.response);
            }
        } catch {
            // Failed to generate metadata
        }
    };

    const generateChapterLecture = async (languageOverride?: string, forceRegenerate = false) => {
        isTeachingEnabledRef.current = true;
        const targetLanguage = languageOverride || language;
        if (isGeneratingRef.current && !forceRegenerate) return;
        if (hasGeneratedIntroduction && !forceRegenerate) {
            setIsGeneratingLecture(false);
            return;
        }

        try {
            isGeneratingRef.current = true;
            setIsGeneratingLecture(true);

            // Logic for isAIGenerated vs dynamic vs standard
            if (lesson.isDynamic) {
                // Dynamic lessons:
                // - For standard syllabus topics: use /curriculum/.../topic-content
                // - For crash/oneshorts lessons: detect special content marker and read JSON directly

                // 1. Fetch JSON Content first (if not already loaded)
                let data = topicData;
                if (!data) {
                    const isOneshort = typeof lesson.content === 'string' && lesson.content.startsWith('ONESHORTS::');

                    if (isOneshort) {
                        // Oneshoot crash-course content is stored under /api/oneshorts
                        const rawPath = (lesson.content as string).replace('ONESHORTS::', '');
                        const res = await apiRequest(`${API_BASE_URL}/oneshorts${rawPath}`, 'GET');
                        if (!res.ok) throw new Error("Failed to fetch oneshots content");
                        data = await res.json();
                    } else {
                        const type = course.category.toLowerCase().startsWith('jee') ? 'jee' : 'neet';
                        const res = await apiRequest(
                            `${API_BASE_URL}/curriculum/${type}/topic-content?subject=${encodeURIComponent(lesson.originalSubject || '')}` +
                            `&classLevel=${encodeURIComponent(lesson.originalClass || '')}` +
                            `&chapter=${encodeURIComponent(lesson.originalChapter || '')}` +
                            `&topic=${encodeURIComponent(lesson.title || '')}&type=${type}`
                        );
                        if (!res.ok) throw new Error("Failed to fetch dynamic content");
                        data = await res.json();
                    }

                    // Normalize formulas to always be objects { formula, description }
                    const normalizedFormulas = (data.formulas || []).map((f: any) => {
                        if (typeof f === 'string') {
                            return { formula: f, description: '' };
                        }
                        if (f && typeof f.formula === 'string') {
                            return f;
                        }
                        return null;
                    }).filter(Boolean);

                    // Normalize images so SmartBoard can consume them:
                    // - Backend oneshots currently send images as string paths (e.g., "/images/si_units.png")
                    // - EnhancedSmartBoard expects { url, description }
                    const normalizedImages = (data.images || []).map((img: any) => {
                        if (typeof img === 'string') {
                            return {
                                url: img,
                                description: ''
                            };
                        }
                        if (img && typeof img.url === 'string') {
                            return img;
                        }
                        return null;
                    }).filter(Boolean);

                    setTopicData({
                        ...data,
                        formulas: normalizedFormulas,
                        images: normalizedImages
                    });

                    const lectureScript: string = Array.isArray(data.lecture_script)
                        ? JSON.stringify(data.lecture_script)
                        : (data.lecture_script || "Lesson content");

                    setLectureContent(lectureScript);
                    const definitions = (data.definitions || []).map((d: any) => `${d.term}: ${d.definition}`);
                    setKeyPoints([...(data.keywords || []), ...definitions]);
                    setSummary(data.metadata?.chapter || "");
                }

                // 2. Generate/Play Audio ONLY if forceRegenerate is true
                // In dynamic lessons, we wait for user to click PLAY
                if (forceRegenerate) {
                    const scriptText =
                        typeof data.lecture_script === 'string'
                            ? data.lecture_script
                            : JSON.stringify(data.lecture_script || '');

                    const audioRes = await apiRequest(`${API_BASE_URL}/curriculum/generate-lesson`, 'POST', {
                        script: scriptText,
                        language: targetLanguage,
                        onlyAudio: true
                    });

                    if (audioRes.ok) {
                        const audioData = await audioRes.json();
                        if (audioData.audio) {
                            setLectureAudio(audioData.audio);
                            setLectureAudioMime(audioData.audioMime || 'audio/mp3');
                            setSpeechCommand(scriptText);
                            playLectureAudio(audioData.audio, scriptText, 0, audioData.audioMime);
                            setHasGeneratedIntroduction(true);
                        }
                    } else {
                        // Fallback: Browser TTS
                        setSpeechCommand(scriptText);
                        setCurrentSpeech('');
                        setCurrentSubtitle('');
                        setHasGeneratedIntroduction(true);
                    }
                }

                if (onLectureGenerated && data) {
                    const kp = data.keywords || [];
                    onLectureGenerated(
                        typeof data.lecture_script === 'string' ? data.lecture_script : JSON.stringify(data.lecture_script || ''),
                        kp,
                        ""
                    );
                }
                return;
            }

            if (lesson.isAIGenerated) {
                const res = await apiRequest(`${API_BASE_URL}/curriculum/generate-lesson`, 'POST', {
                    ...lesson,
                    language: targetLanguage
                });
                if (!res.ok) throw new Error("Failed");
                const data = await res.json();
                setLectureContent(data.script || "Lesson content");
                setKeyPoints(data.keyPoints || []);
                setSummary(data.summary || "");
                if (data.audio) {
                    setLectureAudio(data.audio);
                    setLectureAudioMime(data.audioMime || 'audio/mp3');
                    setSpeechCommand(data.script);
                    playLectureAudio(data.audio, data.script, 0, data.audioMime);
                } else {
                    setCurrentSpeech(data.script);
                    setCurrentSubtitle(data.script);
                    setSpeechCommand(data.script);
                }
                setHasGeneratedIntroduction(true);
                if (onLectureGenerated) onLectureGenerated(data.script, data.keyPoints, data.summary);
                return;
            }

            const chapterTopics = getChapterTopics(course.category, lesson.title) || [];
            const introText = getSubjectIntroduction(course.category, lesson.title);
            const lecturePrompt = `Instruction: Start your response exactly with "${introText}". Then teach ${lesson.title} for ${course.category}. Topics: ${chapterTopics.join(', ')}. Keep it friendly, concise, and do NOT use markdown symbols like # or *.`;

            const response = await apiRequest(getApiUrl(), 'POST', {
                audio: null,
                messages: [{ role: 'user', content: lecturePrompt }],
                courseCategory: course.category,
                language: targetLanguage
            });

            if (response.ok) {
                const data = await response.json();
                const lecture = data.response;

                setLectureContent(lecture);
                await generateKeyPointsAndSummary(lecture);

                if (data.audio) {
                    setLectureAudio(data.audio);
                    setLectureAudioMime(data.audioMime || 'audio/mp3');
                    lectureTextRef.current = lecture;
                    setSpeechCommand(lecture);
                    await playLectureAudio(data.audio, lecture, 0, data.audioMime);
                } else {
                    // Fallback: Browser TTS
                    setSpeechCommand(lecture);
                    setCurrentSpeech(''); // Ensure it starts empty
                    setCurrentSubtitle('');
                }
                setHasGeneratedIntroduction(true);
                if (onLectureGenerated) onLectureGenerated(lecture, [], ""); // Keypoints are async, might update later
            }

        } catch {
            const fallback = getSubjectIntroduction(course.category, lesson.title);
            setLectureContent(fallback);
            setCurrentSpeech(fallback);
            setHasGeneratedIntroduction(true);
        } finally {
            setIsGeneratingLecture(false);
            isGeneratingRef.current = false;
        }
    };

    const pauseLecture = () => {
        console.log("LectureManager: pauseLecture called");
        isTeachingEnabledRef.current = false;

        // 1. Update states immediately
        setIsLectureAudioPlaying(false);
        setIsAudioPlaying(false);

        // 2. Pause and mute main lecture audio ref
        if (lectureAudioRef.current) {
            lectureAudioRef.current.volume = 0; // Immediate silence
            lectureAudioRef.current.pause();
        }

        // 3. Pause and mute standard audio ref
        if (audioRef.current) {
            audioRef.current.volume = 0;
            audioRef.current.pause();
        }

        // 4. Hard safety net: Find and pause EVERY audio element that might be a lecture blob
        if (typeof document !== 'undefined') {
            const allAudios = document.querySelectorAll('audio');
            allAudios.forEach(aud => {
                if (aud.src.startsWith('blob:') || aud.src === '') {
                    console.log("LectureManager: Safety pausing found audio element", aud.src);
                    aud.pause();
                }
            });
        }

        // 5. Sync Avatar video
        const video = avatarRef.current?.videoRef?.current;
        if (video) {
            video.pause();
        }

        // 6. Hard cancel any leftover speech synthesis
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };

    const toggleMute = (isMuted: boolean) => {
        if (lectureAudioRef.current) {
            lectureAudioRef.current.muted = isMuted;
        }
        if (audioRef.current) {
            audioRef.current.muted = isMuted;
        }
    };

    const resumeLecture = async () => {
        isTeachingEnabledRef.current = true;
        console.log("LectureManager: Attempting resume", {
            hasLectureRef: !!lectureAudioRef.current,
            hasAudioRef: !!audioRef.current,
            savedTime: lastReportedTimeRef.current
        });

        // Restore optimistic state to prevent RealisticAvatar from triggering fallback TTS
        setIsAudioPlaying(true);
        if (lectureAudioRef.current) setIsLectureAudioPlaying(true);

        // 1. Resume main lecture audio (Priority 1)
        if (lectureAudioRef.current) {
            try {
                const aud = lectureAudioRef.current;
                // Force seek to last known accurate time just in case browser reset it on pause
                if (lastReportedTimeRef.current > 0) {
                    console.log("LectureManager: Resuming at precise time", lastReportedTimeRef.current);
                    aud.currentTime = lastReportedTimeRef.current;
                }

                aud.volume = 1.0;
                await aud.play();

                // (Optimistic states already set above)

                const video = avatarRef.current?.videoRef?.current;
                if (video) video.play().catch(console.error);
                return;
            } catch (err) {
                console.error("LectureManager: Lecture resume failed", err);
            }
        }

        // 2. Resume standard/short audio (Priority 2)
        if (audioRef.current) {
            try {
                const aud = audioRef.current;
                if (lastReportedTimeRef.current > 0) {
                    aud.currentTime = lastReportedTimeRef.current;
                }
                aud.volume = 1.0;
                await aud.play();

                // Now that it's actually playing, update state
                setIsAudioPlaying(true);

                const video = avatarRef.current?.videoRef?.current;
                if (video) video.play().catch(console.error);
                return;
            } catch (err) {
                console.error("LectureManager: Audio ref resume failed", err);
            }
        }

        // 3. Fallback: Re-init playback from state if refs lost
        if (lectureAudio) {
            console.log("LectureManager: No active refs, using state fallback for re-init @", lectureAudioCurrentTime);
            playLectureAudio(lectureAudio, lectureContent, lectureAudioCurrentTime || lastReportedTimeRef.current, lectureAudioMime);
        } else if (hasGeneratedIntroduction && lectureContent) {
            // Case for Browser TTS Resume
            console.log("LectureManager: Resuming in Browser TTS mode");
            // Since RealisticAvatar reacts to currentSpeech + isTeachingEnabledRef.current (proxy for isActive), 
            // all we need to do is ensure the state triggers the avatar.
            // (Avatar's speakText index fix handles the rest)
            setIsAudioPlaying(true);
        } else {
            console.warn("LectureManager: Nothing to resume");
        }
    };

    const loadExternalLecture = (script: string) => {
        setLectureContent(script);
        setSpeechCommand(script);
        setCurrentSpeech(''); // Start empty, let TTS drive it
        setCurrentSubtitle('');
        setHasGeneratedIntroduction(true);
        setIsGeneratingLecture(false);
    };

    const handleSpeechProgress = (charIndex: number) => {
        if (speechCommand) {
            // Update currentSpeech progressively based on TTS progress
            // Add a small buffer to ensure words display fully
            const safeIndex = Math.min(charIndex + 5, speechCommand.length);
            setCurrentSpeech(speechCommand.substring(0, safeIndex));

            // Allow subtitles to update based on this progress if needed
            // (Though audio element usually drives subtitles, this is for fallback)
            if (!lectureAudio && speechCommand) {
                // Find sentence roughly at this index
                const sentences = speechCommand.match(/[^.!?]+[.!?]+/g) || [speechCommand];
                let charCount = 0;
                for (const sentence of sentences) {
                    if (charCount + sentence.length > charIndex) {
                        if (currentSubtitle !== sentence) {
                            setCurrentSubtitle(sentence);
                        }
                        break;
                    }
                    charCount += sentence.length;
                }
            }
        }
    };

    const contextValue = useMemo(() => ({
        lectureContent,
        keyPoints,
        summary,
        hasGeneratedIntroduction,
        isGeneratingLecture,
        lectureAudio,
        isLectureAudioPlaying,
        isAudioPlaying,
        lectureAudioCurrentTime,
        lectureAudioDuration,
        currentSubtitle,
        currentSpeech,
        setCurrentSpeech,
        speechCommand,
        handleSpeechProgress,
        generateChapterLecture,
        playLectureAudio,
        playAudioFromBase64,
        stopAllMedia,
        pauseLecture,
        resumeLecture,
        toggleMute,
        loadExternalLecture,
        topicData
    }), [
        lectureContent,
        keyPoints,
        summary,
        hasGeneratedIntroduction,
        isGeneratingLecture,
        lectureAudio,
        isLectureAudioPlaying,
        isAudioPlaying,
        lectureAudioCurrentTime,
        lectureAudioDuration,
        currentSubtitle,
        currentSpeech,
        setCurrentSpeech,
        speechCommand,
        generateChapterLecture,
        playLectureAudio,
        playAudioFromBase64,
        stopAllMedia,
        pauseLecture,
        resumeLecture,
        toggleMute,
        loadExternalLecture,
        topicData
    ]);

    useEffect(() => {
        if (lesson.isDynamic && !topicData && !isGeneratingLecture) {
            console.log("Auto-loading dynamic topic data (Silent)", lesson.title);
            // Call without forceRegenerate to just fetch data
            generateChapterLecture().catch(err => console.error("Dynamic data loading failed:", err));
        }
    }, [lesson.isDynamic, topicData, isGeneratingLecture]);

    return contextValue;
};
