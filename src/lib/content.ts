import { getCollection, type CollectionEntry } from 'astro:content';

export async function getDivisions() {
  const all = await getCollection('divisions', (d) => d.data.published);
  return all.sort((a, b) => a.data.order - b.data.order);
}

/** Route for a division: built-in templates have their own pages. */
export function divisionHref(division: CollectionEntry<'divisions'>) {
  return `/${division.id}/`;
}

export async function getShows() {
  const all = await getCollection('shows', (s) => s.data.published);
  return all.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

const newestFirst = (a?: Date, b?: Date) => (b?.getTime() ?? 0) - (a?.getTime() ?? 0);

export async function getEpisodes(showId?: string) {
  const published = new Set((await getShows()).map((s) => s.id));
  const all = await getCollection(
    'episodes',
    (e) => !e.data.hidden && published.has(e.data.show.id) && (!showId || e.data.show.id === showId),
  );
  return all.sort((a, b) => newestFirst(a.data.published, b.data.published));
}

export async function getReleases() {
  const all = await getCollection('releases', (r) => r.data.published);
  return all.sort((a, b) => newestFirst(a.data.releaseDate, b.data.releaseDate));
}

/** Upcoming events soonest first; past events most recent first. */
export async function getEvents(now = new Date()) {
  const all = await getCollection('events', (e) => e.data.published);
  const isPast = (e: CollectionEntry<'events'>) => (e.data.end ?? e.data.start) < now;
  return {
    upcoming: all.filter((e) => !isPast(e)).sort((a, b) => a.data.start.getTime() - b.data.start.getTime()),
    past: all.filter(isPast).sort((a, b) => b.data.start.getTime() - a.data.start.getTime()),
  };
}

export function episodeHref(episode: CollectionEntry<'episodes'>) {
  return `/podcasts/${episode.data.show.id}/${episode.data.slug}/`;
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
