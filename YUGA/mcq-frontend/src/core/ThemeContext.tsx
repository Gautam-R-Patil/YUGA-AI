import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./contexts/AuthContext";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { user, isAuthenticated, updateProfile } = useAuth();
    const hasResolvedServerThemeRef = useRef(false);
    const lastUserIdRef = useRef<string | null>(null);
    const [theme, setThemeState] = useState<Theme>(() => {
        // Check local storage first (instant load)
        const savedTheme = localStorage.getItem("theme") as Theme;
        if (savedTheme) {
            return savedTheme;
        }
        // Check system preference
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }
        return "light";
    });

    // 1. Resolve backend vs local theme once per login.
    //    IMPORTANT: Do not let a stale server theme overwrite an optimistic local toggle.
    useEffect(() => {
        const userId = isAuthenticated ? (user?.id ?? null) : null;

        if (!userId) {
            hasResolvedServerThemeRef.current = false;
            lastUserIdRef.current = null;
            return;
        }

        if (lastUserIdRef.current !== userId) {
            hasResolvedServerThemeRef.current = false;
            lastUserIdRef.current = userId;
        }

        if (hasResolvedServerThemeRef.current) return;

        const serverTheme = user?.preferences?.theme as Theme | undefined;
        if (!serverTheme) {
            hasResolvedServerThemeRef.current = true;
            return;
        }

        const savedTheme = localStorage.getItem("theme") as Theme | null;
        const savedIsValid = savedTheme === "light" || savedTheme === "dark";

        if (savedIsValid) {
            // Prefer local choice for instant UX; push it to server if needed.
            if (theme !== savedTheme) {
                setThemeState(savedTheme);
            }

            if (savedTheme !== serverTheme) {
                updateProfile({
                    preferences: {
                        ...(user.preferences || {}),
                        theme: savedTheme,
                    },
                }).catch((err) => {
                    console.error("Failed to sync theme preference to server", err);
                });
            }
        } else {
            // No local preference yet: adopt server theme.
            if (theme !== serverTheme) {
                setThemeState(serverTheme);
            }
            localStorage.setItem("theme", serverTheme);
        }

        hasResolvedServerThemeRef.current = true;
    }, [isAuthenticated, user?.id, user?.preferences?.theme, updateProfile]);

    // 2. Apply Theme to DOM
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
    };

    const setTheme = (newTheme: Theme) => {
        // Optimistic update
        setThemeState(newTheme);

        // Sync to Backend
        if (isAuthenticated && user) {
            updateProfile({
                preferences: {
                    ...user.preferences,
                    theme: newTheme,
                }
            }).catch(err => {
                console.error("Failed to persist theme preference", err);
                // Optional: Revert on failure? Usually overkill for theme.
            });
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
