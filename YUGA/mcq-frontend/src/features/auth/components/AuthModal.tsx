import React, { useState } from "react";
import {
    X,
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    Loader,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Shield,
    Zap,
    Brain,
    TrendingUp,
    Users,
    GraduationCap,
    ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../../core/contexts/AuthContext";
import { trackAuthEvent, trackEvent } from "../../../core/utils/analytics";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: "login" | "signup";
}

type SignupStep = 1 | 2 | 3;

export const AuthModal: React.FC<AuthModalProps> = ({
    isOpen,
    onClose,
    initialMode = "login",
}) => {
    const [mode, setMode] = useState<"login" | "signup" | "forgot-password">(initialMode || "login");
    const [signupStep, setSignupStep] = useState<SignupStep>(1);
    const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        topic: "" as "NEET" | "JEE" | "Both" | "",
        otp: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login, initiateSignup, verifyOTP, completeSignup, initiatePasswordReset, verifyResetOTP, completePasswordReset } = useAuth();

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.fullName.trim()) {
            newErrors.fullName = "Name required";
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email";
        }
        if (!formData.topic) {
            newErrors.topic = "Please select a topic";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.otp.trim()) {
            newErrors.otp = "OTP required";
        } else if (formData.otp.length !== 6) {
            newErrors.otp = "OTP must be 6 digits";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.password) {
            newErrors.password = "Password required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Min 8 characters";
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords don't match";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateLogin = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.email.trim()) {
            newErrors.email = "Email required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email";
        }
        if (!formData.password) {
            newErrors.password = "Password required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep1()) return;

        setIsLoading(true);
        setError(null);
        try {
            trackAuthEvent("signup_step1_attempt", "email");
            await initiateSignup(formData.fullName, formData.email, formData.topic);
            trackAuthEvent("signup_step1_success", "email");
            setSignupStep(2);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Failed to send verification code";
            setError(errorMessage);
            trackAuthEvent("signup_step1_failed", "email");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStep2Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setIsLoading(true);
        setError(null);
        try {
            trackAuthEvent("signup_step2_attempt", "email");
            await verifyOTP(formData.email, formData.otp);
            trackAuthEvent("signup_step2_success", "email");
            setSignupStep(3);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Invalid verification code";
            setError(errorMessage);
            trackAuthEvent("signup_step2_failed", "email");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStep3Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep3()) return;

        setIsLoading(true);
        setError(null);
        try {
            trackAuthEvent("signup_step3_attempt", "email");
            await completeSignup(formData.email, formData.password);
            trackAuthEvent("signup_step3_success", "email");
            onClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Failed to complete signup";
            setError(errorMessage);
            trackAuthEvent("signup_step3_failed", "email");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateLogin()) return;

        setIsLoading(true);
        setError(null);
        try {
            trackAuthEvent("login_attempt", "email");
            await login(formData.email, formData.password);
            trackAuthEvent("login_success", "email");
            onClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Login failed";
            setError(errorMessage);
            trackAuthEvent("login_failed", "email");
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = (newMode: "login" | "signup" | "forgot-password") => {
        trackEvent("Auth", "mode_change", newMode);
        setMode(newMode);
        setSignupStep(1);
        setResetStep(1);
        setFormData({ fullName: "", email: "", topic: "", otp: "", password: "", confirmPassword: "" });
        setErrors({});
        setError(null);
    };

    const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (!formData.email.trim()) {
            newErrors.email = "Email required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email";
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await initiatePasswordReset(formData.email);
            setResetStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to send reset code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyResetOTPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.otp.trim() || formData.otp.length !== 6) {
            setErrors({ otp: "Valid 6-digit OTP required" });
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await verifyResetOTP(formData.email, formData.otp);
            setResetStep(3);
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid or expired code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep3()) return;

        setIsLoading(true);
        setError(null);
        try {
            await completePasswordReset(formData.email, formData.password);
            switchMode("login");
            setError("Success! Log in with your new password.");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Call resend OTP endpoint
            await initiateSignup(formData.fullName, formData.email, formData.topic);
            setError("Verification code resent successfully!");
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Failed to resend code";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative w-full max-w-5xl animate-scale-in">
                {/* Outer Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 animate-pulse-slow"></div>

                {/* Card Container */}
                <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border dark:border-slate-800">
                    <div className="grid md:grid-cols-2">
                        {/* Left Side - Branding */}
                        <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-12 text-white overflow-hidden hidden md:flex flex-col justify-between">
                            {/* Animated Background */}
                            <div className="absolute inset-0 opacity-30">
                                <div className="absolute w-72 h-72 bg-purple-500 rounded-full -top-20 -left-20 blur-3xl animate-pulse-slow"></div>
                                <div className="absolute w-72 h-72 bg-pink-500 rounded-full -bottom-20 -right-20 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute w-64 h-64 bg-purple-500 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <span className="text-2xl font-bold">YUGA AI</span>
                                </div>

                                <h2 className="text-4xl font-bold mb-4 leading-tight">
                                    {mode === "login" && "Welcome Back to the Future of Learning"}
                                    {mode === "signup" && signupStep === 1 && "Transform Your Education with AI"}
                                    {mode === "signup" && signupStep === 2 && "Verify Your Email"}
                                    {mode === "signup" && signupStep === 3 && "Secure Your Account"}
                                    {mode === "forgot-password" && "Reset Your Password"}
                                </h2>

                                <p className="text-purple-200 text-lg mb-8">
                                    {mode === "login" && "Continue your personalized learning journey with our AI-powered platform"}
                                    {mode === "signup" && signupStep === 1 && "Join a growing community of students learning smarter with AI tutors and personalized study paths"}
                                    {mode === "signup" && signupStep === 2 && "We've sent a verification code to your email"}
                                    {mode === "signup" && signupStep === 3 && "Choose a strong password to protect your account"}
                                    {mode === "forgot-password" && "Recover access to your account with a quick verification"}
                                </p>

                                {/* Features */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <Brain className="w-5 h-5 text-purple-300" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">AI-Powered Learning</h3>
                                            <p className="text-sm text-purple-200">Personalized lessons that adapt to your style</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <TrendingUp className="w-5 h-5 text-purple-300" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Track Your Progress</h3>
                                            <p className="text-sm text-purple-200">Real-time analytics and insights</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <Users className="w-5 h-5 text-purple-300" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Community First</h3>
                                            <p className="text-sm text-purple-200">Learn with a supportive peer group</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Stats */}
                            <div className="relative z-10 grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
                                <div>
                                    <div className="text-2xl font-bold">95%</div>
                                    <div className="text-xs text-purple-200">Success Rate</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">500+</div>
                                    <div className="text-xs text-purple-200">Lessons</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">24/7</div>
                                    <div className="text-xs text-purple-200">Support</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="relative p-6 md:p-12">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group"
                            >
                                <X className="w-5 h-5 text-gray-600 dark:text-slate-400 group-hover:rotate-90 transition-transform duration-300" />
                            </button>

                            {/* Mobile Header */}
                            <div className="md:hidden mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xl font-bold">YUGA AI</span>
                                </div>
                            </div>

                            {/* Progress Indicator for Signup */}
                            {mode === "signup" && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        {[1, 2, 3].map((step) => (
                                            <React.Fragment key={step}>
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all ${signupStep >= step
                                                    ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                                                    : "bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-slate-500"
                                                    }`}>
                                                    {signupStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
                                                </div>
                                                {step < 3 && (
                                                    <div className={`flex-1 h-1 mx-2 rounded transition-all ${signupStep > step ? "bg-gradient-to-r from-purple-600 to-blue-500" : "bg-gray-200 dark:bg-slate-800"
                                                        }`}></div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600 dark:text-slate-400 mt-2 font-medium tracking-wide uppercase px-1">
                                        <span>Details</span>
                                        <span>Verify</span>
                                        <span>Set Password</span>
                                    </div>
                                </div>
                            )}

                            {/* Form Header */}
                            <div className="mb-6 sm:mb-8">
                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {mode === "login" && "Sign In"}
                                    {mode === "signup" && signupStep === 1 && "Create Account"}
                                    {mode === "signup" && signupStep === 2 && "Verify Email"}
                                    {mode === "signup" && signupStep === 3 && "Set Password"}
                                </h3>
                                <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">
                                    {mode === "login" && "Enter your credentials to continue"}
                                    {mode === "signup" && signupStep === 1 && "Fill in your details to get started"}
                                    {mode === "signup" && signupStep === 2 && "Enter the code sent to your email"}
                                    {mode === "signup" && signupStep === 3 && "Create a strong password"}
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className={`mb-6 p-4 border-l-4 rounded-lg ${error.includes("success")
                                    ? "bg-green-50 border-green-500"
                                    : "bg-red-50 border-red-500"
                                    }`}>
                                    <p className={`text-sm font-medium ${error.includes("success") ? "text-green-800" : "text-red-800"
                                        }`}>{error}</p>
                                </div>
                            )}

                            {/* LOGIN FORM */}
                            {mode === "login" && (
                                <form onSubmit={handleLoginSubmit} className="space-y-5">
                                    {/* Email */}
                                    <div>
                                        <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                                            <input
                                                id="login-email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all dark:text-white ${errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/20" : "border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-100 dark:focus:ring-purple-900/20"
                                                    }`}
                                                placeholder="Enter your email address"
                                            />
                                        </div>
                                        {errors.email && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.email}</p>}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                                            <input
                                                id="login-password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="current-password"
                                                value={formData.password}
                                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                                className={`w-full pl-11 pr-12 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all dark:text-white ${errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/20" : "border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-100 dark:focus:ring-purple-900/20"
                                                    }`}
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <div className="flex justify-end mb-2">
                                            <button 
                                                type="button"
                                                onClick={() => switchMode("forgot-password")}
                                                className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                        {errors.password && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.password}</p>}
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="relative w-full group overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                                        <div className="relative bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3.5 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
                                            {isLoading ? (
                                                <Loader className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Zap className="w-5 h-5" />
                                                    <span>Sign In</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    <p className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
                                        Don't have an account?{" "}
                                        <button
                                            type="button"
                                            onClick={() => switchMode("signup")}
                                            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold hover:underline"
                                        >
                                            Sign up free
                                        </button>
                                    </p>
                                </form>
                            )}

                            {/* SIGNUP STEP 1: Name, Email, Topic */}
                            {mode === "signup" && signupStep === 1 && (
                                <form onSubmit={handleStep1Submit} className="space-y-5">
                                    {/* Full Name */}
                                    <div>
                                        <label htmlFor="signup-fullname" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                                            <input
                                                id="signup-fullname"
                                                name="fullName"
                                                type="text"
                                                autoComplete="name"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                                className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all dark:text-white ${errors.fullName ? "border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/20" : "border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-100 dark:focus:ring-purple-900/20"
                                                    }`}
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        {errors.fullName && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.fullName}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="signup-email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                                            <input
                                                id="signup-email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all dark:text-white ${errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/20" : "border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-100 dark:focus:ring-purple-900/20"
                                                    }`}
                                                placeholder="Enter your email address"
                                            />
                                        </div>
                                        {errors.email && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.email}</p>}
                                    </div>

                                    {/* Topic Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Select Your Preparation</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, topic: "NEET" }))}
                                                className={`relative p-3 rounded-xl border-2 transition-all ${formData.topic === "NEET"
                                                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                                    : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-purple-300 dark:hover:border-purple-700"
                                                    }`}
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <GraduationCap className={`w-6 h-6 ${formData.topic === "NEET" ? "text-purple-600" : "text-gray-400"}`} />
                                                    <span className={`font-bold text-sm ${formData.topic === "NEET" ? "text-purple-600" : "text-gray-700"}`}>NEET</span>
                                                    {formData.topic === "NEET" && (
                                                        <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-purple-600" />
                                                    )}
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                disabled
                                                className="relative p-3 rounded-xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20 opacity-60 cursor-not-allowed group"
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-500 text-[10px] font-bold text-white rounded-full shadow-lg whitespace-nowrap">
                                                        COMING SOON
                                                    </div>
                                                    <GraduationCap className="w-6 h-6 text-gray-400" />
                                                    <span className="font-bold text-sm text-gray-400">JEE</span>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                disabled
                                                className="relative p-3 rounded-xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20 opacity-60 cursor-not-allowed group"
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-indigo-500 text-[10px] font-bold text-white rounded-full shadow-lg whitespace-nowrap">
                                                        COMING SOON
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <GraduationCap className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                    <span className="font-bold text-sm text-gray-400">Both</span>
                                                </div>
                                            </button>
                                        </div>
                                        {errors.topic && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.topic}</p>}
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="relative w-full group overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                                        <div className="relative bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3.5 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
                                            {isLoading ? (
                                                <Loader className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <span>Continue</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    <p className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
                                        Already have an account?{" "}
                                        <button
                                            type="button"
                                            onClick={() => switchMode("login")}
                                            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold hover:underline"
                                        >
                                            Sign in
                                        </button>
                                    </p>
                                </form>
                            )}

                            {/* SIGNUP STEP 2: OTP Verification */}
                            {mode === "signup" && signupStep === 2 && (
                                <form onSubmit={handleStep2Submit} className="space-y-5">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Mail className="w-8 h-8 text-purple-600" />
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            We sent a 6-digit code to<br />
                                            <span className="font-semibold text-gray-900">{formData.email}</span>
                                        </p>
                                    </div>

                                    {/* OTP Input */}
                                    <div>
                                        <label htmlFor="signup-otp" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Verification Code</label>
                                        <input
                                            id="signup-otp"
                                            name="otp"
                                            type="text"
                                            autoComplete="one-time-code"
                                            maxLength={6}
                                            value={formData.otp}
                                            onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                                            className={`w-full px-4 py-3 bg-white dark:bg-slate-800 text-center text-2xl font-bold tracking-widest border-2 rounded-xl focus:outline-none focus:ring-4 transition-all dark:text-white ${errors.otp ? "border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/20" : "border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-100 dark:focus:ring-purple-900/20"
                                                }`}
                                            placeholder="000000"
                                        />
                                        {errors.otp && <p className="mt-1.5 text-sm text-red-600 font-medium text-center">{errors.otp}</p>}
                                    </div>

                                    {/* Resend OTP */}
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={handleResendOTP}
                                            disabled={isLoading}
                                            className="text-sm text-purple-600 hover:text-purple-700 font-semibold hover:underline disabled:opacity-50"
                                        >
                                            Didn't receive code? Resend
                                        </button>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="relative w-full group overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                                        <div className="relative bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3.5 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
                                            {isLoading ? (
                                                <Loader className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <span>Verify Email</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    {/* Back Button */}
                                    <button
                                        type="button"
                                        onClick={() => setSignupStep(1)}
                                        className="w-full flex items-center justify-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 font-semibold"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        <span>Back</span>
                                    </button>
                                </form>
                            )}

                            {/* SIGNUP STEP 3: Password Setup */}
                            {mode === "signup" && signupStep === 3 && (
                                <form onSubmit={handleStep3Submit} className="space-y-5">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Email verified successfully!<br />
                                            <span className="font-semibold text-gray-900">Now set your password</span>
                                        </p>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label htmlFor="signup-password" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                                            <input
                                                id="signup-password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                value={formData.password}
                                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                                className={`w-full pl-11 pr-12 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all dark:text-white ${errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/20" : "border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-100 dark:focus:ring-purple-900/20"
                                                    }`}
                                                placeholder="Create a strong password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.password}</p>}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label htmlFor="signup-confirm-password" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                                            <input
                                                id="signup-confirm-password"
                                                name="confirmPassword"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all dark:text-white ${errors.confirmPassword ? "border-red-300 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/20" : "border-gray-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-100 dark:focus:ring-purple-900/20"
                                                    }`}
                                                placeholder="Confirm your password"
                                            />
                                        </div>
                                        {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.confirmPassword}</p>}
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {formData.password && (
                                        <div className="space-y-2">
                                            <div className="flex gap-1">
                                                <div className={`h-1 flex-1 rounded ${formData.password.length >= 8 ? "bg-green-500" : "bg-gray-200"}`}></div>
                                                <div className={`h-1 flex-1 rounded ${formData.password.length >= 10 && /[A-Z]/.test(formData.password) ? "bg-green-500" : "bg-gray-200"}`}></div>
                                                <div className={`h-1 flex-1 rounded ${formData.password.length >= 12 && /[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password) ? "bg-green-500" : "bg-gray-200"}`}></div>
                                            </div>
                                            <p className="text-xs text-gray-600">
                                                {formData.password.length < 8 && "Weak - Add more characters"}
                                                {formData.password.length >= 8 && formData.password.length < 10 && "Fair - Add uppercase letters"}
                                                {formData.password.length >= 10 && /[A-Z]/.test(formData.password) && "Good - Add numbers for better security"}
                                                {formData.password.length >= 12 && /[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password) && "Strong password!"}
                                            </p>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="relative w-full group overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                                        <div className="relative bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3.5 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
                                            {isLoading ? (
                                                <Loader className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5" />
                                                    <span>Complete Signup</span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </form>
                            )}

                            {/* FORGOT PASSWORD FLOW */}
                            {mode === "forgot-password" && (
                                <div className="space-y-6">
                                    {resetStep === 1 && (
                                        <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
                                            <div>
                                                <label htmlFor="forgot-email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
                                                    <input
                                                        id="forgot-email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                        className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all dark:text-white ${errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 dark:border-slate-700 focus:border-purple-500"}`}
                                                        placeholder="Enter your registered email"
                                                    />
                                                </div>
                                                {errors.email && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.email}</p>}
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3.5 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <><span>Send Reset Code</span><ArrowRight className="w-5 h-5" /></>}
                                            </button>
                                            <button type="button" onClick={() => switchMode("login")} className="w-full text-sm text-gray-600 dark:text-slate-400 hover:text-purple-600 font-semibold flex items-center justify-center gap-1">
                                                <ArrowLeft className="w-4 h-4" /> Back to Sign In
                                            </button>
                                        </form>
                                    )}

                                    {resetStep === 2 && (
                                        <form onSubmit={handleVerifyResetOTPSubmit} className="space-y-5">
                                            <div className="text-center mb-6">
                                                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Shield className="w-8 h-8 text-purple-600" />
                                                </div>
                                                <p className="text-sm text-gray-600">Enter the verification code sent to {formData.email}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="reset-otp" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 text-center">Verification Code</label>
                                                <input
                                                    id="reset-otp"
                                                    type="text"
                                                    maxLength={6}
                                                    value={formData.otp}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 text-center text-2xl font-bold tracking-widest border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-purple-500 transition-all dark:text-white"
                                                    placeholder="000000"
                                                />
                                            </div>
                                            {errors.otp && <p className="mt-1.5 text-sm text-red-600 font-medium text-center">{errors.otp}</p>}
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3.5 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <><span>Verify Code</span><ArrowRight className="w-5 h-5" /></>}
                                            </button>
                                            <div className="text-center">
                                                <button
                                                    type="button"
                                                    onClick={handleResendOTP}
                                                    disabled={isLoading}
                                                    className="text-sm text-purple-600 hover:text-purple-700 font-semibold hover:underline disabled:opacity-50"
                                                >
                                                    Didn't receive code? Resend
                                                </button>
                                            </div>
                                            <button type="button" onClick={() => setResetStep(1)} className="w-full text-sm text-gray-600 font-semibold flex items-center justify-center gap-1">
                                                <ArrowLeft className="w-4 h-4" /> Different email?
                                            </button>
                                        </form>
                                    )}

                                    {resetStep === 3 && (
                                        <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                                            <div className="text-center mb-6">
                                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Lock className="w-8 h-8 text-green-600" />
                                                </div>
                                                <p className="text-sm text-gray-600">Set your new password</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="reset-new-password" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">New Password</label>
                                                    <div className="relative">
                                                        <input
                                                            id="reset-new-password"
                                                            type={showPassword ? "text" : "password"}
                                                            value={formData.password}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                                            className={`w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl focus:border-purple-500 transition-all dark:text-white ${errors.password ? "border-red-300" : "border-gray-200 dark:border-slate-700"}`}
                                                            placeholder="Minimum 8 characters"
                                                        />
                                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="reset-confirm-password" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Confirm Password</label>
                                                    <input
                                                        id="reset-confirm-password"
                                                        type={showPassword ? "text" : "password"}
                                                        value={formData.confirmPassword}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                        className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl focus:border-purple-500 transition-all dark:text-white ${errors.confirmPassword ? "border-red-300" : "border-gray-200 dark:border-slate-700"}`}
                                                        placeholder="Repeat new password"
                                                    />
                                                </div>
                                            </div>
                                            {(errors.password || errors.confirmPassword) && <p className="text-sm text-red-600 font-medium">{errors.password || errors.confirmPassword}</p>}
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3.5 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <><span>Update Password</span><CheckCircle2 className="w-5 h-5" /></>}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
