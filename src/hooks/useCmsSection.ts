import React from "react";
import { cmsDefaults } from "../data/cmsDefaults";
import { fetchCmsContent } from "../services/cmsContent";
import type {
  CmsContentMap,
  CmsFocusContent,
  CmsHeroContent,
  CmsSectionKey,
  CmsWeekContent,
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
  };
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
  };
}

function mergeContent<T extends CmsSectionKey>(
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
    default:
      return fallback;
  }
}

export function useCmsSection<T extends CmsSectionKey>(
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
