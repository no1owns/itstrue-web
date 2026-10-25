import type { APIRoute } from 'astro';
import { SITE_LIVE } from 'astro:env/server';
import { url } from '../lib/paths';

// Disallow crawling until launch. Note: crawlers only read robots.txt at a
// domain's root, so on the GitHub Pages project URL the per-page noindex
// tag is what keeps the site out of search results.
export const GET: APIRoute = ({ site }) => {
  const body =
    SITE_LIVE && site
      ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL(url('/sitemap-index.xml'), site).href}\n`
      : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
