import React, { useState, useEffect, useRef } from "react";
import {
  X,
  User,
  Settings,
  Clock,
  Flame,
  BookOpen,
  Crown,
  Edit3,
  LogOut,
  Star,
  ChevronRight,
  Activity,
  CheckCircle2,
  Lock,
  Camera,
  GraduationCap,
  Save,
  Brain,
  Target,
  Bell
} from "lucide-react";
import { useAuth } from "../../../core/contexts/AuthContext";
import { MembershipSection } from "./MembershipSection";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateProfile, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<"overview" | "edit" | "membership" | "preferences">("overview");
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    studentClass: "Class 12",
    learningStyle: "visual",
    difficulty: "beginner",
    weeklyGoal: 5,
    notifications: true,
    avatar: "",
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        studentClass: user.studentClass || "Class 12",
        learningStyle: user.preferences?.learningStyle || "visual",
        difficulty: user.preferences?.difficulty || "beginner",
        weeklyGoal: user.progress?.weeklyGoal || 5,
        notifications: user.preferences?.notifications ?? true,
        avatar: user.avatar || "",
      });
      setActiveSection("overview");
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      // Prepare updates
      const updates: any = {
        fullName: formData.fullName,
        email: formData.email,
        studentClass: formData.studentClass,
        avatar: formData.avatar,
        preferences: {
          ...(user.preferences || {}),
          learningStyle: formData.learningStyle as "visual" | "auditory" | "kinesthetic",
          difficulty: formData.difficulty as "beginner" | "intermediate" | "advanced",
          notifications: formData.notifications,
        },
        progress: {
          ...(user.progress || {}),
          weeklyGoal: formData.weeklyGoal,
        },
      };

      // Only include password if provided
      if (passwordData.newPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          alert("Passwords do not match!");
          setIsSaving(false);
          return;
        }
        updates.password = passwordData.newPassword;
      }

      await updateProfile(updates);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setActiveSection("overview");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      logout();
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  const isPremium = user.membership?.plan === "student" || user.membership?.plan === "pro" || user.membership?.plan === "premium";
  const currentStreak = user.progress?.currentStreak || 0;
  const weeklyProgress = user.progress?.weeklyProgress || 0;
  const totalCourses = user.progress?.totalCourses || 12;
  const completedCourses = user.progress?.completedCourses || 0;
  const progressPercentage = Math.min((weeklyProgress / formData.weeklyGoal) * 100, 100);

  const quickStats = [
    { icon: Flame, value: currentStreak, label: "Day Streak", color: "from-orange-500 to-red-500" },
    { icon: Clock, value: `${weeklyProgress}h`, label: "This Week", color: "from-blue-500 to-cyan-500" },
    // { icon: Trophy, value: "1", label: "Certificates", color: "from-yellow-500 to-amber-500" },
  ];

  const userAchievements = user.progress?.achievements || [];
  const hasAchievement = (title: string) => userAchievements.some((a: any) => a.title === title || a.id === title);

  const achievements = [
    {
      icon: "🔥",
      title: "Week Warrior",
      desc: "7 day streak",
      unlocked: currentStreak >= 7 || hasAchievement("Week Warrior"),
      progress: Math.min(currentStreak / 7, 1)
    },
    {
      icon: "📚",
      title: "Bookworm",
      desc: "Complete 5 courses",
      unlocked: completedCourses >= 5 || hasAchievement("Bookworm"),
      progress: Math.min(completedCourses / 5, 1)
    },
    {
      icon: "🎯",
      title: "Perfectionist",
      desc: "Get 100% score",
      unlocked: hasAchievement("Perfectionist"),
      progress: hasAchievement("Perfectionist") ? 1 : 0.6
    },
    {
      icon: "⚡",
      title: "Speed Demon",
      desc: "Finish in record time",
      unlocked: hasAchievement("Speed Demon"),
      progress: hasAchievement("Speed Demon") ? 1 : 0.3
    },
  ];

  const menuItems = [
    { id: "overview", label: "Overview", icon: Activity, desc: "Your learning dashboard" },
    { id: "edit", label: "Edit Profile", icon: Edit3, desc: "Update your information" },
    { id: "membership", label: "Membership", icon: Crown, desc: "Manage your plan" },
    { id: "preferences", label: "Preferences", icon: Settings, desc: "Customize your experience" },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-0 sm:p-4 animate-fade-in font-sans"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-6xl h-full sm:h-[95vh] rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in-up">
        {/* Sidebar (Desktop) / Header (Mobile) */}
        <div className="w-full md:w-72 lg:w-80 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 text-white relative flex-shrink-0 flex flex-col transition-all duration-300">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -ml-32 -mb-32" />
          </div>

          {/* Mobile Top Bar: Profile & Actions */}
          <div className="md:hidden p-4 flex items-center gap-4 border-b border-white/10 relative z-10 bg-white/5 backdrop-blur-md">
            <div className="relative shrink-0">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/30">
                {formData.avatar ? (
                  <img src={formData.avatar} alt={formData.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              {isPremium && (
                <div className="absolute -top-1 -right-1 bg-amber-400 p-1 rounded-full border border-blue-600">
                  <Crown className="w-2 h-2 fill-white text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate leading-tight">{user.fullName || "User"}</h2>
              <p className="text-blue-200 text-xs truncate">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Horizontal Tabs */}
          <div className="md:hidden flex overflow-x-auto no-scrollbar bg-blue-900/20 backdrop-blur-sm">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${activeSection === item.id
                  ? "text-white bg-white/10"
                  : "text-blue-200 hover:text-white"
                  }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {activeSection === item.id && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                )}
              </button>
            ))}
          </div>

          {/* Desktop Sidebar Content */}
          <div className="hidden md:flex max-md:hidden relative z-10 h-full flex-col p-6 md:p-8">
            {/* Profile Section */}
            <div className="text-center mb-6">
              <div className="relative inline-block mb-3">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-4 border-white/30 overflow-hidden shadow-xl group">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt={formData.fullName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData(prev => ({ ...prev, avatar: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-white text-xs font-bold">Change</span>
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-white text-blue-600 p-2 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-110 z-10"
                >
                  <Camera className="w-4 h-4" />
                </button>
                {isPremium && (
                  <div className="absolute -top-2 -left-2 bg-gradient-to-r from-amber-400 to-orange-500 p-2 rounded-lg shadow-lg">
                    <Crown className="w-4 h-4 fill-current" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-1 truncate px-2">{user.fullName || "Student"}</h2>
              <p className="text-blue-200 text-sm mb-2 truncate px-2">{user.email}</p>
              {isPremium && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold border border-white/30">
                  <Crown className="w-3 h-3 fill-current" />
                  PREMIUM
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="space-y-2 mb-6 flex-shrink-0">
              {quickStats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/15 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-blue-200">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Menu */}
            <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${activeSection === item.id
                    ? "bg-white text-blue-600 shadow-lg"
                    : "bg-white/10 text-white hover:bg-white/15"
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <div className="text-left min-w-0">
                      <div className="font-semibold text-sm truncate">{item.label}</div>
                      <div className={`text-xs truncate transition-colors ${activeSection === item.id ? "text-blue-400" : "text-blue-200 group-hover:text-blue-100"}`}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${activeSection === item.id ? 'translate-x-1' : ''}`} />
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full mt-4 flex items-center justify-center gap-2 p-3 bg-white/10 hover:bg-red-500/20 text-white rounded-xl transition-all border border-white/20 flex-shrink-0 group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold text-sm">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gray-50 min-h-0">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4 sm:p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {menuItems.find(item => item.id === activeSection)?.label}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                  {menuItems.find(item => item.id === activeSection)?.desc}
                </p>
              </div>
              <button
                onClick={onClose}
                className="hidden md:block text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all flex-shrink-0 ml-4"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {activeSection === "overview" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Progress Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 sm:p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold mb-1">Weekly Progress</h4>
                      <p className="text-blue-200 text-sm">Keep up the momentum!</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold">{weeklyProgress}h</div>
                      <div className="text-xs sm:text-sm text-blue-200">of {formData.weeklyGoal}h goal</div>
                    </div>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-blue-200">
                      {progressPercentage >= 100 ? "🎉 Goal completed!" : `${(formData.weeklyGoal - weeklyProgress).toFixed(1)}h remaining`}
                    </span>
                    <span className="font-bold">{progressPercentage.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Achievements Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-900">Achievements</h4>
                    <span className="text-sm text-gray-500">{achievements.filter(a => a.unlocked).length} of {achievements.length}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all ${achievement.unlocked
                          ? "bg-gradient-to-br from-blue-50 to-blue-50 border-blue-200 shadow-md"
                          : "bg-white border-gray-200"
                          }`}
                      >
                        <div className="text-center mb-2">
                          <div className={`text-3xl sm:text-4xl mb-2 ${!achievement.unlocked && 'grayscale opacity-50'}`}>
                            {achievement.icon}
                          </div>
                          <h5 className="font-bold text-gray-900 text-xs sm:text-sm mb-1">{achievement.title}</h5>
                          <p className="text-xs text-gray-500">{achievement.desc}</p>
                        </div>
                        {!achievement.unlocked && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                style={{ width: `${achievement.progress * 100}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1 text-center">
                              {Math.round(achievement.progress * 100)}%
                            </p>
                          </div>
                        )}
                        {achievement.unlocked && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Learning Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">{completedCourses}/{totalCourses}</div>
                        <div className="text-xs text-gray-500">Courses</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">4.8</div>
                        <div className="text-xs text-gray-500">Avg Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "edit" && (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
                    <User className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label htmlFor="profile-name" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                      <input
                        id="profile-name"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base outline-none"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input
                        id="profile-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base outline-none"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    Academic Details
                  </h4>
                  <div>
                    <label htmlFor="profile-class" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Class / Batch</label>
                    <div className="relative">
                      <select
                        id="profile-class"
                        value={formData.studentClass}
                        onChange={(e) => setFormData(prev => ({ ...prev, studentClass: e.target.value }))}
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none text-sm sm:text-base outline-none"
                      >
                        <option value="Class 11">Class 11 (Plus One)</option>
                        <option value="Class 12">Class 12 (Plus Two)</option>
                        <option value="Repeater">Repeater / Dropper</option>
                      </select>
                      <ChevronRight className="w-4 h-4 absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Password Change */}
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-base sm:text-lg">
                    <Lock className="w-5 h-5 text-blue-600" />
                    Security
                  </h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label htmlFor="profile-new-password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                      <input
                        id="profile-new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base outline-none"
                        placeholder="Leave empty to keep current"
                      />
                    </div>
                    {passwordData.newPassword && (
                      <div>
                        <label htmlFor="profile-confirm-password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                        <input
                          id="profile-confirm-password"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base outline-none ${passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                            ? "border-red-300 focus:ring-red-200"
                            : "border-gray-200"
                            }`}
                          placeholder="Confirm new password"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2 sm:pt-0 sticky bottom-0 bg-gray-50/95 backdrop-blur-sm p-4 -mx-4 -mb-4 border-t border-gray-200 sm:static sm:bg-transparent sm:p-0 sm:m-0 sm:border-0 z-10 sm:z-auto">
                  <button
                    type="button"
                    onClick={() => setActiveSection("overview")}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all text-sm sm:text-base active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base active:scale-95 shadow-md"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {activeSection === "membership" && (
              <div>
                <MembershipSection
                  user={user}
                  onUpgrade={async () => {
                    try {
                      await updateProfile({
                        membership: {
                          plan: "premium",
                          status: "active",
                          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        }
                      });
                    } catch (err) {
                      console.error("Failed to upgrade membership", err);
                    }
                  }}
                />
              </div>
            )}

            {activeSection === "preferences" && (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pb-24 md:pb-0 relative">
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    Learning Preferences
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pref-learning-style" className="block text-sm font-semibold text-gray-700 mb-2">Learning Style</label>
                      <select
                        id="pref-learning-style"
                        value={formData.learningStyle}
                        onChange={(e) => setFormData(prev => ({ ...prev, learningStyle: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                      >
                        <option value="visual">👁️ Visual</option>
                        <option value="auditory">👂 Auditory</option>
                        <option value="kinesthetic">✋ Kinesthetic</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="pref-difficulty" className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                      <select
                        id="pref-difficulty"
                        value={formData.difficulty}
                        onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                      >
                        <option value="beginner">🌱 Beginner</option>
                        <option value="intermediate">🌿 Intermediate</option>
                        <option value="advanced">🌳 Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Weekly Goal
                  </h4>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-xl p-4 sm:p-6">
                    <input
                      type="range"
                      min={1}
                      max={40}
                      value={formData.weeklyGoal}
                      onChange={(e) => setFormData(prev => ({ ...prev, weeklyGoal: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-gray-500">1h</span>
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-bold text-blue-600">{formData.weeklyGoal}</div>
                        <div className="text-xs sm:text-sm text-gray-500">hours/week</div>
                      </div>
                      <span className="text-sm text-gray-500">40h</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    Notifications
                  </h4>
                  <label htmlFor="pref-notifications" className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bell className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">Push Notifications</div>
                        <div className="text-xs sm:text-sm text-gray-500">Get updates about your progress</div>
                      </div>
                    </div>
                    <input
                      id="pref-notifications"
                      type="checkbox"
                      checked={formData.notifications}
                      onChange={(e) => setFormData(prev => ({ ...prev, notifications: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                    />
                  </label>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-negative z-20 md:static md:p-0 md:bg-transparent md:border-t-0 md:shadow-none md:z-auto">
                  <div className="flex justify-end gap-3 max-w-7xl mx-auto">
                    <button
                      type="button"
                      onClick={() => setActiveSection("overview")}
                      className="flex-1 md:flex-none px-4 sm:px-6 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base shadow-lg shadow-blue-500/20"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Save Preferences</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

