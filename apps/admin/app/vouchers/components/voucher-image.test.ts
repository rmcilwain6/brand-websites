import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  VOUCHER_IMAGE_ASSETS,
  type VoucherImageAssets,
  type VoucherImageData,
  buildVoucherSvg,
  voucherImageCopy
} from './voucher-image';

const fakeAssets: VoucherImageAssets = {
  sans400: 'U0FOUzQwMA==',
  sans700: 'U0FOUzcwMA==',
  mono600: 'TU9OTzYwMA==',
  logo: 'TE9HTw=='
};

const referral: VoucherImageData = {
  code: 'EAC-7KQ2',
  discountLabel: '$15',
  expiresLabel: 'December 31, 2027',
  holderName: 'Sam Patel',
  isReferral: true
};

const manual: VoucherImageData = {
  code: 'EAC-H4ND',
  discountLabel: '20%',
  expiresLabel: null,
  holderName: null,
  isReferral: false
};

describe('voucherImageCopy', () => {
  it('thanks a referrer by first name', () => {
    expect(voucherImageCopy(referral).headline).toBe('Thank you, Sam.');
  });

  it('addresses a hand-made voucher to its holder', () => {
    expect(voucherImageCopy({ ...manual, holderName: 'Ana Lee' }).headline).toBe('For Ana.');
    expect(voucherImageCopy(manual).headline).toBe('A little something for you.');
  });

  it('caps a very long first name', () => {
    const { headline } = voucherImageCopy({ ...referral, holderName: 'Bartholomewalexander Q' });
    expect(headline).toBe('Thank you, Bartholomewalex….');
  });
});

describe('buildVoucherSvg', () => {
  it('shows the code, discount, and expiry with the fonts and logo embedded', () => {
    const svg = buildVoucherSvg(referral, fakeAssets);

    expect(svg).toContain('width="1080" height="1350"');
    expect(svg).toContain('>EAC-7KQ2</text>');
    expect(svg).toContain('>$15 off</text>');
    expect(svg).toContain('Good until December 31, 2027 · One per session');
    expect(svg).toContain(`data:font/woff;base64,${fakeAssets.mono600}`);
    expect(svg).toContain(`data:image/svg+xml;base64,${fakeAssets.logo}`);
  });

  it('leaves out the expiry when there is none', () => {
    const svg = buildVoucherSvg(manual, fakeAssets);

    expect(svg).toContain('>20% off</text>');
    expect(svg).toContain('>One per session</text>');
    expect(svg).not.toContain('Good until');
  });

  it('escapes names so they cannot break the SVG', () => {
    const svg = buildVoucherSvg({ ...referral, holderName: 'Jo&<b>' }, fakeAssets);

    expect(svg).toContain('Thank you, Jo&amp;&lt;b&gt;.');
    expect(svg).not.toContain('<b>');
  });

  // Set VOUCHER_IMAGE_OUT=/some/dir to write sample SVGs with the real fonts, to look at them.
  it.skipIf(!process.env.VOUCHER_IMAGE_OUT)('writes previews', async () => {
    const publicDir = join(__dirname, '../../../public');
    const real = Object.fromEntries(
      await Promise.all(
        Object.entries(VOUCHER_IMAGE_ASSETS).map(async ([key, path]) => [
          key,
          (await readFile(join(publicDir, path))).toString('base64')
        ])
      )
    ) as VoucherImageAssets;
    for (const data of [referral, manual]) {
      await writeFile(
        join(process.env.VOUCHER_IMAGE_OUT!, `${data.code}.svg`),
        buildVoucherSvg(data, real)
      );
    }
  });
});
