import React from "react";
import { cmsDefaults } from "../data/cmsDefaults";
import { fetchCmsContent } from "../services/cmsContent";
import type {
  CmsContentMap,
  CmsFocusContent,
  CmsHeroContent,
  CmsContentKey,
  CmsWeekContent,
  CmsGalleryContent,
  CmsFamilyContent,
} from "../types/cms";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeHero(
  incoming: unknown,
  fallback: CmsHeroContent,
): CmsHeroContent {
  if (!isRecord(incoming)) {
    return fallback;
  }

  const heroHeader =
    Array.isArray(incoming.heroHeader) && incoming.heroHeader.length
      ? (incoming.heroHeader as string[])
      : fallback.heroHeader;
  const heroSecondary =
    Array.isArray(incoming.heroSecondary) && incoming.heroSecondary.length
      ? (incoming.heroSecondary as string[])
      : fallback.heroSecondary;
  const slides =
    Array.isArray(incoming.slides) && incoming.slides.length
      ? (incoming.slides as CmsHeroContent["slides"])
      : fallback.slides;

  return {
    heroHeader,
    heroSecondary,
    slides,
    finalSlideId:
      typeof incoming.finalSlideId === "string" &&
      slides.some((slide) => slide.id === incoming.finalSlideId)
        ? incoming.finalSlideId
        : fallback.finalSlideId && slides.some((slide) => slide.id === fallback.finalSlideId)
          ? fallback.finalSlideId
          : slides[slides.length - 1]?.id ?? "",
  };
}

function mergeGallery(
  incoming: unknown,
  fallback: CmsGalleryContent,
): CmsGalleryContent {
  if (!isRecord(incoming) || !Array.isArray(incoming.items)) return fallback;
  return { items: incoming.items as CmsGalleryContent["items"] };
}

function mergeFamily(incoming: unknown, fallback: CmsFamilyContent): CmsFamilyContent {
  if (!isRecord(incoming)) return fallback;
  const profile = (value: unknown, base: CmsFamilyContent["patron"]) => isRecord(value) ? { ...base, ...value, image: isRecord(value.image) ? value.image : base.image } as CmsFamilyContent["patron"] : base;
  return { ...fallback, ...incoming, patron: profile(incoming.patron, fallback.patron), matron: profile(incoming.matron, fallback.matron) } as CmsFamilyContent;
}

function mergeFocus(
  incoming: unknown,
  fallback: CmsFocusContent,
): CmsFocusContent {
  if (!isRecord(incoming)) {
    return fallback;
  }

  return {
    overline:
      typeof incoming.overline === "string" && incoming.overline.trim()
        ? incoming.overline
        : fallback.overline,
    title:
      typeof incoming.title === "string" && incoming.title.trim()
        ? incoming.title
        : fallback.title,
    description:
      typeof incoming.description === "string" && incoming.description.trim()
        ? incoming.description
        : fallback.description,
    items:
      Array.isArray(incoming.items) && incoming.items.length
        ? (incoming.items as CmsFocusContent["items"])
        : fallback.items,
  };
}

function mergeWeek(
  incoming: unknown,
  fallback: CmsWeekContent,
): CmsWeekContent {
  if (!isRecord(incoming)) {
    return fallback;
  }

  return {
    overline:
      typeof incoming.overline === "string" && incoming.overline.trim()
        ? incoming.overline
        : fallback.overline,
    title:
      typeof incoming.title === "string" && incoming.title.trim()
        ? incoming.title
        : fallback.title,
    description:
      typeof incoming.description === "string" && incoming.description.trim()
        ? incoming.description
        : fallback.description,
    slides:
      Array.isArray(incoming.slides) && incoming.slides.length
        ? (incoming.slides as CmsWeekContent["slides"])
        : fallback.slides,
    themeOfWeek: isRecord(incoming.themeOfWeek)
      ? {
          title:
            typeof incoming.themeOfWeek.title === "string" &&
            incoming.themeOfWeek.title.trim()
              ? incoming.themeOfWeek.title
              : fallback.themeOfWeek.title,
          verseReference:
            typeof incoming.themeOfWeek.verseReference === "string" &&
            incoming.themeOfWeek.verseReference.trim()
              ? incoming.themeOfWeek.verseReference
              : fallback.themeOfWeek.verseReference,
          verseVersion:
            typeof incoming.themeOfWeek.verseVersion === "string"
              ? incoming.themeOfWeek.verseVersion
              : fallback.themeOfWeek.verseVersion,
          verseText:
            typeof incoming.themeOfWeek.verseText === "string" &&
            incoming.themeOfWeek.verseText.trim()
              ? incoming.themeOfWeek.verseText
              : fallback.themeOfWeek.verseText,
          verseTranslation:
            typeof incoming.themeOfWeek.verseTranslation === "string"
              ? incoming.themeOfWeek.verseTranslation
              : fallback.themeOfWeek.verseTranslation,
        }
      : fallback.themeOfWeek,
  };
}

function mergeContent<T extends CmsContentKey>(
  key: T,
  incoming: unknown,
  fallback: CmsContentMap[T],
): CmsContentMap[T] {
  switch (key) {
    case "home.hero":
      return mergeHero(incoming, fallback as CmsHeroContent) as CmsContentMap[T];
    case "home.focus":
      return mergeFocus(
        incoming,
        fallback as CmsFocusContent,
      ) as CmsContentMap[T];
    case "home.week":
      return mergeWeek(incoming, fallback as CmsWeekContent) as CmsContentMap[T];
    case "home.gallery":
      return mergeGallery(incoming, fallback as CmsGalleryContent) as CmsContentMap[T];
    case "family.content":
      return mergeFamily(incoming, fallback as CmsFamilyContent) as CmsContentMap[T];
    default:
      return fallback;
  }
}

export function useCmsSection<T extends CmsContentKey>(
  key: T,
  fallback: CmsContentMap[T] = cmsDefaults[key] as CmsContentMap[T],
): CmsContentMap[T] {
  const [content, setContent] = React.useState<CmsContentMap[T]>(fallback);

  React.useEffect(() => {
    let isActive = true;

    fetchCmsContent([key])
      .then((data) => {
        if (!isActive) return;
        const incoming = data[key];
        if (incoming) {
          setContent(mergeContent(key, incoming, fallback));
        }
      })
      .catch(() => {
        // Keep fallback content on error.
      });

    return () => {
      isActive = false;
    };
  }, [key, fallback]);

  return content;
}
