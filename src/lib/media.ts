import {
  CMS_BUCKET,
  LEGACY_MEDIA_BUCKET,
  SEED_BUCKET,
  supabase,
} from "./supabase";

export type MediaMode = "online" | "offline" | "auto";

const OFFLINE_MEDIA_BASE = "/offline-media";
const DEFAULT_MEDIA_MODE: MediaMode = "online";
const LEGACY_PREFIXES = ["events/", "presenters/", "shorts/"];
const CMS_PREFIXES = ["cms/"];

function parseMediaMode(value: string | undefined): MediaMode {
  if (!value) {
    return DEFAULT_MEDIA_MODE;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "online" || normalized === "offline" || normalized === "auto") {
    return normalized;
  }

  return DEFAULT_MEDIA_MODE;
}

function normalizeStoragePath(storagePath: string): string {
  return storagePath.replace(/^\/+/, "").replace(/\\/g, "/");
}

function resolveBucketForPath(storagePath: string): string {
  const normalized = normalizeStoragePath(storagePath);

  if (CMS_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return CMS_BUCKET;
  }

  if (LEGACY_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return LEGACY_MEDIA_BUCKET;
  }

  return SEED_BUCKET;
}

function toOfflineUrl(storagePath: string): string {
  const normalized = normalizeStoragePath(storagePath);
  const encodedPath = normalized
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${OFFLINE_MEDIA_BASE}/${encodedPath}`;
}

export const mediaMode: MediaMode = parseMediaMode(import.meta.env.VITE_MEDIA_MODE);

export const isOffline =
  mediaMode === "offline" ||
  (mediaMode === "auto" &&
    import.meta.env.DEV &&
    typeof navigator !== "undefined" &&
    navigator.onLine === false);

export function resolveMediaUrl(storagePath: string | null): string | null {
  if (!storagePath) {
    return null;
  }

  const normalized = normalizeStoragePath(storagePath);

  const isCmsAsset = CMS_PREFIXES.some((prefix) => normalized.startsWith(prefix));

  // CMS assets are uploaded to Supabase at runtime, so they have no local
  // offline-media counterpart. Continue resolving those paths from Storage.
  if (isOffline && !isCmsAsset) {
    return toOfflineUrl(normalized);
  }

  const bucket = resolveBucketForPath(normalized);
  const { data } = supabase.storage.from(bucket).getPublicUrl(normalized);
  return data.publicUrl;
}
