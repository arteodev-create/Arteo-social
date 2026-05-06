/**
 * String Utilities
 * Orchestrates professional string manipulation and normalization logic.
 * Standardized for Arteo Platinum (ABS v14.1).
 */
class StringUtils {
    /**
     * High-Fidelity Slug Generator
     * Converts raw titles into URL-friendly, SEO-optimized slugs.
     * Supports full Vietnamese diacritic removal.
     */
    slugify(text) {
        if (!text) return '';

        return text.toString().toLowerCase()
            .normalize('NFD') // Separate base characters from accents
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[đĐ]/g, 'd')
            .replace(/([^0-9a-z-\s])/g, '') // Remove special chars
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Remove duplicate hyphens
            .replace(/^-+|-+$/g, ''); // Trim hyphens
    }
}

module.exports = new StringUtils();
