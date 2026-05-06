/**
 * Identity Utilities
 * Specialized logic for identity normalization, branding, and verification logic.
 * Standardized for Phase 104 (Neural Alignment).
 */

class IdentityUtils {
    /**
     * Generates a virtual Node ID for high-fidelity UI branding.
     * Standardizes logic based on the user's canonical UUID.
     */
    static generateVirtualNodeId(uuid) {
        if (!uuid || typeof uuid !== 'string') return 'node_arteo_cluster';
        const segments = uuid.split('-');
        return `node_${segments[0].toLowerCase()}`;
    }

    /**
     * Ensures an identity identifier is normalized.
     */
    static normalizeIdentifier(identifier) {
        if (!identifier) return '';
        return identifier.toLowerCase().trim();
    }
}

module.exports = IdentityUtils;
