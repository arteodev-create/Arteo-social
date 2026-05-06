import React, { useState, useEffect } from 'react';
import { ArrowUp } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

interface BackToTopProps {
    scrollRef: React.RefObject<HTMLDivElement | null>;
}

const BackToTop: React.FC<BackToTopProps> = ({ scrollRef }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const handleScroll = () => {
            setIsVisible(container.scrollTop > 400);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [scrollRef]);

    const scrollToTop = () => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onClick={scrollToTop}
                    className="fixed bottom-28 right-8 w-12 h-12 bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-full flex items-center justify-center shadow-sm z-[100] active:scale-95 transition-transform"
                    title="Back to top"
                >
                    <ArrowUp size={20} weight="light" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default BackToTop;
