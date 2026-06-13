import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../core/ThemeContext";

interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
    className = "",
    showLabel = false
}) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
            aria-label="Toggle theme"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            {theme === "dark" ? (
                <div className="flex items-center gap-2 text-yellow-500">
                    <Sun className="w-5 h-5" />
                    {showLabel && <span className="text-sm font-medium">Light Mode</span>}
                </div>
            ) : (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Moon className="w-5 h-5" />
                    {showLabel && <span className="text-sm font-medium">Dark Mode</span>}
                </div>
            )}
        </button>
    );
};
