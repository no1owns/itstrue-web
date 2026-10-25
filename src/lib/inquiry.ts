// Kept free of imports: the /book page's client script loads this file.

/** Inquiry types offered on /book. Edit labels here; values are sent with the form. */
export const inquiryTypes = [
  { value: 'live-booking', label: 'Live performance booking' },
  { value: 'appearance', label: 'Appearance or hosting' },
  { value: 'podcast', label: 'Podcast guest or sponsorship' },
  { value: 'music-production', label: 'Music production' },
  { value: 'brand-partnership', label: 'Brand partnership' },
  { value: 'press', label: 'Press or media' },
  { value: 'general', label: 'Something else' },
] as const;
