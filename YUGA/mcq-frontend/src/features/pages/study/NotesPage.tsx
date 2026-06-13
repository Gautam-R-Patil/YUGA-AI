import { useState, useEffect } from "react";
import { Notebook, RefreshCw, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { api } from "../../../core/utils/api";
import { trackEvent } from "../../../core/utils/analytics";

interface Note {
    id: string;
    title: string;
    subjectId: string;
    courseTitle: string;
    category: string; // For coloring
    content: string;
    createdAt: number;
    updatedAt: number;
}

export const NotesPage = () => {
    // State for notes
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [subjects, setSubjects] = useState<{ id: string, title: string, category: string }[]>([]);

    // Form state
    const [title, setTitle] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [content, setContent] = useState("");
    const [isEditingId, setIsEditingId] = useState<string | null>(null);

    // Load notes and subjects
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await api.get("/course/courses");
                setSubjects(res.data);
            } catch (err) {
                console.error("Failed to fetch subjects:", err);
            }
        };

        const savedNotes = localStorage.getItem("yuga_user_notes");
        if (savedNotes) {
            setNotes(JSON.parse(savedNotes));
        }
        fetchSubjects();
        setIsLoading(false);
    }, []);

    // Save notes to localStorage whenever they change
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem("yuga_user_notes", JSON.stringify(notes));
        }
    }, [notes, isLoading]);

    // Helper function to get subject color for UI elements
    const getSubjectColor = (category: string) => {
        const colors: Record<string, string> = {
            Mathematics: "bg-blue-500",
            Science: "bg-green-500",
            English: "bg-blue-500",
            Hindi: "bg-yellow-500",
            "Social Science": "bg-red-500",
            "Computer Applications": "bg-blue-500",
            "NEET MCQ": "bg-teal-500",
            "NEET MCQ 2.O": "bg-pink-500",
            "NEET Physics": "bg-blue-600",
            "NEET Chemistry": "bg-green-600",
            "NEET Biology": "bg-red-600",
        };
        return colors[category] || "bg-gray-500";
    };

    const handleSaveNote = () => {
        if (!title.trim() || !subjectId || !content.trim()) {
            alert("Please fill in all fields");
            return;
        }

        const selectedCourse = subjects.find(c => c.id === subjectId);
        const category = selectedCourse?.category || "General";
        const courseTitle = selectedCourse?.title || "Unknown Subject";

        if (isEditingId) {
            // Update existing note
            setNotes(prev => prev.map(note =>
                note.id === isEditingId
                    ? { ...note, title, subjectId, courseTitle, category, content, updatedAt: Date.now() }
                    : note
            ));
            trackEvent('Notes', 'update', title);
        } else {
            // Create new note
            const newNote: Note = {
                id: Date.now().toString(),
                title,
                subjectId,
                courseTitle,
                category,
                content,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            setNotes(prev => [newNote, ...prev]);
            trackEvent('Notes', 'create', title);
        }

        // Reset form
        setTitle("");
        setSubjectId("");
        setContent("");
        setIsEditingId(null);
    };

    const handleEditNote = (note: Note) => {
        setTitle(note.title);
        setSubjectId(note.subjectId);
        setContent(note.content);
        setIsEditingId(note.id);

        // Scroll to form
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleDeleteNote = (id: string) => {
        if (confirm("Are you sure you want to delete this note?")) {
            setNotes(prev => prev.filter(n => n.id !== id));
            trackEvent('Notes', 'delete', id);
        }
    };

    const handleCancelEdit = () => {
        setTitle("");
        setSubjectId("");
        setContent("");
        setIsEditingId(null);
    };

    // Derived stats
    const notesBySubject = notes.reduce((acc, note) => {
        acc[note.courseTitle] = (acc[note.courseTitle] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="animate-fade-in pb-12 bg-slate-50/50 dark:bg-slate-950 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Clean Header */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full blur-3xl opacity-60 -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-800">
                                <Notebook className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold text-slate-800 dark:text-white tracking-tight mb-2">
                                    My Notes
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                                    Your personalized knowledge base
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Notes by Subject Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 h-full hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Notebook className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Notes by Subject</h2>
                            </div>

                            {Object.keys(notesBySubject).length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                                    <Notebook className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3 opacity-50" />
                                    <p className="text-slate-400 dark:text-slate-500 font-medium">No notes created yet. Start adding some!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(notesBySubject).map(([subject, count]) => {
                                        const course = subjects.find(c => c.title === subject);
                                        return (
                                            <div
                                                key={subject}
                                                className="group relative p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-300 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${getSubjectColor(course?.category || 'General')}`}></div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-800 dark:text-white line-clamp-1 text-base">{subject}</h3>
                                                        <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">{count} note{count !== 1 ? 's' : ''}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Notes List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 h-full flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400">
                                    <RefreshCw className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Recent Updates</h2>
                            </div>

                            <div className="space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar pr-2 -mr-2">
                                {notes.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 dark:text-slate-500 font-medium italic">No recent notes.</div>
                                ) : (
                                    notes.slice(0, 5).map((note) => (
                                        <div key={note.id} className="group p-4 bg-slate-50/50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-sm transition-all duration-300 cursor-default">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-slate-800 dark:text-white line-clamp-1 flex-1 pr-2">{note.title}</h3>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                        onClick={() => handleEditNote(note)}
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                        onClick={() => handleDeleteNote(note.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium mb-2">
                                                <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-600">{note.courseTitle}</span>
                                                <span>•</span>
                                                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{note.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor Section */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                    {/* Decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
                                    {isEditingId ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                                    {isEditingId ? 'Edit Note' : 'Create New Note'}
                                </h2>
                            </div>
                            {isEditingId && (
                                <button
                                    onClick={handleCancelEdit}
                                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium flex items-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 rounded-xl transition-all"
                                >
                                    <X className="w-4 h-4" /> <span className="hidden sm:inline">Cancel</span>
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="note-title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="note-title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                                    placeholder="e.g. Quadratic Formula Definitions"
                                />
                            </div>
                            <div>
                                <label htmlFor="note-subject" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                                    Subject
                                </label>
                                <div className="relative">
                                    <select
                                        id="note-subject"
                                        value={subjectId}
                                        onChange={(e) => setSubjectId(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 dark:text-white appearance-none font-medium cursor-pointer"
                                    >
                                        <option value="">Select subject...</option>
                                        {subjects.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.title}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label htmlFor="note-content" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                                Content
                            </label>
                            <textarea
                                id="note-content"
                                rows={8}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700 dark:text-slate-300 leading-relaxed resize-y placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                placeholder="Start typing your notes here..."
                            ></textarea>
                        </div>

                        <div className="flex justify-end">
                            <button
                                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
                                onClick={handleSaveNote}
                            >
                                <Save className="w-5 h-5" />
                                {isEditingId ? 'Update Note' : 'Save Note'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

