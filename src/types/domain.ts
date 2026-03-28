export type FeedType = "Services" | "Revivals" | "Specials";

export type MediaType = "picture" | "video";

export type ServiceComponent = "Preaching" | "Intercession" | "Praise and Worship";

export interface ServiceLeader {
  component: ServiceComponent;
  name: string;
  roleLabel: string;
  avatarPath: string | null;
  avatarUrl: string | null;
}

export interface EventMedia {
  id: string;
  eventId: string;
  mediaType: MediaType;
  component: ServiceComponent;
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
  themeTopic: string;
  feedType: FeedType;
  summary: string;
  eventDate: string;
  presenterName: string;
  presenterRole: string;
  presenterAvatarPath: string | null;
  presenterAvatarUrl: string | null;
  serviceLeaders: ServiceLeader[];
  themeScriptureReference: string;
  themeScriptureText: string;
  themeScriptureVersion?: string | null;
  themeScriptureTranslation?: string | null;
  intercessionPrayerPoints: string[];
  praiseHighlights: string[];
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
