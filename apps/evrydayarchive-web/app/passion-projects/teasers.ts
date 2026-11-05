/**
 * Stand-ins for the features that haven't been unveiled yet, shown as frosted "Coming soon"
 * arches: the first three on the home page block, and all four in the features row on
 * /passion-projects until the first feature publishes.
 *
 * `src` is a pre-blurred photo, so the sharp photo never reaches the browser. Make it from the
 * original at 400×531 (the arch's 64:85), zoomed 1.15×, saturation 1.15, then a Gaussian blur of
 * sigma 21 (60% of the frosted-glass blur Reed picked on the design canvas), saved as
 * `public/images/passion-projects/teaser-0N.webp`. Without one the arch shows a plain frosted fill.
 *
 * Sources: 01 urec-finishedimages-20, 02 nikki&nicole-jan15-08, 03 tedxvictoria2026-159,
 * 04 vedant-headshots-1.
 */
export type Teaser = {
  /** The question under the arch. */
  name: string;
  src: string | null;
};

export const TEASERS: Teaser[] = [
  { name: 'Someone you know?', src: '/images/passion-projects/teaser-01.webp' },
  { name: 'A business you love?', src: '/images/passion-projects/teaser-02.webp' },
  { name: 'You?', src: '/images/passion-projects/teaser-03.webp' },
  { name: 'Someone down the street?', src: '/images/passion-projects/teaser-04.webp' }
];
