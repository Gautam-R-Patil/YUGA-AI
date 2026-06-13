import React, { useState } from "react";
import { Trophy, Award } from "lucide-react";
import { api } from "../../core/utils/api";
import { trackAssessmentEvent, trackEvent } from "../../core/utils/analytics";
import { Course } from "../../core/types";
import { mockQuizQuestions } from "../../core/utils/mockData";
import { QuizComponent } from "../../shared/components/QuizComponent";
import { AIAvatar } from "../../shared/components/AIAvatar";

export const CertificatePage = () => {
    const [quizScore, setQuizScore] = useState<number | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get<Course[]>("/course/courses");
                setCourses(res.data);
            } catch (err) {
                console.error("Failed to fetch courses for certificates:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    // Track quiz completion
    const handleQuizComplete = (score: number) => {
        setQuizScore(score);
        trackAssessmentEvent('complete', score, mockQuizQuestions.length);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

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
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Champion Certificate</h1>
                    <p className="text-blue-100 text-lg">Earn certificates by demonstrating mastery of your subjects</p>
                </div>
            </div>

            {/* Certificate Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Available Certificates */}
                <div className="modern-card p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Available Certificates</h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Complete assessments to earn certificates in your Class 10 subjects.
                    </p>
                    <div className="space-y-4">
                        {courses.slice(0, 4).map((course) => (
                            <div
                                key={course.id}
                                className="group p-5 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                                    <div className="flex-1 w-full sm:w-auto">
                                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                            {course.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${course.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">{course.progress}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-auto">
                                        {course.progress >= 80 ? (
                                            <button
                                                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105"
                                                onClick={() => trackAssessmentEvent('start', undefined, undefined)}
                                            >
                                                Take Assessment
                                            </button>
                                        ) : (
                                            <span className="block text-center w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium">
                                                {80 - course.progress}% more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Earned Certificates */}
                <div className="modern-card p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Earned Certificates</h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Your achievements and completed certifications.
                    </p>
                    <div className="space-y-4">
                        <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                                        <Trophy className="w-5 h-5 text-amber-600" />
                                        Mathematics Champion
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-1">Earned on: Dec 15, 2023</p>
                                    <p className="text-sm font-semibold text-green-600">Score: 95%</p>
                                </div>
                                <button
                                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
                                    onClick={() => trackEvent('Certificate', 'download', 'Mathematics Champion')}
                                >
                                    Download
                                </button>
                            </div>
                        </div>

                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trophy className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">
                                Complete more assessments to earn certificates
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assessment Center */}
            <div className="modern-card p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Center</h2>
                <p className="text-gray-600 mb-8">
                    Take comprehensive assessments to demonstrate your mastery and earn champion certificates.
                </p>

                {quizScore === null ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group p-8 border-2 border-dashed border-blue-300 rounded-2xl text-center bg-gradient-to-br from-blue-50 to-blue-50 hover:border-blue-500 hover:shadow-lg transition-all duration-300">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Quick Assessment</h3>
                            <p className="text-gray-600 mb-6">
                                Test your knowledge with a quick 5-question assessment
                            </p>
                            <button
                                onClick={() => {
                                    setQuizScore(null);
                                    trackAssessmentEvent('start_quick');
                                }}
                                className="btn-gradient px-6 py-3 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                            >
                                Start Quick Test
                            </button>
                        </div>

                        <div className="group p-8 border-2 border-dashed border-amber-300 rounded-2xl text-center bg-gradient-to-br from-amber-50 to-yellow-50 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Award className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Full Assessment</h3>
                            <p className="text-gray-600 mb-6">
                                Complete comprehensive assessment for certificate
                            </p>
                            <button
                                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl font-semibold hover:from-amber-700 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                onClick={() => trackAssessmentEvent('start_full')}
                            >
                                Start Full Assessment
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-md mx-auto modern-card p-8 text-center">
                        <AIAvatar size="large" emotion="encouraging" isActive />
                        <h2 className="text-3xl font-bold text-gray-900 mt-6 mb-3">
                            Assessment Complete!
                        </h2>
                        <p className="text-gray-600 mb-4">
                            You scored {quizScore} out of {mockQuizQuestions.length}
                        </p>
                        <div className="text-5xl font-bold text-blue-600 mb-6">
                            {Math.round((quizScore / mockQuizQuestions.length) * 100)}%
                        </div>
                        {quizScore / mockQuizQuestions.length >= 0.8 ? (
                            <div className="mb-6">
                                <div className="text-green-600 font-bold text-xl mb-4">
                                    🏆 Certificate Earned!
                                </div>
                                <button
                                    className="btn-gradient px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 mr-2"
                                    onClick={() => trackEvent('Certificate', 'earned', `Score: ${quizScore}/${mockQuizQuestions.length}`)}
                                >
                                    Download Certificate
                                </button>
                            </div>
                        ) : (
                            <div className="mb-6">
                                <div className="text-orange-600 font-bold text-xl mb-3">
                                    Keep Practicing!
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    You need 80% or higher to earn a certificate
                                </p>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                setQuizScore(null);
                                trackAssessmentEvent('retry');
                            }}
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {quizScore === null && (
                    <QuizComponent
                        questions={mockQuizQuestions}
                        onComplete={handleQuizComplete}
                    />
                )}
            </div>
        </div>
    );
};

