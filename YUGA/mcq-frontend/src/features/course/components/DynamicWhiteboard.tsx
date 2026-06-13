import React, { useState, useEffect, useRef } from "react";
import { Download, Trash2, Edit3, Type, Circle, Square, Minus, Save, RefreshCw, FileText, Sparkles, BookOpen, Lightbulb, CheckCircle } from "lucide-react";

interface DynamicWhiteboardProps {
  content: string[];
  lessonTitle: string;
  currentSegment: string;
  isActive: boolean;
  explanation?: string;
  isExplaining?: boolean;
  isAudioPlaying?: boolean;
  highlightedText?: string;
  hasSections?: boolean;
  currentKeyPointIndex?: number;
  totalKeyPoints?: number;
}

const DynamicWhiteboard: React.FC<DynamicWhiteboardProps> = ({
  content,
  lessonTitle,
  currentSegment,
  isActive,
  explanation,
  isExplaining,
  isAudioPlaying,
  highlightedText,
  hasSections = false,
  currentKeyPointIndex = 0,
  totalKeyPoints = 0
}) => {
  const [notes, setNotes] = useState<string[]>([]);
  const [userNotes, setUserNotes] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'pen' | 'text' | 'shape'>('pen');
  const [currentColor, setCurrentColor] = useState('#8b5cf6');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawings, setDrawings] = useState<any[]>([]);
  const [animationIndex, setAnimationIndex] = useState(0);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [highlightedWords, setHighlightedWords] = useState<string[]>([]);

  // Parse content into sections if hasSections is true - NEW ORDER: Key Points first, then Class Lecture, then Summary
  const parseSections = () => {
    if (!hasSections || content.length === 0) {
      return {
        keyPoints: [],
        classLecture: content,
        summary: []
      };
    }

    const keyPoints: string[] = [];
    const classLecture: string[] = [];
    const summary: string[] = [];

    let currentSection = 'keyPoints';

    content.forEach(line => {
      if (line.includes('KEY POINTS') || line.includes('🔑 KEY POINTS')) {
        currentSection = 'keyPoints';
        return;
      }
      if (line.includes('CLASS LECTURE') || line.includes('🎯 CLASS LECTURE')) {
        currentSection = 'classLecture';
        return;
      }
      if (line.includes('SUMMARY') || line.includes('📝 SUMMARY')) {
        currentSection = 'summary';
        return;
      }

      if (line.trim() === '' || line.includes('=====')) {
        return;
      }

      switch (currentSection) {
        case 'keyPoints':
          if (line.startsWith('•') || line.trim()) {
            keyPoints.push(line);
          }
          break;
        case 'classLecture':
          classLecture.push(line);
          break;
        case 'summary':
          if (line.trim()) {
            summary.push(line);
          }
          break;
      }
    });

    return { keyPoints, classLecture, summary };
  };

  const sections = parseSections();

  useEffect(() => {
    if (content && content.length > 0) {
      if (hasSections) {
        // For sections view, we don't animate the entire content
        setNotes(content);
        setAnimationIndex(content.length);
      } else {
        // For regular view, animate points appearing one by one
        setNotes(content);
        setAnimationIndex(0);

        if (isActive) {
          content.forEach((_, index) => {
            setTimeout(() => {
              setAnimationIndex(index + 1);
            }, index * 500);
          });
        } else {
          setAnimationIndex(content.length);
        }
      }
    }
  }, [content, isActive, hasSections]);

  // Handle text highlighting during audio playback - 2.5x FASTER SPEED (120ms per word)
  useEffect(() => {
    if (highlightedText && isAudioPlaying) {
      const words = highlightedText.split(' ');
      setHighlightedWords(words);
      setCurrentHighlightIndex(0);

      const interval = setInterval(() => {
        setCurrentHighlightIndex(prev => {
          if (prev >= words.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 120); // 2.5x faster speed: 120ms per word

      return () => clearInterval(interval);
    } else {
      setHighlightedWords([]);
      setCurrentHighlightIndex(0);
    }
  }, [highlightedText, isAudioPlaying]);

  const exportNotes = () => {
    const timestamp = new Date().toLocaleString();
    const allNotes = [
      `YUGA AI - Lesson Notes`,
      `Generated on: ${timestamp}`,
      ``,
      `Course: ${lessonTitle}`,
      `Section: ${currentSegment}`,
      ``,
      `=== KEY POINTS ===`,
      ...(hasSections ? sections.keyPoints : ['Key points will appear here as the lesson progresses']),
      ``,
      `=== CLASS LECTURE ===`,
      ...(hasSections ? sections.classLecture : notes),
      ``,
      `=== SUMMARY ===`,
      ...(hasSections ? sections.summary : ['Summary will appear here as the lesson progresses']),
      ``,
      `=== PERSONAL NOTES ===`,
      userNotes || 'No personal notes added.',
      ``,
      `=== EXPLANATIONS ===`,
      explanation || 'No explanations added.',
      ``,
      `=== LEARNING SUMMARY ===`,
      `This lesson covered ${hasSections ? sections.keyPoints.length : notes.length} key concepts in ${currentSegment}.`,
      `Continue practicing these concepts for better understanding.`
    ].join('\n');

    const blob = new Blob([allNotes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lessonTitle.replace(/\s+/g, '_')}_${currentSegment.replace(/\s+/g, '_')}_notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearWhiteboard = () => {
    setNotes([]);
    setUserNotes('');
    setDrawings([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (drawingMode !== 'pen') return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || drawingMode !== 'pen') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Enhanced Whiteboard Header */}
      <div className="relative p-5 border-b border-blue-100 bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-600 flex-shrink-0">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-600 opacity-90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg flex items-center">
                  {currentSegment}
                  {isActive && (
                    <div className="ml-3 flex items-center space-x-2 px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-400/30">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-100 font-medium">LIVE</span>
                    </div>
                  )}
                </h3>
                <p className="text-xs text-blue-100 mt-1 flex items-center space-x-2">
                  <BookOpen className="w-3 h-3" />
                  <span>{hasSections ? 'Interactive Learning Sections' : 'Real-time Auto-sync'}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportNotes}
                className="p-2.5 text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 hover:scale-105"
                title="Export Notes"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={clearWhiteboard}
                className="p-2.5 text-white bg-red-500/30 hover:bg-red-500/40 backdrop-blur-sm rounded-xl transition-all duration-200 hover:scale-105"
                title="Clear All"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Enhanced Drawing Tools */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-xl p-1">
              <button
                onClick={() => setDrawingMode('pen')}
                className={`p-2 rounded-lg transition-all duration-200 ${drawingMode === 'pen' ? 'bg-white text-blue-600 shadow-lg' : 'text-white hover:bg-white/20'
                  }`}
                title="Pen Tool"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDrawingMode('text')}
                className={`p-2 rounded-lg transition-all duration-200 ${drawingMode === 'text' ? 'bg-white text-blue-600 shadow-lg' : 'text-white hover:bg-white/20'
                  }`}
                title="Text Tool"
              >
                <Type className="w-4 h-4" />
              </button>
            </div>
            <div className="relative group">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="w-10 h-10 rounded-lg border-2 border-white/30 cursor-pointer bg-white/10 backdrop-blur-sm"
              />
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Color Picker
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Enhanced Styling */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {hasSections ? (
          /* Three Sections View for NEET Physics/Chemistry/Biology - Enhanced Design */
          <>
            {/* Key Points Section - Premium Design */}
            <div className="group">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative p-2 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg flex items-center space-x-2">
                    <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      Key Points
                    </span>
                    {isActive && totalKeyPoints > 0 && (
                      <div className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-300 text-emerald-700 rounded-full text-xs font-semibold flex items-center space-x-1.5 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span>{currentKeyPointIndex + 1} / {totalKeyPoints}</span>
                      </div>
                    )}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">Essential concepts to remember</p>
                </div>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {sections.keyPoints.length > 0 ? (
                  sections.keyPoints.map((point, index) => (
                    <div
                      key={index}
                      className={`transform transition-all duration-700 ${index <= currentKeyPointIndex
                        ? 'scale-100 opacity-100 translate-x-0'
                        : 'scale-95 opacity-40 translate-x-4'
                        }`}
                    >
                      <div className={`relative p-4 rounded-2xl border-2 transition-all duration-500 ${index <= currentKeyPointIndex
                        ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-cyan-50 border-emerald-300 shadow-lg shadow-emerald-100/50'
                        : 'bg-gray-50 border-gray-200'
                        }`}>
                        {index <= currentKeyPointIndex && (
                          <div className="absolute -top-1 -left-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md ${index <= currentKeyPointIndex
                            ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white'
                            : 'bg-gray-300 text-gray-600'
                            }`}>
                            {index + 1}
                          </div>
                          <p className={`text-sm leading-relaxed flex-1 ${index <= currentKeyPointIndex ? 'text-gray-800 font-medium' : 'text-gray-500'
                            }`}>
                            {point.replace(/^•\s*/, '')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center shadow-lg">
                      <Lightbulb className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Key points will appear in real-time</p>
                    <p className="text-xs text-gray-500 mt-1">as the lecture progresses</p>
                  </div>
                )}
              </div>
            </div>

            {/* Class Lecture Section - Premium Design */}
            <div className="group">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg flex items-center space-x-2">
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                      Class Lecture
                    </span>
                    {isActive && (
                      <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-100 border border-blue-300 text-blue-700 rounded-full text-xs font-semibold flex items-center space-x-1.5 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>LIVE</span>
                      </div>
                    )}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">Main learning content</p>
                </div>
              </div>
              <div className="relative p-6 bg-gradient-to-br from-blue-50 via-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 shadow-xl shadow-blue-100/50 max-h-72 overflow-y-auto custom-scrollbar">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
                {sections.classLecture.length > 0 ? (
                  <div className="relative space-y-3">
                    {sections.classLecture.map((line, index) => (
                      <p key={index} className="text-gray-800 text-sm leading-relaxed font-medium">
                        {line}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                    <p className="text-sm text-gray-600 font-medium">Class lecture content will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Section - Premium Design */}
            <div className="group">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg">
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Summary
                    </span>
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">Quick recap of the lesson</p>
                </div>
              </div>
              <div className="relative p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 shadow-xl shadow-blue-100/50 max-h-56 overflow-y-auto custom-scrollbar">
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
                {sections.summary.length > 0 ? (
                  <div className="relative space-y-2">
                    {sections.summary.map((line, index) => (
                      <p key={index} className="text-gray-800 text-sm leading-relaxed font-medium">
                        {line}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Summary will be generated</p>
                    <p className="text-xs text-gray-500 mt-1">from the lecture content</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Regular Single Section View for other courses */
          <>
            {/* Auto-generated Key Points */}
            <div className="group">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg flex items-center space-x-2">
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                      Key Points
                    </span>
                    {isActive && (
                      <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 text-green-700 rounded-full text-xs font-semibold flex items-center space-x-1.5 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span>LIVE UPDATE</span>
                      </div>
                    )}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">Automatically extracted from the lesson</p>
                </div>
              </div>
              <div className="space-y-4">
                {notes.map((note, index) => (
                  <div
                    key={index}
                    className={`transform transition-all duration-700 ${index < animationIndex ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-8 opacity-0 scale-95'
                      }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="relative p-5 bg-gradient-to-br from-blue-50 via-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-blue-200/20 rounded-full blur-2xl group-hover:opacity-75 transition-opacity"></div>
                      <div className="flex items-start space-x-4 relative z-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                          {index + 1}
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed flex-1 font-medium">{note}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {notes.length === 0 && (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-100 rounded-3xl flex items-center justify-center shadow-xl">
                      <FileText className="w-10 h-10 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Waiting for content...</p>
                    <p className="text-xs text-gray-500 mt-2">Key points will appear as the lesson progresses</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* NEET 2.O Explanation Section - Enhanced */}
        {explanation && (
          <div className="group">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative p-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-lg flex items-center space-x-2">
                  <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                    Detailed Explanation
                  </span>
                  {isExplaining && (
                    <div className="px-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 text-amber-700 rounded-full text-xs font-semibold flex items-center space-x-1.5 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                      <span>{isAudioPlaying ? 'Audio Playing...' : 'Typing...'}</span>
                    </div>
                  )}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">In-depth analysis and insights</p>
              </div>
            </div>
            <div className="relative p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200 shadow-xl shadow-amber-100/50">
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-yellow-200/20 rounded-full blur-3xl"></div>
              {isAudioPlaying && highlightedWords.length > 0 ? (
                <p className="relative text-gray-800 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {highlightedWords.map((word, index) => (
                    <span
                      key={index}
                      className={index <= currentHighlightIndex ?
                        'bg-gradient-to-r from-blue-200 to-blue-200 text-blue-900 px-1.5 py-0.5 rounded-md transition-all duration-300 font-semibold' :
                        'text-gray-800'
                      }
                    >
                      {word}{' '}
                    </span>
                  ))}
                </p>
              ) : (
                <p className="relative text-gray-800 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {explanation}
                  {isExplaining && (
                    <span className="inline-block w-1 h-5 bg-amber-500 ml-1 animate-pulse"></span>
                  )}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Drawing Canvas - Enhanced */}
        <div className="group">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg">
                <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  Visual Notes & Sketches
                </span>
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Draw diagrams and visual explanations</p>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            width={320}
            height={200}
            className="w-full border-2 border-dashed border-blue-300 rounded-2xl cursor-crosshair bg-white hover:border-blue-500 hover:shadow-xl transition-all duration-300"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          <p className="text-xs text-gray-500 mt-3 flex items-center space-x-2">
            <Edit3 className="w-3 h-3" />
            <span>Click and drag to draw, or use the tools above</span>
          </p>
        </div>

        {/* Personal Notes - Enhanced */}
        <div className="group">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full">
                <Type className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-lg">
                <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Personal Notes
                </span>
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Add your own insights and questions</p>
            </div>
          </div>
          <textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="✍️ Add your own notes, questions, or insights here..."
            className="w-full h-40 p-5 border-2 border-teal-200 bg-gradient-to-br from-teal-50/50 to-emerald-50/50 rounded-2xl resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm leading-relaxed placeholder:text-gray-400 transition-all duration-200 shadow-sm hover:shadow-lg font-medium"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-500 flex items-center space-x-1">
              <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
              <span>{userNotes.length} characters</span>
            </p>
            <p className="text-xs text-teal-600 font-medium flex items-center space-x-1">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
              <span>Auto-saved</span>
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions Footer */}
      <div className="p-5 border-t border-blue-100 bg-gradient-to-r from-slate-50 via-white to-blue-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-slate-100 to-gray-100 rounded-xl">
              <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-gray-700 font-medium">Auto-sync: <span className={isActive ? 'text-green-600' : 'text-gray-500'}>{isActive ? 'ON' : 'OFF'}</span></span>
            </div>
            {hasSections && totalKeyPoints > 0 && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl border border-emerald-300">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">
                  Key Points: {currentKeyPointIndex + 1}/{totalKeyPoints}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={exportNotes}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-2xl hover:shadow-blue-300/50 transition-all duration-300 text-sm font-bold flex items-center space-x-2 hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>Export Notes</span>
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(148, 163, 184, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #6366f1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9333ea, #4f46e5);
        }
      `}} />
    </div>
  );
};

export { DynamicWhiteboard };

