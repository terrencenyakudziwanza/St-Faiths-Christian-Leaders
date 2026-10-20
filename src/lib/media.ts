import { CMS_BUCKET, LEGACY_MEDIA_BUCKET, supabase } from "./supabase";

function normalizeStoragePath(storagePath: string): string {
  return storagePath.replace(/^\/+/, "").replace(/\\/g, "/");
}

function resolveBucketForPath(storagePath: string): string {
  const normalized = normalizeStoragePath(storagePath);
  return normalized.startsWith("cms/") ? CMS_BUCKET : LEGACY_MEDIA_BUCKET;
}

export function resolveMediaUrl(storagePath: string | null): string | null {
  if (!storagePath) return null;
  const normalized = normalizeStoragePath(storagePath);
  return supabase.storage.from(resolveBucketForPath(normalized)).getPublicUrl(normalized).data.publicUrl;
}
