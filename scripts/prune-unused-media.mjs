// Astro integration: keeps raw owner media out of the published site.
//
// Everything in public/ is copied into the build and published. The
// owner-supplied photo and video folders (public/photos, public/videos) are
// working material, not site content, so after the build this removes every
// file in them that no built page, stylesheet or script refers to. A file a
// published page does use is kept. The source files are never touched.
import { readdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TEXT_FILES = /\.(html|css|js|mjs|json|xml|txt|svg|webmanifest)$/i;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function removeEmptyDirs(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) await removeEmptyDirs(path.join(dir, entry.name));
  }
  if ((await readdir(dir)).length === 0) await rm(dir, { recursive: true });
}

/** @param {{ dirs?: string[] }} [options] folders under the build root to prune */
export function pruneUnusedMedia({ dirs = ['photos', 'videos'] } = {}) {
  return {
    name: 'prune-unused-media',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const exists = async (p) =>
          stat(p).then(
            () => true,
            () => false,
          );

        // Everything a published page could refer to, as one searchable string.
        const pruneRoots = dirs.map((d) => path.join(root, d));
        let haystack = '';
        for await (const file of walk(root)) {
          if (pruneRoots.some((r) => file.startsWith(r + path.sep))) continue;
          if (TEXT_FILES.test(file)) haystack += (await readFile(file, 'utf8')) + '\n';
        }

        let removed = 0;
        let kept = 0;
        for (const folder of pruneRoots) {
          if (!(await exists(folder))) continue;
          for await (const file of walk(folder)) {
            const rel = path.relative(root, file).split(path.sep).join('/');
            const used = haystack.includes(rel) || haystack.includes(encodeURI(rel));
            if (used) {
              kept++;
              logger.info(`kept ${rel} (a published page uses it)`);
            } else {
              await rm(file);
              removed++;
            }
          }
          if (await exists(folder)) await removeEmptyDirs(folder);
        }
        logger.info(`${removed} unused media file(s) left out of the build, ${kept} kept`);
      },
    },
  };
}
