// Homepage content for the It's True Entertainments owner-review preview
// (handoff "Homepage Work 1", 2026-10-31). Copy comes from the handoff's
// content/homepage_copy.md with internal review labels removed, and every
// link follows content/navigation_map.md: interior pages don't exist yet, so
// links point at sections on this page.

export const brand = {
  /** Parent name, always with the final S. */
  name: 'It’s True Entertainments',
  tagline: 'Twin Way. No Other Way.',
  /** Owner spelling, preserved on purpose. */
  email: 'Itstrueentertaiment@gmail.com',
  phones: [
    { label: '443-977-2750', href: 'tel:4439772750' },
    { label: '443-801-7422', href: 'tel:4438017422' },
  ],
  /** Owner-supplied; confirm before public launch. */
  address: '23 E North Ave, Baltimore, MD 21202',
  previewNotice: 'Pre-launch preview for owner review. Not the final website.',
} as const;

export const mailto = `mailto:${brand.email}`;

export interface Link {
  label: string;
  href: string;
}

/** Header and drawer navigation (navigation map: Proposal). */
export const primaryNav: Link[] = [
  { label: 'About', href: '#about' },
  { label: 'Our Work', href: '#work' },
  { label: 'Music', href: '#music' },
  { label: 'Podcast & Media', href: '#twinway' },
  { label: 'Acting', href: '#work' },
  { label: 'Fashion', href: '#fashion' },
];

export interface Discipline {
  no: string;
  name: string;
  desc: string;
  href: string;
  tag?: string;
}

/** Nine-discipline index. Services without their own section go to #book. */
export const disciplines: Discipline[] = [
  { no: '01', name: 'Acting', desc: 'Screen work and casting inquiries.', href: '#book' },
  { no: '02', name: 'Modeling', desc: 'Two distinct personalities. One unmistakable presence.', href: '#book' },
  { no: '03', name: 'Dance & Tap', desc: 'Tap and hip-hop performance, choreography and workshops.', href: '#musical' },
  { no: '04', name: 'Music', desc: 'Moneytakers. The catalog on every platform.', href: '#music' },
  { no: '05', name: 'Podcast & Radio', desc: 'TwinWay Podcast. Candid conversations.', href: '#twinway' },
  {
    no: '06',
    name: 'Fashion',
    desc: 'Spend DaT Bread. The clothing brand.',
    href: '#fashion',
    tag: 'In development',
  },
  { no: '07', name: 'Production & Engineering', desc: 'Production and engineering for artists.', href: '#book' },
  { no: '08', name: 'Hosting', desc: 'Hosting and on-air appearances.', href: '#book' },
  { no: '09', name: 'Brand Partnerships', desc: 'Ambassador and brand collaborations.', href: '#book' },
];

/** Owner-supplied official links. Handles are reproduced exactly. */
export const channels = {
  moneytakers: {
    appleMusic: 'https://music.apple.com/us/artist/moneytakers/1387557101',
    spotify: 'https://open.spotify.com/artist/27bB0UTbrKdFsFkFjeCXtE',
    youtube: 'https://youtube.com/@moneytakers8618',
    instagram: 'https://www.instagram.com/moneytakers_/',
    tiktok: 'https://www.tiktok.com/@moneytakers_',
  },
  twinway: {
    youtube: 'https://youtube.com/@twinwaypodcast',
    instagram: 'https://www.instagram.com/twinway.podcast/',
  },
  twins: {
    instagram: { url: 'https://www.instagram.com/officializetwins/', handle: '@officializetwins' },
    tiktok: { url: 'https://www.tiktok.com/@twinchinoandtwincasso', handle: '@twinchinoandtwincasso' },
  },
} as const;

export const bookingPaths = [
  {
    title: 'Perform & appear',
    text: 'Music and tap performance, hosting and on-air appearances, media interviews.',
  },
  { title: 'Screen & style', text: 'Acting and casting, modeling and runway, brand partnerships.' },
  {
    title: 'Create & develop',
    text: 'Production and engineering, artist development and management inquiries.',
  },
];

export const footerExplore: Link[] = [
  { label: 'About', href: '#about' },
  { label: 'Music', href: '#music' },
  { label: 'Acting', href: '#work' },
  { label: 'Dance', href: '#musical' },
  { label: 'Modeling', href: '#work' },
];

export const footerBrands: Link[] = [
  { label: 'Moneytakers', href: '#music' },
  { label: 'TwinWay Podcast', href: '#twinway' },
  { label: 'Spend DaT Bread', href: '#fashion' },
  { label: 'TRAP TAP TWINS', href: '#musical' },
  { label: 'Events', href: '#events' },
];
