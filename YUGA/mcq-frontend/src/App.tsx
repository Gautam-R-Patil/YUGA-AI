import { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  Outlet,
} from "react-router-dom";
import {
  BarChart3,
  RefreshCw,
  Calendar,
  TrendingUp,
  Layers,
  LayoutTemplate,
} from "lucide-react";

// Core imports
import { AuthProvider, useAuth, useToast, ToastProvider, CourseProvider } from "./core";
import { ThemeProvider } from "./core/ThemeContext";
import ErrorBoundary from "./core/ErrorBoundary";

// Shared imports
import {
  Navigation,
  Footer,
} from "./shared";

// Feature imports
// Lazy load feature components (Modals/Overlays)
const AuthModal = lazy(() => import("./features/auth/components/AuthModal").then(m => ({ default: m.AuthModal })));
const ProfileModal = lazy(() => import("./features/user/components/ProfileModal").then(m => ({ default: m.ProfileModal })));
const DoubtSolver = lazy(() => import("./features/doubts/components/DoubtSolver").then(m => ({ default: m.DoubtSolver })));
const ChatInterface = lazy(() => import("./shared/components/ChatInterface").then(m => ({ default: m.ChatInterface })));

import { Course } from "./core/types";
import {
  trackPageView,
  trackAuthEvent,
  trackCourseEvent,
  trackAIEvent,
  trackDoubtEvent,
} from "./core/utils";

// Lazy load page components for better performance
const LandingPage = lazy(() =>
  import("./features/pages/landing/LandingPage").then((m) => ({
    default: m.LandingPage,
  }))
);

const ComingSoonPage = lazy(() =>
  import("./features/pages/landing/ComingSoonPage").then((m) => ({
    default: m.ComingSoonPage,
  }))
);

const DownloadAppPage = lazy(() =>
  import("./features/pages/landing/DownloadAppPage").then((m) => ({
    default: m.DownloadAppPage,
  }))
);

// Dashboard & Study Pages
const DashboardPage = lazy(() =>
  import("./features/pages/dashboard/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  }))
);
const CourseFolderPage = lazy(() =>
  import("./features/pages/dashboard/CourseFolderPage").then((m) => ({
    default: m.CourseFolderPage,
  }))
);
const StudyHubPage = lazy(() =>
  import("./features/pages/study/StudyHubPage").then((m) => ({
    default: m.StudyHubPage,
  }))
);
const RevisionPage = lazy(() =>
  import("./features/pages/study/RevisionPage").then((m) => ({
    default: m.RevisionPage,
  }))
);
const TimeTablePage = lazy(() =>
  import("./features/pages/study/TimeTablePage").then((m) => ({
    default: m.TimeTablePage,
  }))
);
const TodaysClassesPage = lazy(() =>
  import("./features/pages/study/TodaysClassesPage").then((m) => ({
    default: m.TodaysClassesPage,
  }))
);
const MockExamHubPage = lazy(() =>
  import("./features/pages/study/MockExamHubPage").then((m) => ({
    default: m.MockExamHubPage,
  }))
);
const AiAssessmentPage = lazy(() =>
  import("./features/pages/study/AiAssessmentPage").then((m) => ({
    default: m.AiAssessmentPage,
  }))
);
const IQQuizPage = lazy(() =>
  import("./features/pages/study/IQQuizPage").then((m) => ({
    default: m.IQQuizPage,
  }))
);

// Performance & Settings
const PerformancePage = lazy(() =>
  import("./features/pages/performance/PerformancePage").then((m) => ({
    default: m.PerformancePage,
  }))
);
const SettingsPage = lazy(() =>
  import("./features/pages/settings/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  }))
);

// Adaptive Learning
const LearningPathDashboard = lazy(() =>
  import("./features/learning-path/LearningPathDashboard").then((m) => ({
    default: m.default,
  }))
);
const AnalyticsDashboard = lazy(() =>
  import("./features/analytics/AnalyticsDashboard").then((m) => ({
    default: m.default,
  }))
);

// Company Pages
const AboutUs = lazy(() =>
  import("./features/company/pages/AboutUs").then((m) => ({
    default: m.AboutUs,
  }))
);
const OurMission = lazy(() =>
  import("./features/company/pages/OurMission").then((m) => ({
    default: m.OurMission,
  }))
);
const OurServices = lazy(() =>
  import("./features/company/pages/OurServices").then((m) => ({
    default: m.OurServices,
  }))
);
const Careers = lazy(() =>
  import("./features/company/pages/Careers").then((m) => ({
    default: m.Careers,
  }))
);
const Press = lazy(() =>
  import("./features/company/pages/Press").then((m) => ({
    default: m.Press,
  }))
);

// Support Pages
const HelpCenter = lazy(() =>
  import("./features/support/pages/HelpCenter").then((m) => ({
    default: m.HelpCenter,
  }))
);
const ContactUs = lazy(() =>
  import("./features/support/pages/ContactUs").then((m) => ({
    default: m.ContactUs,
  }))
);
const SystemStatus = lazy(() =>
  import("./features/support/pages/SystemStatus").then((m) => ({
    default: m.SystemStatus,
  }))
);
const Community = lazy(() =>
  import("./features/support/pages/Community").then((m) => ({
    default: m.Community,
  }))
);

// Legal Pages
const PrivacyPolicy = lazy(() =>
  import("./features/legal/pages/PrivacyPolicy").then((m) => ({
    default: m.PrivacyPolicy,
  }))
);
const TermsAndConditions = lazy(() =>
  import("./features/legal/pages/TermsAndConditions").then((m) => ({
    default: m.TermsAndConditions,
  }))
);
const CookiePolicy = lazy(() =>
  import("./features/legal/pages/CookiePolicy").then((m) => ({
    default: m.CookiePolicy,
  }))
);
const GDPR = lazy(() =>
  import("./features/legal/pages/GDPR").then((m) => ({
    default: m.GDPR,
  }))
);

// Auth & Premium
const ResetPasswordPage = lazy(() =>
  import("./features/auth/components/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  }))
);
const PremiumPage = lazy(() =>
  import("./features/premium/PremiumPage").then((m) => ({
    default: m.PremiumPage,
  }))
);

const SMEPage = lazy(() =>
  import("./features/pages/sme/SMEPage").then((m) => ({
    default: m.SMEPage,
  }))
);

// Component Routes
const AuthPage = lazy(() =>
  import("./features/pages/ComponentRoutes").then((m) => ({
    default: m.AuthPage,
  }))
);
const ProfilePage = lazy(() =>
  import("./features/pages/ComponentRoutes").then((m) => ({
    default: m.ProfilePage,
  }))
);
const DoubtPage = lazy(() =>
  import("./features/pages/ComponentRoutes").then((m) => ({
    default: m.DoubtPage,
  }))
);
const PlannerPage = lazy(() =>
  import("./features/pages/ComponentRoutes").then((m) => ({
    default: m.PlannerPage,
  }))
);
const ChapterSelectionPage = lazy(() =>
  import("./features/pages/ComponentRoutes").then((m) => ({
    default: m.ChapterSelectionPage,
  }))
);
const NEETPracticePage = lazy(() =>
  import("./features/pages/ComponentRoutes").then((m) => ({
    default: m.NEETPracticePage,
  }))
);
const ClassroomPage = lazy(() =>
  import("./features/pages/ComponentRoutes").then((m) => ({
    default: m.ClassroomPage,
  }))
);

const ClassroomViewContainer = lazy(() =>
  import("./features/course/components/ClassroomViewContainer").then((m) => ({
    default: m.ClassroomViewContainer,
  }))
);

const CrashClassroomPage = lazy(() =>
  import("./features/course/components/CrashClassroom").then((m) => ({
    default: m.CrashClassroom,
  }))
);

// Page view tracker
const PageViewTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
    window.scrollTo(0, 0);
  }, [location]);
  return null;
};

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))] transition-colors duration-300">
    <div className="text-[rgb(var(--text-secondary))] font-medium">Loading...</div>
  </div>
);

// Global loading fallback for modals
const ModalFallback = () => null;

// White-listed emails for beta access
const ALLOWED_EMAILS = [
  "sourav.r@yugaai.app",
  "arpita.m@yugaai.app",
  "ceo@yugaai.app",
  "test@yugaai.app",
  "jee@test.com",
  "neet@test.com",
  "both@test.com",
  "demo.user@yugaai.app",
  // A series users
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
  // B series users
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
  "zoo_asme_b12@yugaai.app",
  "bot_asme_b13@yugaai.app",
  "chem_asme_b13@yugaai.app"
];

const ALLOWED_SME_EMAILS = [
  "sourav.r@yugaai.app",
  "arpita.m@yugaai.app",
  "ceo@yugaai.app",
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
  "zoo_asme_b12@yugaai.app",
  "bot_asme_b13@yugaai.app",
  "chem_asme_b13@yugaai.app"
];

// Layout component
function Layout() {
  const { user, isAuthenticated, isLoading: loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Global UI States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDoubtSolverOpen, setIsDoubtSolverOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { success: showSuccess, error: showError, info: showInfo } = useToast();
  
  // Track authentication and process URL params (e.g., payment results)
  useEffect(() => {
    if (isAuthenticated && user) {
      trackAuthEvent("login_success");
    }

    // Process URL search parameters
    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get('payment');
    const plan = queryParams.get('plan');

    if (paymentStatus === 'success') {
      showSuccess(`Payment Successful! Welcome to ${plan?.toUpperCase() || 'Premium'} membership! 🚀`, 8000);
      // Clean up the URL
      navigate(location.pathname, { replace: true });
    } else if (paymentStatus === 'failed') {
      showError(`Payment Failed: ${queryParams.get('reason') || 'Unknown error'}. Please try again.`, 6000);
      navigate(location.pathname, { replace: true });
    } else if (paymentStatus === 'user_not_found') {
      showInfo("Payment processed, but we couldn't automatically update your account. Please logout and login again.", 8000);
      navigate(location.pathname, { replace: true });
    }
  }, [isAuthenticated, user, location.search, location.pathname, navigate, showSuccess, showError, showInfo]);

  // Show timer on signin
  // Show timer on signin - COMMENTED OUT BY USER REQUEST
  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     if (!hasTimerShownRef.current) {
  //       hasTimerShownRef.current = true;
  //       const timer = setTimeout(() => {
  //         setIsYugaTimerOpen(true);
  //       }, 1000);
  //       return () => clearTimeout(timer);
  //     }
  //   } else {
  //     hasTimerShownRef.current = false;
  //   }
  // }, [isAuthenticated, user]);

  // Close modals on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Auth handler
  const handleAuthAction = (mode: "login" | "signup") => {
    trackAuthEvent(`${mode}_attempt`);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Course handler
  const handleCourseClick = (course: Course) => {
    if (!isAuthenticated) {
      handleAuthAction("login");
      return;
    }

    const plan = user?.membership?.plan || 'free';
    const isPremium = plan === 'student' || plan === 'pro' || plan === 'premium';

    trackCourseEvent("view", course.title, course.id);

    // Guard for Classes (Student Pro or above)
    if (course.category.includes("Class") && !isPremium) {
      navigate("/premium");
      return;
    }

    if (course.category.includes("AI Examiner")) {
      navigate("/mock-neet"); // Keep route for now
      return;
    }

    if (course.category.includes("MCQs")) {
      navigate(`/practice/${encodeURIComponent(course.category)}`);
      return;
    }

    if (course.category.includes("Class")) {
      navigate(`/select-chapter/${encodeURIComponent(course.category)}`);
      return;
    }

    if (course.category === 'Your Scheduled Classes') { navigate('/todays-classes'); return; }
    if (course.category === 'Your Schedule Quiz') { navigate('/ai-assessment', { state: { type: 'quiz', subject: 'General Science' } }); return; }
    if (course.category === 'Your Weekly Mock Test') { navigate('/ai-assessment', { state: { type: 'mock', subject: 'NEET' } }); return; }

    navigate("/classroom", { state: { course, lesson: course.lessons[0] } });
  };

  // Chat toggle
  const handleChatToggle = (isOpen: boolean) => {
    setIsChatOpen(isOpen);
    if (isOpen) {
      trackAIEvent("open", "chat_interface");
    }
  };

  // Doubt toggle
  const handleDoubtSolverToggle = (isOpen: boolean) => {
    setIsDoubtSolverOpen(isOpen);
    if (isOpen) {
      trackDoubtEvent("open");
    }
  };

  // Navigation items
  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: "study-hub",
      label: "Study Hub",
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: "revision",
      label: "Revision",
      icon: <RefreshCw className="w-5 h-5" />,
    },
    {
      id: "timetable",
      label: "Time Table",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: "performance",
      label: "Performance",
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];

  if (user?.email && ALLOWED_SME_EMAILS.includes(user.email.toLowerCase())) {
    navigation.push({
      id: "sme",
      label: "SME Terminal",
      icon: <LayoutTemplate className="w-5 h-5" />,
    });
  }

  const getActiveView = () => {
    const path = location.pathname.substring(1);
    if (!path) return "dashboard";
    if (navigation.some((item) => item.id === path)) return path;
    if (path === "notes" || path === "exercises") return "study-hub";
    return "dashboard";
  };

  if (loading) {
    return <PageLoader />;
  }

  // Check if user is allowed to access the dashboard
  const isUserAllowed = user?.email && ALLOWED_EMAILS.includes(user.email.toLowerCase());

  if (isAuthenticated && !isUserAllowed) {
    return (
      <Suspense fallback={<PageLoader />}>
        <ComingSoonPage />
      </Suspense>
    );
  }

  const isRootPath =
    location.pathname === "/" || location.pathname === "/dashboard";
  if (!isAuthenticated && isRootPath) {
    return (
      <>
        <Suspense fallback={<PageLoader />}>
          <LandingPage onAuthAction={handleAuthAction} />
        </Suspense>
        <Suspense fallback={<ModalFallback />}>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            initialMode={authModalMode}
          />
        </Suspense>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--text-primary))] flex flex-col transition-colors duration-300 safe-top safe-bottom">
      {!location.pathname.startsWith('/practice/') && (
        <Navigation
          isAuthenticated={isAuthenticated}
          user={user}
          activeView={getActiveView() as any}
          setActiveView={(view) => navigate(view === "dashboard" ? "/" : `/${view}`)}
          navigation={navigation}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleAuthAction={handleAuthAction}
          setIsDoubtSolverOpen={handleDoubtSolverToggle}
          setIsChatOpen={handleChatToggle}
        />
      )}

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet
              context={{
                onCourseClick: handleCourseClick,
                onDoubtSolverToggle: handleDoubtSolverToggle,
                onChatToggle: handleChatToggle,
              }}
            />
          </Suspense>
        </div>
      </main>

      {!location.pathname.startsWith('/practice/') && <Footer />}

      {/* Modals and Overlays */}
      <Suspense fallback={<ModalFallback />}>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
        />

        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />

        {/* <YugaTimerPopup
          isOpen={isYugaTimerOpen}
          onClose={() => setIsYugaTimerOpen(false)}
        /> */}

        <DoubtSolver
          isOpen={isDoubtSolverOpen}
          onClose={() => handleDoubtSolverToggle(false)}
        />

        <ChatInterface
          isOpen={isChatOpen}
          onClose={() => handleChatToggle(false)}
          courseCategory={undefined}
        />
      </Suspense>
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();
  return (
    <>
      <PageViewTracker />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route
            path="dashboard/courses/:type/:exam"
            element={
              <Suspense fallback={<PageLoader />}>
                <CourseFolderPage />
              </Suspense>
            }
          />
          <Route
            path="study-hub"
            element={
              <Suspense fallback={<PageLoader />}>
                <StudyHubPage />
              </Suspense>
            }
          />
          <Route path="notes" element={<Navigate to="/study-hub" replace />} />
          <Route path="exercises" element={<Navigate to="/study-hub" replace />} />
          <Route
            path="revision"
            element={
              <Suspense fallback={<PageLoader />}>
                <RevisionPage />
              </Suspense>
            }
          />
          <Route
            path="timetable"
            element={
              <Suspense fallback={<PageLoader />}>
                <TimeTablePage />
              </Suspense>
            }
          />
          <Route
            path="performance"
            element={
              <Suspense fallback={<PageLoader />}>
                <PerformancePage />
              </Suspense>
            }
          />
          <Route
            path="todays-classes"
            element={
              <Suspense fallback={<PageLoader />}>
                <TodaysClassesPage />
              </Suspense>
            }
          />
          <Route
            path="mock-neet"
            element={
              <Suspense fallback={<PageLoader />}>
                <MockExamHubPage />
              </Suspense>
            }
          />
          <Route
            path="select-chapter/:subject"
            element={
              <Suspense fallback={<PageLoader />}>
                <ChapterSelectionPage />
              </Suspense>
            }
          />
          <Route
            path="auth"
            element={
              <Suspense fallback={<PageLoader />}>
                <AuthPage />
              </Suspense>
            }
          />
          <Route
            path="profile"
            element={
              <Suspense fallback={<PageLoader />}>
                <ProfilePage />
              </Suspense>
            }
          />
          <Route
            path="doubts"
            element={
              <Suspense fallback={<PageLoader />}>
                <DoubtPage />
              </Suspense>
            }
          />
          <Route
            path="planner"
            element={
              <Suspense fallback={<PageLoader />}>
                <PlannerPage />
              </Suspense>
            }
          />
          <Route
            path="practice/:subject"
            element={
              <Suspense fallback={<PageLoader />}>
                <NEETPracticePage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
            }
          />

          {/* Company pages */}
          <Route
            path="ai-assessment"
            element={
              <Suspense fallback={<PageLoader />}>
                <AiAssessmentPage />
              </Suspense>
            }
          />
          <Route
            path="about"
            element={
              <Suspense fallback={<PageLoader />}>
                <AboutUs />
              </Suspense>
            }
          />
          <Route
            path="mission"
            element={
              <Suspense fallback={<PageLoader />}>
                <OurMission />
              </Suspense>
            }
          />
          <Route
            path="services"
            element={
              <Suspense fallback={<PageLoader />}>
                <OurServices />
              </Suspense>
            }
          />
          <Route
            path="careers"
            element={
              <Suspense fallback={<PageLoader />}>
                <Careers />
              </Suspense>
            }
          />
          <Route
            path="press"
            element={
              <Suspense fallback={<PageLoader />}>
                <Press />
              </Suspense>
            }
          />

          {/* Support pages */}
          <Route
            path="help"
            element={
              <Suspense fallback={<PageLoader />}>
                <HelpCenter />
              </Suspense>
            }
          />
          <Route
            path="contact"
            element={
              <Suspense fallback={<PageLoader />}>
                <ContactUs />
              </Suspense>
            }
          />
          <Route
            path="status"
            element={
              <Suspense fallback={<PageLoader />}>
                <SystemStatus />
              </Suspense>
            }
          />
          <Route
            path="community"
            element={
              <Suspense fallback={<PageLoader />}>
                <Community />
              </Suspense>
            }
          />

          <Route
            path="download-app"
            element={
              <Suspense fallback={<PageLoader />}>
                <DownloadAppPage />
              </Suspense>
            }
          />

          {/* Legal pages */}
          <Route
            path="privacy"
            element={
              <Suspense fallback={<PageLoader />}>
                <PrivacyPolicy />
              </Suspense>
            }
          />
          <Route
            path="terms"
            element={
              <Suspense fallback={<PageLoader />}>
                <TermsAndConditions />
              </Suspense>
            }
          />
          <Route
            path="cookies"
            element={
              <Suspense fallback={<PageLoader />}>
                <CookiePolicy />
              </Suspense>
            }
          />
          <Route
            path="gdpr"
            element={
              <Suspense fallback={<PageLoader />}>
                <GDPR />
              </Suspense>
            }
          />
          <Route
            path="iq-quiz"
            element={
              <Suspense fallback={<PageLoader />}>
                <IQQuizPage />
              </Suspense>
            }
          />
          <Route
            path="sme"
            element={
              <Suspense fallback={<PageLoader />}>
                {user?.email && ALLOWED_SME_EMAILS.includes(user.email.toLowerCase()) ? <SMEPage /> : <Navigate to="/" replace />}
              </Suspense>
            }
          />
        </Route>

        {/* Standalone Routes */}
        <Route
          path="classroom"
          element={
            <Suspense fallback={<PageLoader />}>
              <ClassroomPage />
            </Suspense>
          }
        />
        <Route
          path="crash-classroom"
          element={
            <Suspense fallback={<PageLoader />}>
              <CrashClassroomPage />
            </Suspense>
          }
        />
        <Route
          path="ai-tutor"
          element={
            <Suspense fallback={<PageLoader />}>
              <ClassroomPage />
            </Suspense>
          }
        />
        <Route
          path="classroom-demo"
          element={
            <Suspense fallback={<PageLoader />}>
              <ClassroomViewContainer />
            </Suspense>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <Suspense fallback={<PageLoader />}>
              <ResetPasswordPage />
            </Suspense>
          }
        />

        <Route
          path="/premium"
          element={
            <Suspense fallback={<PageLoader />}>
              <PremiumPage />
            </Suspense>
          }
        />

        {/* Adaptive Learning Routes */}
        <Route
          path="learning-path"
          element={
            <Suspense fallback={<PageLoader />}>
              <LearningPathDashboard />
            </Suspense>
          }
        />
        <Route
          path="analytics"
          element={
            <Suspense fallback={<PageLoader />}>
              <AnalyticsDashboard />
            </Suspense>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CourseProvider>
            <ThemeProvider>
              <Router>
                <AppContent />
              </Router>
            </ThemeProvider>
          </CourseProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
