#!/usr/bin/env node
// Accessibility scan of the built site (dist/) with axe-core in Chromium.
// Every page is checked at phone and desktop widths in light and dark mode
// against WCAG 2.2 A/AA. Also fails on horizontal scrolling at phone width.
// Run after `npm run build`. Third-party embeds are blocked: only this
// site's own markup is audited.
import { createServer } from 'node:http';
import { readdir, readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { chromium } from 'playwright';

const dist = path.resolve('dist');
// Serve the site under the same base path the build used.
const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
const axeSource = await readFile(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

async function* pages(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* pages(full);
    else if (entry.name.endsWith('.html')) {
      const rel = '/' + path.relative(dist, full).split(path.sep).join('/');
      yield rel.replace(/index\.html$/, '');
    }
  }
}

const server = createServer(async (req, res) => {
  const fullPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (base && !fullPath.startsWith(base)) return res.writeHead(404).end();
  const urlPath = fullPath.slice(base.length) || '/';
  for (const candidate of [urlPath, path.join(urlPath, 'index.html')]) {
    const file = path.join(dist, candidate);
    if (!file.startsWith(dist)) break;
    try {
      if ((await stat(file)).isFile()) {
        res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
        return res.end(await readFile(file));
      }
    } catch {
      // try next candidate
    }
  }
  res.writeHead(404).end();
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const routes = [];
for await (const route of pages(dist)) routes.push(route);

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : undefined,
);
const viewports = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 900 },
];
let problems = 0;

for (const colorScheme of ['light', 'dark']) {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, colorScheme });
    const page = await context.newPage();
    await page.route(
      (url) => url.origin !== origin,
      (route) => route.abort(),
    );
    for (const route of routes) {
      await page.goto(origin + base + route);
      await page.addScriptTag({ content: axeSource });
      const result = await page.evaluate(() =>
        // eslint-disable-next-line no-undef
        axe.run({ runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }),
      );
      for (const v of result.violations) {
        problems++;
        console.error(`${route} [${viewport.name}, ${colorScheme}] ${v.id} (${v.impact}): ${v.help}`);
        for (const node of v.nodes.slice(0, 3)) console.error(`    ${node.target.join(' ')}`);
      }
      if (viewport.name === 'phone' && (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))) {
        problems++;
        console.error(`${route} [phone, ${colorScheme}] page scrolls horizontally`);
      }
    }
    await context.close();
  }
}

await browser.close();
server.close();

if (problems) {
  console.error(`\n${problems} accessibility problem(s) found.`);
  process.exit(1);
}
console.log(`Accessibility OK: ${routes.length} pages × 2 widths × light/dark, no violations.`);
