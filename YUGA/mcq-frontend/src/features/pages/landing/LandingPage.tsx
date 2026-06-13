import React from "react";
import { SEO } from "../../../shared/components/SEO";
import {
    MessageCircle,
    BarChart3,
    Sparkles,
    Brain,
    Target,
    Zap,
    Users,
    Award,
    Video,
    Clock,
    TrendingUp,
    // Star,
    CheckCircle2,
    ArrowRight,
    Lightbulb,
    BookOpen,
    GraduationCap
} from "lucide-react";

interface LandingPageProps {
    onAuthAction: (mode: "login" | "signup") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAuthAction }) => {

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 particles-bg">
            <SEO
                title="Home"
                description="YUGA AI - India's first AI-powered education platform. Experience personalized learning with interactive AI avatars and instant doubt solving."
                keywords="AI education, personalized learning, AI tutors, NEET prep, JEE prep, online classes India"
            />
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
                <div className="absolute top-0 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
                <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float-slow"></div>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-32 sm:pb-32">
                    <div className="text-center">
                        {/* Floating Badge */}
                        <div className="mb-8 flex justify-center animate-bounce-in">
                            <div className="glass-ultra shadow-premium px-4 sm:px-6 py-2 rounded-full inline-flex items-center gap-2 text-white max-w-full holographic">
                                <Sparkles className="w-4 h-4 text-yellow-300 shrink-0 animate-pulse" />
                                <span className="text-xs sm:text-sm font-semibold truncate">India's first AI-Powered Learning Platform</span>
                                <Sparkles className="w-4 h-4 text-yellow-300 shrink-0 animate-pulse" />
                            </div>
                        </div>

                        {/* AI Core with Enhanced Glow Effect */}
                        <div className="mb-10 flex justify-center animate-scale-in">
                            <div className="relative magnetic-hover">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 rounded-full blur-3xl opacity-60 animate-pulse-glow glow-pulse"></div>
                                <div className="relative w-32 h-32 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-premium-xl">
                                    <Sparkles className="w-16 h-16 text-white animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 animate-fade-in">
                            <span className="block text-white mb-2 drop-shadow-2xl">Learn Smarter with</span>
                            <span className="block text-gradient-premium animate-gradient-x">
                                AI-Powered Education
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-2xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200 px-2 drop-shadow-lg">
                            Experience innovative learning with interactive AI avatars, personalized study paths, and instant doubt-solving.
                            <span className="block mt-2 text-purple-300 font-semibold">Your success is our mission!</span>
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up animate-delay-400 px-4">
                            <button
                                onClick={() => onAuthAction("signup")}
                                className="group relative px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-base sm:text-lg font-bold rounded-2xl shadow-premium-xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 ripple overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Start Learning Free
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                            <button
                                onClick={() => onAuthAction("login")}
                                className="btn-premium px-8 sm:px-10 py-4 text-base sm:text-lg font-semibold shadow-premium-lg hover:shadow-2xl transform hover:scale-105"
                            >
                                Sign In
                            </button>
                        </div>

                        {/* Animated Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto animate-fade-in-up animate-delay-600">
                            <div className="glass-ultra shadow-premium p-4 sm:p-6 rounded-2xl hover:scale-105 transition-transform duration-300 group magnetic-hover">
                                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform drop-shadow-lg" />
                                <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">100+</div>
                                <div className="text-xs sm:text-sm text-gray-300 font-medium">Active Students</div>
                            </div>

                            <div className="glass-ultra shadow-premium p-4 sm:p-6 rounded-2xl hover:scale-105 transition-transform duration-300 group magnetic-hover">
                                <Video className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform drop-shadow-lg" />
                                <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">1000+</div>
                                <div className="text-xs sm:text-sm text-gray-300 font-medium">Video Lessons</div>
                            </div>

                            <div className="glass-ultra shadow-premium p-4 sm:p-6 rounded-2xl hover:scale-105 transition-transform duration-300 group magnetic-hover">
                                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform drop-shadow-lg" />
                                <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">+35%</div>
                                <div className="text-xs sm:text-sm text-gray-300 font-medium">Avg. Improvement</div>
                            </div>

                            <div className="glass-ultra shadow-premium p-4 sm:p-6 rounded-2xl hover:scale-105 transition-transform duration-300 group magnetic-hover">
                                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform drop-shadow-lg" />
                                <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">24/7</div>
                                <div className="text-xs sm:text-sm text-gray-300 font-medium">AI Support</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="relative py-12 sm:py-24 bg-gradient-to-b from-transparent to-black/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 sm:mb-20">
                        <h2 className="text-2xl sm:text-5xl md:text-6xl font-bold mb-6">
                            <span className="text-gradient-premium">
                                Why YUGA AI is Unique
                            </span>
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto drop-shadow-lg">
                            Cutting-edge AI technology meets personalized education
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Feature 1 */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                            <div className="relative glass-ultra shadow-premium-lg p-6 sm:p-8 rounded-3xl hover-lift magnetic-hover border-gradient-animated">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-premium group-hover:scale-110 transition-transform duration-300">
                                    <Brain className="w-8 h-8 text-white drop-shadow-lg" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
                                    AI Avatar Teaching
                                </h3>
                                <p className="text-gray-300 leading-relaxed mb-4">
                                    Learn from interactive AI tutors that understand your pace, adapt to your style, and make education engaging and fun.
                                </p>
                                <div className="flex items-center gap-2 text-purple-400 font-semibold">
                                    <Sparkles className="w-4 h-4" />
                                    <span>Personalized Learning</span>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                            <div className="relative glass-ultra shadow-premium-lg p-6 sm:p-8 rounded-3xl hover-lift magnetic-hover border-gradient-animated">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-premium group-hover:scale-110 transition-transform duration-300">
                                    <Lightbulb className="w-8 h-8 text-white drop-shadow-lg" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
                                    Instant Doubt Solving
                                </h3>
                                <p className="text-gray-300 leading-relaxed mb-4">
                                    Get immediate, detailed answers to your questions anytime, anywhere with our advanced AI resolution system.
                                </p>
                                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                                    <Zap className="w-4 h-4" />
                                    <span>Lightning Fast</span>
                                </div>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                            <div className="relative glass-ultra shadow-premium-lg p-6 sm:p-8 rounded-3xl hover-lift magnetic-hover border-gradient-animated">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-premium group-hover:scale-110 transition-transform duration-300">
                                    <Target className="w-8 h-8 text-white drop-shadow-lg" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
                                    Smart Progress Tracking
                                </h3>
                                <p className="text-gray-300 leading-relaxed mb-4">
                                    Monitor your journey with AI-powered analytics that provide actionable insights and personalized recommendations.
                                </p>
                                <div className="flex items-center gap-2 text-orange-400 font-semibold">
                                    <BarChart3 className="w-4 h-4" />
                                    <span>Data-Driven Insights</span>
                                </div>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                            <div className="relative glass-ultra shadow-premium-lg p-6 sm:p-8 rounded-3xl hover-lift magnetic-hover border-gradient-animated">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-premium group-hover:scale-110 transition-transform duration-300">
                                    <BookOpen className="w-8 h-8 text-white drop-shadow-lg" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
                                    Comprehensive Content
                                </h3>
                                <p className="text-gray-300 leading-relaxed mb-4">
                                    Access 1000+ video lessons, practice tests, and study materials designed by expert educators.
                                </p>
                                <div className="flex items-center gap-2 text-purple-400 font-semibold">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Expert Curated</span>
                                </div>
                            </div>
                        </div>

                        {/* Feature 5 */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                            <div className="relative glass-ultra shadow-premium-lg p-6 sm:p-8 rounded-3xl hover-lift magnetic-hover border-gradient-animated">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-premium group-hover:scale-110 transition-transform duration-300">
                                    <GraduationCap className="w-8 h-8 text-white drop-shadow-lg" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
                                    Exam Preparation
                                </h3>
                                <p className="text-gray-300 leading-relaxed mb-4">
                                    Specialized courses for NEET, JEE, and board exams with proven strategies and success stories.
                                </p>
                                <div className="flex items-center gap-2 text-purple-400 font-semibold">
                                    <Award className="w-4 h-4" />
                                    <span>Proven Results</span>
                                </div>
                            </div>
                        </div>

                        {/* Feature 6 */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                            <div className="relative glass-ultra shadow-premium-lg p-6 sm:p-8 rounded-3xl hover-lift magnetic-hover border-gradient-animated">
                                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-premium group-hover:scale-110 transition-transform duration-300">
                                    <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
                                    Multi-Language Support
                                </h3>
                                <p className="text-gray-300 leading-relaxed mb-4">
                                    Learn in your preferred language with support for Hindi, English, Bengali, Telugu, and more.
                                </p>
                                <div className="flex items-center gap-2 text-pink-400 font-semibold">
                                    <Users className="w-4 h-4" />
                                    <span>Inclusive Learning</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials Section - Hidden for Beta */}
            {/* <div className="relative py-16 sm:py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 sm:mb-16">
                        <h2 className="text-3xl sm:text-5xl font-bold mb-4">
                            <span className="text-gradient-premium">
                                Success Stories
                            </span>
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-300 drop-shadow-lg">
                            Join thousands of students achieving their dreams
                        </p>
                    </div>

                    <div className="relative">
                        <div className="glass-ultra shadow-premium-xl p-6 sm:p-10 rounded-3xl border-gradient-animated">
                            <div className="flex flex-col items-center text-center">
                                <div className="text-5xl sm:text-6xl mb-6 animate-bounce-in">
                                    {testimonials[currentTestimonial].avatar}
                                </div>

                                <div className="flex gap-1 mb-6">
                                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-400 text-yellow-400 drop-shadow-lg" />
                                    ))}
                                </div>

                                <p className="text-lg sm:text-xl text-gray-200 mb-6 max-w-2xl leading-relaxed italic drop-shadow-lg">
                                    "{testimonials[currentTestimonial].content}"
                                </p>

                                <div className="text-lg font-bold text-white drop-shadow-lg">
                                    {testimonials[currentTestimonial].name}
                                </div>
                                <div className="text-blue-400 font-semibold">
                                    {testimonials[currentTestimonial].role}
                                </div>
                            </div>

                            <div className="flex justify-center gap-2 mt-8">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentTestimonial(index)}
                                        className={`h-3 rounded-full transition-all duration-300 ${index === currentTestimonial
                                            ? "bg-blue-500 w-8 shadow-premium"
                                            : "bg-gray-600 hover:bg-gray-500 w-3"
                                            } `}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* Final CTA Section */}
            <div className="relative py-12 sm:py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl">
                        {/* Animated background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 animate-gradient-x"></div>

                        {/* Holographic overlay */}
                        <div className="absolute inset-0 holographic opacity-30"></div>

                        <div className="relative p-8 sm:p-16 text-center">
                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
                                Ready to Transform Your Future?
                            </h2>
                            <p className="text-lg sm:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto drop-shadow-lg">
                                Join our growing community of students and start achieving your dreams with YUGA AI
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                                <button
                                    onClick={() => onAuthAction("signup")}
                                    className="group px-8 sm:px-12 py-4 sm:py-5 bg-white text-purple-600 text-lg sm:text-xl font-bold rounded-2xl shadow-premium-xl hover:shadow-white/30 transform hover:scale-105 transition-all duration-300 magnetic-hover"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Get Started Free
                                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    </span>
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-white/90">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-300 drop-shadow-lg" />
                                    <span className="drop-shadow-lg">No credit card required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-300 drop-shadow-lg" />
                                    <span className="drop-shadow-lg">Cancel anytime</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div className="relative py-12 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-gray-400">
                        <p className="text-base sm:text-lg">
                            © 2026 YUGA AI. Empowering students across India with AI-powered education.
                        </p>
                        <p className="text-sm mt-2 text-gray-500">
                            Made with ❤️ for the future of learning
                        </p>
                        <button
                            onClick={() => onAuthAction("login")}
                            className="btn-gradient px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 mt-6"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

