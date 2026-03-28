import type {
  CmsFocusContent,
  CmsHeroContent,
  CmsWeekContent,
} from "../types/cms";
import { normalizeText } from "./cms";
import { isSupportedTranslation } from "../services/bibleApi";

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

function rangeMessage(label: string, min: number, max: number): string {
  return `${label} must be between ${min} and ${max} characters.`;
}

function requireCount(label: string, min: number, max: number): string {
  return `${label} must have between ${min} and ${max} entries.`;
}

export function validateHero(content: CmsHeroContent): ValidationResult {
  const errors: string[] = [];

  const headerLines = content.heroHeader.map(normalizeText).filter(Boolean);
  const secondaryLines = content.heroSecondary.map(normalizeText).filter(Boolean);

  if (headerLines.length < 1 || headerLines.length > 2) {
    errors.push(requireCount("Hero header", 1, 2));
  }

  headerLines.forEach((line, index) => {
    if (line.length < 8 || line.length > 60) {
      errors.push(`Hero header line ${index + 1}: ${rangeMessage("Line", 8, 60)}`);
    }
  });

  if (secondaryLines.length < 1 || secondaryLines.length > 2) {
    errors.push(requireCount("Hero secondary line", 1, 2));
  }

  secondaryLines.forEach((line, index) => {
    if (line.length < 6 || line.length > 80) {
      errors.push(
        `Hero secondary line ${index + 1}: ${rangeMessage("Line", 6, 80)}`,
      );
    }
  });

  if (content.slides.length < 2 || content.slides.length > 6) {
    errors.push(requireCount("Hero slides", 2, 6));
  }

  content.slides.forEach((slide, index) => {
    const label = normalizeText(slide.label);
    if (label.length < 3 || label.length > 32) {
      errors.push(`Hero slide ${index + 1} label: ${rangeMessage("Label", 3, 32)}`);
    }

    if (!slide.image?.storagePath && !slide.image?.url) {
      errors.push(`Hero slide ${index + 1} is missing an image.`);
    }
  });

  return { valid: errors.length === 0, errors };
}

export function validateFocus(content: CmsFocusContent): ValidationResult {
  const errors: string[] = [];

  const overline = normalizeText(content.overline);
  const title = normalizeText(content.title);
  const description = normalizeText(content.description);

  if (overline.length < 4 || overline.length > 36) {
    errors.push(rangeMessage("Focus overline", 4, 36));
  }

  if (title.length < 8 || title.length > 70) {
    errors.push(rangeMessage("Focus title", 8, 70));
  }

  if (description.length < 40 || description.length > 260) {
    errors.push(rangeMessage("Focus description", 40, 260));
  }

  if (content.items.length < 3 || content.items.length > 6) {
    errors.push(requireCount("Focus items", 3, 6));
  }

  content.items.forEach((item, index) => {
    const itemTitle = normalizeText(item.title);
    const itemCopy = normalizeText(item.copy);

    if (itemTitle.length < 3 || itemTitle.length > 36) {
      errors.push(
        `Focus item ${index + 1} title: ${rangeMessage("Title", 3, 36)}`,
      );
    }

    if (itemCopy.length < 20 || itemCopy.length > 160) {
      errors.push(
        `Focus item ${index + 1} copy: ${rangeMessage("Copy", 20, 160)}`,
      );
    }

    if (!item.image?.storagePath && !item.image?.url) {
      errors.push(`Focus item ${index + 1} is missing an image.`);
    }
  });

  return { valid: errors.length === 0, errors };
}

export function validateWeek(content: CmsWeekContent): ValidationResult {
  const errors: string[] = [];

  const overline = normalizeText(content.overline);
  const title = normalizeText(content.title);
  const description = normalizeText(content.description);
  const themeTitle = normalizeText(content.themeOfWeek.title);
  const themeVerseRef = normalizeText(content.themeOfWeek.verseReference);

  if (overline.length < 4 || overline.length > 36) {
    errors.push(rangeMessage("Week overline", 4, 36));
  }

  if (title.length < 8 || title.length > 70) {
    errors.push(rangeMessage("Week title", 8, 70));
  }

  if (description.length < 30 || description.length > 200) {
    errors.push(rangeMessage("Week description", 30, 200));
  }

  if (themeTitle.length < 4 || themeTitle.length > 60) {
    errors.push(rangeMessage("Theme title", 4, 60));
  }

  if (themeVerseRef.length < 3 || themeVerseRef.length > 60) {
    errors.push(rangeMessage("Theme verse reference", 3, 60));
  }

  if (!normalizeText(content.themeOfWeek.verseText)) {
    errors.push("Theme verse text could not be resolved from the API.");
  }

  if (
    content.themeOfWeek.verseVersion &&
    !isSupportedTranslation(content.themeOfWeek.verseVersion)
  ) {
    errors.push("Theme verse version is not supported by bible-api.com.");
  }

  if (content.slides.length !== 7) {
    errors.push("Week slides should include all 7 days.");
  }

  content.slides.forEach((slide, index) => {
    const day = normalizeText(slide.day);
    const slideTitle = normalizeText(slide.title);
    const slideDescription = normalizeText(slide.description);

    if (day.length < 3 || day.length > 10) {
      errors.push(`Week slide ${index + 1} day: ${rangeMessage("Day", 3, 10)}`);
    }

    if (slideTitle.length < 4 || slideTitle.length > 60) {
      errors.push(
        `Week slide ${index + 1} title: ${rangeMessage("Title", 4, 60)}`,
      );
    }

    if (slideDescription.length < 20 || slideDescription.length > 160) {
      errors.push(
        `Week slide ${index + 1} description: ${rangeMessage(
          "Description",
          20,
          160,
        )}`,
      );
    }

    if (slide.activities.length < 1 || slide.activities.length > 4) {
      errors.push(
        `Week slide ${index + 1} must list between 1 and 4 activities.`,
      );
    }

    slide.activities.forEach((activity, activityIndex) => {
      const act = normalizeText(activity);
      if (act.length < 3 || act.length > 22) {
        errors.push(
          `Week slide ${index + 1} activity ${activityIndex + 1}: ${rangeMessage(
            "Activity",
            3,
            22,
          )}`,
        );
      }
    });

    if (!slide.image?.storagePath && !slide.image?.url) {
      errors.push(`Week slide ${index + 1} is missing an image.`);
    }
  });

  return { valid: errors.length === 0, errors };
}
