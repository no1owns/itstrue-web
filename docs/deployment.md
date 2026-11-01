# Deployment: GitHub Pages

The site is a static Astro build published to GitHub Pages by GitHub Actions.

- **Workflow:** `.github/workflows/deploy.yml` runs on every push to `main` (and can be started by hand from the Actions tab). It builds with the official Astro action (`withastro/action`) and publishes with `actions/deploy-pages`.
- **Checks:** `.github/workflows/ci.yml` runs on every pull request. It runs lint, formatting, type check, asset inventory, build, internal links, and an accessibility scan, and builds under a base path just like Pages does.
- **Development URL:** `https://no1owns.github.io/itstrue-web/`

## One-time GitHub settings (manual)

1. **Settings → Pages → Build and deployment → Source:** choose **GitHub Actions**. The "Deploy from a branch" option won't work with this setup.
2. **Settings → Environments → `github-pages` → Deployment branches:** keep it limited to `main`. Feature branches are checked by CI but not deployed.
3. **Optional repository variables** (Settings → Secrets and variables → Actions → **Variables**):

   | Variable               | Value                                                | Effect                                                                                            |
   | ---------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
   | `PUBLIC_FORM_ENDPOINT` | Form service URL, e.g. `https://formspree.io/f/xxxx` | Turns on the booking form. Leave unset until the service is chosen.                               |
   | `SITE_LIVE`            | `true` **only at launch**                            | Removes `noindex`, allows crawling, and hides all placeholder content and media pending approval. |

   Both are public values that end up in the built site, so use Variables, not Secrets.

## How the URL and base path work

Nothing in the code names the repository or the domain. The deploy workflow reads the Pages configuration with `actions/configure-pages` and passes two values to the build:

|                       | `SITE_URL`                  | `BASE_PATH`    |
| --------------------- | --------------------------- | -------------- |
| Project URL (now)     | `https://no1owns.github.io` | `/itstrue-web` |
| Custom domain (later) | `https://<domain>`          | _(empty)_      |
| Local development     | _(empty)_                   | _(empty)_      |

Every internal link and asset goes through `url()` / `asset()` in `src/lib/paths.ts`, which adds the base path. CI builds under a base path, so a link that skips the helper fails the link check.

## Under development: no indexing

Until `SITE_LIVE` is `true`:

- every page carries `<meta name="robots" content="noindex, nofollow">`
- `robots.txt` disallows all crawling. Crawlers only read `robots.txt` at a domain's root, so on the project URL the `noindex` tag is what keeps pages out of search results.
- a "Preview build" notice appears at the top of every page
- placeholder content and media pending approval are shown with visible labels

## Booking form

GitHub Pages serves static files only, so the form posts directly to an external form service. Any service that accepts a standard HTML form POST works, for example Formspree, Basin or Getform.

1. Create the form in the chosen service and route submissions to the bookings inbox.
2. Set `PUBLIC_FORM_ENDPOINT` (above) and redeploy.
3. The form includes a hidden `_gotcha` honeypot field (Formspree's convention). Turn on the service's own spam filtering too.

Field names sent: `name`, `organization`, `email`, `phone`, `type`, `eventType`, `date`, `location`, `audience`, `budget`, `details`.

## Moving to the custom domain later (not done yet)

No code changes are needed. When approved:

1. In **Settings → Pages → Custom domain**, enter the domain. GitHub creates the `CNAME` setting for Pages-from-Actions sites; no `CNAME` file is needed in the repo.
2. At the DNS provider (possibly Squarespace, **Needs confirmation**):
   - `www`: a `CNAME` record pointing to `no1owns.github.io`
   - apex domain: `A` records for GitHub Pages (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and optionally the matching `AAAA` records
   - Keep the existing email (`MX`) records untouched.
3. Verify the domain in GitHub (Settings → Pages) to protect it from takeover, then turn on **Enforce HTTPS** once the certificate is issued.
4. Re-run the deploy workflow. It picks up the new origin and an empty base path automatically.

Do not change DNS until the domain owner approves the cutover.

## Local commands

```sh
npm ci
npm run dev        # http://localhost:4321
npm run validate   # everything CI runs (needs Chromium for the a11y scan)
```

To preview exactly what Pages will serve:

```sh
BASE_PATH=/itstrue-web SITE_URL=https://no1owns.github.io npm run build
BASE_PATH=/itstrue-web npm run check:links
BASE_PATH=/itstrue-web npm run preview   # http://localhost:4321/itstrue-web/
```
