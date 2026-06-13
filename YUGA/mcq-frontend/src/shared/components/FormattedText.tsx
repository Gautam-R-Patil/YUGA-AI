import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Import KaTeX styles

interface FormattedTextProps {
    content: string;
    className?: string;
}

/**
 * Renders text with Markdown and LaTeX support.
 * Uses react-markdown, remark-math, and rehype-katex.
 */
export const FormattedText: React.FC<FormattedTextProps> = ({ content, className = '' }) => {
    // Preprocess LaTeX delimiters used by various LLMs to standard markdown math delimiters ($ and $$)
    const processLaTeXDelimiters = (text: string) => {
        if (!text) return text;
        return text
            .replace(/\\\[/g, '$$')
            .replace(/\\\]/g, '$$')
            .replace(/\\\(/g, '$')
            .replace(/\\\)/g, '$');
    };

    const processedContent = processLaTeXDelimiters(content);

    return (
        <div className={`formatted-text ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-current mt-4 mb-2 first:mt-0" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-base font-bold mt-4 mb-2 first:mt-0" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-current opacity-90 mt-3 mb-1.5" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-current" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-2" {...props} />,
                    li: ({ node, ...props }) => <li className="text-current opacity-90" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-3 border-indigo-400 pl-3 my-2 italic text-current opacity-80" {...props} />,
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
};
