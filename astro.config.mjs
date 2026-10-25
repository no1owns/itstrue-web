// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL is the final public origin. It stays blank until the domain is
// confirmed; while blank, BaseLayout marks every page noindex.
const site = process.env.SITE_URL || undefined;

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  // Writes sitemap-index.xml only when `site` is set.
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
});
