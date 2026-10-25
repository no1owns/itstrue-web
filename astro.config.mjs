// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Deployment settings come from the environment, so nothing here names the
// repository or the domain. On GitHub Pages the deploy workflow sets
// SITE_URL and BASE_PATH from the Pages configuration:
//   project URL:    SITE_URL=https://no1owns.github.io  BASE_PATH=/moneytakers-web
//   custom domain:  SITE_URL=https://example.com        BASE_PATH= (empty)
// Locally both are empty and the site is served from the root.
const site = process.env.SITE_URL || undefined;
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  // Writes sitemap-index.xml when `site` is set.
  integrations: [sitemap()],
  env: {
    schema: {
      // The launch switch. While false (the default), every page is
      // noindex, robots.txt disallows crawling, and placeholder content and
      // media pending approval are shown with visible labels. Set to true
      // only when the site goes live.
      SITE_LIVE: envField.boolean({ context: 'server', access: 'public', default: false }),
      // Where the booking form posts (an external form service such as
      // Formspree). While unset, the form is shown but can't be submitted.
      PUBLIC_FORM_ENDPOINT: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
});
