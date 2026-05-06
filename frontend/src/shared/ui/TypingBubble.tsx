import React from 'react';
import { motion } from 'framer-motion';

/**
 * Arteo Typing Bubble - Majestic Noir Edition
 * A high-fidelity "three-dot" animation for platform-wide real-time feedback.
 */
const TypingBubble: React.FC = () => {
    return (
        <div className="flex justify-start mb-6">
            <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-zinc-100 px-5 py-3.5 rounded-[8px] rounded-bl-none shadow-sm border border-zinc-200/50 flex items-center gap-1.5"
            >
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 1, 0.3],
                            backgroundColor: ["#a1a1aa", "#6366f1", "#a1a1aa"]
                        }}
                        transition={{ 
                            duration: 1.2, 
                            repeat: Infinity, 
                            delay: i * 0.2,
                            ease: "easeInOut"
                        }}
                        className="w-1.5 h-1.5 rounded-full"
                    />
                ))}
            </motion.div>
        </div>
    );
};

export default TypingBubble;

