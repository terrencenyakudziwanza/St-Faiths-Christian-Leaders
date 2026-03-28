import type { CmsMediaRef } from "../types/cms";
import { resolveMediaUrl } from "./media";

export function resolveCmsMedia(media?: CmsMediaRef | null): string | null {
  if (!media) {
    return null;
  }

  if (media.storagePath) {
    return resolveMediaUrl(media.storagePath);
  }

  if (media.url) {
    return media.url;
  }

  return null;
}

export function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function slugify(value: string): string {
  return normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
