import React, { useState, useCallback, useMemo } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useWhiteboardManager = (initialContent: any[] = []) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [whiteboardContent, setWhiteboardContent] = useState<any[]>(initialContent);
    const [isWhiteboardVisible, setIsWhiteboardVisible] = useState(true);

    const updateWhiteboardWithSections = useCallback((title: string, lecture: string, keyPoints: string[], summary: string) => {
        console.log("Updating Whiteboard with Sections:", title);
        const newContent = [
            title,
            "",
            "KEY POINTS",
            "=".repeat(50),
            ...keyPoints.map(point => `• ${point} `),
            "",
            "CLASS LECTURE",
            "=".repeat(50),
            ...lecture.split('\n').filter(line => line.trim()),
            "",
            "SUMMARY",
            "=".repeat(50),
            summary
        ];

        setWhiteboardContent(prev => {
            if (JSON.stringify(prev) === JSON.stringify(newContent)) {
                return prev;
            }
            console.log("Whiteboard content changed, updating...");
            return newContent;
        });
    }, []);

    const contextValue = useMemo(() => ({
        whiteboardContent,
        setWhiteboardContent,
        isWhiteboardVisible,
        setIsWhiteboardVisible,
        updateWhiteboardWithSections
    }), [whiteboardContent, isWhiteboardVisible, updateWhiteboardWithSections]);

    return contextValue;
};
