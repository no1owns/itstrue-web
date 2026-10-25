# moneytakers-web

Website for MoneyTakers: podcasts and original shows, music and production, live entertainment and bookings, and merchandise.

**Status:** foundation in place (Phase 2 of the [proposal](docs/architecture-proposal.md)). Page structure, content model, media embeds, podcast feed sync and the booking form are built. There's no MoneyTakers content yet, and the visual design is a neutral placeholder until the creative direction is chosen.

## Docs

- [Architecture and implementation proposal](docs/architecture-proposal.md)
- [Content guide](docs/content-guide.md): how to add shows, episodes, releases, events and more
- [Content and asset inventory](docs/asset-inventory.csv): every supplied asset and its usage rights

## Develop

Requires Node 22.12 or later.

```sh
npm ci
npm run dev        # local site at http://localhost:4321
npm test           # feed parser tests
npm run check      # type check
npm run build      # static site in dist/
npm run sync:feeds # pull new podcast episodes into src/data/feeds/
```

Copy `.env.example` to `.env` to set:

- `SITE_URL`: the final public origin. While it's blank, every page is marked `noindex`, `robots.txt` disallows crawling, and no sitemap is written. Set it only on the production deployment.
- `PUBLIC_FORM_ENDPOINT`: where the booking form posts. While it's blank, the form is visible but can't be submitted.

## Structure

```
src/
  content.config.ts    content model (schemas for every collection)
  content/             JSON content, one folder per collection
  data/site.json       site-wide settings
  data/feeds/          podcast feed snapshots (written by sync:feeds)
  lib/                 content queries, settings, feed parser
  components/          layout, media, cards, forms, SEO
  layouts/             BaseLayout
  pages/               routes
  styles/tokens.css    design tokens (placeholder values)
scripts/sync-feeds.mjs feed sync
tests/                 parser tests and synthetic fixtures
```

## Media

Large video and audio files are not committed here. Media is embedded from YouTube, Spotify, the podcast host, or a media CDN. YouTube players load only when the visitor presses play.

## Deployment

Hosting isn't chosen yet (Cloudflare Pages is recommended). The output is a plain static site: build with `npm run build` and serve the `dist/` folder. The **Sync podcast feeds** workflow commits new episodes on a schedule; the host should rebuild on every push to `main`, plus once a day so finished events move to "Past".
