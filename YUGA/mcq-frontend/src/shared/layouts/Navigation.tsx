import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Bell, User, Mic, LogOut, Settings, ChevronRight, LayoutTemplate } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { VoiceAssistant } from "../../features/voice/components/VoiceAssistant";
import { trackEvent, trackButtonClick } from "../../core/utils/analytics";
import { useAuth } from "../../core/contexts/AuthContext";
import { apiRequest } from "../../core/utils/api";

interface User {
  name?: string;
  avatar?: string;
  fullName?: string;
  email?: string;
}

const ALLOWED_SME_EMAILS = [
  "sourav.r@yugaai.app",
  "arpita.m@yugaai.app",
  "ceo@yugaai.app",
  "chem_sme1@yugaai.app",
  "chem_sme2@yugaai.app",
  "chem_sme3@yugaai.app",
  "phy_sme1@yugaai.app",
  "phy_sme2@yugaai.app",
  "phy_sme3@yugaai.app",
  "bio_sme@yugaai.app",
  "bot_sme@yugaai.app",
  "zoo_sme@yugaai.app",
  "chem_hsme_a10@yugaai.app",
  "chem_asme_a11@yugaai.app",
  "chem_asme_a12@yugaai.app",
  "phy_hsme_a10@yugaai.app",
  "phy_asme_a11@yugaai.app",
  "phy_asme_a12@yugaai.app",
  "bot_hsme_a10@yugaai.app",
  "bot_asme_a11@yugaai.app",
  "bot_asme_a12@yugaai.app",
  "zoo_hsme_a10@yugaai.app",
  "zoo_asme_a11@yugaai.app",
  "zoo_asme_a12@yugaai.app",
  "chem_hsme_b10@yugaai.app",
  "chem_asme_b11@yugaai.app",
  "chem_asme_b12@yugaai.app",
  "phy_hsme_b10@yugaai.app",
  "phy_asme_b11@yugaai.app",
  "phy_asme_b12@yugaai.app",
  "bot_hsme_b10@yugaai.app",
  "bot_asme_b11@yugaai.app",
  "bot_asme_b12@yugaai.app",
  "bot_asme_b13@yugaai.app",
  "chem_asme_b13@yugaai.app",
  "zoo_hsme_b10@yugaai.app",
  "zoo_asme_b11@yugaai.app",
  "zoo_asme_b12@yugaai.app"
];

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface NavigationProps {
  isAuthenticated: boolean;
  user: User | null;
  activeView: string;
  setActiveView: (view: string) => void;
  navigation: NavItem[];
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  handleAuthAction: (mode: "login") => void;
  setIsDoubtSolverOpen: (open: boolean) => void;
  setIsChatOpen: (open: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  isAuthenticated,
  user,
  activeView,
  navigation,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  handleAuthAction,
}) => {
  const { user: authUser, logout } = useAuth();
  const isPremium = authUser?.membership?.plan === 'student' || authUser?.membership?.plan === 'pro' || authUser?.membership?.plan === 'premium';
  const [fontSize, setFontSize] = useState("text-sm");
  const [padding, setPadding] = useState("px-3 py-2");
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const { scrollY } = useScroll();
  const navScale = useTransform(scrollY, [0, 50], [1, 0.98]);
  const navPadding = useTransform(scrollY, [0, 50], ["0.5rem", "0.25rem"]);

  type Notification = {
    id: number;
    message: string;
    read: boolean;
    time?: string;
  };

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (isAuthenticated && authUser) {
          const response = await apiRequest('/notifications', 'GET');
          if (Array.isArray(response)) {
            setNotifications(response);
            setUnreadCount(response.filter((n: Notification) => !n.read).length);
          }
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, authUser]);

  useEffect(() => {
    const tabCount = navigation.length;
    if (tabCount > 8 && tabCount <= 12) {
      setFontSize("text-sm");
      setPadding("px-2.5 py-1.5");
    } else if (tabCount > 12) {
      setFontSize("text-xs");
      setPadding("px-2 py-1");
    } else {
      setFontSize("text-sm");
      setPadding("px-3 py-1.5");
    }
  }, [navigation]);

  return (
    <>
      <motion.div
        style={{ padding: navPadding, scale: navScale }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none safe-top"
      >
        <nav className="max-w-7xl mx-auto pointer-events-auto glass-ultra dark:glass-ultra-dark shadow-premium-lg rounded-2xl sm:rounded-3xl border border-white/20 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 shrink-0 group">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gradient-to-br from-purple-600 via-purple-600 to-purple-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-premium"
                >
                  <span className="text-white font-black text-xl drop-shadow-lg">Y</span>
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-2xl font-black text-gradient-premium tracking-tighter leading-none">
                    YUGA AI
                  </span>
                  <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest leading-none mt-1 hidden sm:block">
                    Elevate Learning
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              {isAuthenticated && (
                <div className="hidden lg:flex items-center bg-gray-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl gap-1 mx-4 relative">
                  {navigation.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                      <Link
                        key={item.id}
                        to={item.id === 'dashboard' ? '/' : `/${item.id}`}
                        onClick={() => {
                          trackEvent('Navigation', 'tab_change', item.label);
                          trackButtonClick(item.label, 'Main Navigation');
                        }}
                        className={`relative flex items-center justify-center space-x-2 rounded-xl transition-colors duration-200 z-10 ${padding} ${fontSize} ${isActive
                          ? "text-white"
                          : "text-gray-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                          }`}
                      >
                        <span className="shrink-0 relative z-10">{item.icon}</span>
                        <span className="font-bold relative z-10">{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="active-tab"
                            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl shadow-premium z-0"
                            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Right side actions */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {isAuthenticated ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsVoiceAssistantOpen(true)}
                      className="p-2 sm:p-3 text-gray-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-300"
                      aria-label="Voice Assistant"
                    >
                      <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.button>

                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 sm:p-3 text-gray-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-300 relative"
                        onClick={() => setShowNotifications(!showNotifications)}
                        aria-label="Notifications"
                      >
                        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                        <AnimatePresence>
                          {unreadCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 font-black shadow-premium flex items-center justify-center pointer-events-none"
                            >
                              {unreadCount}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>

                      <AnimatePresence>
                        {showNotifications && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                              onClick={() => setShowNotifications(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-premium-xl border border-gray-100 dark:border-slate-800 z-50 overflow-hidden"
                            >
                              <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                                <span className="text-gray-900 dark:text-white font-black">Notifications</span>
                                <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full font-bold">{unreadCount} New</span>
                              </div>
                              <div className="max-h-[60vh] overflow-y-auto scrollbar-premium">
                                {notifications.length === 0 ? (
                                  <div className="px-4 py-10 text-sm text-gray-400 text-center font-medium">
                                    No new notifications
                                  </div>
                                ) : (
                                  <div className="divide-y divide-gray-100 dark:divide-slate-800">
                                    {notifications.map((n) => (
                                      <motion.div
                                        key={n.id}
                                        whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.05)" }}
                                        className={`px-5 py-4 transition-colors cursor-pointer relative group ${!n.read ? 'bg-purple-50/30 dark:bg-purple-900/10' : ''}`}
                                      >
                                        <div className="flex justify-between items-start mb-1">
                                          <span className={`text-sm font-bold ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-slate-400'}`}>{n.message}</span>
                                          {/* blue dot changed to purple */}
                                          {!n.read && <span className="w-2 h-2 bg-purple-500 rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></span>}
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{n.time}</p>
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300"
                        aria-label="User Menu"
                      >
                        <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform">
                          {isPremium && (
                            <>
                              {/* Soft pulsating glow behind */}
                              <div className="absolute inset-0 -m-1 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 blur-md opacity-40 animate-pulse transition-opacity z-0"></div>

                              {/* Constantly rotating ring */}
                              <div
                                className="absolute inset-[-4px] rounded-[14px] border-[2px] border-dashed border-amber-400 border-t-amber-200 border-b-yellow-500 animate-spin z-0 opacity-80"
                                style={{ animationDuration: '4s' }}
                              ></div>
                            </>
                          )}

                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover shadow-premium ${isPremium ? 'ring-2 ring-white dark:ring-slate-900 bg-white' : 'ring-2 ring-purple-100 dark:ring-purple-900/50'}`}
                            />
                          ) : (
                            <div className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-premium transition-all ${isPremium ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 ring-2 ring-white dark:ring-slate-900' : 'bg-gradient-to-br from-purple-600 to-blue-500'}`}>
                              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                          )}
                        </div>
                      </motion.button>

                      <AnimatePresence>
                        {isProfileMenuOpen && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-40"
                              onClick={() => setIsProfileMenuOpen(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95, transformOrigin: "top right" }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute right-0 mt-4 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-premium-xl border border-gray-100 dark:border-slate-800 py-2 z-50 overflow-hidden"
                            >
                              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 mb-1">
                                <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Logged in as</p>
                                <p className="text-sm font-black text-gray-900 dark:text-white truncate">{user?.fullName || user?.name || 'Student'}</p>
                              </div>
                              {user?.email && ALLOWED_SME_EMAILS.includes(user.email.toLowerCase()) && (
                                <Link
                                  to="/sme"
                                  onClick={() => setIsProfileMenuOpen(false)}
                                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-3 transition-colors font-bold"
                                >
                                  <LayoutTemplate className="w-4 h-4 text-purple-500" />
                                  SME Dashboard
                                </Link>
                              )}
                              <Link
                                to="/settings"
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-3 transition-colors font-bold"
                              >
                                <Settings className="w-4 h-4 text-purple-500" />
                                Settings
                              </Link>
                              <button
                                onClick={() => {
                                  setIsProfileMenuOpen(false);
                                  logout();
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors font-bold"
                              >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAuthAction("login")}
                    className="btn-premium px-6 py-2.5 text-sm"
                  >
                    Sign In
                  </motion.button>
                )}

                {/* Mobile hamburger */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-gray-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  aria-label="Open Menu"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isMobileMenuOpen ? "close" : "open"}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>

          </div>
        </nav>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && isAuthenticated && (
          <div className="lg:hidden relative z-[9999]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[900]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-[320px] bg-white dark:bg-slate-900 shadow-2xl z-[950] border-l border-gray-100 dark:border-slate-800 flex flex-col safe-top safe-bottom"
            >
              <div className="p-6 h-full flex flex-col overflow-y-auto">
                <div className="flex justify-between items-center mb-8 shrink-0">
                  <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-50 dark:bg-slate-800 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                    aria-label="Close Menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-3 flex-1">
                  {navigation.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                    >
                      <Link
                        to={item.id === 'dashboard' ? '/' : `/${item.id}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all ${activeView === item.id
                          ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-premium"
                          : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 font-bold"
                          }`}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        <span className="text-lg font-bold">{item.label}</span>
                        {activeView === item.id && <ChevronRight className="ml-auto w-5 h-5 text-white" />}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="pt-8 border-t border-gray-100 dark:border-slate-800 mt-auto shrink-0"
                >
                  <div className="flex items-center space-x-4 mb-6 px-4">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-100 shadow-md" />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-md">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 dark:text-white text-lg truncate">{user?.fullName || 'Student'}</p>
                      <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-purple-600 font-bold hover:underline">View Profile</Link>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all font-black shadow-sm"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-base">Sign Out</span>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-20 sm:h-24"></div>

      {/* Voice Assistant Component */}
      <VoiceAssistant
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
      />
    </>
  );
};

