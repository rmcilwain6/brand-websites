import { describe, expect, it } from 'vitest';

import { campaignReply } from './campaign-replies';

describe('campaignReply', () => {
  it('has nothing to send while the application is pending', () => {
    expect(campaignReply('PENDING', 'Jordan Lee')).toBeNull();
  });

  it('accepts by first name', () => {
    const reply = campaignReply('ACCEPTED', 'Jordan Lee');

    expect(reply).toMatch(/^Hi Jordan,/);
    expect(reply).toContain("I'd love to feature your work");
  });

  it('tells someone not featured that their session is unaffected', () => {
    const reply = campaignReply('NOT_FEATURED', 'Jordan Lee');

    expect(reply).toMatch(/^Hi Jordan,/);
    expect(reply).toContain("doesn't change anything about your session");
  });

  it('still greets someone with a blank name', () => {
    expect(campaignReply('ACCEPTED', '  ')).toMatch(/^Hi there,/);
  });
});
