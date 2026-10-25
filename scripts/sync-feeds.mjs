#!/usr/bin/env node
// Fetches each show's podcast RSS feed (and optional YouTube playlist feed)
// and writes a snapshot to src/data/feeds/<show>.json. The site builds from
// the snapshots, never from live feeds, so a feed outage can't empty an
// archive: on any fetch or parse error the previous snapshot is kept.
//
// Usage: npm run sync:feeds            (all shows with a feed URL)
//        npm run sync:feeds -- <slug>  (one show)
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePodcastRss, parseYouTubeFeed, matchYouTube, assignSlugs, carryForward } from '../src/lib/feeds/parse.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const showsDir = path.join(root, 'src/content/shows');
const feedsDir = path.join(root, 'src/data/feeds');

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'moneytakers-web feed sync' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.text();
}

async function syncShow(slug, show) {
  const snapshotFile = path.join(feedsDir, `${slug}.json`);
  const previous = await readJson(snapshotFile);
  const previousByGuid = new Map((previous?.episodes ?? []).map((e) => [e.guid, e]));
  const previousSlugs = new Map([...previousByGuid].map(([guid, e]) => [guid, e.slug]));

  const rss = parsePodcastRss(await fetchText(show.feeds.rss));
  let episodes = carryForward(assignSlugs(rss.episodes, previousSlugs), previousByGuid);

  if (show.feeds.youtubePlaylistId) {
    const url = `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(show.feeds.youtubePlaylistId)}`;
    try {
      episodes = matchYouTube(episodes, parseYouTubeFeed(await fetchText(url)));
    } catch (error) {
      // Audio still updates; video matches from the last snapshot are kept.
      console.warn(`  ${slug}: YouTube feed skipped (${error.message})`);
    }
  }

  const snapshot = { show: slug, source: { rss: show.feeds.rss }, episodes };
  const unchanged = previous && JSON.stringify({ ...previous, fetchedAt: undefined }) === JSON.stringify(snapshot);
  if (unchanged) {
    console.log(`  ${slug}: no changes (${episodes.length} episodes)`);
    return;
  }
  await writeFile(snapshotFile, `${JSON.stringify({ ...snapshot, fetchedAt: new Date().toISOString() }, null, 2)}\n`);
  console.log(`  ${slug}: wrote ${episodes.length} episodes`);
}

const only = process.argv[2];
await mkdir(feedsDir, { recursive: true });
const files = (await readdir(showsDir)).filter((f) => f.endsWith('.json'));
let failures = 0;

for (const file of files) {
  const slug = path.basename(file, '.json');
  if (only && slug !== only) continue;
  const show = await readJson(path.join(showsDir, file));
  if (!show?.feeds?.rss) {
    console.log(`  ${slug}: no RSS feed URL yet, skipped`);
    continue;
  }
  try {
    await syncShow(slug, show);
  } catch (error) {
    failures++;
    console.error(`  ${slug}: kept previous snapshot (${error.message})`);
  }
}

if (files.length === 0) console.log('No shows in src/content/shows yet.');
// A failed feed is reported but doesn't fail the run: the old snapshot is
// still valid, and one host outage shouldn't block other shows or the build.
if (failures) console.warn(`${failures} feed(s) failed; previous snapshots kept.`);
