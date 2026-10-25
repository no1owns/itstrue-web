// Pure parsing helpers for podcast RSS and YouTube feeds. Shared by
// scripts/sync-feeds.mjs and the tests, so keep this free of I/O.
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: false,
  trimValues: true,
  isArray: (name) => name === 'item' || name === 'entry',
});

/** Text content of a parsed node, whether it is a string or { '#text' }. */
function text(node) {
  if (node == null) return undefined;
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (typeof node === 'object' && '#text' in node) return String(node['#text']);
  return undefined;
}

const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(value) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

/**
 * Feed descriptions are HTML written in the podcast host's editor. The site
 * never renders that HTML directly: it is reduced to plain text with
 * paragraph breaks, so a feed can't inject markup or scripts into the page.
 */
export function htmlToText(html) {
  if (!html) return '';
  return decodeEntities(
    html
      .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
      .replace(/<\s*br\s*\/?>/gi, '\n')
      .replace(/<\s*\/\s*(p|div|li|h[1-6])\s*>/gi, '\n\n')
      .replace(/<\s*li[^>]*>/gi, '• ')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/[ \t ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** itunes:duration may be seconds ("3600"), "MM:SS" or "HH:MM:SS". */
export function parseDuration(value) {
  if (value == null || value === '') return undefined;
  const parts = String(value).trim().split(':').map(Number);
  if (parts.some((n) => !Number.isFinite(n))) return undefined;
  return parts.reduce((total, n) => total * 60 + n, 0);
}

export function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

function toIsoDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toPositiveInt(value) {
  const n = Number.parseInt(text(value) ?? '', 10);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

/** Parse a podcast RSS 2.0 feed (with iTunes tags) into plain episode records. */
export function parsePodcastRss(xml) {
  const doc = parser.parse(xml);
  const channel = doc?.rss?.channel;
  if (!channel) throw new Error('Not an RSS feed: missing <rss><channel>');

  const channelImage = channel['itunes:image']?.['@_href'] ?? text(channel.image?.url);

  const episodes = (channel.item ?? [])
    .map((item) => {
      const enclosure = item.enclosure ?? {};
      const guid = text(item.guid) ?? enclosure['@_url'] ?? text(item.link);
      const title = text(item.title)?.trim();
      if (!guid || !title) return undefined;
      const explicit = text(item['itunes:explicit'])?.toLowerCase();
      return {
        guid,
        title: decodeEntities(title),
        published: toIsoDate(text(item.pubDate)),
        description: htmlToText(text(item['content:encoded']) ?? text(item.description) ?? text(item['itunes:summary'])),
        audioUrl: enclosure['@_url'],
        audioType: enclosure['@_type'],
        durationSeconds: parseDuration(text(item['itunes:duration'])),
        image: item['itunes:image']?.['@_href'] ?? channelImage,
        season: toPositiveInt(item['itunes:season']),
        episode: toPositiveInt(item['itunes:episode']),
        explicit: explicit === 'true' || explicit === 'yes' || explicit === 'explicit',
        link: text(item.link),
      };
    })
    .filter(Boolean);

  return { title: text(channel.title), image: channelImage, episodes };
}

/**
 * Parse a YouTube Atom feed, e.g.
 * https://www.youtube.com/feeds/videos.xml?playlist_id=PL...
 * The keyless feed only lists the most recent ~15 videos; older episodes are
 * matched once and then kept in the snapshot, or set by hand in an override.
 */
export function parseYouTubeFeed(xml) {
  const doc = parser.parse(xml);
  const feed = doc?.feed;
  if (!feed) throw new Error('Not an Atom feed: missing <feed>');
  return (feed.entry ?? [])
    .map((entry) => ({
      videoId: text(entry['yt:videoId']),
      title: text(entry.title) ? decodeEntities(text(entry.title)) : undefined,
      published: toIsoDate(text(entry.published)),
    }))
    .filter((video) => video.videoId && video.title);
}

/** Loose title key: case, punctuation and "Ep. 12 |" style prefixes ignored. */
export function titleKey(title) {
  return slugify(title)
    .replace(/^(ep|episode)-?\d+-?/, '')
    .replace(/-/g, '');
}

/**
 * Attach YouTube video IDs to episodes whose titles match. Ambiguous titles
 * (two videos with the same key) are skipped rather than guessed.
 */
export function matchYouTube(episodes, videos) {
  const byKey = new Map();
  const ambiguous = new Set();
  for (const video of videos) {
    const key = titleKey(video.title);
    if (!key) continue;
    if (byKey.has(key)) ambiguous.add(key);
    byKey.set(key, video.videoId);
  }
  return episodes.map((episode) => {
    if (episode.youtubeId) return episode;
    const key = titleKey(episode.title);
    if (!key || ambiguous.has(key) || !byKey.has(key)) return episode;
    return { ...episode, youtubeId: byKey.get(key) };
  });
}

/**
 * Give each episode a URL slug. Slugs already published (looked up by guid
 * in the previous snapshot) never change, even if the title is edited, so
 * episode URLs stay stable. New collisions get a numeric suffix.
 */
export function assignSlugs(episodes, previousSlugsByGuid = new Map()) {
  const taken = new Set(previousSlugsByGuid.values());
  return episodes.map((episode) => {
    const previous = previousSlugsByGuid.get(episode.guid);
    if (previous) return { ...episode, slug: previous };
    const base = slugify(episode.title) || 'episode';
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
    taken.add(slug);
    return { ...episode, slug };
  });
}

/**
 * Carry forward fields the current feed no longer provides. YouTube matches
 * are the main case: the keyless feed drops older videos, but a match made
 * while the video was listed should stay.
 */
export function carryForward(episodes, previousByGuid = new Map()) {
  return episodes.map((episode) => {
    const previous = previousByGuid.get(episode.guid);
    if (!previous?.youtubeId || episode.youtubeId) return episode;
    return { ...episode, youtubeId: previous.youtubeId };
  });
}
