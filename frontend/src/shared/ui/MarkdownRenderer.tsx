import React from 'react';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    // Helper to process text and apply simple markdown rules
    const processText = (text: string) => {
        // Only process formatted parts if the closing tag is present
        const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

        return parts.map((part, index) => {
            // Check if part is genuinely wrapped (both start and end)
            if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
                return <strong key={index} className="text-emerald-400 font-bold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
                return <code key={index} className="bg-black/30 text-cyan-400 px-1 py-0.5 rounded font-mono text-[10px] border border-cyan-500/20">{part.slice(1, -1)}</code>;
            }
            return part;
        });
    };

    // Split by newlines to handle paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());

    return (
        <div className="space-y-3">
            {paragraphs.map((paragraph, i) => (
                <p key={i} className="leading-relaxed">
                    {processText(paragraph)}
                </p>
            ))}
        </div>
    );
};

export default MarkdownRenderer;

