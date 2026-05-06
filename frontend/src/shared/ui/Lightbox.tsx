import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface LightboxProps {
    isOpen: boolean;
    onClose: () => void;
    mediaUrls: string[];
    initialIndex?: number;
}

const Lightbox: React.FC<LightboxProps> = ({
    isOpen,
    onClose,
    mediaUrls,
    initialIndex = 0
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen, initialIndex]);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % mediaUrls.length);
        setIsZoomed(false);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
        setIsZoomed(false);
    };

    if (!isOpen || typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 backdrop-blur-xl"
                onClick={onClose}
            >
                {/* Header Controls */}
                <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-10">
                    <div className="text-white/60 text-sm font-bold tracking-tighter">
                        {currentIndex + 1} <span className="opacity-30">/</span> {mediaUrls.length}
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
                            className="p-2 text-white/50 hover:text-white transition-colors"
                        >
                            {isZoomed ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all active:scale-95"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Navigation Buttons */}
                {mediaUrls.length > 1 && (
                    <>
                        <button 
                            onClick={handlePrev}
                            className="absolute left-6 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all z-10"
                        >
                            <ChevronLeft size={32} />
                        </button>
                        <button 
                            onClick={handleNext}
                            className="absolute right-6 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all z-10"
                        >
                            <ChevronRight size={32} />
                        </button>
                    </>
                )}

                {/* Main Content */}
                <motion.div
                    key={mediaUrls[currentIndex]}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ 
                        opacity: 1, 
                        scale: isZoomed ? 1.5 : 1, 
                        y: 0 
                    }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative cursor-default"
                    onClick={(e) => e.stopPropagation()}
                >
                    <img 
                        src={mediaUrls[currentIndex]} 
                        alt={`Media ${currentIndex}`}
                        className="max-w-[90vw] max-h-[85vh] object-contain rounded-[8px] shadow-none"
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default Lightbox;
