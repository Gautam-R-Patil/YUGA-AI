import { useState, useEffect } from "react";
import { api } from "../../../../core/utils/api";
import { SettingsFormData, PasswordData } from "../types";
import { User } from "../../../../core/types";

interface UseSettingsProps {
    user: User | null;
    updateProfile: (data: any) => Promise<void>;
    logout: () => void;
}

export const useSettings = ({ user, updateProfile, logout }: UseSettingsProps) => {
    const [isSaving, setIsSaving] = useState(false);
    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [formData, setFormData] = useState<SettingsFormData>({
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
        handleReset();
    }, [user]);

    const handleReset = () => {
        if (user) {
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
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action is irreversible.")) {
            try {
                const res = await api.delete(`/auth/users/${user?.id}`);
                if (res.status === 200) {
                    alert("Account deleted successfully.");
                    logout();
                }
            } catch (err) {
                console.error("Failed to delete account", err);
                alert("Failed to delete account. Please try again.");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        try {
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
        } catch (err) {
            console.error("Failed to update settings", err);
        } finally {
            setIsSaving(false);
        }
    };

    return {
        formData,
        setFormData,
        passwordData,
        setPasswordData,
        isSaving,
        handleReset,
        handleDeleteAccount,
        handleSubmit
    };
};
