// MCR file header: Frontend\src\pages\mcr-dashboard\components\useReplayOnView.ts
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


import { useCallback, useEffect, useState } from 'react';

interface UseReplayOnViewOptions {
  threshold?: number;
  rootMargin?: string;
}

export default function useReplayOnView({
  threshold = 0.3,
  rootMargin = '0px',
}: UseReplayOnViewOptions = {}) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const ref = useCallback((nextNode: HTMLDivElement | null) => {
    setNode(nextNode);
  }, []);

  useEffect(() => {
    const browserWindow: (Window & typeof globalThis) | null =
      typeof window === 'undefined' ? null : window;

    if (!browserWindow) {
      setIsInView(true);
      setReplayKey(1);
      return;
    }

    const mediaQuery = browserWindow.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsInView(true);
      setReplayKey(1);
      return;
    }

    let hasActivated = false;

    const activateOnce = () => {
      if (hasActivated) return;
      hasActivated = true;
      setReplayKey((current) => current + 1);
    };

    if (!node) return;

    const checkVisibility = () => {
      const rect = node.getBoundingClientRect();
      const viewportHeight = browserWindow.innerHeight || document.documentElement.clientHeight;
      const viewportWidth = browserWindow.innerWidth || document.documentElement.clientWidth;

      const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
      const visibleWidth = Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0));
      const visibleArea = visibleHeight * visibleWidth;
      const totalArea = Math.max(rect.height * rect.width, 1);
      const intersectionRatio = visibleArea / totalArea;
      const visible = visibleArea > 0;

      setIsInView(visible);

      if (visible && intersectionRatio >= threshold) {
        activateOnce();
      }
    };

    const supportsIntersectionObserver =
      typeof browserWindow.IntersectionObserver !== 'undefined';

    if (supportsIntersectionObserver) {
      let frameId = 0;
      const observer = new browserWindow.IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;

          const visible = entry.isIntersecting || entry.intersectionRatio > 0;
          setIsInView(visible);

          if (visible) {
            activateOnce();
          }
        },
        {
          threshold,
          rootMargin,
        }
      );

      observer.observe(node);

      // Run an immediate viewport check so above-the-fold widgets do not stay
      // stuck at their pre-animation state while waiting for observer delivery.
      checkVisibility();
      frameId = browserWindow.requestAnimationFrame(checkVisibility);

      return () => {
        browserWindow.cancelAnimationFrame(frameId);
        observer.disconnect();
      };
    }

    let frameId = 0;

    const scheduleCheck = () => {
      browserWindow.cancelAnimationFrame(frameId);
      frameId = browserWindow.requestAnimationFrame(checkVisibility);
    };

    scheduleCheck();
    browserWindow.addEventListener('scroll', scheduleCheck, { passive: true });
    browserWindow.addEventListener('resize', scheduleCheck);

    return () => {
      browserWindow.cancelAnimationFrame(frameId);
      browserWindow.removeEventListener('scroll', scheduleCheck);
      browserWindow.removeEventListener('resize', scheduleCheck);
    };
  }, [node, rootMargin, threshold]);

  return {
    ref,
    isInView,
    replayKey,
  };
}
