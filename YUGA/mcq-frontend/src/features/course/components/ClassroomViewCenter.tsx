import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, HelpCircle, Monitor, Mic } from 'lucide-react';
import { RealisticAvatar } from "./RealisticAvatar";
import { EnhancedSmartBoard } from "./EnhancedSmartBoard";
import { RealTimeChat } from "./RealTimeChat";

// Mock Data
const MOCK_COURSE = { title: "Physics Demo", category: "NEET Physics" };
const MOCK_LESSON = { title: "Electromagnetism: Field Theory", isAIGenerated: false };

export const ClassroomViewCenter: React.FC = () => {
    const [isLessonActive, setIsLessonActive] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avatarRef = useRef<any>(null);

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Sync with video element from Avatar
    useEffect(() => {
        const interval = setInterval(() => {
            const video = avatarRef.current?.videoRef?.current;
            if (video) {
                setCurrentTime(video.currentTime);
                setDuration(video.duration || 0);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // Mock Managers
    const lectureManager = {
        isAudioPlaying: isLessonActive,
        currentSpeech: isLessonActive ? "Welcome to today's session on Electromagnetism. We will explore how electric fields interact with magnetic fields." : "Hello! Ready to start?",
        currentSubtitle: isLessonActive ? "Welcome to today's session on Electromagnetism." : "",
        isLectureAudioPlaying: false,
    };

    return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0520] via-[#1a0f2e] to-[#0f1a2e] p-4">
            <div className="flex gap-4 h-full">
                {/* LEFT COLUMN: Smart Content (25%) */}
                <div className="flex-[2.5] flex flex-col min-w-0 bg-slate-900/50 rounded-2xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)] overflow-hidden">
                    <EnhancedSmartBoard
                        content={['# Electromagnetism', '## Key Concepts', '- Electric Fields', '- Magnetic Flux', '- Maxwell Equations']}
                        lessonTitle={MOCK_LESSON.title}
                        currentSegment={""}
                        isActive={isLessonActive}
                        explanation={"Visualizing the magnetic field lines around a current-carrying conductor."}
                        isExplaining={false}
                        isAudioPlaying={isLessonActive}
                        highlightedText={''}
                        hasSections={true}
                        currentKeyPointIndex={0}
                        totalKeyPoints={3}
                        onAddToNotes={() => { }}
                        currentSpeech={lectureManager.currentSubtitle}
                    />
                </div>

                {/* CENTER COLUMN: Avatar (50%) */}
                <div className="flex-[5] flex flex-col min-w-0 bg-gradient-to-br from-slate-800/60 via-purple-900/30 to-slate-800/60 rounded-3xl border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)] overflow-hidden relative">

                    {/* Avatar Area (Flex Grow) - Keeps Avatar separated from controls */}
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-transparent to-black/20">
                        <div className="relative w-full h-full flex items-center justify-center">
                            <RealisticAvatar
                                ref={avatarRef}
                                gender="female"
                                isTeaching={isLessonActive}
                                currentSpeech={lectureManager.currentSpeech}
                                emotion={isLessonActive ? 'teaching' : 'friendly'}
                                soundEnabled={soundEnabled}
                                onQuestionAsked={() => { }}
                                onSpeechEnd={() => { }}
                                onOpenVoiceAssistant={() => { }}
                                language="english"
                                isExternalAudioPlaying={false}
                                courseCategory={MOCK_COURSE.category}
                            />
                        </div>
                    </div>

                    {/* Controls Bar with Progress */}
                    <div className="flex flex-col bg-[#0f111a]/90 backdrop-blur-md border-t border-white/5 z-20">
                        {/* Progress Bar - Sleek & Thin */}
                        <div
                            className="w-full h-1 bg-white/5 cursor-pointer group relative"
                            onClick={(e) => {
                                const video = avatarRef.current?.videoRef?.current;
                                if (video && duration) {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const percent = (e.clientX - rect.left) / rect.width;
                                    video.currentTime = percent * duration;
                                    setCurrentTime(percent * duration);
                                }
                            }}
                        >
                            <div
                                className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 relative transition-all duration-100 ease-linear"
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>

                        {/* Control Buttons - Enterprise Style */}
                        <div className="flex items-center justify-between px-6 py-4">
                            {/* Left Controls */}
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-400 font-medium tabular-nums">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </div>
                            </div>

                            {/* Center Controls */}
                            <div className="flex items-center gap-4">
                                <button className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all" title="Toggle Camera">
                                    <Monitor className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={() => setIsLessonActive(!isLessonActive)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95 ${isLessonActive ? 'bg-white text-black' : 'bg-teal-500 text-white'}`}
                                >
                                    {isLessonActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                                </button>

                                <button className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all" title="Toggle Mic">
                                    <Mic className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Right Controls */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                    title="Volume"
                                >
                                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                                </button>
                                <button className="p-2.5 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all" title="End Session">
                                    <div className="w-2.5 h-2.5 rounded-[2px] bg-current"></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Chat (25%) */}
                <div className="flex-[2.5] flex flex-col min-w-0 bg-slate-900/50 rounded-2xl border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)] overflow-hidden">
                    <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <span className="font-semibold text-sm text-cyan-100">Ask Doubt</span>
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                    </div>
                    <RealTimeChat
                        onQuestionAsked={() => { }}
                        onClose={() => { }}
                        courseCategory={MOCK_COURSE.category}
                        hideHeader={true}
                    />
                </div>

            </div>
        </div>
    );
};
