import React, { useState } from 'react';
import { X } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface MediaGalleryProps {
    mediaUrls?: string[];
    gifUrl?: string;
    onRemove?: (index: number) => void;
    onMediaClick?: (index: number) => void;
    preview?: boolean;
    maxHeight?: string;
}

const isVideo = (url: string) => {
    if (url.startsWith('blob:')) {
        return url.includes('video') || /\.(mp4|mov|avi|webm)$/i.test(url);
    }
    return /\.(mp4|mov|avi|webm)$/i.test(url) || url.includes('video/upload');
};

const MediaItem = ({ url, index, className = "", style = {}, onClick, onRemove, preview }: {
    url: string,
    index: number,
    className?: string,
    style?: React.CSSProperties,
    onClick: (index: number, e?: React.MouseEvent) => void,
    onRemove?: (index: number) => void,
    preview: boolean
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const video = isVideo(url);
    const defaultClassName = video ? "w-full h-full object-contain" : "w-full h-full object-cover";
    const finalClassName = className || defaultClassName;

    return (
        <div
            className="relative w-full h-full group/image overflow-hidden flex items-center justify-center cursor-pointer"
            onClick={(e) => onClick(index, e)}
        >
            {video ? (
                <VideoPlayer src={url} className={finalClassName} preview={preview} style={style} />
            ) : (
                <>
                    {!isLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-full bg-[var(--bg-secondary)]"></div>
                        </div>
                    )}
                    <img
                        src={url}
                        alt=""
                        className={`${finalClassName} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        style={style}
                        onLoad={() => setIsLoaded(true)}
                    />
                </>
            )}
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(index);
                    }}
                    className="absolute top-2 right-2 bg-black text-white p-1.5 border border-black hover:bg-black transition-colors z-10 group-hover/image:opacity-100"
                >
                    <X className="w-4 h-4" strokeWidth={1.2} />
                </button>
            )}
        </div>
    );
};

const MediaGallery: React.FC<MediaGalleryProps> = ({
    mediaUrls = [],
    gifUrl,
    onRemove,
    onMediaClick,
    preview = false,
    maxHeight = '450px'
}) => {
    const allMedia = [...mediaUrls];
    if (gifUrl) allMedia.push(gifUrl);

    if (allMedia.length === 0) return null;

    const handleMediaClick = (index: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (onMediaClick) {
            onMediaClick(index);
        }
    };

    return (
        <div className="w-full h-full overflow-hidden">
            {allMedia.length === 1 && (
                <div className="relative w-full flex justify-start">
                    <div 
                        className="relative overflow-hidden cursor-pointer group border border-black"
                        style={{ maxHeight, width: 'auto', maxWidth: '100%' }}
                    >
                        <MediaItem 
                            url={allMedia[0]} 
                            index={0} 
                            className="w-auto h-auto max-w-full object-contain" 
                            style={{ maxHeight, display: 'block' }} 
                            onClick={handleMediaClick} 
                            onRemove={onRemove} 
                            preview={preview} 
                        />
                    </div>
                </div>
            )}

            {allMedia.length === 2 && (
                <div className="grid grid-cols-2 gap-1 h-[320px] overflow-hidden border border-black shadow-none">
                    <MediaItem url={allMedia[0]} index={0} onClick={handleMediaClick} onRemove={onRemove} preview={preview} className="w-full h-full object-cover" />
                    <MediaItem url={allMedia[1]} index={1} onClick={handleMediaClick} onRemove={onRemove} preview={preview} className="w-full h-full object-cover" />
                </div>
            )}

            {allMedia.length === 3 && (
                <div className="flex gap-1 w-full aspect-[3/2] overflow-hidden border border-black shadow-none">
                    {/* Large preview on the left: 60% width, full height */}
                    <div className="basis-[60%] h-full">
                        <MediaItem url={allMedia[0]} index={0} onClick={handleMediaClick} onRemove={onRemove} preview={preview} className="w-full h-full object-cover" />
                    </div>
                    {/* Right column: 40% width with two stacked previews */}
                    <div className="basis-[40%] flex flex-col gap-1 h-full">
                        <div className="h-1/2 w-full overflow-hidden">
                            <MediaItem url={allMedia[1]} index={1} onClick={handleMediaClick} onRemove={onRemove} preview={preview} className="w-full h-full object-cover" />
                        </div>
                        <div className="h-1/2 w-full overflow-hidden">
                            <MediaItem url={allMedia[2]} index={2} onClick={handleMediaClick} onRemove={onRemove} preview={preview} className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            )}

            {allMedia.length >= 4 && (
                <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full aspect-square overflow-hidden border border-black shadow-none">
                    <MediaItem url={allMedia[0]} index={0} onClick={handleMediaClick} onRemove={onRemove} preview={preview} className="w-full h-full object-cover" />
                    <MediaItem url={allMedia[1]} index={1} onClick={handleMediaClick} onRemove={onRemove} preview={preview} className="w-full h-full object-cover" />
                    <MediaItem url={allMedia[2]} index={2} onClick={handleMediaClick} onRemove={onRemove} preview={preview} className="w-full h-full object-cover" />
                    <div className="relative w-full h-full group/more cursor-pointer" onClick={(e) => handleMediaClick(3, e)}>
                        <MediaItem url={allMedia[3]} index={3} onClick={handleMediaClick} onRemove={onRemove} preview={preview} className="w-full h-full object-cover" />
                        {allMedia.length > 4 && (
                            <div className="absolute inset-0 bg-black/50  flex flex-col items-center justify-center transition-all group-hover/more:bg-black/60">
                                <span className="text-white text-3xl font-bold">+{allMedia.length - 3}</span>
                                <span className="text-white/80 text-xs font-medium mt-1">View more</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaGallery;
