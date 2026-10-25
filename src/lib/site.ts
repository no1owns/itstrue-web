// Site-wide settings. Blank strings mean "Needs confirmation": the pages
// leave those details out rather than showing placeholder text.
import { z } from 'astro/zod';
import raw from '../data/site.json';

const optionalText = z.string().transform((v) => v.trim() || undefined);
const optionalEmail = z.union([z.literal(''), z.email()]).transform((v) => v || undefined);

const schema = z.object({
  name: z.string().min(1),
  description: optionalText,
  contact: z.object({
    general: optionalEmail,
    bookings: optionalEmail,
    press: optionalEmail,
  }),
  social: z.array(z.object({ platform: z.string().min(1), url: z.url() })),
  shopUrl: z.union([z.literal(''), z.url()]).transform((v) => v || undefined),
  announcement: optionalText,
});

export const site = schema.parse(raw);

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
