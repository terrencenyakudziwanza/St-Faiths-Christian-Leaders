import { MEDIA_BUCKET, supabase } from "../lib/supabase";
import type { ShortItem } from "../types/domain";

type ShortRow = {
  id: string;
  title: string;
  storage_path: string;
  thumbnail_path: string | null;
  like_count: number | null;
  published_at: string;
};

function publicUrlFor(storagePath: string | null): string | null {
  if (!storagePath) {
    return null;
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

function mapShort(row: ShortRow): ShortItem {
  const publicUrl = publicUrlFor(row.storage_path);

  if (!publicUrl) {
    throw new Error(`Could not resolve short URL for path "${row.storage_path}"`);
  }

  return {
    id: row.id,
    title: row.title,
    storagePath: row.storage_path,
    publicUrl,
    thumbnailPath: row.thumbnail_path,
    thumbnailUrl: publicUrlFor(row.thumbnail_path),
    likeCount: row.like_count ?? 0,
    publishedAt: row.published_at,
  };
}

export async function fetchShorts(limit = 8): Promise<ShortItem[]> {
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
