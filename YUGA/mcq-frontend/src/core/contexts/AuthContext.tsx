import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { User, AuthState, AuthProviderType } from "../types";
import { api } from "../utils/api";
import { setUserId, setUserProperties, trackAuthEvent, trackError } from "../utils/analytics";
import { useToast } from "./ToastContext";
import { SessionExpiredModal } from "../../shared/components/SessionExpiredModal";

const PRO_EMAILS = [
  "bot_asme_b13@yugaai.app",
  "chem_asme_b13@yugaai.app"
];

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  initiateSignup: (fullName: string, email: string, topic: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  completeSignup: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: AuthProviderType) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  initiatePasswordReset: (email: string) => Promise<void>;
  verifyResetOTP: (email: string, otp: string) => Promise<void>;
  completePasswordReset: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>; // Kept for backward compatibility
  verifyEmail: (token: string) => Promise<void>;
  setNewPassword: (token: string, password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { success, error: toastError, info } = useToast();
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      // If we have both token and user, we can optimistically render the app
      // while validating the session in the background.
      if (storedToken && user) {
        return {
          user,
          isAuthenticated: true,
          isLoading: false, // Don't block render!
          error: null,
        };
      }
    } catch (e) {
      // Fallback if JSON parse fails
    }

    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    };
  });

  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  // ✅ Restore session using saved token
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.log("No token found, skipping session check.");
        setAuthState((prev) => ({ ...prev, isLoading: false, user: null, isAuthenticated: false }));
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log("Token found, checking session...");
      try {
        // Add a safety timeout of 10 seconds for the session check
        const sessionPromise = api.get("/auth/me");
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session check timed out")), 10000)
        );

        const res = (await Promise.race([sessionPromise, timeoutPromise])) as any;
        
        console.log("Session check successful:", res.data.user?.email);

        // Validate response structure
        if (!res?.data?.user) {
          throw new Error('Invalid session data received');
        }

        const userData = res.data.user;
        const userProgress = userData.progress || {};

        const user = {
          ...userData,
          progress: {
            ...userProgress,
            // Provide defaults only if missing
            currentStreak: userProgress.currentStreak ?? 0,
            weeklyProgress: userProgress.weeklyProgress ?? 0,
            weeklyGoal: userProgress.weeklyGoal ?? 5,
            totalCourses: userProgress.totalCourses ?? 12,
            completedCourses: userProgress.completedCourses ?? 0,
            achievements: userProgress.achievements ?? [],
          },
          membership: userData.membership || {
            plan: "free",
            status: "active",
            validUntil: null
          },
        };

        // Grant Pro access to specific IDs
        if (user.email && PRO_EMAILS.includes(user.email.toLowerCase())) {
          user.membership = {
            plan: "premium",
            status: "active",
            validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
          };
        }

        // Update local storage with fresh user data
        localStorage.setItem("user", JSON.stringify(user));

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Track session restoration
        if (user.id) {
          setUserId(user.id);
          setUserProperties({
            user_type: 'returning',
            user_name: user.fullName || 'Unknown',
          });
        }
      } catch (error) {
        console.warn("Session check failed (safe fallback):", error);
        // Clear invalid tokens on session check failure
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user"); // Clear stale user data
        delete api.defaults.headers.common["Authorization"];
        setAuthState((prev) => ({ ...prev, isLoading: false, user: null, isAuthenticated: false }));
      }
    };

    checkSession();
  }, []);

  // ✅ Handle session conflicts (single-device enforcement)
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Check for session expired error (logged in on another device)
        if (error.response?.status === 401 &&
          error.response?.data?.error === 'SESSION_EXPIRED') {
          // Clear local auth state
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];

          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          // Show beautiful modal before confirming logout
          setShowSessionExpiredModal(true);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [toastError]);

  // ✅ Login
  const login = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await api.post("/auth/login", { email, password });

      const token = res.data.token;
      // Always store in localStorage for persistence (user requested to stay in memory/open directly)
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const user = {
        ...res.data.user,
        progress: {
          ...res.data.user.progress,
          currentStreak: res.data.user.progress?.currentStreak ?? 0,
          weeklyProgress: res.data.user.progress?.weeklyProgress ?? 0,
          weeklyGoal: res.data.user.progress?.weeklyGoal ?? 5,
          totalCourses: res.data.user.progress?.totalCourses ?? 12,
          completedCourses: res.data.user.progress?.completedCourses ?? 0,
          achievements: res.data.user.progress?.achievements ?? [],
        },
        membership: res.data.user.membership || {
          plan: "basic",
          status: "active",
          validUntil: null
        },
      };

      // Grant Pro access to specific IDs
      if (user.email && PRO_EMAILS.includes(user.email.toLowerCase())) {
        user.membership = {
          plan: "premium",
          status: "active",
          validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
        };
      }

      // Persist user
      localStorage.setItem("user", JSON.stringify(user));

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Track successful login
      trackAuthEvent('login_success', 'email');
      if (user.id) {
        setUserId(user.id);
        setUserProperties({
          user_type: 'authenticated',
          user_name: user.fullName || 'Unknown',
          login_method: 'email',
        });
      }
      success(`Welcome back, ${user.fullName || 'Scholar'}!`); // Premium Toast
    } catch (error: any) {
      // Clear both storage types on error
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      const errorMessage = error.response?.data?.message || "Login failed";
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      // Track login failure
      trackAuthEvent('login_failure', 'email');
      trackError(`Login failed: ${errorMessage}`, false);
      toastError(errorMessage); // Premium Toast
      throw error;
    }
  };

  // ✅ Signup
  const signup = async (name: string, email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await api.post("/auth/signup", {
        fullName: name,
        email,
        password,
        confirmPassword: password,
      });

      // Auto-login after successful signup
      const token = res.data.token;
      const user = res.data.user;

      // Set token and auth state
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setAuthState({
        user: {
          ...user,
          progress: {
            totalCourses: 0,
            completedCourses: 0,
            currentStreak: 0,
            totalHours: 0,
            achievements: [],
            weeklyGoal: 5,
            weeklyProgress: 0,
            ...(user.progress || {}),
          },
          // Map 'class' from backend to 'studentClass' if needed
          studentClass: user.class || user.studentClass,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Track successful signup
      trackAuthEvent('signup_success', 'email');

      success("Welcome to YUGA AI! Your account has been created successfully.");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Signup failed";
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      // Track signup failure
      trackAuthEvent('signup_failure', 'email');
      trackError(`Signup failed: ${errorMessage}`, false);
      toastError(errorMessage);
      throw error;
    }
  };

  // ====== NEW MULTI-STEP SIGNUP FLOW ======

  // ✅ Step 1: Initiate Signup
  const initiateSignup = async (fullName: string, email: string, topic: string) => {
    try {
      const res = await api.post("/auth/signup/initiate", {
        fullName,
        email,
        topic,
      });
      // Don't show success toast here, just return success
      return res.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to initiate signup";
      toastError(errorMessage);
      throw error;
    }
  };

  // ✅ Step 2: Verify OTP
  const verifyOTP = async (email: string, otp: string) => {
    try {
      const res = await api.post("/auth/signup/verify-otp", {
        email,
        otp,
      });
      // Don't show success toast here, just return success
      return res.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to verify OTP";
      toastError(errorMessage);
      throw error;
    }
  };

  // ✅ Step 3: Complete Signup
  const completeSignup = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await api.post("/auth/signup/complete", {
        email,
        password,
      });

      // Auto-login after successful signup
      const token = res.data.token;
      const user = res.data.user;

      // Set token and auth state
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setAuthState({
        user: {
          ...user,
          progress: {
            totalCourses: 0,
            completedCourses: 0,
            currentStreak: 0,
            totalHours: 0,
            achievements: [],
            weeklyGoal: 5,
            weeklyProgress: 0,
            ...(user.progress || {}),
          },
          studentClass: user.class || user.studentClass,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Track successful signup
      trackAuthEvent('signup_complete_success', 'email');
      if (user.id) {
        setUserId(user.id);
        setUserProperties({
          user_type: 'new',
          user_name: user.fullName || 'Unknown',
          topic: user.topic,
        });
      }

      success(`Welcome to YUGA AI, ${user.fullName}! 🎉`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to complete signup";
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      // Track signup failure
      trackAuthEvent('signup_complete_failure', 'email');
      trackError(`Signup completion failed: ${errorMessage}`, false);
      toastError(errorMessage);
      throw error;
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await api.post("/auth/logout"); // Optional
    } catch (err) {
      console.warn("Logout failed, continuing anyway...");
    } finally {
      // Track logout
      trackAuthEvent('logout', 'manual');

      // Clear storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      info("You have successfully logged out.");
      window.location.href = "/";
    }
  };

  // ✅ Update Profile
  const updateProfile = async (updates: Partial<User>) => {
    if (!authState.user) return;
    try {
      const res = await api.put(`/auth/users/${authState.user.id}`, updates);
      const updatedUser = res.data.user;
      setAuthState((prev) => ({ ...prev, user: updatedUser }));

      // Track profile update
      trackAuthEvent('profile_update', 'manual');
      if (updatedUser.fullName) {
        setUserProperties({
          user_name: updatedUser.fullName,
        });
      }
      success("Profile updated successfully!");
    } catch (err) {
      console.error("Update profile error:", err);
      trackError('Profile update failed', false);
      throw err;
    }
  };

  // ✅ OTP-BASED PASSWORD RESET FLOW
  const initiatePasswordReset = async (email: string) => {
    try {
      await api.post("/auth/forgot-password", { email });
      trackAuthEvent('password_reset_initiate', 'email');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to initiate password reset";
      toastError(errorMessage);
      throw err;
    }
  };

  const verifyResetOTP = async (email: string, otp: string) => {
    try {
      await api.post("/auth/verify-reset-otp", { email, otp });
      trackAuthEvent('password_reset_verify_otp_success', 'email');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Invalid reset code";
      toastError(errorMessage);
      throw err;
    }
  };

  const completePasswordReset = async (email: string, password: string) => {
    try {
      await api.post("/auth/reset-password", { email, password });
      trackAuthEvent('password_reset_complete_success', 'email');
      success("Password reset successfully! You can now sign in.");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to reset password";
      toastError(errorMessage);
      throw err;
    }
  };

  // ✅ Legacy Reset Password functions (updated to use the new endpoints if possible, or kept as is)
  const resetPassword = async (email: string) => {
    return initiatePasswordReset(email);
  };
  
  const setNewPassword = async (_token: string, password: string) => {
    // This is the legacy token flow, might not work with current backend changes
    // But we'll use email-based flow in the modal anyway
    console.warn("Legacy setNewPassword called. It's recommended to use completePasswordReset.");
    throw new Error("Please use the integrated password reset in the sign-in modal.");
  };

  // ⚠️ Placeholder for Email Verification (optional)
  const verifyEmail = async (_token: string) => {
    console.log("⚠️ Email verification not implemented in backend yet.");
  };

  // ✅ OAuth Login - Shows notification that feature is not yet configured
  const loginWithProvider = async (provider: AuthProviderType) => {
    console.log("⚠️ OAuth not implemented in frontend yet.");
    // Display premium toast instead of alert
    info(
      `${provider === 'google' ? 'Google' : 'Apple'} Sign-In is coming soon! 🚀 OAuth integration is currently being set up.`,
      5000
    );
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        initiateSignup,
        verifyOTP,
        completeSignup,
        logout,
        updateProfile,
        initiatePasswordReset,
        verifyResetOTP,
        completePasswordReset,
        resetPassword,
        verifyEmail,
        loginWithProvider,
        setNewPassword,
      }}
    >
      {children}

      {/* Session Expired Modal */}
      <SessionExpiredModal
        isOpen={showSessionExpiredModal}
        onConfirm={() => setShowSessionExpiredModal(false)}
      />
    </AuthContext.Provider>
  );
};

