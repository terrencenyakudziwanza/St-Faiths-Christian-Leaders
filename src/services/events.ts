import {
  offlineEventMediaRows,
  offlineEventRows,
  type OfflineEventMediaRow,
  type OfflineEventRow,
} from "../data/offlineContent";
import { isOffline, resolveMediaUrl } from "../lib/media";
import { supabase } from "../lib/supabase";
import { fetchBibleVerse } from "./bibleApi";
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

type LeaderOverride = {
  name: string;
  avatarPath: string | null;
};

const componentCycle: ServiceComponent[] = [
  "Preaching",
  "Intercession",
  "Praise and Worship",
];

const defaultScripture = {
  reference: "John 15:5",
  text: "Apart from Me you can do nothing. Remain in Christ and bear lasting fruit.",
};

const defaultPrayerPoints = [
  "Pray for deeper hunger for God's presence across every service.",
  "Pray for unity among ministry leaders and volunteers.",
  "Pray for healing, restoration, and salvation in every family represented.",
];

const defaultPraiseHighlights = [
  "A song of thanksgiving opened the gathering with joy.",
  "A worship set invited the congregation into surrender.",
  "A final declaration of faith closed the moment in unity.",
];

const themeTopicBySlug: Record<string, string> = {
  "sunday-prayer-service": "Standing Firm in the Place of Prayer",
  "city-revival-night": "Revive Us Again by Your Spirit",
  "family-thanksgiving-gathering": "Count Your Blessings With Gratitude",
};

const scriptureBySlug: Record<
  string,
  {
    reference: string;
    text: string;
  }
> = {
  "sunday-prayer-service": {
    reference: "Ephesians 6:18",
    text: "Pray in the Spirit on all occasions with all kinds of prayers and requests.",
  },
  "city-revival-night": {
    reference: "Psalm 85:6",
    text: "Will You not revive us again, that Your people may rejoice in You?",
  },
  "family-thanksgiving-gathering": {
    reference: "1 Thessalonians 5:18",
    text: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus.",
  },
};

async function resolveScripture(
  row: EventRow,
  allowNetwork: boolean,
): Promise<{
  reference: string;
  text: string;
  translationId: string | null;
  translationName: string | null;
}> {
  if (row.theme_scripture_reference && row.theme_scripture_text) {
    return {
      reference: row.theme_scripture_reference,
      text: row.theme_scripture_text,
      translationId: row.theme_scripture_version,
      translationName: null,
    };
  }

  const fallback = scriptureBySlug[row.slug] ?? defaultScripture;
  const reference = row.theme_scripture_reference ?? fallback.reference;
  const version = row.theme_scripture_version;

  if (!allowNetwork) {
    return {
      reference,
      text: row.theme_scripture_text ?? fallback.text,
      translationId: version ?? null,
      translationName: null,
    };
  }

  try {
    const verse = await fetchBibleVerse(reference, version);
    return {
      reference: verse.reference,
      text: verse.text,
      translationId: verse.translationId,
      translationName: verse.translationName,
    };
  } catch {
    return {
      reference,
      text: row.theme_scripture_text ?? fallback.text,
      translationId: version ?? null,
      translationName: null,
    };
  }
}

const prayerPointsBySlug: Record<string, string[]> = {
  "sunday-prayer-service": [
    "Grace to remain consistent in personal and corporate prayer.",
    "Sensitivity to the leading of the Holy Spirit during intercession.",
    "A renewed burden for souls and community transformation.",
  ],
  "city-revival-night": [
    "Fresh fire for evangelism and discipleship in the city.",
    "Boldness for youth and workers to live as witnesses.",
    "Endurance for every team serving during revival season.",
  ],
  "family-thanksgiving-gathering": [
    "Thanksgiving for God's faithfulness through every season.",
    "Peace and restoration across households and relationships.",
    "Open doors and provision for families trusting God.",
  ],
};

const praiseHighlightsBySlug: Record<string, string[]> = {
  "sunday-prayer-service": [
    "A focused worship response before intercession began.",
    "Scripture songs that emphasized faith and surrender.",
    "A closing refrain centered on God's faithfulness.",
  ],
  "city-revival-night": [
    "A high-energy praise set stirred expectation for revival.",
    "Spontaneous worship moments encouraged consecration.",
    "The team ended with a declaration of God's lordship.",
  ],
  "family-thanksgiving-gathering": [
    "Songs of gratitude created a joyful atmosphere.",
    "A family choir segment celebrated God's goodness.",
    "The congregation joined in a thanksgiving anthem.",
  ],
};

const secondaryLeadersBySlug: Record<
  string,
  {
    intercession: LeaderOverride;
    praise: LeaderOverride;
  }
> = {
  "sunday-prayer-service": {
    intercession: {
      name: "Sister Ama Boateng",
      avatarPath: "presenters/sister-ama.jpg",
    },
    praise: {
      name: "Elder Kojo Asare",
      avatarPath: "presenters/elder-kojo.jpg",
    },
  },
  "city-revival-night": {
    intercession: {
      name: "Deacon Lydia Ofori",
      avatarPath: "presenters/pastor-joel.jpg",
    },
    praise: {
      name: "Brother Daniel Addo",
      avatarPath: "presenters/elder-kojo.jpg",
    },
  },
  "family-thanksgiving-gathering": {
    intercession: {
      name: "Sister Mabel Agyemang",
      avatarPath: "presenters/sister-ama.jpg",
    },
    praise: {
      name: "Choir Lead Emmanuel Owusu",
      avatarPath: "presenters/pastor-joel.jpg",
    },
  },
};

function byDateDescending(a: { event_date: string }, b: { event_date: string }): number {
  return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
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

function resolveSecondaryLeaders(slug: string): {
  intercession: LeaderOverride;
  praise: LeaderOverride;
} {
  return (
    secondaryLeadersBySlug[slug] ?? {
      intercession: {
        name: "Intercession Leader",
        avatarPath: "presenters/sister-ama.jpg",
      },
      praise: {
        name: "Praise Leader",
        avatarPath: "presenters/elder-kojo.jpg",
      },
    }
  );
}

function buildServiceLeaders(row: EventRow): ServiceLeader[] {
  const preacherName = row.presenter_name.trim() || "Service Preacher";
  const secondaryLeaders = resolveSecondaryLeaders(row.slug);

  const leaders: Omit<ServiceLeader, "avatarUrl">[] = [
    {
      component: "Preaching",
      name: preacherName,
      roleLabel: "Preacher",
      avatarPath: row.presenter_avatar_path,
    },
    {
      component: "Intercession",
      name: secondaryLeaders.intercession.name,
      roleLabel: "Intercession Leader",
      avatarPath: secondaryLeaders.intercession.avatarPath,
    },
    {
      component: "Praise and Worship",
      name: secondaryLeaders.praise.name,
      roleLabel: "Praise Leader",
      avatarPath: secondaryLeaders.praise.avatarPath,
    },
  ];

  return leaders.map((leader) => ({
    ...leader,
    avatarUrl: resolveMediaUrl(leader.avatarPath),
  }));
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
  const themeTopic = row.theme_topic?.trim()
    ? row.theme_topic
    : themeTopicBySlug[row.slug] ?? row.title;
  const intercessionPrayerPoints =
    row.intercession_prayer_points && row.intercession_prayer_points.length
      ? row.intercession_prayer_points
      : prayerPointsBySlug[row.slug] ?? [...defaultPrayerPoints];
  const praiseHighlights =
    row.praise_highlights && row.praise_highlights.length
      ? row.praise_highlights
      : praiseHighlightsBySlug[row.slug] ?? [...defaultPraiseHighlights];

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
  if (isOffline) {
    const rows = offlineEventRows
      .filter((row) => row.is_published && row.feed_type === feedType)
      .sort(byDateDescending)
      .map((row) => {
        const eventMedia = offlineEventMediaRows.filter(
          (mediaRow) => mediaRow.event_id === row.id,
        );

        return {
          ...(row as OfflineEventRow),
          event_media: eventMedia as OfflineEventMediaRow[],
        } as EventRow;
      });

    const data = await Promise.all(
      rows.map(async (row) => {
        const scripture = await resolveScripture(row, false);
        return mapEvent(row, scripture);
      }),
    );

    return data;
  }

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
      const scripture = await resolveScripture(row as EventRow, true);
      return mapEvent(row as EventRow, scripture);
    }),
  );

  return events;
}

export async function fetchEventMedia(eventId: string): Promise<EventMedia[]> {
  if (isOffline) {
    const rows = offlineEventMediaRows
      .filter((row) => row.event_id === eventId)
      .sort((a, b) => byMediaRowSortOrder(a as EventMediaRow, b as EventMediaRow));

    return rows.map((row, index) =>
      mapMedia(row as EventMediaRow, inferMediaComponent(row as EventMediaRow, index)),
    );
  }

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
