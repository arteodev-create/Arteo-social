/**
 * [ABS v14.1 Platinum] Media Service
 * Centralized orchestrator for Arteo media assets (Local & S3).
 * Responsibility: Path normalization, URL generation, and lifecycle management.
 */
class MediaService {
    encodePathSegment(value) {
        return encodeURIComponent(value).replace(/%2F/g, '/');
    }

    buildCdnUrl(key) {
        if (!key) return null;
        return `/api/cdn/${this.encodePathSegment(key)}`;
    }

    extractStorageKeyFromUrl(value) {
        if (!value || typeof value !== 'string') return null;
        const decodedValue = decodeURIComponent(value.trim());
        const bucket = process.env.AWS_S3_BUCKET;
        const publicMarker = '/storage/v1/object/public/';
        const s3Marker = '/storage/v1/s3/';

        const extractAfterBucket = (path) => {
            if (!path) return null;
            if (bucket && path.startsWith(`${bucket}/`)) return path.slice(bucket.length + 1);
            return /^(avatar|avatars|coverPhoto|cover|image|images|media|plugins|videos)\//.test(path) ? path : null;
        };

        if (decodedValue.startsWith('/api/cdn/')) {
            return decodedValue.slice('/api/cdn/'.length);
        }

        const publicIndex = decodedValue.indexOf(publicMarker);
        if (publicIndex !== -1) {
            return extractAfterBucket(decodedValue.slice(publicIndex + publicMarker.length));
        }

        const s3Index = decodedValue.indexOf(s3Marker);
        if (s3Index !== -1) {
            return extractAfterBucket(decodedValue.slice(s3Index + s3Marker.length));
        }

        return null;
    }

    normalizeFileUrl(value) {
        if (!value || typeof value !== 'string') return value || null;
        const key = this.extractStorageKeyFromUrl(value);
        return key ? this.buildCdnUrl(key) : value;
    }

    /**
     * Resolves a Multer file object into a browser-accessible URL.
     * Supports both local disk storage and S3.
     */
    resolveFileUrl(file) {
        if (!file) return null;

        // 1. Supabase Storage key via S3-compatible upload.
        if (file.key) return this.buildCdnUrl(file.key);

        // 2. Check for S3 location and normalize private Supabase public URLs.
        if (file.location) return this.normalizeFileUrl(file.location);

        // 3. Check for Local Filename (Multer Disk Storage)
        if (file.filename) return `/uploads/${file.filename}`;

        // 4. Fallback to existing URL.
        if (file.url) return this.normalizeFileUrl(file.url);

        // 5. Dirty Path Fallback (Last Resort - cleaning absolute paths)
        if (file.path) {
            const basename = file.path.split(/[\\/]/).pop();
            return `/uploads/${basename}`;
        }

        return null;
    }

    /**
     * Normalizes a collection of files into an array of URLs.
     */
    normalizeMediaCollection(files) {
        if (!files) return [];
        const flatFiles = Array.isArray(files) ? files : Object.values(files).flat();
        return flatFiles.map(f => this.resolveFileUrl(f)).filter(url => !!url);
    }
}

module.exports = new MediaService();
