#!/usr/bin/env node
// Generates docs/asset-inventory.csv from the media inventory in
// src/content/media/*.json, so there is one source of truth.
//   npm run inventory         rewrite the CSV
//   npm run inventory:check   fail if the CSV is out of date (used in CI)
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const mediaDir = path.resolve('src/content/media');
const csvFile = path.resolve('docs/asset-inventory.csv');

const columns = [
  ['Asset ID', (id) => id],
  ['Asset name', (_, d) => d.name],
  ['URL or file reference', (_, d) => d.url],
  ['Type', (_, d) => d.type],
  ['Provider', (_, d) => d.provider],
  ['Business category / division', (_, d) => d.division],
  ['Associated pages', (_, d) => (d.pages ?? []).join('; ')],
  ['Status', (_, d) => d.status],
  ['Usage rights / approval status', (_, d) => d.rights],
  ['Rights holder / credit', (_, d) => d.rightsHolder],
  ['Alt text / caption', (_, d) => d.alt ?? d.caption],
  ['Supplied by', (_, d) => d.suppliedBy],
  ['Date received', (_, d) => d.dateReceived],
  ['EPK download', (_, d) => (d.epk ? 'yes' : '')],
  ['Notes', (_, d) => d.notes],
];

const cell = (value) => {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const files = (await readdir(mediaDir)).filter((f) => f.endsWith('.json')).sort();
const rows = await Promise.all(
  files.map(async (file) => {
    const data = JSON.parse(await readFile(path.join(mediaDir, file), 'utf8'));
    const id = path.basename(file, '.json');
    return columns.map(([, get]) => cell(get(id, data))).join(',');
  }),
);
const csv = [columns.map(([name]) => cell(name)).join(','), ...rows].join('\n') + '\n';

if (process.argv.includes('--check')) {
  const current = await readFile(csvFile, 'utf8').catch(() => '');
  if (current !== csv) {
    console.error('docs/asset-inventory.csv is out of date. Run `npm run inventory` and commit the result.');
    process.exit(1);
  }
  console.log(`Asset inventory up to date (${files.length} assets).`);
} else {
  await writeFile(csvFile, csv);
  console.log(`Wrote docs/asset-inventory.csv (${files.length} assets).`);
}
