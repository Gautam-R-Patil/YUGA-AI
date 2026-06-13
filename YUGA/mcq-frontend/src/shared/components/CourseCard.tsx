import React, { useCallback, useMemo } from "react";
import { Clock, BookOpen } from "lucide-react";
import { Course } from "../../core/types";
import { useCourse } from "../../core/contexts/CourseContext";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  onCourseClick: (course: Course) => void;
  searchQuery?: string;
  courses: Course[];
  loading: boolean;
}

interface CourseSection {
  title: string;
  description: string;
  courses: Course[];
}

export const getThumbnail = (category: string): string | null => {
  const thumbnails: Record<string, string> = {
    "NEET Physics Class": "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa",
    "NEET Chemistry Class": "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6",
    "NEET Biology Class": "https://images.unsplash.com/photo-1530026405186-ed1f139313f8",
    "NEET Physics MCQs": "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa",
    "NEET Chemistry MCQs": "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6",
    "NEET Biology MCQs": "https://images.unsplash.com/photo-1530026405186-ed1f139313f8",
    "NEET AI Examiner": "https://images.unsplash.com/photo-1531482615713-2afd69097998",
    "Your Scheduled Classes": "https://images.unsplash.com/photo-1633526543814-9718c8922b7a",
    "Your Schedule Quiz": "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b",
    "Your Weekly Mock Test": "https://images.unsplash.com/photo-1517673132405-a56a62b18caf",
    "JEE Physics Class": "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa",
    "JEE Chemistry Class": "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6",
    "JEE Mathematics Class": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
    "JEE Physics MCQs": "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa",
    "JEE Chemistry MCQs": "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6",
    "JEE Mathematics MCQs": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
    "JEE AI Examiner": "https://images.unsplash.com/photo-1531482615713-2afd69097998",
  };
  return thumbnails[category] || null;
};

// Kept for backward compatibility or reference, though specific styles are now in-component
export const getCardStyle = (_category: string) => {
  return {
    ringClass: "",
    gradient: "from-purple-600 via-purple-600 to-pink-600",
    badge: null,
    badgeColor: "text-purple-600",
  };
};

export const getCourseDescription = (category: string): string => {
  const descriptions: Record<string, string> = {
    "NEET Physics Class": "Master Physics concepts with AI-guided lessons, interactive simulations, and real-world problem solving.",
    "NEET Chemistry Class": "Comprehensive Chemistry coverage including Organic, Inorganic, and Physical Chemistry with detailed explanations.",
    "NEET Biology Class": "In-depth Biology lessons covering Botany and Zoology with high-quality diagrams and retention aids.",
    "NEET AI Examiner": "Simulate the real exam environment with our advanced AI Examiner. Adaptive difficulty and detailed analysis.",
    "NEET Physics MCQs": "Sharpen your Physics problem-solving skills with a vast bank of targeted MCQs and instant solution tracking.",
    "NEET Chemistry MCQs": "Practice high-yield Chemistry questions curated to boost your speed and accuracy for the NEET exam.",
    "NEET Biology MCQs": "Test your Biology knowledge with topic-wise MCQs designed to reinforce key concepts and improve recall.",
    "Your Scheduled Classes": "Your daily AI-scheduled classes based on your Yuga Timer study plan. Stay on track!",
    "Your Schedule Quiz": "Quick daily quizzes to test your retention of yesterday's topics.",
    "Your Weekly Mock Test": "Comprehensive weekly mock exams to simulate real test conditions and track progress.",
    "JEE Physics Class": "Master JEE Physics with advanced problem-solving techniques and in-depth conceptual clarity.",
    "JEE Chemistry Class": "Build a strong foundation in JEE Chemistry covering all branches with advanced AI tutoring.",
    "JEE Mathematics Class": "Excel in JEE Mathematics with complex problem walkthroughs and mathematical reasoning skills.",
    "JEE Physics MCQs": "Challenge yourself with high-level JEE Physics MCQs and detailed performance analytics.",
    "JEE Chemistry MCQs": "Advanced Chemistry MCQ practice tailored for JEE Mains and Advanced difficulty levels.",
    "JEE Mathematics MCQs": "Rigorous Mathematics practice with JEE-level questions and step-by-step AI solutions."
  };
  return descriptions[category] || "Learn effectively with our AI-powered course content designed for your success.";
};

const CourseCard: React.FC<CourseCardProps> = ({ onCourseClick, searchQuery = "", courses, loading }) => {
  const navigate = useNavigate();
  const { config } = useCourse();

  const organizeCoursesIntoSections = useCallback((coursesList: Course[]): CourseSection[] => {
    // 3. Exam Prep Zone (NEET ONLY)
    const examPrepZone = coursesList.filter(course =>
      course.category === "NEET AI Examiner"
    );

    const sections: CourseSection[] = [];
    if (examPrepZone.length > 0) {
      sections.push({ 
        title: "Exam Prep Zone", 
        description: "Simulate real exam conditions with AI-powered mock tests.", 
        courses: examPrepZone 
      });
    }

    return sections;
  }, []);

  const displayedSections = useMemo(() => {
    let filtered = courses;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = courses.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query)
      );
    }
    return organizeCoursesIntoSections(filtered);
  }, [courses, searchQuery, organizeCoursesIntoSections]);

  if (loading) return <div className="text-center py-12 text-gray-500"><p>Loading courses...</p></div>;

  return (
    <div className="space-y-12">
      {displayedSections.map((section, sectionIndex) => {
        const isFolderSection = config.id === 'both' && (section.title === 'Classes' || section.title === 'MCQ Practice');

        let displayCourses = section.courses;
        if (isFolderSection) {
          displayCourses = [
            {
              id: `folder-neet-${section.title}`,
              title: section.title === 'Classes' ? 'NEET Classes' : 'NEET Practice',
              description: section.title === 'Classes' ? 'Access all NEET Physics, Chemistry, and Biology classes.' : 'Practice NEET Physics, Chemistry, and Biology MCQs.',
              category: 'Folder',
              image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8',
              duration: '3 Subjects',
              lessons: [],
              level: 'Intermediate',
              progress: 0,
              color: 'bg-teal-600',
              chapters: [],
              instructor: '',
              rating: 0,
              students: 0,
              tags: ['Folder', 'NEET'],
              notesCount: 0
            },
            {
              id: `folder-jee-${section.title}`,
              title: section.title === 'Classes' ? 'JEE Classes' : 'JEE Practice',
              description: section.title === 'Classes' ? 'Access all JEE Physics, Chemistry, and Mathematics classes.' : 'Practice JEE Physics, Chemistry, and Mathematics MCQs.',
              category: 'Folder',
              image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
              duration: '3 Subjects',
              lessons: [],
              level: 'Intermediate',
              progress: 0,
              color: 'bg-indigo-600',
              chapters: [],
              instructor: '',
              rating: 0,
              students: 0,
              tags: ['Folder', 'JEE'],
              notesCount: 0
            }
          ];
        }

        return (
          <div key={section.title} className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <div className="text-center w-full relative">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h2>
                <p className="text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">{section.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 px-4">
              {displayCourses.map((course, courseIndex) => {
                const isFolder = course.category === 'Folder';
                let theme = 'purple';
                if (course.title.includes('NEET') || course.category.includes('Biology')) theme = 'teal';
                else if (course.title.includes('JEE') || course.category.includes('Mathematics')) theme = 'indigo';
                else if (course.category.includes('Physics')) theme = 'violet';
                else if (course.category.includes('Chemistry')) theme = 'emerald';

                if (course.category === 'Your Scheduled Classes') theme = 'violet';
                if (course.category.includes('Mock')) theme = 'rose';

                const gradients: Record<string, any> = {
                  teal: { from: 'from-teal-500', to: 'to-emerald-500', shadow: 'shadow-teal-500/20', btnShadow: 'shadow-teal-500/40', text: 'text-teal-600', light: 'bg-teal-50', border: 'border-teal-100' },
                  indigo: { from: 'from-indigo-600', to: 'to-blue-600', shadow: 'shadow-indigo-500/20', btnShadow: 'shadow-indigo-500/40', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-100' },
                  violet: { from: 'from-violet-600', to: 'to-purple-600', shadow: 'shadow-violet-500/20', btnShadow: 'shadow-violet-500/40', text: 'text-violet-600', light: 'bg-violet-50', border: 'border-violet-100' },
                  emerald: { from: 'from-emerald-500', to: 'to-teal-500', shadow: 'shadow-emerald-500/20', btnShadow: 'shadow-emerald-500/40', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-100' },
                  rose: { from: 'from-rose-500', to: 'to-red-500', shadow: 'shadow-rose-500/20', btnShadow: 'shadow-rose-500/40', text: 'text-rose-600', light: 'bg-rose-50', border: 'border-rose-100' },
                  purple: { from: 'from-purple-600', to: 'to-pink-600', shadow: 'shadow-purple-500/20', btnShadow: 'shadow-purple-500/40', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-100' },
                };

                const palette = gradients[theme] || gradients['purple'];
                const folderType = course.title.includes('NEET') ? 'neet' : 'jee';
                const sectionParam = section.title === 'Classes' ? 'classes' : 'practice';

                const handleClick = () => {
                  if (isFolder) { navigate(`/dashboard/courses/${sectionParam}/${folderType}`); return; }
                  if (course.category === 'Your Scheduled Classes') { navigate('/todays-classes'); return; }
                  if (course.category === 'Your Schedule Quiz') { navigate('/ai-assessment', { state: { type: 'quiz', subject: 'General Science' } }); return; }
                  if (course.category === 'Your Weekly Mock Test') { navigate('/ai-assessment', { state: { type: 'mock', subject: 'NEET' } }); return; }
                  onCourseClick(course);
                };

                let badgeText = course.category;
                if (isFolder) badgeText = course.title.includes('NEET') ? 'Medical Stream' : 'Engineering Stream';
                else if (course.category.includes('Class')) badgeText = 'Live Classes';
                else if (course.category.includes('MCQ')) badgeText = 'Practice Mode';
                else if (course.category.includes('Mock')) badgeText = 'Live Test';
                else if (course.category === 'Your Scheduled Classes') badgeText = 'Daily Schedule';

                const actionText = isFolder ? 'Explore' :
                  (course.category === 'Your Scheduled Classes' ? 'Start Class' :
                    course.category === 'Your Schedule Quiz' ? 'Take Quiz' :
                      course.category === 'Your Weekly Mock Test' ? 'Start Test' : 'Start Learning');

                const delay = courseIndex * 100;

                return (
                  <div
                    key={course.id}
                    onClick={handleClick}
                    style={{ animationDelay: `${delay}ms` }}
                    className={`group relative overflow-hidden bg-white dark:bg-[#0b0f19] rounded-[2.5rem] shadow-lg ${palette.shadow} hover:shadow-2xl hover:shadow-${theme}-500/30 transition-all duration-500 border border-gray-100 dark:border-slate-800 cursor-pointer w-full md:w-[48%] lg:w-[31%] max-w-[30rem] hover:-translate-y-2 animate-fade-in-up opacity-0 flex flex-col`}
                  >
                    <div className={`absolute inset-0 rounded-[2.5rem] border-2 border-transparent bg-gradient-to-br ${palette.from} ${palette.to} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}></div>
                    <div className="relative h-60 overflow-hidden shrink-0">
                      {(() => {
                        const systemThumbnail = config.thumbnails?.[course.category] || getThumbnail(course.category);
                        let baseSrc = course.image;
                        const isSystemCategory = ["JEE Mathematics Class", "JEE Physics Class", "JEE Chemistry Class", "NEET Biology Class", "NEET Physics Class", "NEET Chemistry Class"].includes(course.category);
                        if (isSystemCategory && systemThumbnail) baseSrc = systemThumbnail;
                        else baseSrc = baseSrc || systemThumbnail || "/images/placeholder.png";

                        const isUnsplash = baseSrc.includes('unsplash.com');
                        const isPriority = sectionIndex === 0 && courseIndex < 2;
                        const finalSrc = isUnsplash ? `${baseSrc}?auto=format&fit=crop&w=800&q=75` : baseSrc;
                        const srcSet = isUnsplash ? `${baseSrc}?auto=format&fit=crop&w=400&q=75 400w, ${baseSrc}?auto=format&fit=crop&w=800&q=75 800w` : undefined;

                        return (
                          <img src={finalSrc} srcSet={srcSet} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" alt={course.title} loading={isPriority ? "eager" : "lazy"} decoding={isPriority ? "sync" : "async"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" width="800" height="450" />
                        );
                      })()}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/50 to-transparent opacity-90"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-sm`}>{badgeText}</div>
                        <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight tracking-tight drop-shadow-lg">
                          {course.title.replace(' Classes', '').replace(' Class', '')} <span className="font-light opacity-80 text-base sm:text-lg block mt-1">{course.title.includes('Classes') || course.title.includes('Class') ? 'Master Class' : ''}</span>
                        </h3>
                      </div>
                    </div>
                    <div className="relative p-6 sm:p-8 pt-4 flex-grow flex flex-col justify-between bg-white dark:bg-[#0b0f19]">
                      <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">{course.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        {isFolder ? (
                          <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                              <div key={i} className={`w-10 h-10 rounded-full border-2 border-white dark:border-[#0b0f19] bg-gradient-to-br ${palette.from} ${palette.to} flex items-center justify-center text-xs text-white font-bold shadow-sm`}>
                                {course.title.includes('NEET') ? ['P', 'C', 'B'][i - 1] : ['P', 'C', 'M'][i - 1]}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                            {course.lessons && (
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${palette.light} ${palette.text}`}><BookOpen className="w-4 h-4" /><span>{course.lessons.length}</span></div>
                            )}
                            {course.duration && (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400"><Clock className="w-4 h-4" /><span>{course.duration}</span></div>
                            )}
                          </div>
                        )}
                        <button className={`relative overflow-hidden pl-6 pr-5 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r ${palette.from} ${palette.to} ${palette.btnShadow} group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-md`}>
                          <span>{actionText}</span>
                          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { CourseCard };
