import { CMS_BUCKET, supabase } from "../lib/supabase";
import { slugify } from "../lib/cms";
import { isCmsMediaFolder } from "../lib/cmsMedia";
import type { CmsMediaFolder } from "../types/cms";

export type UploadResult = {
  storagePath: string;
  publicUrl: string;
};

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  if (parts.length <= 1) {
    return "bin";
  }
  return parts[parts.length - 1].toLowerCase();
}

export async function uploadMediaFile(
  file: File,
  options: { folder: CmsMediaFolder; prefix?: string },
): Promise<UploadResult> {
  if (!isCmsMediaFolder(options.folder)) {
    throw new Error(
      "Upload failed: CMS uploads must target a known cms/ folder.",
    );
  }

  const extension = getFileExtension(file.name);
  const prefix = options.prefix ? `${slugify(options.prefix)}-` : "";
  const storagePath = `${options.folder}/${prefix}${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(CMS_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || undefined,
    });

  if (error) {
    const lowered = error.message.toLowerCase();
    if (lowered.includes("bucket") && lowered.includes("not found")) {
      throw new Error(
        "Upload failed: storage bucket \"media\" was not found. This project expects a single bucket named \"media\" with a \"cms/\" folder inside it.",
      );
    }
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(CMS_BUCKET).getPublicUrl(storagePath);

  return { storagePath, publicUrl: data.publicUrl };
}
