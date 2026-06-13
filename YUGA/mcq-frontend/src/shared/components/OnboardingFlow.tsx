import React, { useState } from "react";
import { ChevronRight, ChevronLeft, Sparkles, MapPin, Trophy, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../core/contexts/AuthContext";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginWithProvider } = useAuth();

  const handleNext = () => {
    if (currentPage < 2) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(loginData.emailOrPhone, loginData.password);
      onComplete();
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderLogin = async (provider: 'google' | 'apple') => {
    try {
      await loginWithProvider(provider);
      onComplete();
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const pages = [
    // Page 1: Welcome Screen
    {
      title: "Welcome to YUGA AI",
      subtitle: "Your AI Teacher",
      description: "Experience a new way of learning. YUGA AI blends powerful technology with expert teaching to guide you step-by-step through your academic journey.",
      icon: <Sparkles className="w-16 h-16" />,
      gradient: "from-blue-600 via-blue-600 to-cyan-500",
      content: (
        <div className="text-center">
          <div className="mb-10 flex justify-center">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-3xl flex items-center justify-center shadow-premium-xl animate-float">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-lg">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">AI-Powered Learning</h3>
                <p className="text-blue-100 text-sm">Personalized lessons that adapt to your learning style</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-lg">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Interactive Avatars</h3>
                <p className="text-blue-100 text-sm">Learn with AI teachers who understand you</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-lg">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Instant Doubt Solving</h3>
                <p className="text-blue-100 text-sm">Get answers to your questions immediately</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    // Page 2: AI Career Guidance
    {
      title: "Your AI Career Guide",
      subtitle: "",
      description: "Plan your future with confidence. Let YUGA AI help you discover the right career paths based on your interests and strengths.",
      icon: <MapPin className="w-16 h-16" />,
      gradient: "from-emerald-600 via-teal-600 to-cyan-500",
      content: (
        <div className="text-center">
          <div className="mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-lg">
              <h3 className="font-bold text-white mb-3">Personalized Recommendations</h3>
              <p className="text-emerald-100 text-sm">AI analyzes your performance and suggests career paths that match your strengths</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-lg">
              <h3 className="font-bold text-white mb-3">Skills Assessment</h3>
              <p className="text-emerald-100 text-sm">Discover your natural talents and areas for improvement</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-lg">
              <h3 className="font-bold text-white mb-3">Future Planning</h3>
              <p className="text-emerald-100 text-sm">Get step-by-step guidance for your academic and career journey</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-lg">
              <h3 className="font-bold text-white mb-3">Industry Insights</h3>
              <p className="text-emerald-100 text-sm">Learn about trending careers and future job opportunities</p>
            </div>
          </div>
        </div>
      )
    },
    // Page 3 (Now 2): Login Screen
    // Page 4: Login Screen
    {
      title: "Welcome Back",
      subtitle: "Please sign in to continue",
      description: "",
      icon: <User className="w-16 h-16" />,
      gradient: "from-blue-600 via-blue-600 to-blue-600",
      content: (
        <div className="max-w-md mx-auto">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email or Phone
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={loginData.emailOrPhone}
                  onChange={(e) => setLoginData(prev => ({ ...prev, emailOrPhone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-300 backdrop-blur-lg"
                  placeholder="Enter your email or phone"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-300 backdrop-blur-lg"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </button>

            <div className="text-center">
              <button
                type="button"
                className="text-white hover:text-gray-200 text-sm underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center">
              <div className="flex-1 border-t border-white border-opacity-20"></div>
              <span className="px-4 text-sm text-white opacity-70">or continue with</span>
              <div className="flex-1 border-t border-white border-opacity-20"></div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleProviderLogin('google')}
                className="w-full flex items-center justify-center px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg hover:bg-opacity-20 transition-colors backdrop-blur-lg text-white"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleProviderLogin('apple')}
                className="w-full flex items-center justify-center px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg hover:bg-opacity-20 transition-colors backdrop-blur-lg text-white"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Continue with Apple
              </button>
            </div>
          </form>
        </div>
      )
    }
  ];

  const currentPageData = pages[currentPage];

  return (
    <div className="fixed inset-0 z-[10000] overflow-y-auto">
      <div className={`min-h-screen bg-gradient-to-br ${currentPageData.gradient} flex flex-col`}>
        {/* Progress Indicator */}
        <div className="p-4 sm:p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              {pages.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentPage
                    ? 'bg-white scale-125'
                    : index < currentPage
                      ? 'bg-white bg-opacity-70'
                      : 'bg-white bg-opacity-30'
                    }`}
                />
              ))}
            </div>
            {currentPage < 2 && (
              <button
                onClick={onComplete}
                className="text-white hover:text-gray-200 text-sm font-medium"
              >
                Skip
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 min-h-0">
          <div className="max-w-4xl mx-auto text-center w-full">
            {/* Header */}
            <div className="mb-8 lg:mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                {currentPageData.title}
              </h1>
              {currentPageData.subtitle && (
                <h2 className="text-xl sm:text-2xl text-white text-opacity-90 mb-6">
                  {currentPageData.subtitle}
                </h2>
              )}
              {currentPageData.description && (
                <p className="text-lg sm:text-xl text-white text-opacity-80 max-w-3xl mx-auto leading-relaxed">
                  {currentPageData.description}
                </p>
              )}
            </div>

            {/* Page Content */}
            <div className="mb-8 lg:mb-12">
              {currentPageData.content}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 sm:p-6 flex-shrink-0">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${currentPage === 0
                ? 'text-white text-opacity-50 cursor-not-allowed'
                : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            {currentPage < 2 ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-white text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-24"></div> // Spacer for login page
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

