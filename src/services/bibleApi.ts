export type BibleTranslation = {
  id: string;
  label: string;
};

export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  { id: "cherokee", label: "Cherokee New Testament" },
  { id: "cuv", label: "Chinese Union Version" },
  { id: "bkr", label: "Bible kralická" },
  { id: "asv", label: "American Standard Version (1901)" },
  { id: "bbe", label: "Bible in Basic English" },
  { id: "darby", label: "Darby Bible" },
  { id: "dra", label: "Douay-Rheims 1899 American Edition" },
  { id: "kjv", label: "King James Version" },
  { id: "web", label: "World English Bible" },
  { id: "ylt", label: "Young's Literal Translation (NT only)" },
  { id: "oeb-cw", label: "Open English Bible, Commonwealth Edition" },
  { id: "webbe", label: "World English Bible, British Edition" },
  { id: "oeb-us", label: "Open English Bible, US Edition" },
  { id: "clementine", label: "Clementine Latin Vulgate" },
  { id: "almeida", label: "João Ferreira de Almeida" },
  { id: "rccv", label: "Protestant Romanian Corrected Cornilescu Version" },
];

export type BibleVerse = {
  reference: string;
  text: string;
  translationId: string;
  translationName: string;
};

const verseCache = new Map<string, BibleVerse>();

export function isSupportedTranslation(translation?: string | null): boolean {
  if (!translation) {
    return true;
  }
  return BIBLE_TRANSLATIONS.some((item) => item.id === translation);
}

export async function fetchBibleVerse(
  reference: string,
  translation?: string | null,
): Promise<BibleVerse> {
  const normalizedReference = reference.trim();
  if (!normalizedReference) {
    throw new Error("Verse reference is required.");
  }

  const normalizedTranslation = translation?.trim() || null;

  if (!isSupportedTranslation(normalizedTranslation)) {
    throw new Error("Unsupported bible-api.com translation.");
  }

  const cacheKey = `${normalizedReference}::${normalizedTranslation ?? "web"}`;
  const cached = verseCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const encodedReference = encodeURIComponent(normalizedReference);
  const query = normalizedTranslation
    ? `?translation=${encodeURIComponent(normalizedTranslation)}`
    : "";
  const response = await fetch(
    `https://bible-api.com/${encodedReference}${query}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch verse (${response.status} ${response.statusText}).`,
    );
  }

  const data = (await response.json()) as {
    reference?: string;
    text?: string;
    translation_id?: string;
    translation_name?: string;
  };

  const verse: BibleVerse = {
    reference: data.reference ?? normalizedReference,
    text: (data.text ?? "").replace(/\s+/g, " ").trim(),
    translationId: data.translation_id ?? normalizedTranslation ?? "web",
    translationName: data.translation_name ?? "World English Bible",
  };

  verseCache.set(cacheKey, verse);
  return verse;
}
