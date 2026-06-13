import React, { useState } from 'react';
import { ArrowLeft, Monitor, Sidebar, LayoutDashboard, Shuffle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClassroomViewCenter } from './ClassroomViewCenter';
import { ClassroomViewRight } from './ClassroomViewRight';
import { ClassroomViewLeft } from './ClassroomViewLeft';
import { ClassroomViewDynamic } from './ClassroomViewDynamic';

export const ClassroomViewContainer: React.FC = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState<'center' | 'right' | 'left' | 'dynamic'>('center');

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0520] via-[#1a0f2e] to-[#0f1a2e] text-white flex flex-col font-sans">
            {/* Top Navigation Bar for Demo */}
            <div className="h-16 border-b border-white/10 bg-gradient-to-r from-purple-900/30 via-slate-900/40 to-teal-900/20 backdrop-blur-md flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Classroom UI Variants
                        </h1>
                        <p className="text-xs text-slate-500">A/B Testing Layouts</p>
                    </div>
                </div>

                {/* View Switcher */}
                <div className="flex items-center p-1 bg-slate-800/50 rounded-lg border border-white/5">
                    <button
                        onClick={() => setActiveView('center')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${activeView === 'center'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Center
                    </button>

                    <button
                        onClick={() => setActiveView('right')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${activeView === 'right'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Sidebar className="w-4 h-4 rotate-180" />
                        Right
                    </button>

                    <button
                        onClick={() => setActiveView('left')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${activeView === 'left'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Sidebar className="w-4 h-4" />
                        Left
                    </button>

                    <div className="w-px h-4 bg-white/10 mx-1"></div>

                    <button
                        onClick={() => setActiveView('dynamic')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${activeView === 'dynamic'
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'text-purple-400 hover:text-purple-200 hover:bg-white/5'
                            }`}
                    >
                        <Shuffle className="w-4 h-4" />
                        Dynamic
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative overflow-hidden">
                {activeView === 'center' && <ClassroomViewCenter />}
                {activeView === 'right' && <ClassroomViewRight />}
                {activeView === 'left' && <ClassroomViewLeft />}
                {activeView === 'dynamic' && <ClassroomViewDynamic />}
            </div>
        </div>
    );
};
