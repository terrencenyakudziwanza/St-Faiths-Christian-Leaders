import type { CmsContentMap, CmsSectionKey } from "../types/cms";

const emptyProfile = { role: "", name: "", about: "", phone: "", email: "", image: {} };

export const cmsDefaults: CmsContentMap = {
  "home.hero": { heroHeader: [], heroSecondary: [], slides: [], finalSlideId: "" },
  "home.focus": { overline: "", title: "", description: "", items: [] },
  "home.week": { overline: "", title: "", description: "", slides: [], themeOfWeek: { title: "", verseReference: "", verseText: "" } },
  "home.gallery": { overline: "", title: "", description: "", testimonialOverline: "", testimonialTitle: "", testimonialDescription: "", items: [] },
  "family.content": { pageEyebrow: "", pageTitle: "", pageDescription: "", patronMatronTitle: "", patronMatronDescription: "", departmentsOverline: "", departmentsTitle: "", departmentsDescription: "", boardOverline: "", boardTitle: "", boardDescription: "", patron: emptyProfile, matron: { ...emptyProfile } },
};

export const cmsSectionLabels: Record<CmsSectionKey, string> = {
  "home.hero": "Home Hero",
  "home.focus": "What We Do",
  "home.week": "A Week In Christian Leaders",
  "content.events": "Events",
  "content.testimonials": "Testimonials",
  "content.board": "Board Members",
  "home.gallery": "Gallery",
  "family.content": "Family Page & Patrons",
};

export const cmsSectionOrder: CmsSectionKey[] = ["home.hero", "home.focus", "home.week", "content.events", "content.testimonials", "content.board", "home.gallery", "family.content"];
