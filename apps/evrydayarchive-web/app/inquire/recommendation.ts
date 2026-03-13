/**
 * Questionnaire recommendation engine.
 *
 * TODO: This module is a stub. The full business logic — mapping all 7 answers
 * to a complete package configuration with modifier pricing — needs to be
 * implemented before the questionnaire produces meaningful recommendations.
 *
 * See requirements/guided-questionaire.md for the complete mapping spec.
 *
 * ── What needs to be implemented ─────────────────────────────────────────────
 *
 * 1. Q1 → base package slug (partial stub exists below)
 *    - answers.q1b holds the group size number (as a string) when the user
 *      selects "group" on Q1 and answers the follow-up question. Use this to
 *      inform session length, image count, and any group-size modifiers.
 *
 * 2. Q2 override logic:
 *    - "work-creative" or "product-project" → force slug to "in-practice"
 *      regardless of Q1 answer
 *    - "not-sure" → flag for exploration mode (handled by isExplorationMode)
 *
 * 3. Q3 → additional image modifier:
 *    - "few-favorites" (5–7):  compare to base package default; if above → add
 *      additional-image modifier at +$7/image
 *    - "solid-set" (10–15):    typically matches Together/In Practice defaults
 *    - "full-collection" (20+): check if > base + 15 → recommend package builder
 *      instead (set config.tooCustom = true)
 *
 * 4. Q4 → session length modifier:
 *    - "short" (30–45 min):    may reduce from base; no price change
 *    - "standard" (60 min):    base default for most packages
 *    - "extended" (90 min):    add +$50 time-extension modifier
 *    - "multiple-locations":   set sessionLengthMinutes = 120+, add +$100
 *    - triggers Q5 to be shown
 *
 * 5. Q5 (conditional) → location modifier:
 *    - "2-locations":           add +$40 per-location modifier; enforce min 90 min
 *    - "3-plus-locations":      add +$80 per-location modifier; enforce min 120 min
 *    - Auto-adjustment rule: if locationCount > 1 → sessionLengthMinutes >= 90
 *
 * 6. Q6 → discount flags:
 *    - "student":               studentDiscount = true  → -20% of total price
 *    - "nonprofit":             nonprofitFlag = true    → manual follow-up note
 *    - "specific-budget":       customBudgetNote = q6Budget text
 *    - "no-constraints":        no change
 *
 * 7. Q7 → edit level modifier:
 *    - "light":  add light-edits modifier at -$15
 *    - "full":   standard; no price change
 *    - "not-sure": default to full
 *
 * ── Auto-adjustment rules ─────────────────────────────────────────────────────
 *    - If locationCount > 1 → sessionLengthMinutes minimum = 90
 *    - If sessionLengthMinutes = 90 → add +$50 if not already applied
 *    - If sessionLengthMinutes ≥ 120 → add +$100 if not already applied
 *    - If requestedImages > baseDefault + 15 → set config.tooCustom = true
 *
 * ── Edge cases ────────────────────────────────────────────────────────────────
 *    - If packageSlug can't be resolved from the DB → fall back to "evryday"
 *    - If calculated total is negative → floor to base price, log warning
 *    - Student discount applied after all modifiers are summed
 */

import type { Answers } from './questions';

export type AppliedModifier = {
  label: string;
  priceDeltaCents: number;
};

export type PackageConfig = {
  packageSlug: string;
  appliedModifiers: AppliedModifier[];
  modifiersTotalCents: number;
  discountCents: number;
  studentDiscount: boolean;
  nonprofitFlag: boolean;
  customBudgetNote?: string;
  /** When true, the image count is too high for the questionnaire — direct to package builder. */
  tooCustom?: boolean;
};

// ── Q1 → package slug mapping ─────────────────────────────────────────────────
// TODO: expand once Q2 override logic is implemented
const Q1_SLUG_MAP: Record<string, string> = {
  'just-me': 'evryday',
  'me-and-someone': 'together',
  group: 'together',
  business: 'in-practice',
  event: 'as-it-unfolds'
};

/**
 * Computes a package configuration from the user's questionnaire answers.
 *
 * Currently a stub — returns the correct base package slug from Q1 but does not
 * apply any modifier logic. Fill in the TODO sections above before launch.
 */
export function computeRecommendation(answers: Answers): PackageConfig {
  // TODO: implement full Q2–Q7 processing (see module-level TODO above)
  const packageSlug = Q1_SLUG_MAP[answers.q1 ?? ''] ?? 'evryday';

  return {
    packageSlug,
    appliedModifiers: [],
    modifiersTotalCents: 0,
    discountCents: 0,
    studentDiscount: false,
    nonprofitFlag: false
  };
}

/**
 * Returns true when the user answered "not sure" to both Q2 and Q3, indicating
 * they need exploration mode rather than a concrete recommendation.
 */
export function isExplorationMode(answers: Answers): boolean {
  return answers.q2 === 'not-sure' && answers.q3 === 'not-sure';
}
