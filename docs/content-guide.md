# Content guide

How to add and update content. Every content type is a folder of JSON files under `src/content/`. The file name (without `.json`) becomes the URL slug, so use lowercase words separated by hyphens, and don't rename a file once its page is live.

Edit files directly on GitHub or locally. Every change goes through a pull request, and CI checks it (schemas, links, accessibility) before it can reach the site. A CMS editor can sit on top of these same files later.

## Ground rules

- **Only add content It's True Entertainments has supplied and approved.** Never write testimonials, credentials, releases, products or performances. Leave a field out rather than guessing; pages hide anything that is missing.
- **Temporary content must be labelled.** Set `"placeholder": true` on any stand-in entry. Placeholders show on preview builds with a "Temporary content" label and are left out of the live site automatically.
- **Record every media asset** in the media inventory (below) with its usage rights before using it.
- **Never commit video or audio files.** Use YouTube or Spotify IDs, or links to where the media is hosted.

Every collection also accepts `"published": false` to hide an entry without deleting it.

## Site settings: `src/data/site.json`

Name, description, homepage statement (`hero`), contact emails (general, bookings, press), booking response time, social links, store URL and an optional announcement banner. Blank values are hidden on the site.

```json
"hero": { "statement": "Approved positioning statement.", "placeholder": false },
"bookingResponseTime": "within two business days",
"social": [{ "platform": "Instagram", "url": "https://instagram.com/..." }]
```

## Divisions (business lines): `src/content/divisions/`

One file per business line. These drive the main navigation and the homepage.

| Field                    | Required | Notes                                                      |
| ------------------------ | -------- | ---------------------------------------------------------- |
| `name`                   | yes      | Shown in navigation                                        |
| `template`               | yes      | `podcasts`, `music`, `entertainment`, `shop`, or `generic` |
| `tagline`, `description` |          |                                                            |
| `hero`                   |          | `{ "src": "...", "alt": "..." }`                           |
| `order`                  |          | Lower numbers come first in navigation                     |
| `inNav`                  |          | `false` keeps it out of the menu                           |

**Adding a new business line:** create `src/content/divisions/<slug>.json` with `"template": "generic"`. It gets a page at `/<slug>/` and a navigation link. No code changes are needed.

## Media inventory: `src/content/media/`

One file per asset: video, audio, image, document, logo or social post. `docs/asset-inventory.csv` is generated from these files with `npm run inventory`; CI fails if the CSV is out of date.

```json
{
  "name": "Different (Live) at Warehouse Live, Houston",
  "type": "video",
  "provider": "youtube",
  "url": "https://youtu.be/...",
  "embedId": "YouTube video ID",
  "division": "entertainment",
  "pages": ["home", "entertainment"],
  "status": "received",
  "rights": "pending",
  "rightsHolder": "Photographer or owner, for credit",
  "caption": "Shown under the media",
  "suppliedBy": "Who sent it",
  "dateReceived": "2026-10-25",
  "epk": false,
  "notes": ""
}
```

- `status`: `requested`, `received`, `in-review`, `approved`, `live` or `retired`
- `rights`: `owned`, `licensed`, `third-party-credit`, `pending` or `not-cleared`
- `pages`: where it appears. `home` and `entertainment` are read today.
- `epk: true` lists it as a download in the press kit.

**An asset appears on the live site only when its status is `approved` or `live` and its rights are `owned`, `licensed` or `third-party-credit`.** Until then it shows on previews only, labelled "Pending approval". `not-cleared` and `retired` assets never appear.

## Podcasts

### Shows: `src/content/shows/<show-slug>.json`

```json
{
  "title": "Show title",
  "description": "Approved show description.",
  "artwork": { "src": "https://...", "alt": "Show title cover art" },
  "hosts": ["talent-slug"],
  "status": "active",
  "spotifyShowId": "Spotify show ID",
  "rssUrl": "https://feeds.example-host.com/show.xml",
  "links": [
    { "platform": "Spotify", "url": "https://open.spotify.com/show/..." },
    { "platform": "Apple Podcasts", "url": "https://podcasts.apple.com/..." },
    { "platform": "YouTube", "url": "https://www.youtube.com/playlist?list=..." }
  ]
}
```

`status` is `active`, `hiatus` or `ended`. `hosts` refers to files in `src/content/talent/`. `rssUrl` only adds a "subscribe" link; the site does not read the feed.

### Episodes: `src/content/episodes/<show-slug>/<episode-slug>.json`

Copy the metadata from the podcast host. The page is created at `/podcasts/<show-slug>/<episode-slug>/`.

```json
{
  "show": "show-slug",
  "title": "Episode title",
  "date": "2026-11-01",
  "season": 1,
  "episode": 12,
  "durationMinutes": 54,
  "description": "Show notes, as plain text. Blank lines start new paragraphs.",
  "youtubeId": "YouTube video ID",
  "spotifyEpisodeId": "Spotify episode ID",
  "links": [{ "platform": "Apple Podcasts", "url": "https://..." }],
  "guests": ["Guest Name"],
  "transcript": "Optional full transcript."
}
```

If an episode has no `links`, the show's links are used. The YouTube player only loads when the visitor presses play.

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

`type` is `single`, `ep`, `album`, `mixtape`, `live` or `other`. Use the track ID for singles and the album ID otherwise. Mark up to three releases `"featured": true` for the homepage.

## Events: `src/content/events/<slug>.json`

```json
{
  "title": "Event title",
  "start": "2026-12-31T21:00:00-06:00",
  "timezone": "America/Chicago",
  "venue": "Venue name",
  "city": "City",
  "ticketUrl": "https://...",
  "status": "on-sale"
}
```

Include the UTC offset in `start`, and set `timezone` so the time displays in the venue's local time. `status` is `announced`, `on-sale`, `sold-out`, `cancelled` or `postponed`. Events move from "Upcoming" to "Past" the next time the site is built after they finish. After the event, add `recapYoutubeId` to turn the page into a recap.

## Products (merch): `src/content/products/<slug>.json`

The store itself is external. Each product links out to its page there.

```json
{
  "title": "Product name",
  "category": "Apparel",
  "image": { "src": "https://...", "alt": "Description of the product photo" },
  "priceLabel": "$35",
  "url": "https://store.example.com/products/...",
  "soldOut": false,
  "order": 1
}
```

`priceLabel` is display text only; the store sets the real price at checkout.

## Testimonials: `src/content/testimonials/<slug>.json`

Only quotes It's True Entertainments supplies, with the speaker's permission. A testimonial appears only when `permissionConfirmed` is `true`.

```json
{
  "quote": "Exact approved wording.",
  "name": "Speaker name",
  "role": "Talent buyer",
  "organization": "Venue or company",
  "permissionConfirmed": true
}
```

## Talent: `src/content/talent/<slug>.json`

`name`, `role`, `shortBio` (About page), `bio` (press kit), `photo` (`{ "src", "alt", "credit" }`) and `links`.

## Press: `src/content/press/<slug>.json`

`outlet`, `headline`, `url`, `date` and an optional short `quote`. Press items appear in the press kit.

## Images

Full image URLs work anywhere. For files kept in the repo, put small, optimized images in `public/images/` and reference them as `/images/name.webp`; the site adds the deployment base path automatically. Every image needs `alt` text that describes it. Use `""` only for purely decorative images.
