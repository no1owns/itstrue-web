import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  parsePodcastRss,
  parseYouTubeFeed,
  matchYouTube,
  assignSlugs,
  carryForward,
  htmlToText,
  parseDuration,
  slugify,
} from '../src/lib/feeds/parse.mjs';

const fixture = (name) => readFile(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');

test('parses podcast RSS episodes and skips items without title or guid', async () => {
  const feed = parsePodcastRss(await fixture('podcast.xml'));
  assert.equal(feed.title, 'Fixture Show');
  assert.equal(feed.episodes.length, 2);

  const [second, first] = feed.episodes;
  assert.equal(second.guid, 'guid-2');
  assert.equal(second.title, 'Ep. 2 | Second & Last');
  assert.equal(second.published, '2025-10-14T09:00:00.000Z');
  assert.equal(second.audioUrl, 'https://example.com/2.mp3');
  assert.equal(second.durationSeconds, 3723);
  assert.equal(second.season, 1);
  assert.equal(second.episode, 2);
  assert.equal(second.explicit, true);
  assert.equal(second.image, 'https://example.com/2.jpg');

  assert.equal(first.description, 'Plain description');
  assert.equal(first.durationSeconds, 754);
  assert.equal(first.explicit, false);
  assert.equal(first.image, 'https://example.com/show.jpg', 'falls back to show artwork');
});

test('feed HTML is reduced to plain text with scripts removed', async () => {
  const [second] = parsePodcastRss(await fixture('podcast.xml')).episodes;
  assert.equal(second.description, 'First para.\n\nSecond para\nline\n\n• One');
  assert.doesNotMatch(htmlToText('<script>alert(1)</script>x'), /alert/);
});

test('rejects non-RSS input', () => {
  assert.throws(() => parsePodcastRss('<html></html>'), /Not an RSS feed/);
});

test('matches YouTube videos by loose title, ignoring episode prefixes', async () => {
  const { episodes } = parsePodcastRss(await fixture('podcast.xml'));
  const videos = parseYouTubeFeed(await fixture('youtube.xml'));
  const matched = matchYouTube(episodes, videos);
  assert.equal(matched[0].youtubeId, 'vid-second');
  assert.equal(matched[1].youtubeId, undefined);
});

test('does not guess when two videos share a title', () => {
  const episodes = [{ guid: 'a', title: 'Same' }];
  const videos = [
    { videoId: 'x', title: 'Same' },
    { videoId: 'y', title: 'same!' },
  ];
  assert.equal(matchYouTube(episodes, videos)[0].youtubeId, undefined);
});

test('slugs stay stable across title edits and avoid collisions', () => {
  const previous = new Map([['g1', 'original-title']]);
  const result = assignSlugs(
    [
      { guid: 'g1', title: 'Renamed Title' },
      { guid: 'g2', title: 'Original Title' },
      { guid: 'g3', title: 'Original Title' },
    ],
    previous,
  );
  assert.deepEqual(
    result.map((e) => e.slug),
    ['original-title', 'original-title-2', 'original-title-3'],
  );
});

test('keeps earlier YouTube matches once a video leaves the feed', () => {
  const previous = new Map([['g1', { guid: 'g1', youtubeId: 'old' }]]);
  assert.equal(carryForward([{ guid: 'g1' }], previous)[0].youtubeId, 'old');
  assert.equal(carryForward([{ guid: 'g1', youtubeId: 'new' }], previous)[0].youtubeId, 'new');
});

test('helpers', () => {
  assert.equal(parseDuration('45:30'), 2730);
  assert.equal(parseDuration('abc'), undefined);
  assert.equal(slugify('Café & Friends: Live!'), 'cafe-and-friends-live');
});
