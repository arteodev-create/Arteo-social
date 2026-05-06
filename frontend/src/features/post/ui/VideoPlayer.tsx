import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    className?: string;
    preview?: boolean; // If true, simpler controls for small previews
    style?: React.CSSProperties;
    autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, className = '', preview = false, style, autoPlay = false }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(true); // Auto-play usually requires mute
    const [progress, setProgress] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    // Initial play styling to avoid black frame if poster not used (though poster is ideal)
    // We'll rely on browser to show first frame or add logic later if needed.

    const togglePlay = (e?: React.MouseEvent) => {
        e?.stopPropagation(); // Prevent opening post modal if in feed
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            if (duration) {
                setProgress((current / duration) * 100);
            }
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            // Optional: loop? For now, just stop.
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (videoRef.current) {
            const progressBar = e.currentTarget;
            const rect = progressBar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const percentage = x / width;
            videoRef.current.currentTime = percentage * videoRef.current.duration;
        }
    };

    return (
        <div
            className={`relative group overflow-hidden bg-black ${className}`}
            style={style}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={togglePlay}
        >
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain"
                muted={isMuted}
                loop={false}
                playsInline
                autoPlay={autoPlay}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                // preload="metadata" // Save data
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {/* Controls Overlay */}
            <div
                className={`absolute inset-0 transition-opacity duration-300 flex flex-col justify-between p-3
                ${isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 40%)' }}
            >
                {/* Center Play Button (Only visible when paused) */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 rounded-[8px] bg-white/20  flex items-center justify-center border border-white/30 text-white shadow-none">
                            <Play className="w-5 h-5 ml-1 fill-white" />
                        </div>
                    </div>
                )}

                {/* Top Controls (Empty for now, maybe maximize later) */}
                <div></div>

                {/* Bottom Controls */}
                <div className="w-full flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                        {/* Play/Pause Small */}
                        <button onClick={togglePlay} className="p-1.5 rounded-[8px] hover:bg-white/10 text-white transition-colors">
                            {isPlaying ? <Pause className="w-4 h-4 fill-white" strokeWidth={1.2} /> : <Play className="w-4 h-4 fill-white" strokeWidth={1.2} />}
                        </button>

                        {/* Mute Toggle */}
                        <button onClick={toggleMute} className="p-1.5 rounded-[8px] hover:bg-white/10 text-white transition-colors">
                            {isMuted ? <VolumeX className="w-4 h-4" strokeWidth={1.2} /> : <Volume2 className="w-4 h-4" strokeWidth={1.2} />}
                        </button>
                    </div>

                    {/* Progress Bar */}
                    {/* Progress Bar */}
                    <div
                        className="w-full h-1 rounded-[8px] cursor-pointer relative py-3 group/progress"
                        onClick={handleProgressClick}
                    >
                        <div className="absolute top-[13px] left-0 right-0 h-[1px] group-hover/progress:h-[4px] group-hover/progress:top-[11.5px] bg-white/20 rounded-[8px] overflow-visible transition-all duration-200">
                            <div
                                className="h-full bg-white relative rounded-[8px]"
                                style={{ width: `${progress}%` }}
                            >
                                {/* Handle removed */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;

