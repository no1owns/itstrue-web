# Homepage owner-review preview

The homepage (`src/pages/index.astro`) implements "Homepage Work 1" from the design handoff dated 2026-10-31, for early owner review. **It is not approval to launch.** The page is `noindex, nofollow`, `robots.txt` disallows crawling, and no sitemap, canonical link, analytics, cookies or form backend exist.

Interior pages (`/podcasts/`, `/music/` and the rest) still use the earlier neutral placeholder design. They were not rebuilt.

## Structure

| Part                                          | Location                                                                                                                                                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page                                          | `src/pages/index.astro`                                                                                                                                                                                             |
| Layout (own head, no placeholder site styles) | `src/layouts/ItsTrueLayout.astro`                                                                                                                                                                                   |
| Sections                                      | `src/components/itstrue/`: `Header`, `Hero`, `About`, `WorkIndex`, `MusicSection`, `PodcastSection`, `FashionSection`, `MusicalSection`, `EventsSection`, `BookingSection`, `FollowSection`, `ClosingCta`, `Footer` |
| Shared pieces                                 | `ParentMark` (provisional logo), `SocialIcon`, `ExternalLink`                                                                                                                                                       |
| Kept, not rendered                            | `BookingForm.astro` (reference form design; needs an authorized form service)                                                                                                                                       |
| Copy, links, contact details                  | `src/data/home.ts`                                                                                                                                                                                                  |
| Styles                                        | `src/styles/itstrue/tokens.css`, `fonts.css`, `home.css`                                                                                                                                                            |
| Fonts (self-hosted, SIL OFL)                  | `src/assets/fonts/`                                                                                                                                                                                                 |
| Images                                        | `public/images/home/`                                                                                                                                                                                               |

`home.css` contains only the rules from the handoff's reference stylesheet that match the built homepage (291 of 845), in their original order. It's about 28 KB, down from 234 KB. Anton and both texture images were unused and are not shipped.

## Images and rights

| File                                         | Use                                                   | Status                                                                     |
| -------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------- |
| `hero_smoke_1440.jpg`, `hero_smoke_2880.jpg` | Hero composite (srcset), byte-identical to the export | Rights confirmed by the design lead 2026-10-31, not independently verified |
| `home-duo-smiling-ALP05122.jpg`              | About portrait                                        | Same; only 420 px wide, larger master needed                               |
| `podcast-duo-conversational-ALP05153.jpg`    | TwinWay portrait                                      | Same; only 420 px wide, larger master needed                               |
| `pk_sdb-9538.jpg`, `pk_sdb-9550.jpg`         | Spend DaT Bread concept images                        | Same; provenance of 9538 unconfirmed                                       |
| `pk_sdb-wordmark.jpg`                        | Spend DaT Bread wordmark crop                         | OK for owner preview; clean master needed                                  |
| `brand-moneytakers-logo-B036E93D.jpg`        | Moneytakers logo, unaltered                           | OK for owner preview; master needed                                        |

The parent mark is the design lead's **provisional** trace. The owner raster that spells "Entertainment" (singular) is not used.

## Navigation map as applied (proposal; needs design-lead confirmation)

Interior pages don't exist, so every link goes to a section on this page:

- **Header and drawer:** About → `#about`, Our Work → `#work`, Music → `#music`, Podcast & Media → `#twinway`, Acting → `#work`, Fashion → `#fashion`.
- **Work index:**
  - Acting, Modeling, Production & Engineering, Hosting and Brand Partnerships → `#book`
  - Dance & Tap → `#musical`
  - Music, Podcast & Radio and Fashion → their own sections
- **Footer:** Dance → `#musical`, Modeling and Acting → `#work`, TRAP TAP TWINS → `#musical`, Events → `#events`.
- **Omitted:** "Read the story" and "See the lookbook" (no such pages yet).
- **Booking:** the reference form is replaced with a contact panel: a "Request a Quote" email button plus `mailto:` and both `tel:` links. Nothing is collected or submitted.

## Copy changes from the reference

Internal review labels were removed or replaced, as listed in the handoff's `content/internal_labels_to_remove.md`:

- removed the review tags on Acting, Dance & Tap and Brand Partnerships
- shortened Fashion's tag to "In development"
- shortened the Moneytakers caption to "Moneytakers"
- removed the TwinWay episode note and the wordmark caption
- shortened the wordmark alt text to "Spend DaT Bread wordmark"
- shortened the Fashion note to "Concept images. Collection in development."

One footer line was added: "Pre-launch preview for owner review. Not the final website."

## Before any full launch

- a written rights record for every image
- larger portrait masters
- a corrected plural parent logo master and the final logo decision
- owner confirmation of the musical's date, age cap and description, the Baltimore address, both phone numbers, every social handle, and the "New York roots and a Baltimore foundation" line
- a booking backend or inbox, a privacy page, the domain and email routing
- sign-off on Spend DaT Bread's relationship to the parent identity
- a favicon for the new brand
- analytics decision, backups, and testing on real iOS and Android devices, Safari, Firefox and screen readers
