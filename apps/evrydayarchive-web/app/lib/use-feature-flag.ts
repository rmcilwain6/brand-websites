'use client';

import { useEffect, useState } from 'react';

import { FEATURE_FLAGS, type FeatureFlag, registerFeatureFlagsDevtools } from './feature-flags';

/**
 * Returns the current value of a feature flag.
 *
 * Initialises from the static config (SSR-safe, no hydration mismatch),
 * then in the browser reads any localStorage override and listens for
 * runtime changes triggered via window.__flags devtools API.
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  // Always initialise from config — avoids SSR/hydration mismatch.
  // localStorage override is applied in the effect below.
  const [value, setValue] = useState<boolean>(FEATURE_FLAGS[flag].enabled);

  useEffect(() => {
    // Register devtools API on first use (idempotent)
    registerFeatureFlagsDevtools();

    // Apply any stored override
    const stored = localStorage.getItem(`flag:${flag}`);
    if (stored !== null) {
      setValue(stored === 'true');
    }

    // React to runtime changes (window.__flags.toggle etc.)
    const handler = (e: Event) => {
      const { flag: changedFlag, value: newValue } = (
        e as CustomEvent<{ flag: string; value: boolean }>
      ).detail;
      if (changedFlag === flag) {
        setValue(newValue);
      }
    };

    window.addEventListener('feature-flag-change', handler);
    return () => window.removeEventListener('feature-flag-change', handler);
  }, [flag]);

  return value;
}
