import type { APIRoute } from 'astro';

// Until SITE_URL is set, discourage crawling of preview deployments.
export const GET: APIRoute = ({ site }) => {
  const body = site
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
