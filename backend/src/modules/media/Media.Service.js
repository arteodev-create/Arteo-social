/**
 * [ABS v14.1 Platinum] Media Service
 * Centralized orchestrator for Arteo media assets (Local & S3).
 * Responsibility: Path normalization, URL generation, and lifecycle management.
 */
class MediaService {
    encodePathSegment(value) {
        return encodeURIComponent(value).replace(/%2F/g, '/');
    }

    /**
     * Resolves a Multer file object into a browser-accessible URL.
     * Supports both local disk storage and S3.
     */
    resolveFileUrl(file) {
        if (!file) return null;

        // 1. Check for S3 location (Highest Priority)
        if (file.location) return file.location;

        // 2. Check for Local Filename (Multer Disk Storage)
        if (file.filename) return `/uploads/${file.filename}`;

        // 3. Fallback to existing URL or Key-based reconstruction
        if (file.url) return file.url;
        if (file.key) {
           const bucket = process.env.AWS_S3_BUCKET;
           const endpoint = process.env.AWS_S3_ENDPOINT || '';
           const cdnUrl = process.env.AWS_S3_CDN_URL;
           const region = process.env.AWS_S3_REGION || process.env.AWS_REGION || 'ap-southeast-2';
           const cleanCdn = cdnUrl ? cdnUrl.replace(/\/$/, '') : null;
           const encodedBucket = this.encodePathSegment(bucket);
           const encodedKey = this.encodePathSegment(file.key);

           if (cleanCdn) {
              const base = cleanCdn.includes('/storage/v1/object/public') && !cleanCdn.endsWith(`/${encodedBucket}`)
                ? `${cleanCdn}/${encodedBucket}`
                : cleanCdn;
              return `${base}/${encodedKey}`;
           }

           if (endpoint.includes('.supabase.co/storage/v1/s3')) {
              return `${endpoint.replace('/storage/v1/s3', '/storage/v1/object/public')}/${encodedBucket}/${encodedKey}`;
           }

           return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
        }

        // 4. Dirty Path Fallback (Last Resort - cleaning absolute paths)
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
