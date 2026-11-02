import type { ApplicantStatus } from '@repo/core/campaigns';

/**
 * What Reed sends an applicant once he's decided, pasted into a reply by hand. Nothing here is
 * sent automatically. DRAFT wording: Reed still has to write the final copy.
 */
const REPLIES: Partial<Record<ApplicantStatus, (firstName: string) => string>> = {
  ACCEPTED: (firstName) =>
    `Hi ${firstName},

Thanks for applying to Passion Projects. I'd love to feature your work this round.

Here's what that means: alongside your session, I'll record the audio of our conversation while we shoot (no video), and I'll write a story from it for the website and Instagram. You'll read it before anything is published.

The contract covers the feature as well, and I'll send it once we've settled the date. If you have any questions before then, just reply to this email.

Reed`,
  NOT_FEATURED: (firstName) =>
    `Hi ${firstName},

Thanks for applying to Passion Projects, and for telling me about what you're working on. I choose features for variety across each round, and I won't be able to feature yours this time.

This doesn't change anything about your session, and I'm still looking forward to photographing you.

Reed`
};

/** The reply for a status, or null while there's no decision to send. */
export const campaignReply = (status: ApplicantStatus, name: string): string | null => {
  const firstName = name.trim().split(/\s+/)[0] || 'there';
  return REPLIES[status]?.(firstName) ?? null;
};
