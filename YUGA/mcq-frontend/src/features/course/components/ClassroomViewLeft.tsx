import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Monitor, HelpCircle } from 'lucide-react';
import { RealisticAvatar } from "./RealisticAvatar";
import { EnhancedSmartBoard } from "./EnhancedSmartBoard";
import { RealTimeChat } from "./RealTimeChat";

// Mock Data
const MOCK_COURSE = { title: "Physics Demo", category: "NEET Physics" };
const MOCK_LESSON = { title: "Electromagnetism: Field Theory", isAIGenerated: false };

export const ClassroomViewLeft: React.FC = () => {
    const [isLessonActive, setIsLessonActive] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avatarRef = useRef<any>(null);

    const lectureManager = {
        isAudioPlaying: isLessonActive,
        currentSpeech: isLessonActive ? "Calculating the flux through a closed surface requires Gauss's Law." : "Hello! Ready to start?",
        currentSubtitle: isLessonActive ? "Calculating the flux through a closed surface requires Gauss's Law." : "",
        isLectureAudioPlaying: false,
    };

    return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0520] via-[#1a0f2e] to-[#0f1a2e] p-6 flex gap-6 overflow-hidden font-sans text-gray-100">

            {/* LEFT COLUMN: Sidebar (30%) - Stacked Avatar & Chat */}
            <div className="flex-[3] flex flex-col min-w-0 gap-4">

                {/* Avatar Container - Compact and fixed height */}
                <div className="w-full h-[280px] flex-none bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden shadow-xl relative flex flex-col">


                    {/* Avatar Viewing Area */}
                    <div className="flex-1 relative w-full overflow-hidden">
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

                    {/* Controls Dock */}
                    <div className="flex items-center justify-center bg-slate-950/60 backdrop-blur-xl border-t border-white/5 py-3">
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-800/60 border border-white/10 rounded-full">
                            <button className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                                <Monitor className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setIsLessonActive(!isLessonActive)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isLessonActive ? 'bg-white/10 text-white' : 'bg-cyan-500 text-white'}`}>
                                {isLessonActive ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                            </button>
                            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                            </button>
                            <button className="p-1.5 rounded-full hover:bg-white/10 text-red-400 transition-colors">
                                <div className="w-2 h-2 rounded-full border border-current"></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Ask Doubt Section - Cleaner design */}
                <div className="flex-1 flex flex-col min-h-0 bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                    <div className="p-3 border-b border-white/5 flex justify-between items-center">
                        <span className="font-semibold text-sm text-white">Ask Doubt</span>
                        <button className="text-gray-400 hover:text-white transition-colors">
                            <HelpCircle className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <RealTimeChat
                            onQuestionAsked={() => { }}
                            onClose={() => { }}
                            courseCategory={MOCK_COURSE.category}
                            maxSuggestions={2}
                            hideHeader={true}
                        />
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Smart Content (Wide - 70%) */}
            <div className="flex-[7] flex flex-col min-w-0 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-l from-blue-900/5 to-transparent pointer-events-none"></div>
                <EnhancedSmartBoard
                    content={['# Gauss Law', '- Integral Form', '- Differential Form', '- Applications in Symmetry']}
                    lessonTitle={MOCK_LESSON.title}
                    currentSegment={""}
                    isActive={isLessonActive}
                    explanation={"Using a Gaussian surface to determine Electric Field E due to a point charge."}
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

        </div>
    );
};
