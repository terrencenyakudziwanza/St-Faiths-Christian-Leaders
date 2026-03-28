import { supabase } from "../lib/supabase";
import type { CmsContentKey, CmsContentMap, CmsContentRow } from "../types/cms";

export async function fetchCmsContent(
  keys: CmsContentKey[],
): Promise<Partial<CmsContentMap>> {
  if (!keys.length) {
    return {};
  }

  const { data, error } = await supabase
    .from("cms_content")
    .select("section_key, content, is_published, updated_at")
    .in("section_key", keys)
    .eq("is_published", true);

  if (error) {
    throw new Error(`Failed to load CMS content: ${error.message}`);
  }

  const contentMap: Partial<CmsContentMap> = {};

  (data ?? []).forEach((row) => {
    const typedRow = row as CmsContentRow;
    contentMap[typedRow.section_key] =
      typedRow.content as CmsContentMap[CmsContentKey];
  });

  return contentMap;
}

export async function upsertCmsContent<T extends CmsContentKey>(
  key: T,
  content: CmsContentMap[T],
): Promise<void> {
  const { error } = await supabase
    .from("cms_content")
    .upsert(
      {
        section_key: key,
        content,
        is_published: true,
      },
      { onConflict: "section_key" },
    );

  if (error) {
    throw new Error(`Failed to save CMS content: ${error.message}`);
  }
}
