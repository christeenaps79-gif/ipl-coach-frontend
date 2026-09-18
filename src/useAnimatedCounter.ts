import { useEffect, useRef, useState } from "react";

/**
 * useAnimatedCounter
 * 
 * Animates a numeric value from 0 to the target over a specified duration.
 * Used for dashboard statistics to create a cinematic counting effect.
 * 
 * @param targetValue - The final number to animate to
 * @param duration - Animation duration in ms (default: 800)
 * @param enabled - Enable/disable the animation (useful for conditional rendering)
 * @returns The current animated value
 * 
 * Example:
 *   const displayValue = useAnimatedCounter(12345, 800, !!dashboard);
 *   <strong>{displayValue}</strong>
 */
export function useAnimatedCounter(
  targetValue: number | undefined,
  duration: number = 800,
  enabled: boolean = true
): number {
  const [displayValue, setDisplayValue] =
    useState<number>(0);

  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(0);

  useEffect(() => {
    const target = targetValue ?? 0;

    if (!enabled || target === 0) {
      setDisplayValue(target);
      return;
    }

    const animate = (now: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
        startValueRef.current = displayValue;
      }

      const elapsed = now - startTimeRef.current;
      const progress = Math.min(
        elapsed / duration,
        1
      );

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = Math.floor(
        startValueRef.current +
          (target - startValueRef.current) * eased
      );

      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current =
          requestAnimationFrame(animate);
      } else {
        frameRef.current = null;
        startTimeRef.current = null;
      }
    };

    frameRef.current =
      requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetValue, duration, enabled]);

  return displayValue;
}

/**
 * useAnimatedPercent
 * 
 * Animated percentage display (0-100 with % suffix).
 * Useful for win percentages, confidence scores, etc.
 * 
 * @param targetPercent - The final percentage
 * @param duration - Animation duration in ms (default: 800)
 * @param enabled - Enable/disable animation
 * @returns Formatted string like "87%"
 */
export function useAnimatedPercent(
  targetPercent: number | undefined,
  duration: number = 800,
  enabled: boolean = true
): string {
  const value = useAnimatedCounter(
    targetPercent,
    duration,
    enabled
  );

  return `${Math.round(value)}%`;
}
