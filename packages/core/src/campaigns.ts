/**
 * Campaigns — the single source for the current booking campaign.
 *
 * A booking stores `CAMPAIGN.id` rather than a boolean, so the next round only needs a
 * new id here and no schema change. `ackVersion` is saved with each application: bump it
 * whenever the acknowledgement wording changes, so it's clear what each applicant agreed to.
 *
 * Client components should import from '@repo/core/campaigns' rather than '@repo/core':
 * the package root re-exports every Zod schema, which would otherwise ship to the browser.
 */

export const CAMPAIGN = {
  id: 'passion-projects-winter-2026',
  /** Package slugs as they are in production. Renaming one in admin makes it ineligible. */
  eligibleSlugs: ['evryday-package', 'together', 'in-practice'],
  ackVersion: 1
} as const;

export const isCampaignEligible = (slug: string | null | undefined): boolean =>
  (CAMPAIGN.eligibleSlugs as readonly string[]).includes(slug ?? '');
