/**
 * Scroll Memory - Arteo scroll persistence system
 *
 * Reference behavior: Instagram Web and Twitter/X Web.
 * - Stores scroll position in an in-memory Map so it survives re-renders.
 * - Disables browser native scroll restoration for full app control.
 * - Avoids localStorage because scroll position only matters for the current session.
 */

// Disable browser-managed scroll restoration so Arteo can manage it directly.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Global map: route key to scrollY.
// Lives for the whole session and is not reset by React re-renders.
const scrollMap = new Map<string, number>();

export const scrollMemory = {
  /**
   * Save the current scroll position for a key.
   */
  save(key: string, y: number): void {
    // Do not save 0 for home/feed routes to avoid accidental browser resets.
    const isHome = key === '/' || key === '/feed';
    if (isHome && y <= 0) return;
    
    if (y >= 0) {
      scrollMap.set(key, y);
    }
  },

  /**
   * Read a saved scroll position, or 0 when none exists.
   */
  get(key: string): number {
    return scrollMap.get(key) ?? 0;
  },

  /**
   * Clear the saved scroll position for a key.
   */
  clear(key: string): void {
    scrollMap.delete(key);
  },

  /**
   * Check whether a key has a saved scroll position.
   */
  has(key: string): boolean {
    return scrollMap.has(key) && (scrollMap.get(key) ?? 0) > 0;
  },
};

