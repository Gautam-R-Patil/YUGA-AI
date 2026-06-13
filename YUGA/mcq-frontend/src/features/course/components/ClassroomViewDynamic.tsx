import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Monitor, HelpCircle } from 'lucide-react';
import { RealisticAvatar } from "./RealisticAvatar";
import { EnhancedSmartBoard } from "./EnhancedSmartBoard";
import { RealTimeChat } from "./RealTimeChat";

// Mock Data
const MOCK_COURSE = { title: "Physics Demo", category: "NEET Physics" };
const MOCK_LESSON = { title: "Electromagnetism: Field Theory", isAIGenerated: false };

export const ClassroomViewDynamic: React.FC = () => {
    const [isLessonActive, setIsLessonActive] = useState(false);
    const [layoutState, setLayoutState] = useState<'center' | 'side'>('center');
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const avatarRef = useRef<any>(null);

    // Effect to handle transition
    useEffect(() => {
        if (isLessonActive) {
            setLayoutState('side');
        } else {
            setLayoutState('center');
        }
    }, [isLessonActive]);

    const lectureManager = {
        isAudioPlaying: isLessonActive,
        currentSpeech: isLessonActive ? "Starting the lesson on Electromagnetism. Observe the sidebar transition." : "Hello! Click Start to begin the class.",
        currentSubtitle: isLessonActive ? "Starting the lesson on Electromagnetism." : "",
        isLectureAudioPlaying: false,
    };

    const handleToggleLesson = () => {
        setIsLessonActive(!isLessonActive);
    };

    return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0520] via-[#1a0f2e] to-[#0f1a2e] p-4 flex gap-4 overflow-hidden transition-all duration-700 ease-in-out font-sans text-gray-100">

            {/* Smart Content Area */}
            <div className={`flex flex-col min-w-0 bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden shadow-xl transition-all duration-700 ease-in-out ${layoutState === 'center' ? 'flex-[3]' : 'flex-[7]'}`}>
                <EnhancedSmartBoard
                    content={['# Dynamic Layout', '- Initial State: Center', '- Active State: Side', '- Smooth Transition']}
                    lessonTitle={MOCK_LESSON.title}
                    currentSegment={""}
                    isActive={isLessonActive}
                    explanation={"The UI adapts to focus on content when the lesson begins."}
                    isExplaining={false}
                    isAudioPlaying={isLessonActive}
                    highlightedText={''}
                    hasSections={true}
                    currentKeyPointIndex={0}
                    totalKeyPoints={4}
                    onAddToNotes={() => { }}
                    currentSpeech={lectureManager.currentSubtitle}
                />
            </div>

            {/* Avatar Container (Center Mode) */}
            <div className={`flex flex-col min-w-0 transition-all duration-700 ease-in-out ${layoutState === 'center' ? 'flex-[4]' : 'flex-[0] hidden'}`}>
                <div className="flex-1 bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative flex flex-col">

                    {/* Header Badge */}


                    {/* CENTER MODE AVATAR */}
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                        <div className="relative w-full h-full flex items-center justify-center transform scale-95 origin-center">
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

                    {/* Controls Bar (Static Bottom Dock) */}
                    <div className="h-24 flex items-center justify-center bg-slate-950/40 backdrop-blur-xl border-t border-white/5 z-20">
                        <div className="flex items-center gap-6 px-8 py-3 bg-slate-800/80 border border-white/10 rounded-full shadow-2xl">
                            <button className="p-3 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                                <Monitor className="w-6 h-6" />
                            </button>
                            <button onClick={handleToggleLesson} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105 ${isLessonActive ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-500 hover:bg-cyan-600'}`}>
                                {isLessonActive ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}
                            </button>
                            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-3 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                                {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar Container (Combined Avatar + Chat) - Only visible/expanded in SIDE mode */}
            <div className={`flex flex-col min-w-0 gap-4 transition-all duration-700 ease-in-out ${layoutState === 'center' ? 'flex-[3]' : 'flex-[3]'}`}>

                {/* Avatar Slot (Visible in SIDE mode) */}
                {layoutState === 'side' && (
                    <div className="flex-[4] flex flex-col min-w-0 bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative animate-slideInFromRight">

                        {/* Header Badge */}
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
                            <div className={`w-2 h-2 rounded-full ${isLessonActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">LIVE</span>
                        </div>

                        {/* Avatar Area */}
                        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-transparent to-black/20">
                            <div className="relative w-full h-full flex items-center justify-center transform scale-95 origin-center">
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

                        {/* Controls Bar (Static Bottom) */}
                        <div className="h-16 flex items-center justify-center bg-slate-950/40 backdrop-blur-xl border-t border-white/5 z-20">
                            <div className="flex items-center gap-4 px-5 py-2 bg-slate-800/50 border border-white/10 rounded-full shadow-lg">
                                <button className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                                    <Monitor className="w-4 h-4" />
                                </button>
                                <button onClick={handleToggleLesson} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${isLessonActive ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-500 hover:bg-cyan-600'}`}>
                                    <Pause className="w-4 h-4 text-white" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                                    <Volume2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* Chat Container */}
                <div className={`flex flex-col min-w-0 bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden shadow-xl transition-all duration-500 ${layoutState === 'center' ? 'flex-1' : 'flex-[6]'}`}>
                    <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <span className="font-semibold text-sm text-cyan-100">Ask Doubt</span>
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                    </div>
                    <RealTimeChat
                        onQuestionAsked={() => { }}
                        onClose={() => setIsChatOpen(false)}
                        courseCategory={MOCK_COURSE.category}
                        maxSuggestions={2}
                    />
                </div>

            </div>

        </div>
    );
};
