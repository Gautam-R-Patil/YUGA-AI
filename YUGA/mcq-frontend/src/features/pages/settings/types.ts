export interface SettingsFormData {
    fullName: string;
    email: string;
    studentClass: string;
    learningStyle: string;
    difficulty: string;
    weeklyGoal: number;
    notifications: boolean;
    avatar: string;
}

export interface PasswordData {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}
