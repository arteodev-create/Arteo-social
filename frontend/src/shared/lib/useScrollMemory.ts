import { useLayoutEffect, useRef } from 'react';
import { useNavigationType } from 'react-router-dom';
import { scrollMemory } from './scrollMemory';

/**
 * useScrollMemory
 * Restores scroll position for a specific scroll container instead of the window.
 * Keeps SPA page transitions isolated between independently scrolling surfaces.
 */
export function useScrollMemory(key: string | null | undefined, scrollRef: React.RefObject<HTMLElement | null>) {
  const isRestoring = useRef(false);

  // === 1. Save position ===
  const lastKeyRef = useRef(key);
  const isLockedRef = useRef(false);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!key || !el) return;

    // Lock saving briefly after key changes to avoid capturing stale scroll from the previous page.
    if (lastKeyRef.current !== key) {
        isLockedRef.current = true;
        lastKeyRef.current = key;
        // Unlock after the new page has had a moment to settle.
        const timer = setTimeout(() => { isLockedRef.current = false; }, 100);
        return () => clearTimeout(timer);
    }

    const handleScroll = () => {
      if (isRestoring.current || isLockedRef.current) return;
      // Save the container scrollTop.
      scrollMemory.save(key, el.scrollTop);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
  }, [key, scrollRef]);

  // === 2. Restore position ===
  const navType = useNavigationType();

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!key || !el) return;
    
    // Preserve home/feed position more aggressively than detail-style pages.
    const isHomePage = key === '/' || key === '/feed';

    if (navType === 'PUSH' && !isHomePage) {
        // Reset non-home pages on forward navigation.
        scrollMemory.save(key, 0);
        el.scrollTop = 0;
        isRestoring.current = true;
        requestAnimationFrame(() => { isRestoring.current = false; });
        return;
    }

    const targetY = scrollMemory.get(key);
    isRestoring.current = true;

    // Reset to top if there is no saved position or this is a fresh non-home page.
    if (targetY <= 0) {
      el.scrollTop = 0;
      isRestoring.current = false;
      return;
    }

    // Restore patiently because feed content can arrive asynchronously.
    let rafId: number;
    let attempts = 0;
    const MAX_ATTEMPTS = 150;

    const tryRestore = () => {
      const container = scrollRef.current;
      if (!container) return;
      attempts++;
      
      const currentContentHeight = container.scrollHeight;
      const neededHeight = targetY + container.clientHeight;

      // Restore once content is tall enough or the wait budget has elapsed.
      if (currentContentHeight >= neededHeight || attempts >= MAX_ATTEMPTS) {
        container.scrollTop = targetY;
        // Apply once more on the next frame to beat browser scroll reset.
        requestAnimationFrame(() => {
            if (container) container.scrollTop = targetY;
            isRestoring.current = false; 
        });
        return;
      }

      rafId = requestAnimationFrame(tryRestore);
    };

    rafId = requestAnimationFrame(tryRestore);

    return () => {
      cancelAnimationFrame(rafId);
      isRestoring.current = false;
    };
  }, [key, scrollRef, navType]);
}

