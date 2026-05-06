import React, { useState, useEffect } from 'react';

interface TypingEffectProps {
    text: string;
    speed?: number;
    onComplete?: () => void;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ text, speed = 15, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let index = 0;
        setDisplayedText(''); // Reset on new text

        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index));
                index++;
            } else {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, onComplete]);

    return (
        <span>
            {displayedText}
            <span className="animate-pulse inline-block w-1.5 h-3 ml-0.5 bg-emerald-500/50 align-middle" />
        </span>
    );
};

export default TypingEffect;

