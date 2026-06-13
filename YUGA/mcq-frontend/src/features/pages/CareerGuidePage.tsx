import { Calculator, FlaskConical, Globe, BookOpen, Languages, Code, User } from "lucide-react";
import { trackEvent } from "../../core/utils/analytics";

export const CareerGuidePage = () => {
    return (
        <div className="animate-fade-in">
            {/* Premium Header */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                    <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">AI Career Guide</h1>
                    <p className="text-blue-100 text-lg">Discover career paths based on your favorite NCERT 10th subjects</p>
                </div>
            </div>

            {/* Subject-based Career Paths */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Mathematics */}
                <div
                    className="group modern-card p-6 border-l-4 border-blue-600 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => trackEvent('Career Guide', 'subject_select', 'Mathematics')}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Calculator className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Mathematics</h2>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">
                        Careers for students strong in algebra, geometry, and statistics
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Data Scientist</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Actuary</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">AI Engineer</span>
                        </div>
                    </div>
                </div>

                {/* Science */}
                <div
                    className="group modern-card p-6 border-l-4 border-green-600 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => trackEvent('Career Guide', 'subject_select', 'Science')}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FlaskConical className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Science</h2>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">
                        Careers in physics, chemistry, and biology
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Biotechnologist</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Environmental Scientist</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Medical Researcher</span>
                        </div>
                    </div>
                </div>

                {/* Social Science */}
                <div
                    className="group modern-card p-6 border-l-4 border-amber-600 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => trackEvent('Career Guide', 'subject_select', 'Social Science')}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Social Science</h2>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">
                        Careers in history, geography, political science, and economics
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Urban Planner</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Economist</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Archaeologist</span>
                        </div>
                    </div>
                </div>

                {/* English */}
                <div
                    className="group modern-card p-6 border-l-4 border-blue-600 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => trackEvent('Career Guide', 'subject_select', 'English')}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">English</h2>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">
                        Careers for students strong in language and literature
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Content Writer</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Journalist</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Translator</span>
                        </div>
                    </div>
                </div>

                {/* Hindi */}
                <div
                    className="group modern-card p-6 border-l-4 border-orange-600 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => trackEvent('Career Guide', 'subject_select', 'Hindi')}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Languages className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Hindi</h2>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">
                        Careers in Hindi language and literature
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Hindi Content Specialist</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Subtitling Expert</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Hindi Linguist</span>
                        </div>
                    </div>
                </div>

                {/* Computer Applications */}
                <div
                    className="group modern-card p-6 border-l-4 border-blue-600 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => trackEvent('Career Guide', 'subject_select', 'Computer Applications')}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Code className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Computer Applications</h2>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">
                        Careers in IT and computer science
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Software Developer</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Cybersecurity Analyst</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">Game Developer</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Career Assessment */}
            <div className="modern-card p-10 mb-8 text-center bg-gradient-to-br from-blue-50 to-blue-50">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Subject-Based Career Assessment
                </h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
                    Take our AI-powered assessment to discover which careers best match your performance in NCERT 10th subjects.
                </p>
                <button
                    className="btn-gradient px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    onClick={() => trackEvent('Career Guide', 'start_assessment')}
                >
                    <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start Assessment
                </button>
            </div>

            {/* Success Stories */}
            <div className="modern-card p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Alumni Success Stories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-100 rounded-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <User className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Rahul Sharma</h3>
                                <p className="text-sm text-gray-600">Data Scientist at Google</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            "My journey began with a strong interest in NCERT Mathematics. The problem-solving skills I developed in 10th grade became the foundation for my career in data science."
                        </p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                <User className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Priya Patel</h3>
                                <p className="text-sm text-gray-600">Biotech Researcher</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            "NCERT Biology textbooks sparked my curiosity about living organisms. Today, I'm working on cutting-edge genetic research thanks to that early interest."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

