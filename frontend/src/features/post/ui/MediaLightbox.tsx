import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface MediaLightboxProps {
    mediaUrls: string[];
    initialIndex: number;
    onClose: () => void;
    overrideUrl?: string; // Clean social URL e.g. /@username/post/35/media/0
}

const MediaLightbox: React.FC<MediaLightboxProps> = ({
    mediaUrls,
    initialIndex = 0,
    onClose,
    overrideUrl,
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [offsetY, setOffsetY] = useState(0);
    const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const previousUrlRef = useRef(window.location.href);
    const isFirstMount = useRef(true);

    // Update browser URL: /@username/post/id/media/index style (like Threads/Instagram)
    useEffect(() => {
        if (overrideUrl) {
            if (isFirstMount.current) {
                window.history.pushState({ arteoLightbox: true }, '', overrideUrl);
                isFirstMount.current = false;
            } else {
                window.history.replaceState({ arteoLightbox: true }, '', overrideUrl);
            }
        }
    }, [currentIndex, overrideUrl]);

    // Close the lightbox when the browser back button is pressed.
    useEffect(() => {
        const handlePopState = () => onClose();
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
            // Restore original URL when lightbox closes
            if (overrideUrl) {
                window.history.replaceState(null, '', previousUrlRef.current);
            }
        };
    }, [onClose, overrideUrl]);

    // Lock body scroll while lightbox is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        };
    }, []);

    const handleNext = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentIndex < mediaUrls.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, mediaUrls.length]);

    const handlePrev = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
    }, [handleNext, handlePrev, onClose]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);

        setOffsetY(prev => {
            const newOffset = prev + e.deltaY;

            // Threshold to close (e.g., 150px)
            if (Math.abs(newOffset) > 150) {
                onClose();
                return 0;
            }
            return newOffset;
        });

        // Snap back if scrolling stops
        resetTimeoutRef.current = setTimeout(() => {
            setOffsetY(0);
        }, 150);
    }, [onClose]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const currentUrl = mediaUrls[currentIndex] || '';

    // Helper to check for video
    const isVideo = (url: string) => {
        if (!url) return false;
        if (url.startsWith('blob:')) {
            return url.includes('video') || /\.(mp4|mov|avi|webm)$/i.test(url) || url.includes('#video');
        }
        return /\.(mp4|mov|avi|webm)$/i.test(url) || url.includes('video/upload');
    };

    const isCurrentVideo = isVideo(currentUrl);

    // Auto-close if there are no valid URLs to display
    useEffect(() => {
        if (mediaUrls.length === 0 || !mediaUrls[currentIndex]) {
            onClose();
        }
    }, [mediaUrls, currentIndex, onClose]);

    // Calculate opacity based on offset
    const opacity = Math.max(0, 1 - Math.abs(offsetY) / 300);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95"
            onWheel={handleWheel}
            style={{
                backgroundColor: `rgba(0, 0, 0, ${Math.max(0.1, 0.95 * opacity)})`,
                transition: 'background-color 0.1s ease-out'
            }}
        >
            {/* Close Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="absolute top-4 left-4 p-2 rounded-[8px] bg-black/50 text-white hover:bg-white/20 transition-colors z-20"
                style={{ opacity }}
            >
                <X className="w-6 h-6" />
            </button>


            {/* Navigation Buttons */}
            {currentIndex > 0 && (
                <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-[8px] bg-black/50 text-white hover:bg-white/20 transition-colors z-20"
                    style={{ opacity }}
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
            )}

            {currentIndex < mediaUrls.length - 1 && (
                <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-[8px] bg-black/50 text-white hover:bg-white/20 transition-colors z-20"
                    style={{ opacity }}
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            )}

            {/* Content Container - Handles Overlay Click & Animation */}
            <div
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
            >
                <div
                    // Inner wrapper moves with scroll
                    className="flex items-center justify-center w-full h-full pointer-events-none"
                    style={{
                        transform: `translateY(${offsetY}px)`,
                        opacity: opacity,
                        transition: offsetY === 0 ? 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s' : 'none'
                    }}
                >
                    {isCurrentVideo ? (
                        <div
                            className="max-w-5xl max-h-full w-full flex items-center justify-center pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <VideoPlayer
                                src={currentUrl}
                                className="max-w-full max-h-screen object-contain rounded-[8px]"
                                autoPlay
                            />
                        </div>
                    ) : (
                        <img
                            src={currentUrl}
                            alt={`Media ${currentIndex + 1}`}
                            className="max-w-full max-h-screen object-contain pointer-events-auto cursor-zoom-in"
                            title="Open media in a new tab"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(currentUrl, '_blank', 'noopener,noreferrer');
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Counter/Index Indicator, optional */}
            {mediaUrls.length > 1 && (
                <div className="absolute top-4 right-4 text-white/80 font-medium z-20" style={{ opacity }}>
                    {currentIndex + 1} / {mediaUrls.length}
                </div>
            )}
        </motion.div>
    );
};

export default MediaLightbox;

