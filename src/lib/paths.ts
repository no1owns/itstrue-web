// Internal URLs must include the deployment base path (e.g. /itstrue-web
// on the GitHub Pages project URL, nothing on a custom domain). Build every
// internal link and public asset URL with url().
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** url('/podcasts/') → '/itstrue-web/podcasts/' on the project URL. */
export function url(path: string) {
  if (!path.startsWith('/')) throw new Error(`url() expects a root-relative path, got "${path}"`);
  return base + path;
}

/** Current path without the base, for "is this nav item active" checks. */
export function stripBase(pathname: string) {
  return base && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
}

/** Content image/file paths: root-relative ones (files in /public) get the base; full URLs pass through. */
export function asset(src: string) {
  return src.startsWith('/') && !src.startsWith('//') ? url(src) : src;
}
