import type { CmsMediaFolder } from "../types/cms";

export const CMS_MEDIA_FOLDERS = {
  homeHero: "cms/home/hero",
  homeFocus: "cms/home/focus",
  homeWeek: "cms/home/week",
  testimonials: "cms/content/testimonials",
  presenterAvatars: "cms/content/events/presenters",
  boardMembers: "cms/content/board",
  homeGallery: "cms/home/gallery",
} as const satisfies Record<string, CmsMediaFolder>;

export function isCmsMediaFolder(value: string): value is CmsMediaFolder {
  return (Object.values(CMS_MEDIA_FOLDERS) as string[]).includes(value);
}
