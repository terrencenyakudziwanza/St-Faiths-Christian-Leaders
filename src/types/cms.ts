type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type CmsContentKey = "home.hero" | "home.focus" | "home.week";
export type CmsSectionKey =
  | CmsContentKey
  | "content.testimonials"
  | "content.events";

export type CmsMediaRef = {
  storagePath?: string | null;
  url?: string | null;
};

export type CmsHeroSlide = {
  id: string;
  label: string;
  image: CmsMediaRef;
};

export type CmsHeroContent = {
  heroHeader: string[];
  heroSecondary: string[];
  slides: CmsHeroSlide[];
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
