import { MEDIA_BUCKET, supabase } from "../lib/supabase";
import type { EventItem, EventMedia, FeedType, MediaType } from "../types/domain";

type EventMediaRow = {
  id: string;
  event_id: string;
  media_type: MediaType;
  storage_path: string;
  caption: string | null;
  tags: string[] | null;
  sort_order: number | null;
};

type EventRow = {
  id: string;
  slug: string;
  title: string;
  feed_type: FeedType;
  summary: string;
  event_date: string;
  presenter_name: string;
  presenter_role: string;
  presenter_avatar_path: string | null;
  event_media: EventMediaRow[] | null;
};

function publicUrlFor(storagePath: string | null): string | null {
  if (!storagePath) {
    return null;
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

function mapMedia(row: EventMediaRow): EventMedia {
  const publicUrl = publicUrlFor(row.storage_path);

  if (!publicUrl) {
    throw new Error(`Could not resolve media URL for path "${row.storage_path}"`);
  }

  return {
    id: row.id,
    eventId: row.event_id,
    mediaType: row.media_type,
    storagePath: row.storage_path,
    publicUrl,
    caption: row.caption ?? "",
    tags: row.tags ?? [],
    sortOrder: row.sort_order ?? 0,
  };
}

function bySortOrder(a: EventMedia, b: EventMedia): number {
  if (a.sortOrder !== b.sortOrder) {
    return a.sortOrder - b.sortOrder;
  }

  return a.id.localeCompare(b.id);
}

function mapEvent(row: EventRow): EventItem {
  const media = (row.event_media ?? []).map(mapMedia).sort(bySortOrder);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    feedType: row.feed_type,
    summary: row.summary,
    eventDate: row.event_date,
    presenterName: row.presenter_name,
    presenterRole: row.presenter_role,
    presenterAvatarPath: row.presenter_avatar_path,
    presenterAvatarUrl: publicUrlFor(row.presenter_avatar_path),
    media,
  };
}

export async function fetchEvents(feedType: FeedType): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from("events")
    .select(
      `
        id,
        slug,
        title,
        feed_type,
        summary,
        event_date,
        presenter_name,
        presenter_role,
        presenter_avatar_path,
        event_media (
          id,
          event_id,
          media_type,
          storage_path,
          caption,
          tags,
          sort_order
        )
      `,
    )
    .eq("is_published", true)
    .eq("feed_type", feedType)
    .order("event_date", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  return (data ?? []).map((row) => mapEvent(row as EventRow));
}

export async function fetchEventMedia(eventId: string): Promise<EventMedia[]> {
  const { data, error } = await supabase
    .from("event_media")
    .select("id, event_id, media_type, storage_path, caption, tags, sort_order")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch event media: ${error.message}`);
  }

  return (data ?? []).map((row) => mapMedia(row as EventMediaRow)).sort(bySortOrder);
}
