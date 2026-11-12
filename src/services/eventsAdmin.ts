import { supabase } from "../lib/supabase";
import type { FeedType } from "../types/domain";
import { resolveMediaUrl } from "../lib/media";

export type EventAdminItem = {
  id: string;
  title: string;
  slug: string;
  feedType: FeedType;
  eventDate: string;
  isPublished: boolean;
  thumbnailPath: string | null;
  thumbnailUrl: string | null;
  summary: string;
  presenterName: string;
  presenterRole: string;
  presenterAvatarPath: string | null;
  themeTopic: string;
  verseReference: string;
  verseVersion: string | null;
  verseText: string;
  intercessionPrayerPoints: string[];
  praiseHighlights: string[];
};

export async function fetchAllEvents(): Promise<EventAdminItem[]> {
  const { data, error } = await supabase
    .from("events")
    .select("id, title, slug, feed_type, event_date, is_published, thumbnail_path, summary, presenter_name, presenter_role, presenter_avatar_path, theme_topic, theme_scripture_reference, theme_scripture_version, theme_scripture_text, intercession_prayer_points, praise_highlights")
    .order("event_date", { ascending: false });

  if (error) {
    throw new Error(`Failed to load events: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    feedType: row.feed_type as FeedType,
    eventDate: row.event_date as string,
    isPublished: row.is_published as boolean,
    thumbnailPath: row.thumbnail_path as string | null,
    thumbnailUrl: resolveMediaUrl(row.thumbnail_path as string | null),
    summary: row.summary as string,
    presenterName: row.presenter_name as string,
    presenterRole: row.presenter_role as string,
    presenterAvatarPath: row.presenter_avatar_path as string | null,
    themeTopic: row.theme_topic as string,
    verseReference: row.theme_scripture_reference as string,
    verseVersion: row.theme_scripture_version as string | null,
    verseText: row.theme_scripture_text as string,
    intercessionPrayerPoints: row.intercession_prayer_points as string[],
    praiseHighlights: row.praise_highlights as string[],
  }));
}

export async function createEvent(input: {
  slug: string;
  title: string;
  feedType: FeedType;
  summary: string;
  eventDate: string;
  presenterName: string;
  presenterRole: string;
  presenterAvatarPath?: string | null;
  themeTopic: string;
  themeScriptureReference: string;
  themeScriptureVersion?: string | null;
  themeScriptureText: string;
  intercessionPrayerPoints: string[];
  praiseHighlights: string[];
  isPublished: boolean;
  thumbnailPath?: string | null;
  media?: { mediaType: "picture" | "video"; storagePath: string; caption: string }[];
}): Promise<void> {
  const { data, error } = await supabase.from("events").insert({
    slug: input.slug,
    title: input.title,
    feed_type: input.feedType,
    summary: input.summary,
    event_date: input.eventDate,
    presenter_name: input.presenterName,
    presenter_role: input.presenterRole,
    presenter_avatar_path: input.presenterAvatarPath ?? null,
    theme_topic: input.themeTopic,
    theme_scripture_reference: input.themeScriptureReference,
    theme_scripture_version: input.themeScriptureVersion ?? null,
    theme_scripture_text: input.themeScriptureText,
    intercession_prayer_points: input.intercessionPrayerPoints,
    praise_highlights: input.praiseHighlights,
    is_published: input.isPublished,
    thumbnail_path: input.thumbnailPath ?? null,
  }).select("id").single();

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`);
  }
  if (input.media?.length) {
    const { error: mediaError } = await supabase.from("event_media").insert(input.media.map((item, index) => ({
      event_id: data.id,
      media_type: item.mediaType,
      storage_path: item.storagePath,
      caption: item.caption,
      sort_order: index,
    })));
    if (mediaError) throw new Error(`Event saved but its media could not be linked: ${mediaError.message}`);
  }
}

export async function updateEvent(
  id: string,
  updates: Partial<{
    title: string;
    summary: string;
    eventDate: string;
    presenterName: string;
    presenterRole: string;
    presenterAvatarPath: string | null;
    themeTopic: string;
    themeScriptureReference: string;
    themeScriptureVersion: string | null;
    themeScriptureText: string;
    intercessionPrayerPoints: string[];
    praiseHighlights: string[];
    isPublished: boolean;
  }>,
): Promise<void> {
  const { error } = await supabase
    .from("events")
    .update({
      title: updates.title,
      summary: updates.summary,
      event_date: updates.eventDate,
      presenter_name: updates.presenterName,
      presenter_role: updates.presenterRole,
      presenter_avatar_path: updates.presenterAvatarPath,
      theme_topic: updates.themeTopic,
      theme_scripture_reference: updates.themeScriptureReference,
      theme_scripture_version: updates.themeScriptureVersion ?? null,
      theme_scripture_text: updates.themeScriptureText,
      intercession_prayer_points: updates.intercessionPrayerPoints,
      praise_highlights: updates.praiseHighlights,
      is_published: updates.isPublished,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update event: ${error.message}`);
  }
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`);
  }
}
