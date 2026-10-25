# MoneyTakers Website: Architecture and Implementation Proposal

Status: **Draft for creative director review.** No code has been written and no repository has been changed.
Date: 2026-10-24

Anything marked **Needs confirmation** is an open question. It is not an assumption the build depends on.

---

## 1. Existing project structure and technology

This session has two repositories connected. **Neither one is a MoneyTakers project.**

| Repository | What it is | Stack | Relevance to MoneyTakers |
|---|---|---|---|
| `no1owns/akintilo-portfolio` | Ayo Akintilo's personal portfolio, actively maintained (52 commits, last push 2026-10-23) | Vite 6 + React 19 SPA, JSON content in `site/content`, Decap CMS at `/admin`, build-time prerender to static HTML, `sharp` image optimization, GitHub Pages workflow | **Pattern reference only.** Its Git-based content model, Decap editor, prerender step and asset-inventory doc are proven patterns we can reuse. Do not build MoneyTakers inside it. |
| `no1owns/web-portfolio` | An earlier hand-built personal portfolio (`work.akintilo.com`) | Static HTML/CSS/JS, Puppeteer scrape scripts | Not relevant. |

The account can also reach `ForgeHQ`, `sirenszen-wellness`, `cleanbybelle` and `100MalcolmX`. None of them is named for MoneyTakers.

## 2. Empty repository or existing website?

**Neither. There was no MoneyTakers repository.** This repository, `no1owns/moneytakers-web`, was created on 2026-10-25 for the project and starts empty apart from a README.

- **Needs confirmation:** whether the repository should later move to a client-owned GitHub organization for handover.
- **Needs confirmation:** whether MoneyTakers already has a live website (URL, platform, any SEO equity or URLs to redirect). The "original website proposal" is mentioned in the brief, but I don't have the document. Please share it so the EPK and booking requirements carry over exactly.

## 3. Recommended technical architecture

### Recommendation: Astro, static-first, with Git-based content and a visual CMS

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro** (latest stable) with TypeScript | Static HTML by default and zero JS unless a component needs it. That makes it the fastest route to strong Core Web Vitals and SEO on a media-heavy site. Typed **content collections** (Zod schemas) enforce the content model. Interactive islands (players, filters, forms) can use React, which matches your existing portfolio work. |
| Styling | Plain CSS with design tokens (custom properties) and scoped component styles | Leaves the visual direction fully open, avoids Tailwind/SaaS-template aesthetics, and makes a brand system easy to swap. |
| Motion | CSS + View Transitions API, with GSAP only if the creative direction needs it | Entertainment-grade motion without a heavy default. Every effect respects `prefers-reduced-motion`. |
| Content | Markdown/JSON collections in the repo, edited through a CMS (see §5) | Version history, previews per branch, no database to run. |
| Automated content | Build-time ingestion of podcast RSS and YouTube feeds (see §6) | New episodes appear without anyone editing the site. |
| Forms | Serverless endpoint (host function) + spam protection (Cloudflare Turnstile or hCaptcha) → email + optional CRM/Sheet | Booking leads are business-critical, so they need to be routed and logged, not just sent through a mailto link. |
| Commerce | External platform, embedded or linked (see §6.4) | No payment handling on our side. |
| Hosting | Static host with serverless functions and per-branch preview URLs (see §7) | Low cost, fast and secure. |

**Why not reuse the akintilo-portfolio stack directly?** It's a client-rendered React SPA with a custom prerender script. That works for a portfolio. MoneyTakers needs thousands of potential episode pages, structured data and RSS ingestion, and Astro handles all of that natively with less custom code. We should still carry over the Decap CMS setup, the asset-inventory discipline and the "never invent content" policy.

**Alternatives considered:**
- **Webflow:** fastest for non-technical editors, and a Webflow connector is available in this environment. Its weaknesses are automated RSS/YouTube ingestion, custom media logic and plan costs as CMS items grow. Worth considering if MoneyTakers' team must own the site with no developer involved. **Needs confirmation:** who maintains the site after launch.
- **Next.js:** capable, but it brings more runtime complexity than a mostly static brand site needs.
- **WordPress:** good editor experience, but hosting, plugin and security overhead, and it's harder to keep visually distinctive and fast.

### Extensibility principle: "divisions" as data

Each business category (Podcasts, Music, Entertainment, Shop, and future ones such as Film, Management or Brand Partnerships) is a **Division** record in the CMS. Each has a name, slug, tagline, hero media, brand accent, featured content and nav order. Navigation, the homepage division strip and the generic `/[division]` landing template all read from that record. Adding a new business line means adding one CMS entry, not restructuring the site. A division can later "graduate" to a custom template without changing its URL.

## 4. Proposed sitemap and reusable component structure

### Sitemap (proposed, not locked)

```
/                               Home: brand story, division showcase, latest drops, upcoming events, Book CTA
/podcasts                       Network hub: all shows, latest episodes across shows
/podcasts/[show]                Show page: artwork, description, hosts, listen-on links, episode archive
/podcasts/[show]/[episode]      Episode page: player (video and/or audio), notes, guests, links, transcript
/music                          Music hub: artists/projects, releases, production services
/music/releases/[release]       Release page: artwork, tracklist, embeds, smart links, credits
/music/production               Production services + inquiry CTA (Needs confirmation: is this offered?)
/entertainment                  Live entertainment: performances, appearances, highlight reel, Book CTA
/events                         Upcoming + past events (filterable)
/events/[event]                 Event detail: date, venue, tickets link, media from the night
/book                           Booking & business inquiry form (routed by inquiry type)
/epk                            Electronic press kit: bio(s), photos, stage plot/rider, press, video
/shop                           Merch storefront (embedded) or handoff to external store
/about                          Story, team/talent, values, partners
/contact                        General contact, press, collaborations, social
/press                          Press coverage and media resources (could merge into /epk)
/[division]                     Generic landing for future business categories
/privacy, /terms, /404
```

Notes:
- **Book** should be a persistent primary action in the header on every page, because bookings are the main revenue route from the original proposal.
- **EPK:** **Needs confirmation** on whether it's public, unlisted (shared by link), or has downloadable assets behind a simple access step. Promoters expect a fast, printable/downloadable EPK.
- **Talent pages** (`/talent/[person]`): include them if MoneyTakers represents multiple artists or hosts. **Needs confirmation.**
- URL vocabulary ("Entertainment" vs "Live" vs "Bookings") is a brand decision. The structure doesn't depend on it.

### Reusable components

**Layout and navigation**
- `SiteHeader` (with persistent Book CTA), `MobileNav` (full-screen, focus-trapped), `SiteFooter`, `SkipLink`, `Breadcrumbs`

**Storytelling and presentation** (where the brand personality lives)
- `HeroStage`: full-bleed video loop, image or type-driven hero, with a reduced-motion fallback
- `DivisionShowcase`: homepage strip or grid of divisions, driven by Division records
- `StoryBlock`: alternating text/media narrative sections
- `Marquee` / `TickerBand`: announcements, "new episode", "on tour"
- `PressQuote`, `LogoWall` (partners, venues, press), `StatBand` (only with verified figures)
- `Gallery` with an accessible `Lightbox` (can be adapted from the akintilo-portfolio implementation)

**Media**
- `YouTubeEmbed`: click-to-load facade (thumbnail first, `youtube-nocookie.com`), so pages don't load YouTube until the visitor clicks
- `SpotifyEmbed`: lazy-loaded show, episode, track, album or playlist embed
- `AudioPlayer`: native `<audio>` player for RSS enclosure URLs, with a keyboard-accessible custom skin
- `ListenOn`: platform link row (Spotify, Apple Podcasts, YouTube, Amazon/Audible, RSS, etc.), driven by data
- `StreamOn`: music equivalent (Spotify, Apple Music, Tidal, YouTube Music, Audiomack, Bandcamp…) or a smart-link button

**Content cards and lists**
- `ShowCard`, `EpisodeCard`, `EpisodeList` (paginated, searchable, season filter)
- `ReleaseCard`, `Tracklist`, `Credits`
- `EventCard`, `EventList` (upcoming/past split, automatic based on date)
- `ProductTile` / `ShopEmbed`
- `TalentCard`

**Conversion**
- `InquiryForm` (types: live booking, appearance/hosting, podcast guest/sponsorship, music production, brand partnership, press, general), `BookingCTA`, `NewsletterSignup` (**Needs confirmation:** email platform)

**SEO and system**
- `SEOHead` (title, description, Open Graph/Twitter cards, canonical)
- `JsonLd` with schema.org types: `Organization`, `PodcastSeries`, `PodcastEpisode`, `MusicGroup`/`MusicAlbum`/`MusicRecording`, `Event`, `Product` (for external items, where appropriate)

## 5. Recommended content management approach

### Content model (collections)

| Collection | Key fields | Source |
|---|---|---|
| **Division** | name, slug, tagline, description, accent, hero media, featured items, nav order, visible | CMS |
| **Show** (podcast/original show) | title, slug, description, artwork, hosts, RSS feed URL, YouTube playlist ID, platform links, status (active/hiatus/ended), division | CMS |
| **Episode** | show, title, slug, number/season, date, description, artwork, audio URL, YouTube ID, Spotify ID, duration, guests, transcript, explicit flag | **Auto from RSS/YouTube**, plus optional CMS overrides |
| **Release** (music) | title, type (single/EP/album/mixtape), artist(s), date, artwork, tracklist, embeds, smart link, credits, ISRC/UPC (optional) | CMS |
| **Event** | title, date/time + timezone, venue, city, ticket URL, status (announced/sold out/cancelled/past), lineup, media recap | CMS |
| **Service / Booking offer** | name, description, ideal for, media, CTA | CMS |
| **Talent** | name, role, bio, photos, socials, EPK assets | CMS |
| **Product** (pointer) | name, image, external URL/ID, featured | CMS or pulled from the commerce platform |
| **Press item** | outlet, headline, URL, date, quote | CMS |
| **Media asset** | see the asset inventory (§6.6) | Inventory sheet + CMS media fields |
| **Site settings** | contact emails, socials, booking routing, SEO defaults, announcement banner | CMS |

### CMS recommendation

- **Phase 1 default: Decap CMS** (free, Git-based, already proven in your portfolio repo). Editors use a web UI. Each save is a Git commit that triggers a rebuild, and the editorial workflow can open draft PRs for review before publishing.
- **Upgrade route: Sanity** (hosted, real-time editor, scheduled publishing, better for several non-technical editors and lots of media). Astro supports both well, and the content model above transfers directly.
- **Needs confirmation:** how many people will edit content, how technical they are, and whether they need scheduled publishing. That decides Decap vs Sanity before Phase 1 ends.

**Editorial rule:** the CMS has structured fields only, with no free-form page builder. That keeps the design intentional and accessible while still making day-to-day updates (new event, new release, homepage feature) a form fill.

## 6. Media and podcast integration strategy

### 6.1 General media rules
- **No large video or audio files in Git.** Video lives on YouTube (or Vimeo/Mux if ad-free brand reels are needed). Audio lives on the podcast host or DSPs. The site embeds or links.
- **Images:** small brand images can live in the repo and be optimized at build time with Astro's image pipeline (AVIF/WebP, responsive sizes). For a large photo library, use an image CDN (Cloudinary, Cloudflare Images, or the CMS's asset CDN if Sanity). **Needs confirmation:** expected image volume.
- **Background hero loops** (short, silent, under about 3 MB) may be self-hosted on the CDN or host, never committed as source masters.
- **Privacy and performance:** all third-party embeds use click-to-load facades. **Needs confirmation:** whether a cookie consent banner is required for the target audience (EU/UK visitors, analytics choice).

### 6.2 Podcast publishing (distribution is separate from the website)

```
Recording → Podcast host (system of record: audio + RSS)
                 ├─► Spotify, Apple Podcasts, Amazon, Pocket Casts, etc. (via RSS)
                 ├─► YouTube (video upload, or RSS ingestion for audio-only shows)
                 └─► Website (reads RSS + YouTube at build time, displays only)
```

- **Podcast host:** Spotify for Creators, or an alternative (Buzzsprout, Transistor, Libsyn, Captivate). Transistor and Captivate handle **multiple shows under one account** well, which matters for a podcast network. **Needs confirmation:** current host(s) and RSS feed URLs per show.
- **YouTube:** each show gets a playlist. Video podcasts publish to YouTube directly. YouTube can also ingest an RSS feed for audio-only shows. **Needs confirmation:** channel(s), and whether each show has its own channel or playlist.
- **The website is never the host.** It doesn't store audio or generate the primary RSS feed.

**Maintainable workflow for new episodes:**
1. Publish the episode on the podcast host (and YouTube if it's a video episode). This is already part of the normal workflow.
2. A scheduled site rebuild (for example every hour or every few hours via GitHub Actions or a host cron, plus an optional webhook from the host) fetches each show's RSS feed and YouTube playlist feed.
3. Episodes are **matched across sources** (by GUID mapping, title + date, or an explicit YouTube ID override) so each episode page shows the video and the audio player together.
4. New episode pages, show archives, sitemaps and structured data are generated automatically.
5. **Optional:** an editor adds enhanced content in the CMS (custom artwork, pull quotes, guest links, transcript, a "featured" flag). CMS overrides win over feed data.
6. **Failsafe:** if a feed is unreachable during a build, the last good snapshot is kept, so the site never publishes an empty archive.

Episode metadata, descriptions and artwork come from the feed, so there's one source of truth and no double entry.

### 6.3 Commercial music distribution (kept separate from podcasts)

| | Podcasts | Commercial music |
|---|---|---|
| Distributor | Podcast host via **RSS** | Music distributor (DistroKid, TuneCore, UnitedMasters, CD Baby, a label, etc.) delivering to DSPs |
| Identifiers | RSS GUID | **ISRC** (tracks), **UPC** (releases) |
| Rights and revenue | Ads, sponsorships, subscriptions | Streaming royalties, publishing (PRO), sync, Content ID |
| Website role | Ingest the feed and display it | Curated release pages with embeds + smart links (Feature.fm, Linkfire, ToneDen, or a self-built link page) |

The website does **not** ingest music automatically. Releases are curated CMS entries, because each one is a creative and marketing moment. The Spotify artist embed and per-release embeds can show the live catalog. **Needs confirmation:** distributor, artist names/profiles, and whether production services (beats, mixing, studio) are sold. If so, that's a lead-generation page rather than a catalog.

### 6.4 Merchandise
Options, ordered by recommendation for a creator/entertainment brand:
1. **Shopify** (Basic, or Starter for social-first selling) with the **Buy Button / Storefront API** embedded on `/shop`, so customers stay on-brand and checkout is handled by Shopify. Best if merch is a real revenue line.
2. **Creator merch platforms** (Fourthwall, Spring, Printful + store): print-on-demand with no inventory, simple embed or link-out, and YouTube merch-shelf integration.
3. **Link-out only** to an existing store. This is the fastest launch option and can be upgraded later.

**Needs confirmation:** whether a store already exists, inventory vs print-on-demand, and who handles fulfillment.

### 6.5 Events and booking
- Events are CMS entries with ticket links (Eventbrite, DICE, Ticketmaster, Posh, a venue site). The site lists them and doesn't sell tickets. Past events turn into recaps with media automatically.
- **Optional:** sync from Bandsintown or Songkick if MoneyTakers already uses them. **Needs confirmation.**
- **Booking form fields** (draft): name, organization, email, phone, inquiry type, event date(s), city/venue, event type, audience size, budget range, talent/service requested, details, how they heard about us, and consent. Submissions are emailed to a routed inbox per inquiry type, logged to a sheet or CRM, and the sender gets an auto-reply. **Needs confirmation:** inbox addresses per inquiry type, required fields, and whether budget ranges should be shown.

### 6.6 Content and asset inventory
A starter inventory is provided as `docs/asset-inventory.csv`, with columns for the fields in the brief plus a few extras that make it workable:

`Asset ID, Asset name, URL or file reference, Type, Business category / division, Associated page, Status, Usage rights / approval status, Rights holder / credit, Alt text / caption, Supplied by, Date received, Notes`

- **Status values:** Requested · Received · In review · Approved · Live · Retired
- **Usage-rights values:** Owned by MoneyTakers · Licensed (terms in notes) · Pending approval · Third-party (credit required) · Not cleared, do not use
- The inventory (`docs/asset-inventory.csv`) is a **template with no rows**. It contains no invented assets. It should be filled from the client-supplied URLs, with a shared Google Sheet as the editing copy if the client prefers.

## 7. Deployment and hosting recommendations

| Option | Fit | Notes |
|---|---|---|
| **Cloudflare Pages** (recommended) | Excellent | Free tier is generous, global CDN, Pages Functions for forms, built-in Turnstile spam protection, preview URL per branch, cron/webhook rebuilds, R2 storage for any self-hosted loops. |
| Netlify | Excellent | Built-in Forms (simplest booking-form setup), deploy previews, scheduled builds. |
| Vercel | Very good | Strong previews. A Vercel connector is available in this environment for deployment management. |
| GitHub Pages | Adequate | No server-side forms or functions, so it would need a third-party form service. |

Common setup:
- `main` → production, every other branch/PR → preview URL for your design reviews
- CI on every PR: typecheck, build, link check, Lighthouse CI budget (performance, accessibility, SEO), and axe accessibility checks
- Scheduled rebuild (feed ingestion) + CMS-triggered rebuild
- Analytics: privacy-friendly (Plausible, Fathom, or Cloudflare Web Analytics), or GA4 if the client needs it. **Needs confirmation.**
- **Domain and DNS:** **Needs confirmation** for the domain, registrar, and who controls DNS. Email deliverability (SPF/DKIM) for form notifications must be set up on that domain.

### Quality targets
- **Accessibility:** WCAG 2.2 AA. Keyboard-complete navigation, visible focus, sufficient contrast on dark/expressive palettes, captions on video (YouTube captions), transcripts for episodes where available, no autoplaying sound, motion respects `prefers-reduced-motion`.
- **Performance:** LCP < 2.5 s, CLS < 0.1, INP < 200 ms on mid-range mobile over 4G. Third-party embeds are deferred.
- **SEO:** semantic HTML, per-page metadata, JSON-LD, XML sitemap, RSS link tags, Open Graph images per episode, release and event (can be auto-generated from artwork).

## 8. Missing information, credentials and assets

### Business and brand (all Needs confirmation)
- Original website proposal document (EPK and booking scope)
- Brand assets: logo files (SVG), wordmark, colors, typefaces/licenses, existing brand guidelines
- Approved company description, history and boilerplate. **No copy will be written as fact without approval.**
- People and talent: who is featured (founders, artists, hosts, DJs, performers), with approved bios and photos
- Exact list of business divisions at launch and their naming
- Target audiences in priority order (promoters/clients vs fans), which shapes homepage hierarchy
- Existing website URL (if any) and URLs to redirect
- Visual references and mood boards (for the creative exploration phase)

### Podcasts
- Show list, with title, description, artwork (minimum 3000×3000) and hosts for each
- Podcast host(s) and **RSS feed URL per show**
- YouTube channel(s)/playlist IDs per show
- Platform listing URLs (Spotify, Apple, Amazon, etc.)

### Music
- Artist/project names and Spotify/Apple Music artist URLs
- Release list with artwork, links and credits
- Distributor (for context, no access needed)
- Whether production services are offered, and how they're priced or scoped

### Entertainment and events
- Services offered (live performance, hosting, appearances, DJ sets, etc.)
- Upcoming and past events, with ticket links
- EPK contents: bios, press photos (hi-res, credited), stage plot, tech rider, hospitality rider, press quotes, highlight reel URL
- Booking inquiry routing: which inbox gets which inquiry type

### Shop
- Commerce platform (existing or to be created), store URL, product list, fulfillment model

### Credentials and access (to be supplied later through secure channels, never in chat or the repository)
- GitHub: repository creation (or ownership decision) and collaborator access
- Hosting account (Cloudflare/Netlify/Vercel), owned by MoneyTakers if possible
- Domain registrar / DNS access
- Podcast host account (only needed for webhooks; RSS is public)
- YouTube Data API key (optional; the public channel/playlist RSS works without a key for the latest 15 items, but full archives need the API)
- Shopify (or other) Storefront API token, if embedding
- Email/form delivery service and recipient addresses
- Newsletter platform API (if signup is in scope)
- Analytics account

### Legal and rights
- Usage rights for every photo/video (photographer credits, model releases where relevant)
- Clearance for any music used in site videos or hero loops
- Privacy policy and terms (client's legal responsibility; we provide placeholders flagged for review)

## 9. Phased implementation roadmap

Each phase ends with a review gate with you before the next one starts.

**Phase 0: Setup and discovery (now)**
- ~~Create the repository~~ (done); set up branch protections; confirm long-term ownership
- Collect answers to §8; start filling the asset inventory
- Confirm sitemap and division list
- Decide CMS (Decap vs Sanity), host, and commerce platform
- *Output:* signed-off architecture and content model

**Phase 1: Creative exploration (runs in parallel with Phase 2)**
- 2–3 contrasting visual directions as interactive prototypes of the homepage + one inner page (for example a podcast show page), using real supplied assets only
- Typography, color, motion language, photo/video treatment
- Accessibility check of each direction (contrast, motion)
- *Output:* chosen direction → design tokens

**Phase 2: Foundation**
- Astro scaffold, TypeScript, lint/format, CI (build, Lighthouse, axe)
- Content collections + schemas for all collections in §5
- CMS wired to the repo with preview builds
- Base layout, header/nav/footer, SEO head, 404
- Hosting connected to preview URLs (no production domain yet)
- *Output:* working skeleton site on a preview URL

**Phase 3: Podcasts (the most complex integration, done first)**
- RSS + YouTube ingestion, episode matching, snapshot fallback
- Podcast hub, show pages, episode pages, players, listen-on links, structured data
- Scheduled rebuilds
- *Output:* all real shows and archives live on preview

**Phase 4: Entertainment, bookings and EPK**
- Entertainment page, events (upcoming/past), event detail pages
- Booking/inquiry form with routing, spam protection, auto-reply, logging
- EPK page with downloadable assets
- *Output:* the booking funnel from the original proposal is complete

**Phase 5: Music, Shop, About/Contact, Home**
- Music hub, release pages, production services
- Shop integration
- About, Contact, Press
- Homepage assembled from live content (latest episodes, next events, featured release, merch)
- *Output:* feature-complete site

**Phase 6: QA and launch**
- Content population and proofreading against approved copy
- Cross-device testing (real iOS/Android devices), WCAG 2.2 AA audit, performance budget
- Redirects from any existing site, analytics, Search Console, sitemap submission
- Editor training and a short "how to update the site" guide
- DNS cutover (only with explicit approval)

**Phase 7: Post-launch**
- Monitor forms, feeds and Core Web Vitals
- Add new divisions as CMS entries
- Optional: newsletter, talent pages, video hub, sponsor/media kit page, merch drops with countdowns

---

## Decisions needed from you to start Phase 0

1. ~~**Where does the code live?**~~ Resolved: `no1owns/moneytakers-web`. Transfer to a client-owned organization later is still Needs confirmation.
2. **Who edits content after launch?** This decides Decap vs Sanity, or Webflow as an alternative.
3. **Hosting preference.** Cloudflare Pages is recommended. Does an account exist under MoneyTakers?
4. **Commerce.** Is there an existing store or platform?
5. **Original proposal and brand assets.** Please share them so Phase 1 starts from real material.
