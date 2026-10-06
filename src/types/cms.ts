type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type CmsContentKey = "home.hero" | "home.focus" | "home.week" | "home.gallery" | "family.content";
export type CmsSectionKey =
  | CmsContentKey
  | "content.testimonials"
  | "content.events"
  | "content.board"
  | "home.gallery";

export type CmsMediaFolder =
  | "cms/home/hero"
  | "cms/home/focus"
  | "cms/home/week"
  | "cms/content/testimonials"
  | "cms/content/events/presenters"
  | "cms/content/board"
  | "cms/home/gallery";

export type CmsMediaRef = {
  storagePath?: string | null;
  url?: string | null;
};

export type CmsGalleryItem = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image: CmsMediaRef;
  ratio: string;
  termId: string;
  likes: number;
};

export type CmsGalleryContent = { items: CmsGalleryItem[] };

export type CmsFamilyProfile = { role: string; name: string; about: string; phone: string; email: string; image: CmsMediaRef };
export type CmsFamilyContent = { pageEyebrow: string; pageTitle: string; pageDescription: string; patronMatronTitle: string; patronMatronDescription: string; departmentsTitle: string; departmentsDescription: string; boardTitle: string; boardDescription: string; patron: CmsFamilyProfile; matron: CmsFamilyProfile };

export type CmsHeroSlide = {
  id: string;
  label: string;
  image: CmsMediaRef;
};

export type CmsHeroContent = {
  heroHeader: string[];
  heroSecondary: string[];
  slides: CmsHeroSlide[];
  finalSlideId: string;
};

export type CmsFocusItem = {
  id: string;
  title: string;
  copy: string;
  image: CmsMediaRef;
};

export type CmsFocusContent = {
  overline: string;
  title: string;
  description: string;
  items: CmsFocusItem[];
};

export type CmsWeekSlide = {
  id: string;
  day: string;
  title: string;
  description: string;
  activities: string[];
  image: CmsMediaRef;
};

export type CmsThemeOfWeek = {
  title: string;
  verseReference: string;
  verseVersion?: string | null;
  verseText: string;
  verseTranslation?: string | null;
};

export type CmsWeekContent = {
  overline: string;
  title: string;
  description: string;
  slides: CmsWeekSlide[];
  themeOfWeek: CmsThemeOfWeek;
};

export type CmsContentMap = {
  "home.hero": CmsHeroContent;
  "home.focus": CmsFocusContent;
  "home.week": CmsWeekContent;
  "home.gallery": CmsGalleryContent;
  "family.content": CmsFamilyContent;
};

export type CmsUserRole = "admin" | "editor";

export type CmsUser = {
  id: string;
  email: string;
  display_name: string | null;
  role: CmsUserRole;
  is_active: boolean;
  created_at: string;
};

export type CmsInvite = {
  email: string;
  role: CmsUserRole;
  permissions: CmsSectionKey[];
  created_at: string;
};

export type CmsContentRow = {
  section_key: CmsContentKey;
  content: Json;
  is_published: boolean;
  updated_at: string;
};
