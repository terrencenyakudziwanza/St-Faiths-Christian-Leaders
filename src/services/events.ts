import { resolveMediaUrl } from "../lib/media";
import { supabase } from "../lib/supabase";
import type {
  EventItem,
  EventMedia,
  FeedType,
  MediaType,
  ServiceComponent,
  ServiceLeader,
} from "../types/domain";

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
  theme_topic: string | null;
  summary: string;
  event_date: string;
  presenter_name: string;
  presenter_role: string;
  presenter_avatar_path: string | null;
  theme_scripture_reference: string | null;
  theme_scripture_version: string | null;
  theme_scripture_text: string | null;
  intercession_prayer_points: string[] | null;
  praise_highlights: string[] | null;
  event_media: EventMediaRow[] | null;
};

const componentCycle: ServiceComponent[] = [
  "Preaching",
  "Intercession",
  "Praise and Worship",
];

async function resolveScripture(row: EventRow): Promise<{ reference: string; text: string; translationId: string | null; translationName: string | null }> {
  return { reference: row.theme_scripture_reference ?? "", text: row.theme_scripture_text ?? "", translationId: row.theme_scripture_version, translationName: null };
}
function byMediaRowSortOrder(a: EventMediaRow, b: EventMediaRow): number {
  const aSortOrder = a.sort_order ?? 0;
  const bSortOrder = b.sort_order ?? 0;

  if (aSortOrder !== bSortOrder) {
    return aSortOrder - bSortOrder;
  }

  return a.id.localeCompare(b.id);
}

function inferMediaComponent(row: EventMediaRow, fallbackIndex: number): ServiceComponent {
  const tokenBlob = [...(row.tags ?? []), row.caption ?? ""]
    .join(" ")
    .toLowerCase();

  if (
    tokenBlob.includes("preach") ||
    tokenBlob.includes("sermon") ||
    tokenBlob.includes("message")
  ) {
    return "Preaching";
  }

  if (tokenBlob.includes("intercession") || tokenBlob.includes("prayer")) {
    return "Intercession";
  }

  if (
    tokenBlob.includes("praise") ||
    tokenBlob.includes("worship") ||
    tokenBlob.includes("choir")
  ) {
    return "Praise and Worship";
  }

  return componentCycle[fallbackIndex % componentCycle.length];
}

function mapMedia(row: EventMediaRow, component: ServiceComponent): EventMedia {
  const publicUrl = resolveMediaUrl(row.storage_path);

  if (!publicUrl) {
    throw new Error(`Could not resolve media URL for path "${row.storage_path}"`);
  }

  return {
    id: row.id,
    eventId: row.event_id,
    mediaType: row.media_type,
    component,
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

function buildServiceLeaders(row: EventRow): ServiceLeader[] {
  if (!row.presenter_name.trim()) return [];
  return [{ component: "Preaching", name: row.presenter_name, roleLabel: row.presenter_role, avatarPath: row.presenter_avatar_path, avatarUrl: resolveMediaUrl(row.presenter_avatar_path) }];
}
function mapEvent(
  row: EventRow,
  scripture: {
    reference: string;
    text: string;
    translationId: string | null;
    translationName: string | null;
  },
): EventItem {
  const sortedMediaRows = [...(row.event_media ?? [])].sort(byMediaRowSortOrder);
  const media = sortedMediaRows
    .map((mediaRow, index) =>
      mapMedia(mediaRow, inferMediaComponent(mediaRow, index)),
    )
    .sort(bySortOrder);
  const themeTopic = row.theme_topic?.trim() ?? "";
  const intercessionPrayerPoints = row.intercession_prayer_points ?? [];
  const praiseHighlights = row.praise_highlights ?? [];

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    themeTopic,
    feedType: row.feed_type,
    summary: row.summary,
    eventDate: row.event_date,
    presenterName: row.presenter_name,
    presenterRole: row.presenter_role,
    presenterAvatarPath: row.presenter_avatar_path,
    presenterAvatarUrl: resolveMediaUrl(row.presenter_avatar_path),
    serviceLeaders: buildServiceLeaders(row),
    themeScriptureReference: scripture.reference,
    themeScriptureText: scripture.text,
    themeScriptureVersion: scripture.translationId,
    themeScriptureTranslation: scripture.translationName,
    intercessionPrayerPoints,
    praiseHighlights,
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
        theme_topic,
        theme_scripture_reference,
        theme_scripture_version,
        theme_scripture_text,
        intercession_prayer_points,
        praise_highlights,
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

  const rows = data ?? [];

  const events = await Promise.all(
    rows.map(async (row) => {
      const scripture = await resolveScripture(row as EventRow);
      return mapEvent(row as EventRow, scripture);
    }),
  );

  return events;
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

  const rows = (data ?? []).sort((a, b) =>
    byMediaRowSortOrder(a as EventMediaRow, b as EventMediaRow),
  );

  return rows.map((row, index) =>
    mapMedia(row as EventMediaRow, inferMediaComponent(row as EventMediaRow, index)),
  );
}

