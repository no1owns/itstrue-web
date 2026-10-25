import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { isPreview } from './content';

export type MediaAsset = CollectionEntry<'media'>;

const clearedStatus = new Set(['approved', 'live']);
const clearedRights = new Set(['owned', 'licensed', 'third-party-credit']);

/** Approved for use and rights cleared. */
export function isCleared(asset: MediaAsset) {
  return clearedStatus.has(asset.data.status) && clearedRights.has(asset.data.rights);
}

/**
 * Whether an asset may appear on this build. Cleared assets always can;
 * pending ones only on previews, where they carry a "pending approval" label.
 * Assets marked not-cleared or retired never appear.
 */
export function isUsable(asset: MediaAsset) {
  if (asset.data.rights === 'not-cleared' || asset.data.status === 'retired') return false;
  return isCleared(asset) || isPreview;
}

export async function getMedia(id: string) {
  const asset = await getEntry('media', id);
  return asset && isUsable(asset) ? asset : undefined;
}

/** Usable assets tagged for a page, e.g. "entertainment" or "home". */
export async function getMediaForPage(page: string) {
  return (await getCollection('media', (a) => a.data.pages.includes(page))).filter(isUsable);
}
