type FrameEntry = {
  number: string;
  label: string;
  widthPx: number;
  mat: 'none' | 'sm' | 'md' | 'lg';
  title: string;
  offsetY: number;
  catalogRef: string;
  /** Mobile swipe strip: slide width as a vw value (e.g. 68 → "68vw") */
  mobileWidthVw: number;
  /** Mobile swipe strip: CSS aspect-ratio value (e.g. "2/3", "3/4") */
  mobileAspect: string;
};

export const FRAME_POOL: FrameEntry[] = [
  {
    number: '01',
    label: 'Events',
    widthPx: 200,
    mat: 'md',
    title: 'your favourite memory',
    offsetY: 0,
    catalogRef: 'EAC-2026-471',
    mobileWidthVw: 68,
    mobileAspect: '2/3'
  },
  {
    number: '02',
    label: 'Portraits',
    widthPx: 150,
    mat: 'md',
    title: 'doing what you love',
    offsetY: 0,
    catalogRef: 'EAC-2026-489',
    mobileWidthVw: 58,
    mobileAspect: '3/4'
  },
  {
    number: '03',
    label: 'Together',
    widthPx: 270,
    mat: 'md',
    title: 'the people you keep',
    offsetY: 0,
    catalogRef: 'EAC-2026-503',
    mobileWidthVw: 76,
    mobileAspect: '2/3'
  },
  {
    number: '04',
    label: 'In Practice',
    widthPx: 205,
    mat: 'md',
    title: 'the work you believe in',
    offsetY: 0,
    catalogRef: 'EAC-2026-517',
    mobileWidthVw: 64,
    mobileAspect: '4/5'
  },
  {
    number: '05',
    label: 'Action',
    widthPx: 290,
    mat: 'md',
    title: 'the moments that become stories',
    offsetY: 0,
    catalogRef: 'EAC-2026-534',
    mobileWidthVw: 74,
    mobileAspect: '3/4'
  },
  {
    number: '06',
    label: 'Your Idea',
    widthPx: 180,
    mat: 'md',
    title: 'whatever you can dream up',
    offsetY: 0,
    catalogRef: 'EAC-2026-562',
    mobileWidthVw: 62,
    mobileAspect: '2/3'
  }
];
