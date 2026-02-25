export type FeedType = "Services" | "Revivals" | "Specials";

export type MediaType = "picture" | "video";

export interface EventMedia {
  id: string;
  eventId: string;
  mediaType: MediaType;
  storagePath: string;
  publicUrl: string;
  caption: string;
  tags: string[];
  sortOrder: number;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  feedType: FeedType;
  summary: string;
  eventDate: string;
  presenterName: string;
  presenterRole: string;
  presenterAvatarPath: string | null;
  presenterAvatarUrl: string | null;
  media: EventMedia[];
}

export interface ShortItem {
  id: string;
  title: string;
  storagePath: string;
  publicUrl: string;
  thumbnailPath: string | null;
  thumbnailUrl: string | null;
  likeCount: number;
  publishedAt: string;
}
