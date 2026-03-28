import { supabase } from "../lib/supabase";
import type { FeedType } from "../types/domain";

export type EventAdminItem = {
  id: string;
  title: string;
  slug: string;
  feedType: FeedType;
  eventDate: string;
  isPublished: boolean;
};

export async function fetchAllEvents(): Promise<EventAdminItem[]> {
  const { data, error } = await supabase
    .from("events")
    .select("id, title, slug, feed_type, event_date, is_published")
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
}): Promise<void> {
  const { error } = await supabase.from("events").insert({
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
  });

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`);
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
