import React from 'react';

interface LinkPreviewData {
    title: string;
    description: string;
    image: string;
    siteName?: string;
    url: string;
}

interface LinkPreviewProps {
    preview: LinkPreviewData;
    compact?: boolean;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ preview, compact = false }) => {
    const { title, description, image, siteName, url } = preview;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const getHostname = (url: string) => {
        try {
            return new URL(url).hostname;
        } catch (e) {
            return url;
        }
    };

    // FILTER: Don't show if it looks like a warning or broken preview
    // X.com/Twitter often returns this specific warning emoji svg when blocking scrapers
    if (image && image.includes('26a0.svg')) {
        return null;
    }

    // Strict Filter: If no title (or default X.com title that means nothing) and no description, hide it
    if (!title && !description) {
        return null;
    }

    // Also hide if title is just the URL (fallback) AND no image
    if ((title === url || !title) && !image) {
        return null;
    }

    if (compact) {
        return (
            <div
                onClick={handleClick}
                className="flex items-center gap-3 p-2 bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[8px] cursor-pointer hover:bg-[var(--app-card-hover)] transition-colors duration-200 overflow-hidden"
            >
                {image && (
                    <div className="w-12 h-12 rounded-[8px] overflow-hidden flex-shrink-0">
                        <img src={image} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[var(--app-text)] truncate">{title || url}</p>
                    <p className="text-[12px] text-[var(--app-text-muted)] truncate">{siteName || getHostname(url)}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={handleClick}
            className="group my-3 border border-[var(--app-border)] rounded-[8px] overflow-hidden cursor-pointer hover:bg-[var(--app-card-hover)] transition-all duration-200"
        >
            {image && (
                <div className="aspect-[1.91/1] overflow-hidden border-b border-[var(--app-border)]">
                    <img
                        src={image}
                        alt={title || 'Preview'}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                </div>
            )}
            <div className="p-3 space-y-1">
                <p className="text-[13px] text-[var(--app-text-muted)] tracking-tight">{siteName || getHostname(url)}</p>
                <p className="text-[15px] font-bold text-[var(--app-text)] leading-tight line-clamp-2">{title || url}</p>
                {description && (
                    <p className="text-[14px] text-[var(--app-text-muted)] line-clamp-2 leading-snug">{description}</p>
                )}
            </div>
        </div>
    );
};

export default LinkPreview;

