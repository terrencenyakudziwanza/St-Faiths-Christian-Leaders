import { CMS_BUCKET, supabase } from "../lib/supabase";
import { slugify } from "../lib/cms";

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
  options: { folder: string; prefix?: string },
): Promise<UploadResult> {
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
        "Upload failed: storage bucket \"cms\" was not found. Make sure the 0002_cms.sql migration has been applied to this Supabase project (or create the bucket manually).",
      );
    }
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(CMS_BUCKET).getPublicUrl(storagePath);

  return { storagePath, publicUrl: data.publicUrl };
}
