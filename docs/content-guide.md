# Content guide

How to add and update content. Every content type is a folder of JSON files under `src/content/`. The file name (without `.json`) becomes the URL slug, so use lowercase words separated by hyphens and don't rename a file once its page is live.

A CMS editor will sit on top of these files later (Decap or Sanity, still to be decided). Until then, files can be edited directly on GitHub. Every change goes through a pull request, which is previewed before it reaches the live site.

**Content rule:** only add content MoneyTakers has supplied and approved. Leave a field out rather than filling it with placeholder text. Pages hide anything that is missing. Record every image, video and audio file in [`asset-inventory.csv`](asset-inventory.csv) with its usage rights before using it.

## Site settings: `src/data/site.json`

Name, description, contact emails (general, bookings, press), social links, shop URL and an optional announcement banner. Blank values are hidden on the site.

```json
"social": [{ "platform": "Instagram", "url": "https://instagram.com/..." }]
```

## Divisions (business lines): `src/content/divisions/`

One file per business line. These drive the main navigation and the homepage.

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Shown in navigation |
| `template` | yes | `podcasts`, `music`, `entertainment`, `shop`, or `generic` |
| `tagline`, `description` | | |
| `hero` | | `{ "src": "...", "alt": "..." }` |
| `order` | | Lower numbers come first in navigation |
| `inNav` | | `false` keeps it out of the menu |
| `published` | | `false` hides it everywhere |

**Adding a new business line:** create `src/content/divisions/<slug>.json` with `"template": "generic"`. It gets a page at `/<slug>/` and a navigation link. No code changes are needed.

## Podcasts

### Shows: `src/content/shows/<show-slug>.json`

```json
{
  "title": "Show title",
  "description": "Approved show description.",
  "artwork": { "src": "https://...", "alt": "Show title cover art" },
  "hosts": ["talent-slug"],
  "status": "active",
  "feeds": {
    "rss": "https://feeds.example-host.com/show.xml",
    "youtubePlaylistId": "PL..."
  },
  "links": [
    { "platform": "Spotify", "url": "https://open.spotify.com/show/..." },
    { "platform": "Apple Podcasts", "url": "https://podcasts.apple.com/..." }
  ]
}
```

`status` is `active`, `hiatus` or `ended`. `hosts` refers to files in `src/content/talent/`.

### Episodes are added automatically

You don't create episode files. Publish the episode on the podcast host (and on YouTube if it has video) as usual. Then:

1. Every 3 hours, the **Sync podcast feeds** GitHub Action reads each show's RSS feed and YouTube playlist, and commits any changes to `src/data/feeds/<show-slug>.json`. It can also be started by hand from the repository's Actions tab.
2. That commit triggers a site rebuild, and the episode page appears at `/podcasts/<show-slug>/<episode-slug>/`.

How it works:
- Episode titles, dates, descriptions, artwork, audio and duration come from the RSS feed. Descriptions are converted to plain text, so formatting such as bold or links in show notes is not carried over.
- A YouTube video is attached when its title matches the episode title. Prefixes such as "Ep. 12 |" are ignored.
- An episode's URL is fixed the first time it is synced. Renaming the episode later doesn't break its link.
- If a feed can't be reached, the previous snapshot is kept, so the archive never goes empty.

To run the sync locally: `npm run sync:feeds` (or `npm run sync:feeds -- <show-slug>`).

### Enriching or correcting an episode: `src/content/episode-overrides/<show-slug>/<episode-slug>.json`

Any field here replaces the feed value for that one episode:

```json
{
  "youtubeId": "abc123",
  "guests": ["Guest Name"],
  "transcript": "Full transcript text...",
  "featured": true
}
```

Use `"youtubeId"` when automatic matching misses a video, `"spotifyEpisodeId"` to show a Spotify player when the feed has no audio file, and `"hidden": true` to remove an episode from the site without touching the feed.

## Music releases: `src/content/releases/<slug>.json`

```json
{
  "title": "Release title",
  "type": "single",
  "artists": ["Artist Name"],
  "releaseDate": "2026-11-01",
  "artwork": { "src": "https://...", "alt": "Release title cover art" },
  "spotifyId": "Spotify track or album ID",
  "smartLink": "https://...",
  "links": [{ "platform": "Apple Music", "url": "https://..." }],
  "tracks": [{ "title": "Track one", "durationSeconds": 201 }],
  "credits": [{ "role": "Producer", "name": "Name" }]
}
```

`type` is `single`, `ep`, `album`, `mixtape` or `other`. Use `spotifyId` with the track ID for singles and the album ID for everything else. Mark up to three releases `"featured": true` for the homepage. Releases are entered by hand because each one is a marketing moment, and they are separate from podcast feeds.

## Events: `src/content/events/<slug>.json`

```json
{
  "title": "Event title",
  "start": "2026-12-31T21:00:00-05:00",
  "timezone": "America/New_York",
  "venue": "Venue name",
  "city": "City",
  "ticketUrl": "https://...",
  "status": "on-sale"
}
```

Include the UTC offset in `start`, and set `timezone` so the time displays in the venue's local time. `status` is `announced`, `on-sale`, `sold-out`, `cancelled` or `postponed`. Events move from "Upcoming" to "Past" on the next rebuild after they finish. After the event, add `recapYoutubeId` to turn the page into a recap.

## Talent: `src/content/talent/<slug>.json`

`name`, `role`, `bio`, `photo` (`{ "src", "alt", "credit" }`) and `links`. Talent records feed the About page, the press kit and show host credits.

## Press: `src/content/press/<slug>.json`

`outlet`, `headline`, `url`, `date` and an optional short `quote`. Press items appear in the press kit.

## Images and media

- Images: until an image CDN is chosen, small, optimized images can go in `public/images/` and be referenced as `/images/name.webp`. Every image needs `alt` text that describes it. Use `""` only for purely decorative images.
- **Never commit video or audio files.** Use YouTube or Spotify IDs, or the podcast host's audio URL.
