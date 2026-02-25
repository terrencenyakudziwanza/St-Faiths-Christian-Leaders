import { MEDIA_BUCKET, supabase } from "./supabase";

export type MediaMode = "online" | "offline" | "auto";

const OFFLINE_MEDIA_BASE = "/offline-media";
const DEFAULT_MEDIA_MODE: MediaMode = "online";

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

  if (isOffline) {
    return toOfflineUrl(normalized);
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(normalized);
  return data.publicUrl;
}
