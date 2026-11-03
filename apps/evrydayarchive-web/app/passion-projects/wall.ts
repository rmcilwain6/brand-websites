/**
 * The salon wall: past work only. Each slot has a shape from the wall plan on the Notion landing
 * page task, and the photos are the home page's until the real picks are exported. Portrait slots
 * need portrait photos and landscape slots need landscape ones.
 *
 * Spans are columns × rows: 12 columns on desktop and 6 on phones. `phone: null` is desktop only.
 * Phones show the slots in number order, so their spans have to tile the 6 columns with no holes,
 * and only the slots at the end of the list can be left off.
 */

export type WallSlot = {
  /** The number on the frame. */
  number: string;
  src: string;
  alt: string;
  title: string;
  /** "Place · Mon YYYY". Left off when it isn't known. */
  subtitle?: string;
  desktop: [columns: number, rows: number];
  /**
   * Desktop only, optional: pins the frame's top-left cell as [column, row], counted from 1
   * (rows are 40px plus the gap). Use it to leave a deliberate gap; the other frames still pack
   * around it. Without it, the frame takes the first space it fits.
   */
  desktopAt?: [column: number, row: number];
  phone: [columns: number, rows: number] | null;
};

const IMAGES = '/images/passion-projects';

export const WALL: WallSlot[] = [
  {
    number: '01',
    src: `${IMAGES}/rr-brewing-3.webp`,
    alt: 'A baker in a cap and flour-dusted apron pressing out dough on a steel counter, glancing up',
    title: 'Yuki from The Rusted Rake Brewing Company',
    subtitle: 'Nanoose Bay · Jun 2026',
    desktop: [3, 9],
    phone: [4, 9]
  },
  {
    number: '02',
    src: `${IMAGES}/rr-brewing-23.webp`,
    alt: "A bearded brewer in a ball cap grinning in the brewery's equipment room, holding up a plastic jug",
    title: 'Warren from The Rusted Rake Brewing Company',
    subtitle: 'Nanoose Bay · Jun 2026',
    desktop: [2, 7],
    phone: [2, 5]
  },
  {
    number: '03',
    src: `${IMAGES}/img-1410.webp`,
    alt: 'A photographer in a toque and orange media bib laughing, camera on a strap, with snow-covered trees behind',
    title: 'Angus at Big White Winter Rally',
    subtitle: 'Kamloops · Dec 2025',
    desktop: [2, 5],
    phone: [2, 4]
  },
  {
    number: '04',
    src: `${IMAGES}/jess-the-yota-04.webp`,
    alt: 'A woman in sunglasses leaning on a lifted teal 4Runner on a dry hillside under a clear blue sky',
    title: "Jess and the 'Yota",
    subtitle: 'Kamloops · Jan 2026',
    desktop: [4, 6],
    phone: [6, 6]
  },
  {
    number: '05',
    src: `${IMAGES}/rr-brewing-26.webp`,
    alt: 'A woman in waders and blue gloves laughing in a field of tall leafy plants, with evergreens behind',
    title: 'Jodie from The Rusted Rake Brewing Company',
    subtitle: 'Nanoose Bay · Jun 2026',
    desktop: [2, 6],
    phone: [2, 5]
  },
  {
    number: '06',
    src: `${IMAGES}/drews-pokemon-camp-06.webp`,
    alt: 'A man pointing at a card on the table while a boy in glasses watches, in a game shop lined with colourful posters',
    title: "Drew's Pokemon Camp",
    subtitle: 'Victoria · Mar 2026',
    desktop: [3, 4],
    phone: [4, 5]
  },
  {
    number: '07',
    src: `${IMAGES}/55plus-bc-games-kamloops2026-8-ball-032.webp`,
    alt: 'A grey-bearded man in glasses leaning over a blue pool table, racking the balls under a bright light',
    title: '8-Ball at the 55+ BC Games',
    subtitle: 'Kamloops · Sep 2026',
    desktop: [2, 6],
    phone: [3, 7]
  },
  {
    number: '08',
    src: `${IMAGES}/updog-17.webp`,
    alt: 'A smiling vendor in an apron and blue gloves crouching beside a corn dog cart\'s hand-painted "What\'s UPDOG?" sign',
    title: 'David and UPDOG',
    subtitle: 'Victoria · Mar 2026',
    desktop: [3, 4],
    phone: [3, 3]
  },
  {
    number: '09',
    src: `${IMAGES}/55plus-bc-games-kamloops-hockey-16.webp`,
    alt: 'A goalie in a purple jersey skating across the ice as the two teams line up to shake hands',
    title: 'Hockey at the 55+ BC Games',
    subtitle: 'Kamloops · Sep 2026',
    desktop: [2, 4],
    phone: [3, 4]
  },
  {
    number: '10',
    src: `${IMAGES}/urec-finishedimages-21.webp`,
    alt: 'A young man in a pink shirt sitting on a park bench in low sun, looking off to the side',
    title: 'Ruben from UREC',
    subtitle: 'Victoria · Feb 2026',
    desktop: [2, 6],
    phone: [2, 5]
  },
  {
    number: '11',
    src: `${IMAGES}/angus-1.webp`,
    alt: 'A blue rally car spraying snow as it slides past two people in bibs on a snowy forest road',
    title: 'Angus at Big White Winter Rally',
    subtitle: 'Kamloops · Dec 2025',
    desktop: [3, 4],
    phone: [4, 5]
  },
  {
    number: '12',
    src: `${IMAGES}/tedxvictoria2026-163.webp`,
    alt: 'A speaker standing alone on the red circle of a dark stage, mid-talk',
    title: 'Naomi Casiro at TEDxVictoria 2026',
    subtitle: 'Victoria · Oct 2026',
    desktop: [2, 5],
    phone: null
  },
  {
    number: '13',
    src: `${IMAGES}/tedxvictoria2026-087.webp`,
    alt: 'Three women in black with event lanyards, smiling under a TEDxVictoria "Ideas change everything" banner in a busy lobby',
    title: 'TEDxVictoria Organizing Team',
    subtitle: 'Victoria · Oct 2026',
    desktop: [2, 6],
    desktopAt: [11, 19],
    phone: null
  },
  {
    number: '14',
    src: `${IMAGES}/science-of-wine-2026-39.webp`,
    alt: 'A young man holding a wine bottle and cork, chatting with an older man holding a glass of red',
    title: 'Nic from Sagewood Winery',
    subtitle: 'Victoria · Mar 2026',
    desktop: [2, 5],
    desktopAt: [6, 21],
    phone: null
  },
  {
    number: '15',
    src: `${IMAGES}/tedxvictoria2026-107.webp`,
    alt: 'A performer in a cap and denim jacket singing into a microphone under blue light on a dark stage',
    title: 'PINDN at TEDxVictoria 2026',
    subtitle: 'Victoria · Oct 2026',
    desktop: [4, 4],
    phone: null
  },
  {
    number: '16',
    src: `${IMAGES}/tedxvictoria2026-173.webp`,
    alt: 'Three dancers on a blue-lit stage in front of giant TEDxVictoria letters',
    title: 'Broken Rhythms Dance Company',
    subtitle: 'Victoria · Oct 2026',
    desktop: [3, 4],
    desktopAt: [8, 21],
    phone: null
  }
];
