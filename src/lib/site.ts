// Site-wide settings. Blank strings mean "Needs confirmation": the pages
// leave those details out rather than showing placeholder text.
import { z } from 'astro/zod';
import raw from '../data/site.json';

const optionalText = z.string().transform((v) => v.trim() || undefined);
const optionalEmail = z.union([z.literal(''), z.email()]).transform((v) => v || undefined);

const schema = z.object({
  name: z.string().min(1),
  description: optionalText,
  hero: z.object({ statement: optionalText, placeholder: z.boolean() }),
  contact: z.object({
    general: optionalEmail,
    bookings: optionalEmail,
    press: optionalEmail,
  }),
  /** e.g. "within two business days" (Needs confirmation) */
  bookingResponseTime: optionalText,
  social: z.array(z.object({ platform: z.string().min(1), url: z.url() })),
  shopUrl: z.union([z.literal(''), z.url()]).transform((v) => v || undefined),
  announcement: optionalText,
});

export const site = schema.parse(raw);
