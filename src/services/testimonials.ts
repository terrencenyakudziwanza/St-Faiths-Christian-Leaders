import { supabase } from "../lib/supabase";
import { resolveMediaUrl } from "../lib/media";

export type TestimonialItem = {
  id: string;
  name: string;
  profileDetails: string | null;
  avatarPath: string | null;
  avatarUrl: string | null;
  testimonial: string;
  isPublished: boolean;
  createdAt: string;
};

type TestimonialRow = {
  id: string;
  name: string;
  profile_details: string | null;
  avatar_path: string | null;
  testimonial: string;
  is_published: boolean;
  created_at: string;
};

function mapTestimonial(row: TestimonialRow): TestimonialItem {
  return {
    id: row.id,
    name: row.name,
    profileDetails: row.profile_details,
    avatarPath: row.avatar_path,
    avatarUrl: resolveMediaUrl(row.avatar_path),
    testimonial: row.testimonial,
    isPublished: row.is_published,
    createdAt: row.created_at,
  };
}

export async function fetchTestimonials(
  includeUnpublished = false,
): Promise<TestimonialItem[]> {
  let query = supabase
    .from("testimonials")
    .select("id, name, profile_details, avatar_path, testimonial, is_published, created_at")
    .order("created_at", { ascending: false });

  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch testimonials: ${error.message}`);
  }

  return (data ?? []).map((row) => mapTestimonial(row as TestimonialRow));
}

export async function createTestimonial(input: {
  name: string;
  profileDetails?: string | null;
  avatarPath?: string | null;
  testimonial: string;
  isPublished: boolean;
}): Promise<void> {
  const { error } = await supabase.from("testimonials").insert({
    name: input.name,
    profile_details: input.profileDetails ?? null,
    avatar_path: input.avatarPath ?? null,
    testimonial: input.testimonial,
    is_published: input.isPublished,
  });

  if (error) {
    throw new Error(`Failed to create testimonial: ${error.message}`);
  }
}

export async function updateTestimonial(
  id: string,
  updates: Partial<{
    name: string;
    profileDetails: string | null;
    avatarPath: string | null;
    testimonial: string;
    isPublished: boolean;
  }>,
): Promise<void> {
  const { error } = await supabase
    .from("testimonials")
    .update({
      name: updates.name,
      profile_details: updates.profileDetails,
      avatar_path: updates.avatarPath,
      testimonial: updates.testimonial,
      is_published: updates.isPublished,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update testimonial: ${error.message}`);
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase.from("testimonials").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete testimonial: ${error.message}`);
  }
}
