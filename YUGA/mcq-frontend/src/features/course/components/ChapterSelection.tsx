// ChapterSelection.tsx
import React from "react";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import { TopicPlaylist } from "./TopicPlaylist";
import { apiRequest } from "../../../core/utils/api";

interface ChapterSelectionProps {
  subject: string;
  courseType?: string;
  onBack: () => void;
  onChapterSelect: (chapter: string, className: string, topic?: string) => void;
}

const ChapterSelection: React.FC<ChapterSelectionProps> = ({
  subject,
  courseType = 'neet',
  onBack,
  onChapterSelect
}) => {
  // State for dynamic syllabus
  const [syllabusData, setSyllabusData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        // Check both course type and subject name for 'jee'
        // This handles cases where a student enrolled in 'Both' is viewing a JEE subject
        const isJEECourse = courseType.toLowerCase().includes('jee');
        const isJEESubject = subject ? subject.toLowerCase().includes('jee') : false;

        const type = (isJEECourse || isJEESubject) ? 'jee' : 'neet';
        const response = await apiRequest(`/curriculum/${type}/syllabus`);
        const data = await response.json();
        setSyllabusData(data.syllabus);
      } catch (error) {
        console.error("Failed to fetch syllabus", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSyllabus();
  }, []);

  // Theme helpers matching TopicPlaylist
  const theme = React.useMemo(() => {
    if (subject.includes('Physics')) return {
      gradient: 'from-blue-600 to-cyan-500',
      light: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
      shadow: 'shadow-blue-200'
    };
    if (subject.includes('Chemistry')) return {
      gradient: 'from-emerald-600 to-teal-600',
      light: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
      shadow: 'shadow-emerald-200'
    };
    if (subject.includes('Biology')) return {
      gradient: 'from-rose-600 to-pink-600',
      light: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white',
      shadow: 'shadow-rose-200'
    };
    return {
      gradient: 'from-blue-600 to-cyan-500',
      light: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
      shadow: 'shadow-blue-200'
    };
  }, [subject]);

  const getChapterIntroduction = (chapterName: string, className: string, sub: string): string => {
    return `Welcome to ${chapterName} in ${sub} ${className}. Essential concepts for ${courseType.toUpperCase()} preparation.`;
  };

  const [selectedChapter, setSelectedChapter] = React.useState<any | null>(null);
  const [selectedClass, setSelectedClass] = React.useState<string | null>(null);

  // Normalize subject name
  const normalizedSubject = subject.replace(" Class", "");
  const currentChapters = React.useMemo(() => {
    if (!syllabusData) return {};
    // Map backend subject names (Physics, Biology, Chemistry) to subject param if needed
    const subKey = Object.keys(syllabusData).find(k => normalizedSubject.includes(k)) || "Physics";
    return syllabusData[subKey] || {};
  }, [syllabusData, normalizedSubject]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))] transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-[rgb(var(--text-secondary))]">Loading Syllabus...</p>
        </div>
      </div>
    );
  }

  if (selectedChapter && selectedClass) {
    return (
      <TopicPlaylist
        subject={subject}
        courseType={courseType}
        chapter={selectedChapter.name}
        classLevel={selectedClass}
        onBack={() => {
          setSelectedChapter(null);
          setSelectedClass(null);
        }}
        onTopicSelect={(topic) => onChapterSelect(selectedChapter.name, selectedClass, topic)}
      />
    );
  }

  const handleLocalChapterClick = (chapter: any, className: string) => {
    setSelectedChapter(chapter);
    setSelectedClass(className);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] py-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Modern Header */}
        <div className="mb-12 animate-fade-in relative z-10">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-bold text-sm">Back to Courses</span>
            </button>
          </div>

          <div className={`relative rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden bg-gradient-to-br ${theme.gradient} ${theme.shadow}`}>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-black opacity-5 rounded-full -ml-20 -mb-20 blur-2xl"></div>

            <div className="relative z-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-sm font-bold mb-4 shadow-sm">
                  <BookOpen className="w-4 h-4" />
                  <span>Subject Overview</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-lg">{subject}</h1>
                <p className="text-white/90 text-lg max-w-2xl font-medium leading-relaxed opacity-90">
                  Select a class and chapter below to begin your comprehensive learning journey.
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <GraduationCap className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Class Sections Grid */}
        <div className={`grid grid-cols-1 ${Object.keys(currentChapters).length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8`}>
          {Object.entries(currentChapters)
            .sort(([keyA], [keyB]) => {
              if (keyA.includes("Physical Chemistry")) return -1;
              if (keyB.includes("Physical Chemistry")) return 1;
              if (keyA.includes("Inorganic Chemistry")) return -1;
              if (keyB.includes("Inorganic Chemistry")) return 1;
              return 0;
            })
            .map(([className, chapters], colIndex) => (
              <div
                key={className}
                className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full animate-fade-in-up"
                style={{ animationDelay: `${colIndex * 150}ms` }}
              >
                {/* Header */}
                <div className={`relative h-32 overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-90`}></div>
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                  <div className="absolute inset-0 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg">
                        <GraduationCap className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">{className}</h2>
                        <p className="text-white/80 text-xs font-bold uppercase tracking-wider">{courseType.toUpperCase()} Syllabus</p>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 shadow-sm">
                      {(chapters as any[]).length} Chapters
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="space-y-4">
                    {(chapters as any[]).map((chapter: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleLocalChapterClick(chapter, className)}
                        className="group/item w-full text-left p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden flex items-start gap-4"
                      >
                        <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-lg shadow-sm ${theme.light.split(' ')[0]} ${theme.light.split(' ')[1]}`}>
                          {chapter.number}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                            {chapter.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {getChapterIntroduction(chapter.name, className, subject)}
                          </p>
                        </div>

                        <div className="self-center opacity-0 group-hover/item:opacity-100 transition-opacity transform translate-x-2 group-hover/item:translate-x-0">
                          <ArrowLeft className="w-5 h-5 text-blue-500 rotate-180" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Footer Info */}
        <div className="mt-16 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-8 md:p-10 flex items-center gap-8 shadow-lg">
          <div className={`hidden md:flex w-20 h-20 rounded-[1.5rem] bg-gradient-to-br ${theme.gradient} items-center justify-center shadow-xl shadow-blue-500/20 shrink-0`}>
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">About {subject} Course</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-4xl text-base leading-relaxed">
              This comprehensive course is meticulously designed to cover the complete NCERT syllabus for {subject.split(' ')[1]}, aligned perfectly with NEET requirements.
              Dive into interactive lessons, challenging practice questions, and in-depth explanations to master every concept and secure your success.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ChapterSelection };
