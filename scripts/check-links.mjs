#!/usr/bin/env node
// Checks that every internal link and asset reference in the built site
// (dist/) points at a file that exists, and that each one includes the base
// path (BASE_PATH, e.g. /moneytakers-web on the GitHub Pages project URL).
// Run after `npm run build`, with the same BASE_PATH the build used.
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const base = (process.env.BASE_PATH || '').replace(/\/$/, '');

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

async function exists(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

async function resolves(urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  const base = path.join(dist, clean);
  return (await exists(base)) || (await exists(path.join(base, 'index.html'))) || (await exists(`${base}.html`));
}

const broken = [];
let checked = 0;
for await (const file of htmlFiles(dist)) {
  const html = await readFile(file, 'utf8');
  for (const [, url] of html.matchAll(/\s(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
    checked++;
    const inBase = !base || url === base || url.startsWith(`${base}/`);
    if (!inBase) broken.push(`${path.relative(dist, file)} → ${url} (missing base path ${base})`);
    else if (!(await resolves(url.slice(base.length) || '/'))) broken.push(`${path.relative(dist, file)} → ${url}`);
  }
}

if (broken.length) {
  console.error(`Broken internal links (${broken.length}):\n  ${broken.join('\n  ')}`);
  process.exit(1);
}
console.log(`Internal links OK (${checked} checked).`);
