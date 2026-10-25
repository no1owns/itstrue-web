// Content model. Each collection is a folder of JSON files under
// src/content/, so any Git-based CMS (Decap) or a hosted one (Sanity) can
// edit it later without changing the pages. See docs/content-guide.md.
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

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
    published: z.boolean().default(true),
  }),
});

const talent = defineCollection({
  loader: json('talent'),
  schema: z.object({
    name: z.string().min(1),
    role: z.string().optional(),
    bio: z.string().optional(),
    photo: image.optional(),
    links: z.array(link).default([]),
    published: z.boolean().default(true),
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
    feeds: z
      .object({
        rss: url.optional(),
        youtubePlaylistId: z.string().optional(),
      })
      .default({}),
    /** Listen-on links: Spotify, Apple Podcasts, YouTube, etc. */
    links: z.array(link).default([]),
    order: z.number().int().default(100),
    published: z.boolean().default(true),
  }),
});

const episodeSchema = z.object({
  show: reference('shows'),
  slug: z.string().min(1),
  guid: z.string().min(1),
  title: z.string().min(1),
  published: z.coerce.date().optional(),
  description: z.string().default(''),
  audioUrl: url.optional(),
  audioType: z.string().optional(),
  durationSeconds: z.number().nonnegative().optional(),
  image: z.string().optional(),
  season: z.number().int().positive().optional(),
  episode: z.number().int().positive().optional(),
  explicit: z.boolean().default(false),
  youtubeId: z.string().optional(),
  spotifyEpisodeId: z.string().optional(),
  guests: z.array(z.string()).default([]),
  transcript: z.string().optional(),
  featured: z.boolean().default(false),
  hidden: z.boolean().default(false),
});

async function readJsonFiles(dir: string): Promise<{ name: string; data: any }[]> {
  let names: string[];
  try {
    names = (await readdir(dir)).filter((n) => n.endsWith('.json'));
  } catch {
    return [];
  }
  return Promise.all(names.map(async (name) => ({ name, data: JSON.parse(await readFile(path.join(dir, name), 'utf8')) })));
}

/**
 * Episodes come from the feed snapshots in src/data/feeds (written by
 * `npm run sync:feeds`). Editors can override or enrich any episode with
 * src/content/episode-overrides/<show>/<episode-slug>.json; override fields
 * win over feed fields.
 */
const episodes = defineCollection({
  loader: {
    name: 'feed-snapshots',
    load: async ({ store, parseData, generateDigest }) => {
      store.clear();
      const root = process.cwd();
      for (const { data: snapshot } of await readJsonFiles(path.join(root, 'src/data/feeds'))) {
        const overrides = new Map(
          (await readJsonFiles(path.join(root, 'src/content/episode-overrides', snapshot.show))).map((o) => [
            o.name.replace(/\.json$/, ''),
            o.data,
          ]),
        );
        for (const episode of snapshot.episodes ?? []) {
          const id = `${snapshot.show}/${episode.slug}`;
          const raw = { ...episode, ...overrides.get(episode.slug), show: snapshot.show, slug: episode.slug };
          const data = await parseData({ id, data: raw });
          store.set({ id, data, digest: generateDigest(raw) });
        }
      }
    },
  },
  schema: episodeSchema,
});

const releases = defineCollection({
  loader: json('releases'),
  schema: z.object({
    title: z.string().min(1),
    type: z.enum(['single', 'ep', 'album', 'mixtape', 'other']),
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
    division: reference('divisions').prefault('music'),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
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
    division: reference('divisions').prefault('entertainment'),
    published: z.boolean().default(true),
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
    published: z.boolean().default(true),
  }),
});

export const collections = { divisions, talent, shows, episodes, releases, events, press };
