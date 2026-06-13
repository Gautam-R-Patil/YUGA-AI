import React, { useState, useRef, useEffect } from "react";
import { apiRequest } from "../../../core/utils/api";

import { FormattedText } from '../../../shared/components/FormattedText';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    type?: 'question' | 'clarification' | 'general';
}

interface AIClassroomChatProps {
    onQuestionAsked: (question: string) => void;
    courseCategory?: string;
    inputText: string;
    onInputChange: (text: string) => void;
    isDictating?: boolean;
    onDictationToggle?: () => void;
}

export const AIClassroomChat: React.FC<AIClassroomChatProps> = ({
    onQuestionAsked,
    courseCategory = 'General',
    inputText,
    onInputChange,
    isDictating = false,
    onDictationToggle
}) => {
    const [messages, setMessages] = useState<Message[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
            type: 'question'
        };

        setMessages(prev => [...prev, userMessage]);
        onQuestionAsked(inputText);
        onInputChange('');

        try {
            const conversationHistory = messages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            }));
            conversationHistory.push({ role: 'user', content: userMessage.text });

            const response = await apiRequest('/voice/query', 'POST', {
                messages: conversationHistory,
                courseCategory: courseCategory
            });

            if (response.ok) {
                const data = await response.json();
                const aiResponse: Message = {
                    id: (Date.now() + 1).toString(),
                    text: data.response || data.answer || "I'm sorry, I couldn't understand that.",
                    sender: 'ai',
                    timestamp: new Date(),
                    type: 'general'
                };
                setMessages(prev => [...prev, aiResponse]);
            } else {
                console.error("Failed to get AI response", response.statusText);
            }
        } catch (error) {
            console.error("Error getting AI response:", error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            <div className="messages custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`msg ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                        <div className="msg-content">
                            <FormattedText content={msg.text} />
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px' }}>
                {onDictationToggle && (
                    <button
                        className={`ask-doubt-btn-red ${isDictating ? 'active' : ''}`}
                        onClick={onDictationToggle}
                        style={{
                            height: '42px',
                            minWidth: '110px', // Fixed width for stability
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                    >
                        {isDictating ? (
                            <span className="flex items-center gap-1.5 text-white">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                Listening
                            </span>
                        ) : "Ask Doubt"}
                    </button>
                )}

                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        type="text"
                        placeholder={isDictating ? "Listening..." : "Ask your doubt here..."}
                        value={inputText}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        style={{ width: '100%', paddingRight: '40px' }}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSendMessage}
                        style={{
                            position: 'absolute',
                            right: '4px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            fontSize: '12px',
                            border: 'none',
                            background: 'rgba(34, 211, 238, 0.1)'
                        }}
                    >
                        ➤
                    </button>
                </div>
            </div>
        </>
    );
};
