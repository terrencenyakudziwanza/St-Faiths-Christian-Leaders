import type { CmsMediaRef } from "../types/cms";
import { resolveMediaUrl } from "./media";
import image50044 from "../assets/images/50044.jpg";
import imagePexels from "../assets/images/pexels-ivan-stecko-305645871-13438939.jpg";
import imageHandwriting from "../assets/images/hand-writing.jpg";
import imageProfileFallback from "../assets/images/b8736a51078588b23134ef9998ede10e.jpg";

// CMS rows can contain Vite development URLs saved by an editor before deployment.
// Map only those known local assets back to their bundled URLs; storagePath and
// legitimate external URLs keep their existing resolution paths.
const devAssetPrefix = ["", "src", "assets", "images", ""].join("/");
const legacyBundledAssetsByName: Record<string, string> = {
  "50044.jpg": image50044,
  "pexels-ivan-stecko-305645871-13438939.jpg": imagePexels,
  "hand-writing.jpg": imageHandwriting,
  "b8736a51078588b23134ef9998ede10e.jpg": imageProfileFallback,
};

function resolveLegacyBundledAsset(url: string): string | null {
  const path = url.replace(/^https?:\/\/[^/]+/i, "").split(/[?#]/, 1)[0];
  if (!path.startsWith(devAssetPrefix)) return null;
  const fileName = path.slice(devAssetPrefix.length).split("/").pop() ?? "";
  return legacyBundledAssetsByName[fileName] ?? null;
}

export function resolveCmsMedia(media?: CmsMediaRef | null): string | null {
  if (!media) {
    return null;
  }

  if (media.storagePath) {
    return resolveMediaUrl(media.storagePath);
  }

  if (media.url) {
    return resolveLegacyBundledAsset(media.url) ?? media.url;
  }

  return null;
}

export function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function slugify(value: string): string {
  return normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
