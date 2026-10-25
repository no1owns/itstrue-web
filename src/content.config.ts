// Content model. Each collection is a folder of JSON files under
// src/content/, so a Git-based CMS (Decap) or a hosted one (Sanity) can
// edit it later without changing the pages. See docs/content-guide.md.
//
// Every collection has a `placeholder` flag. Placeholder entries are
// clearly labelled temporary content: they render (with a visible label)
// on preview builds and are left out of production builds.
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const url = z.url();

const image = z.object({
  src: z.string().min(1),
  alt: z.string(),
  credit: z.string().optional(),
});

const link = z.object({
  platform: z.string().min(1),
  url,
});

const common = {
  published: z.boolean().default(true),
  placeholder: z.boolean().default(false),
};

const json = (folder: string) => glob({ pattern: '**/*.json', base: `./src/content/${folder}` });

/**
 * A business line (Podcasts, Music, Entertainment, Shop, and future ones).
 * Navigation and the homepage read from these records. A division with
 * template "generic" gets a page at /<slug> without any new code.
 */
const divisions = defineCollection({
  loader: json('divisions'),
  schema: z.object({
    name: z.string().min(1),
    template: z.enum(['podcasts', 'music', 'entertainment', 'shop', 'generic']),
    tagline: z.string().optional(),
    description: z.string().optional(),
    hero: image.optional(),
    accent: z.string().optional(),
    order: z.number().int().default(100),
    inNav: z.boolean().default(true),
    ...common,
  }),
});

/**
 * Media asset inventory. Every image, video, audio file or social post the
 * site uses is recorded here with its source and usage rights.
 * docs/asset-inventory.csv is generated from these files (npm run inventory).
 */
const mediaStatus = ['requested', 'received', 'in-review', 'approved', 'live', 'retired'] as const;
const mediaRights = ['owned', 'licensed', 'third-party-credit', 'pending', 'not-cleared'] as const;
const media = defineCollection({
  loader: json('media'),
  schema: z.object({
    name: z.string().min(1),
    type: z.enum(['video', 'audio', 'image', 'document', 'social-post', 'logo', 'other']),
    provider: z.enum(['youtube', 'spotify', 'instagram', 'tiktok', 'soundcloud', 'apple-music', 'file', 'other']),
    /** Public URL, or a path under /public for files. */
    url: z.string().min(1),
    /** Provider ID for embeds, e.g. a YouTube video ID. */
    embedId: z.string().optional(),
    division: z.string().optional(),
    pages: z.array(z.string()).default([]),
    status: z.enum(mediaStatus),
    rights: z.enum(mediaRights),
    rightsHolder: z.string().optional(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    suppliedBy: z.string().optional(),
    dateReceived: z.string().optional(),
    /** Offer as a download in the press kit. */
    epk: z.boolean().default(false),
    notes: z.string().optional(),
  }),
});

const talent = defineCollection({
  loader: json('talent'),
  schema: z.object({
    name: z.string().min(1),
    role: z.string().optional(),
    bio: z.string().optional(),
    shortBio: z.string().optional(),
    photo: image.optional(),
    links: z.array(link).default([]),
    ...common,
  }),
});

const shows = defineCollection({
  loader: json('shows'),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    artwork: image.optional(),
    hosts: z.array(reference('talent')).default([]),
    status: z.enum(['active', 'hiatus', 'ended']).default('active'),
    /** Listen-on links: Spotify, Apple Podcasts, YouTube, etc. */
    links: z.array(link).default([]),
    /** Public RSS feed URL, shown as a "subscribe" link. Not imported. */
    rssUrl: url.optional(),
    spotifyShowId: z.string().optional(),
    order: z.number().int().default(100),
    ...common,
  }),
});

/**
 * One file per episode, at src/content/episodes/<show-slug>/<episode-slug>.json.
 * Episodes are entered by hand from the podcast host's metadata; audio and
 * video stay on the host, YouTube or Spotify.
 */
const episodes = defineCollection({
  loader: json('episodes'),
  schema: z.object({
    show: reference('shows'),
    title: z.string().min(1),
    date: z.coerce.date().optional(),
    description: z.string().optional(),
    image: image.optional(),
    season: z.number().int().positive().optional(),
    episode: z.number().int().positive().optional(),
    durationMinutes: z.number().positive().optional(),
    explicit: z.boolean().default(false),
    youtubeId: z.string().optional(),
    spotifyEpisodeId: z.string().optional(),
    links: z.array(link).default([]),
    guests: z.array(z.string()).default([]),
    transcript: z.string().optional(),
    featured: z.boolean().default(false),
    ...common,
  }),
});

const releases = defineCollection({
  loader: json('releases'),
  schema: z.object({
    title: z.string().min(1),
    type: z.enum(['single', 'ep', 'album', 'mixtape', 'live', 'other']),
    artists: z.array(z.string().min(1)).min(1),
    releaseDate: z.coerce.date().optional(),
    artwork: image.optional(),
    description: z.string().optional(),
    tracks: z.array(z.object({ title: z.string().min(1), durationSeconds: z.number().optional() })).default([]),
    spotifyId: z.string().optional(),
    youtubeId: z.string().optional(),
    /** Smart link (Feature.fm, Linkfire, etc.), if one exists. */
    smartLink: url.optional(),
    links: z.array(link).default([]),
    credits: z.array(z.object({ role: z.string(), name: z.string() })).default([]),
    featured: z.boolean().default(false),
    ...common,
  }),
});

const events = defineCollection({
  loader: json('events'),
  schema: z.object({
    title: z.string().min(1),
    /** ISO date-time with offset, e.g. 2026-12-31T21:00:00-05:00 */
    start: z.coerce.date(),
    end: z.coerce.date().optional(),
    timezone: z.string().optional(),
    venue: z.string().optional(),
    city: z.string().optional(),
    ticketUrl: url.optional(),
    status: z.enum(['announced', 'on-sale', 'sold-out', 'cancelled', 'postponed']).default('announced'),
    description: z.string().optional(),
    lineup: z.array(z.string()).default([]),
    image: image.optional(),
    recapYoutubeId: z.string().optional(),
    ...common,
  }),
});

/**
 * Merchandise shown on /shop. The store itself is external (platform to be
 * confirmed): each product links out to its page there.
 */
const products = defineCollection({
  loader: json('products'),
  schema: z.object({
    title: z.string().min(1),
    category: z.string().optional(),
    image: image.optional(),
    /** Display text only, e.g. "$35". Checkout pricing comes from the store. */
    priceLabel: z.string().optional(),
    url: url.optional(),
    soldOut: z.boolean().default(false),
    order: z.number().int().default(100),
    ...common,
  }),
});

/** Only quotes MoneyTakers has supplied with the speaker's permission. */
const testimonials = defineCollection({
  loader: json('testimonials'),
  schema: z.object({
    quote: z.string().min(1),
    name: z.string().min(1),
    role: z.string().optional(),
    organization: z.string().optional(),
    permissionConfirmed: z.boolean(),
    ...common,
  }),
});

const press = defineCollection({
  loader: json('press'),
  schema: z.object({
    outlet: z.string().min(1),
    headline: z.string().min(1),
    url: url.optional(),
    date: z.coerce.date().optional(),
    quote: z.string().optional(),
    ...common,
  }),
});

export const collections = {
  divisions,
  media,
  talent,
  shows,
  episodes,
  releases,
  events,
  products,
  testimonials,
  press,
};
