import { url } from './paths';
import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import { SITE_LIVE } from 'astro:env/server';

/**
 * Until launch (SITE_LIVE=true), builds are previews: they show placeholder
 * content and media still pending approval, each clearly labelled. The live
 * build leaves both out.
 */
export const isPreview = !SITE_LIVE;

type Flagged = { data: { published: boolean; placeholder: boolean } };
export const isVisible = (entry: Flagged) => entry.data.published && (isPreview || !entry.data.placeholder);

/** Published entries of a collection, minus placeholders in production. */
export async function getVisible<C extends CollectionKey>(collection: C) {
  const all = (await getCollection(collection)) as unknown as (CollectionEntry<C> & Flagged)[];
  return all.filter(isVisible) as CollectionEntry<C>[];
}

export async function getDivisions() {
  return (await getVisible('divisions')).sort((a, b) => a.data.order - b.data.order);
}

export function divisionHref(division: CollectionEntry<'divisions'>) {
  return url(`/${division.id}/`);
}

export async function getShows() {
  return (await getVisible('shows')).sort(
    (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
  );
}

const newestFirst = (a?: Date, b?: Date) => (b?.getTime() ?? 0) - (a?.getTime() ?? 0);

/** Episodes whose show is also visible, newest first. */
export async function getEpisodes(showId?: string) {
  const shows = new Set((await getShows()).map((s) => s.id));
  return (await getVisible('episodes'))
    .filter((e) => shows.has(e.data.show.id) && (!showId || e.data.show.id === showId))
    .sort((a, b) => newestFirst(a.data.date, b.data.date));
}

/** Episode slug is the file name: episodes/<show>/<slug>.json */
export function episodeSlug(episode: CollectionEntry<'episodes'>) {
  return episode.id.split('/').pop()!;
}

export function episodeHref(episode: CollectionEntry<'episodes'>) {
  return url(`/podcasts/${episode.data.show.id}/${episodeSlug(episode)}/`);
}

export async function getReleases() {
  return (await getVisible('releases')).sort((a, b) => newestFirst(a.data.releaseDate, b.data.releaseDate));
}

/** Upcoming events soonest first; past events most recent first. */
export async function getEvents(now = new Date()) {
  const all = await getVisible('events');
  const isPast = (e: CollectionEntry<'events'>) => (e.data.end ?? e.data.start) < now;
  return {
    upcoming: all.filter((e) => !isPast(e)).sort((a, b) => a.data.start.getTime() - b.data.start.getTime()),
    past: all.filter(isPast).sort((a, b) => b.data.start.getTime() - a.data.start.getTime()),
  };
}

export async function getProducts() {
  return (await getVisible('products')).sort((a, b) => a.data.order - b.data.order);
}

/** Testimonials appear only once the speaker's permission is confirmed. */
export async function getTestimonials() {
  return (await getVisible('testimonials')).filter((t) => t.data.permissionConfirmed);
}

export function formatDate(date: Date | undefined, timeZone?: string) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: timeZone ?? 'UTC' }).format(date);
}

export function formatDuration(seconds?: number) {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h ? `${h} hr ${m} min` : `${m} min`;
}
