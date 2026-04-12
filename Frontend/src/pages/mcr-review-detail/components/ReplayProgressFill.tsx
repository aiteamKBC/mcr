// MCR file header: Frontend\src\pages\mcr-review-detail\components\ReplayProgressFill.tsx
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


import { useEffect, useState } from 'react';

interface ReplayProgressFillProps {
  pct: number;
  className: string;
  replayKey: number;
  delayMs?: number;
  durationMs?: number;
  /** When false, keeps the bar at 0% and does not animate. */
  isActive?: boolean;
}

export default function ReplayProgressFill({
  pct,
  className,
  replayKey,
  delayMs = 0,
  durationMs = 1200,
  isActive = true,
}: ReplayProgressFillProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setWidth(0);
      return;
    }

    if (typeof window === 'undefined') {
      setWidth(pct);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setWidth(pct);
      return;
    }

    setWidth(0);
    const timeoutId = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        setWidth(pct);
      });
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, isActive, pct, replayKey]);

  return (
    <div
      className={className}
      style={{
        width: `${width}%`,
        transitionProperty: 'width, opacity',
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        opacity: width > 0 ? 1 : 0.7,
      }}
    />
  );
}
