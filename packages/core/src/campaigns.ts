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
  label: 'Passion Projects Winter 2026',
  season: 'Winter 2026',
  /** Package slugs as they are in production. Renaming one in admin makes it ineligible. */
  eligibleSlugs: ['evryday-package', 'together', 'in-practice'],
  ackVersion: 1,
  /** Placeholder until the contract's feature section is written; bump ackVersion when it changes. */
  copy: {
    apply: 'Apply to be featured in Passion Projects',
    disclaimer:
      "Featured sessions include a recorded conversation while we shoot, and a story on the website and Instagram. You read it before anything is published. Features are chosen for variety, and you'll be photographed either way.",
    acknowledgement:
      'I understand what a featured session involves, including the recorded conversation and the published story.',
    whatHappensNext:
      "I'll reply within 24 to 48 hours, usually to set up a short call before anything is confirmed."
  }
} as const;

export const isCampaignEligible = (slug: string | null | undefined): boolean =>
  (CAMPAIGN.eligibleSlugs as readonly string[]).includes(slug ?? '');

/** A booking's campaign id, readable. An earlier round's id no longer has a label, so shows as is. */
export const campaignLabel = (id: string): string => (id === CAMPAIGN.id ? CAMPAIGN.label : id);

export const APPLICANT_STATUSES = ['PENDING', 'ACCEPTED', 'NOT_FEATURED'] as const;
export type ApplicantStatus = (typeof APPLICANT_STATUSES)[number];

export const APPLICANT_STATUS_LABELS: Record<ApplicantStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  NOT_FEATURED: 'Not featured'
};

/** What `BookingRequest.campaignAnswers` holds. */
export type CampaignAnswers = {
  whatWorkingOn: string | null;
  aboutIt: string | null;
  link: string | null;
  othersInvolved: string | null;
  /** ISO timestamp, stamped by the server when the application was saved. */
  acknowledgedAt: string;
  ackVersion: number;
};
