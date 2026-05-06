import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from '@shared/ui';

const SplashScreen: React.FC = () => {
    return (
        <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-[var(--bg-primary)] z-[9999] flex items-center justify-center overflow-hidden"
        >
            {/* Ambient Background Glow - Extremely subtle */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--bg-secondary)_0%,_transparent_70%)] opacity-40" />

            {/* Logo Flash Container */}
            <motion.div 
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                    duration: 0.8, 
                    ease: [0.16, 1, 0.3, 1],
                }}
                className="relative z-10"
            >
                {/* Outer Glow Pulse */}
                <motion.div 
                    animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                    className="absolute inset-0 bg-[var(--text-primary)] blur-3xl rounded-full opacity-20 scale-150"
                />
                
                {/* Standard Arteo Logo */}
                <Logo size={120} color="var(--text-primary)" className="drop-shadow-none" />
            </motion.div>

            {/* Bottom Brand Identity */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="absolute bottom-12 flex flex-col items-center gap-2"
            >
                <span className="text-[14px] font-bold text-[var(--text-muted)] font-readable">
                    Arteo Platform
                </span>
                <div className="w-1 h-1 rounded-full bg-[var(--text-primary)] opacity-40" />
            </motion.div>
        </motion.div>
    );
};

export default SplashScreen;
