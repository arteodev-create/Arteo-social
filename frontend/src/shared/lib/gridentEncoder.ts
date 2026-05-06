/**
 * ND781 AI Gradient Encryption & Identity Engine
 * Standardized for Arteo 2.0 noise visual signatures.
 * Immutable palette mapping so older AI identities keep their colors when new palettes are added.
 */

import { ALL_PALETTES } from './palettes';

export interface GradientIdentity {
    username: string;
    gradianCode: string; // Format: ND781-V1-XXXX, where V1 is the palette version
    colors: string[];
    css: string;
    meshCss: string;
    pixelMatrix: string[]; // 64-color matrix for the 8x8 noise avatar effect
    noiseOpacity: number;
    version: number;
}

/**
 * Arteo Official Identity Filters - [ND781]
 * Recreates the pixelated metallic grain visual effect.
 */
export const ARTEO_PIXEL_FILTER_SVG = `
  <filter id="pixelNoise" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" result="fadedNoise" />
    <feBlend in="SourceGraphic" in2="fadedNoise" mode="overlay" />
  </filter>
`.trim();

export class GridentEncoder {
    // Current system palette version used by newly generated identities.
    private static CURRENT_VERSION = 1;

    /**
     * Deterministic Hash Function
     */
    private static hash(str: string): number {
        let hash = 2166136261;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return Math.abs(hash);
    }

    private static getHexID(seed: number): string {
        return (seed % 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    }

    /**
     * Generate an immutable AI identity.
     * @param username AI username.
     * @param forcedVersion Optional palette version used to preserve older colors.
     */
    public static generate(username: string, forcedVersion: number = 1): GradientIdentity {
        const seed = this.hash(username.toLowerCase());
        const hexID = this.getHexID(seed);
        const version = forcedVersion;
        
        // Immutable lookup: only use colors from the requested version range.
        const v1_count = 58; // Fixed V1 color count
        let paletteIndex = 0;
        
        if (version === 1) {
            paletteIndex = seed % v1_count;
        } else {
            paletteIndex = seed % v1_count; // Fallback to V1
        }

        const palette = ALL_PALETTES[paletteIndex] || ALL_PALETTES[0];
        const gradianCode = `ND781-V${version}-${hexID}`;
        const angle = (seed % 360);
        
        // Enhanced mesh gradient for maximum vibrancy and depth
        const meshCss = `
            radial-gradient(at 0% 0%, ${palette.colors[0]} 0%, transparent 60%),
            radial-gradient(at 100% 0%, ${palette.colors[1]} 0%, transparent 60%),
            radial-gradient(at 100% 100%, ${palette.colors[2] || palette.colors[0]} 0%, transparent 60%),
            radial-gradient(at 0% 100%, ${palette.colors[1]} 0%, transparent 60%),
            radial-gradient(at 50% 50%, ${palette.colors[0]} 0%, transparent 80%)
        `.trim().replace(/\s+/g, ' ');

        // Generate 8x8 Pixel Matrix (64 colors)
        const pixelMatrix: string[] = [];
        const baseColors = palette.colors;
        for (let i = 0; i < 64; i++) {
            // Mix base colors deterministically for each pixel
            const colorIdx = (seed + i * 13) % baseColors.length;
            pixelMatrix.push(baseColors[colorIdx]);
        }

        return {
            username,
            gradianCode,
            version,
            colors: palette.colors,
            css: `linear-gradient(${angle}deg, ${palette.colors.join(', ')})`,
            meshCss,
            pixelMatrix,
            noiseOpacity: 0.12 + (seed % 8) / 100
        };
    }

    public static verify(username: string, code: string): boolean {
        // Extract version from the code.
        const parts = code.split('-');
        const versionStr = parts[1]?.replace('V', '');
        const version = versionStr ? parseInt(versionStr) : 1;
        
        const identity = this.generate(username, version);
        return identity.gradianCode === code;
    }
}

