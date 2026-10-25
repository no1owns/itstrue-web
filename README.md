# moneytakers-web

Website for MoneyTakers, a multifaceted entertainment business: podcasts and original shows, music and production, live entertainment and bookings, and clothing and merchandise.

**Status:** foundation built. The site has its page structure, content models, media embeds and booking form, plus automated checks and GitHub Pages deployment. Content is clearly labelled placeholder material, and the visual design is a neutral stand-in until the creative direction is reviewed.

- Development URL: https://no1owns.github.io/moneytakers-web/ (`noindex`; published from `main`)

## Docs

- [Architecture proposal and decisions](docs/architecture-proposal.md)
- [Open items: dependencies and decisions](docs/open-items.md)
- [Content guide](docs/content-guide.md): how to add shows, episodes, releases, events, products and media
- [Deployment](docs/deployment.md): GitHub Pages setup, form service, custom domain
- [Asset inventory](docs/asset-inventory.csv): generated from `src/content/media/`

## Develop

Requires Node 22.12 or later.

```sh
npm ci
npm run dev           # local site at http://localhost:4321
```

| Command                                 | What it does                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `npm run build`                         | Static site in `dist/`                                                                                                         |
| `npm run preview`                       | Serve the built site                                                                                                           |
| `npm run lint`                          | ESLint, including accessibility rules for markup                                                                               |
| `npm run format` / `format:check`       | Prettier                                                                                                                       |
| `npm run check`                         | Type check and content schema validation                                                                                       |
| `npm run inventory` / `inventory:check` | Regenerate / verify `docs/asset-inventory.csv`                                                                                 |
| `npm run check:links`                   | Every internal link resolves (run after build)                                                                                 |
| `npm run check:a11y`                    | axe scan of every page, phone and desktop, light and dark (run after build; needs Chromium: `npx playwright install chromium`) |
| `npm run validate`                      | All of the above, in CI order                                                                                                  |

### Environment

Copy `.env.example` to `.env` for local overrides. All are optional:

| Variable                | Purpose                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| `SITE_URL`, `BASE_PATH` | Public origin and path prefix. Set automatically by the deploy workflow; leave empty locally. |
| `SITE_LIVE`             | `true` only at launch. Until then, pages are `noindex` and placeholders show with labels.     |
| `PUBLIC_FORM_ENDPOINT`  | External form service URL for the booking form. While empty, the form can't be submitted.     |

## Structure

```
src/
  content.config.ts      content models (schemas for every collection)
  content/               JSON content, one folder per collection
  data/site.json         site-wide settings
  lib/                   content queries, media rules, settings, base-path helpers
  components/
    layout/              header, footer, page header, empty state
    content/             section, temporary-content label, testimonials
    cards/               show, episode, release, event, product cards
    media/               YouTube, Spotify, media inventory embed, listen-on links
    forms/               booking inquiry form
    seo/                 meta tags, JSON-LD
  layouts/BaseLayout.astro
  pages/                 routes
  styles/tokens.css      design tokens (placeholder values)
scripts/                 inventory generator, link and accessibility checks
.github/workflows/       CI and GitHub Pages deployment
```

Internal links must use `url()` from `src/lib/paths.ts` so they work under the GitHub Pages base path; CI builds under a base path to catch any that don't.

## Media

No video or audio files are committed. Media is embedded from YouTube or Spotify, or linked to where it's hosted. YouTube players load only when the visitor presses play. Every asset is tracked in the media inventory with its rights status, and anything not yet approved stays off the live site.
