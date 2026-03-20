/**
 * Feature Flags
 *
 * Defaults are set here in code (deploy-time configuration).
 * Override any flag at runtime via browser devtools:
 *
 *   window.__flags.enable('ROLLING_HERO')   // enable and persist to localStorage
 *   window.__flags.disable('ROLLING_HERO')  // disable and persist
 *   window.__flags.toggle('ROLLING_HERO')   // flip current value
 *   window.__flags.reset()                  // clear all overrides → revert to defaults
 *   window.__flags.list()                   // print table of all flags + current state
 *
 * Changes take effect immediately without a page reload.
 */

export const FEATURE_FLAGS = {
  ROLLING_HERO: {
    enabled: false,
    description: 'Rolling gallery wall hero on the homepage (replaces single-image hero)'
  },
  ROLLING_HERO_DRAG: {
    enabled: false,
    description:
      'Switches rolling hero from auto-scroll to drag/touch-scroll mode (dev/experimental)'
  },
  ROLLING_HERO_FIXED_TEXT: {
    enabled: false,
    description:
      'Rolling hero variant: fixed left text panel with cross-fading copy + photo-only marquee strip'
  }
} as const satisfies Record<string, { enabled: boolean; description: string }>;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

// ── Runtime resolution ────────────────────────────────────────────────────────

function getStoredOverride(flag: FeatureFlag): boolean | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(`flag:${flag}`);
  if (raw === null) return null;
  return raw === 'true';
}

export function getFlagValue(flag: FeatureFlag): boolean {
  const override = getStoredOverride(flag);
  return override !== null ? override : FEATURE_FLAGS[flag].enabled;
}

// ── Devtools API ──────────────────────────────────────────────────────────────

function dispatchFlagChange(flag: string, value: boolean) {
  window.dispatchEvent(new CustomEvent('feature-flag-change', { detail: { flag, value } }));
}

let devtoolsRegistered = false;

export function registerFeatureFlagsDevtools() {
  if (devtoolsRegistered || typeof window === 'undefined') return;
  devtoolsRegistered = true;

  const api = {
    enable(flag: string) {
      localStorage.setItem(`flag:${flag}`, 'true');
      dispatchFlagChange(flag, true);
      console.log(`[flags] ${flag} → enabled`);
    },
    disable(flag: string) {
      localStorage.setItem(`flag:${flag}`, 'false');
      dispatchFlagChange(flag, false);
      console.log(`[flags] ${flag} → disabled`);
    },
    toggle(flag: string) {
      const current = getFlagValue(flag as FeatureFlag);
      current ? api.disable(flag) : api.enable(flag);
    },
    reset(flag?: string) {
      if (flag) {
        localStorage.removeItem(`flag:${flag}`);
        dispatchFlagChange(flag, FEATURE_FLAGS[flag as FeatureFlag]?.enabled ?? false);
        console.log(`[flags] ${flag} → reset to default`);
      } else {
        Object.keys(FEATURE_FLAGS).forEach((k) => {
          localStorage.removeItem(`flag:${k}`);
          dispatchFlagChange(k, FEATURE_FLAGS[k as FeatureFlag].enabled);
        });
        console.log('[flags] all flags reset to defaults');
      }
    },
    list() {
      const rows = Object.entries(FEATURE_FLAGS).map(([k, v]) => ({
        flag: k,
        default: v.enabled,
        override: localStorage.getItem(`flag:${k}`) ?? '—',
        active: getFlagValue(k as FeatureFlag),
        description: v.description
      }));
      console.table(rows);
    }
  };

  (window as unknown as Record<string, unknown>)['__flags'] = api;
  console.log('[flags] devtools ready — try window.__flags.list()');
}
