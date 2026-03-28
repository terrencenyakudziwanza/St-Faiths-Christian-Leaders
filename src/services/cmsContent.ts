import { supabase } from "../lib/supabase";
import type { CmsContentMap, CmsContentRow, CmsSectionKey } from "../types/cms";

export async function fetchCmsContent(
  keys: CmsSectionKey[],
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
    contentMap[typedRow.section_key] = typedRow.content as CmsContentMap[CmsSectionKey];
  });

  return contentMap;
}

export async function upsertCmsContent<T extends CmsSectionKey>(
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
