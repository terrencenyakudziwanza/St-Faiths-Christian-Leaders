import { offlineShortRows, type OfflineShortRow } from "../data/offlineContent";
import { isOffline, resolveMediaUrl } from "../lib/media";
import { supabase } from "../lib/supabase";
import type { ShortItem } from "../types/domain";

type ShortRow = {
  id: string;
  title: string;
  storage_path: string;
  thumbnail_path: string | null;
  like_count: number | null;
  published_at: string;
};

function mapShort(row: ShortRow): ShortItem {
  const publicUrl = resolveMediaUrl(row.storage_path);

  if (!publicUrl) {
    throw new Error(`Could not resolve short URL for path "${row.storage_path}"`);
  }

  return {
    id: row.id,
    title: row.title,
    storagePath: row.storage_path,
    publicUrl,
    thumbnailPath: row.thumbnail_path,
    thumbnailUrl: resolveMediaUrl(row.thumbnail_path),
    likeCount: row.like_count ?? 0,
    publishedAt: row.published_at,
  };
}

export async function fetchShorts(limit = 8): Promise<ShortItem[]> {
  if (isOffline) {
    return offlineShortRows
      .filter((row) => row.is_published)
      .sort(
        (a, b) =>
          new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
      )
      .slice(0, limit)
      .map((row) => mapShort(row as OfflineShortRow as ShortRow));
  }

  const { data, error } = await supabase
    .from("shorts")
    .select("id, title, storage_path, thumbnail_path, like_count, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch shorts: ${error.message}`);
  }

  return (data ?? []).map((row) => mapShort(row as ShortRow));
}
