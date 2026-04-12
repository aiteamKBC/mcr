// MCR file header: Frontend\src\pages\mcr-dashboard\components\AnimatedNumber.tsx
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


import { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  durationMs?: number;
  className?: string;
  replayKey?: number;
  /** When false, keeps the number at initialValue and does not animate. */
  isActive?: boolean;
  /** Starting value when inactive or at the start of an animation. */
  initialValue?: number;
}

// Smooth easing function used to animate the number value.
// This gives a nice decelerating curve as the animation approaches the end.
const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);

export default function AnimatedNumber({
  value,
  decimals = 0,
  durationMs = 1100,
  className,
  replayKey = 0,
  isActive = true,
  initialValue = 0,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(initialValue);

  useEffect(() => {
    if (!isActive) {
      setDisplayValue(initialValue);
      return;
    }

    // Avoid animation during server-side rendering.
    if (typeof window === 'undefined') {
      setDisplayValue(value);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Honor the user's reduced motion preference by disabling animation.
    if (mediaQuery.matches) {
      setDisplayValue(value);
      return;
    }

    let frameId = 0;
    let startTime: number | null = null;
    const startValue = initialValue;
    const delta = value - startValue;

    // Reset displayed value before running the animation.
    setDisplayValue(startValue);

    // If there is no change, render the value immediately.
    if (delta === 0) {
      setDisplayValue(value);
      return;
    }

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easedProgress = easeOutCubic(progress);

      // Interpolate the display value from startValue to target value.
      setDisplayValue(startValue + delta * easedProgress);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [durationMs, initialValue, isActive, replayKey, value]);

  // Format the value with the requested number of decimal places.
  return <span className={className}>{displayValue.toFixed(decimals)}</span>;
}
