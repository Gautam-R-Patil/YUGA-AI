import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { COURSE_CONFIGS, CourseConfig, CourseType } from "../config/courseConfig";

interface CourseContextType {
    selectedCourse: CourseType;
    config: CourseConfig;
    setCourse: (course: CourseType) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedCourse, setSelectedCourse] = useState<CourseType>(() => {
        const saved = localStorage.getItem("selected_course") as CourseType;
        return (saved && COURSE_CONFIGS[saved]) ? saved : "neet";
    });

    const { user } = useAuth();

    useEffect(() => {
        if (user?.topic) {
            const topic = user.topic.toLowerCase();
            if (topic === "neet") setCourse("neet");
            else if (topic === "jee") setCourse("jee");
            else if (topic === "both") setCourse("both");
        }
    }, [user]);



    const setCourse = (course: CourseType) => {
        setSelectedCourse(course);
        localStorage.setItem("selected_course", course);
    };

    const config = COURSE_CONFIGS[selectedCourse];

    return (
        <CourseContext.Provider value={{ selectedCourse, config, setCourse }}>
            {children}
        </CourseContext.Provider>
    );
};

export const useCourse = () => {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error("useCourse must be used within a CourseProvider");
    }
    return context;
};
