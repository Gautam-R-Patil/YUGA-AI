import React, { useEffect, useRef } from 'react';

interface HighlightedLectureScriptProps {
    fullScript: string;
    currentSpeech: string;
}

export const HighlightedLectureScript: React.FC<HighlightedLectureScriptProps> = ({
    fullScript,
    currentSpeech
}) => {
    const scrollRef = useRef<HTMLSpanElement>(null);

    // Auto-scroll to bottom when currentSpeech updates
    useEffect(() => {
        if (scrollRef.current && currentSpeech) {
            const parent = scrollRef.current.parentElement;
            if (parent) {
                parent.scrollTop = parent.scrollHeight;
            }
        }
    }, [currentSpeech]);

    // If no speech yet, show placeholder message
    if (!currentSpeech || currentSpeech.length === 0) {
        return <span className="text-slate-500 italic">Lecture will appear here as the teacher speaks...</span>;
    }

    // Clean the input scripts from heavy LaTeX and Markdown to make it readable for subtitles
    const sanitizeLectureText = (text: string) => {
        if (!text) return text;
        return text
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/__/g, '')
            .replace(/\$\$/g, '')
            .replace(/\$/g, '')
            .replace(/\\\[/g, '')
            .replace(/\\\]/g, '')
            .replace(/\\\(/g, '')
            .replace(/\\\)/g, '')
            .replace(/\\frac{([^}]+)}{([^}]+)}/g, '$1 / $2')
            .replace(/\\text{([^}]+)}/g, '$1')
            .replace(/\\theta/g, 'θ')
            .replace(/\\sin/g, 'sin')
            .replace(/\\cos/g, 'cos')
            .replace(/\\sqrt{([^}]+)}/g, '√($1)')
            .replace(/_{([^}]+)}/g, '_$1')
            .replace(/\\/g, ''); // strip any remaining isolated backslashes
    };

    // Extract original string pieces first for correct character syncing, then sanitize for rendering:
    const spokenLength = currentSpeech.length;
    
    // Check if speech is complete
    const isComplete = spokenLength >= fullScript.length;

    // If complete, show all text in normal color
    if (isComplete) {
        return <span ref={scrollRef} className="text-slate-300">{sanitizeLectureText(fullScript)}</span>;
    }

    // Define a "highlight window" for currently speaking words (last ~50 characters)
    const highlightWindowSize = 50;
    const highlightStart = Math.max(0, spokenLength - highlightWindowSize);

    // 1. Already spoken (before the highlight window)
    const alreadySpoken = sanitizeLectureText(fullScript.substring(0, highlightStart));
    // 2. Currently speaking (the highlight window)
    const currentlySpeaking = sanitizeLectureText(fullScript.substring(highlightStart, spokenLength));

    return (
        <span ref={scrollRef}>
            {/* Already spoken - normal color */}
            <span className="text-slate-300">
                {alreadySpoken}
            </span>
            {/* Currently speaking - yellow highlight */}
            <span className="text-yellow-300 font-semibold bg-yellow-500/10 px-0.5 transition-all duration-200">
                {currentlySpeaking}
            </span>
        </span>
    );
};
