/**
 * Image URL helpers for avatars and media.
 * Supports full external URLs and local server paths.
 */

const getBaseUrl = () => {
    if (typeof window === 'undefined') return 'https://acs-production-3833.up.railway.app';
    const apiBase = process.env.REACT_APP_API_URL || 'https://acs-production-3833.up.railway.app/api';
    return apiBase.replace(/\/api$/, '');
};

const SERVER_URL = getBaseUrl();

export const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path || path.trim() === '' || path.startsWith('nucleus:')) {
        return null;
    }

    let trimmedPath = path.trim();

    // 1. Return early for full URLs, Blob URLs, and Data URIs.
    if (
        trimmedPath.startsWith('http://') || 
        trimmedPath.startsWith('https://') || 
        trimmedPath.startsWith('blob:') || 
        trimmedPath.startsWith('data:')
    ) {
        return trimmedPath;
    }

    // 2. CDN REWRITE LOGIC (Optional for internal paths)
    const S3_CDN_URL = process.env.REACT_APP_S3_CDN_URL;
    const isS3 = trimmedPath.includes('s3.ap-southeast-2.amazonaws.com') || 
                 trimmedPath.includes('.s3.') ||
                 trimmedPath.includes('/s3/');

    if (S3_CDN_URL && isS3) {
        try {
            let key = '';
            if (trimmedPath.includes('/s3/')) {
                key = trimmedPath.split('/s3/')[1];
            } else {
                key = trimmedPath; // Fallback
            }
            const cleanCdnBase = S3_CDN_URL.endsWith('/') ? S3_CDN_URL.slice(0, -1) : S3_CDN_URL;
            return `${cleanCdnBase}/${key}`;
        } catch (e) {
            console.error('[getImageUrl] ERROR REWRITING:', e);
        }
    }

    // 3. Resolve relative paths against SERVER_URL.
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${SERVER_URL}${cleanPath}`;
};
