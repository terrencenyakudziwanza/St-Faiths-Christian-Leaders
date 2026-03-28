import { supabase } from "../lib/supabase";
import type { CmsInvite, CmsSectionKey, CmsUser } from "../types/cms";

export type CmsEditorRecord = CmsUser & { permissions: CmsSectionKey[] };

export async function fetchEditorsWithPermissions(): Promise<CmsEditorRecord[]> {
  const { data: users, error: userError } = await supabase
    .from("cms_users")
    .select("id, email, display_name, role, is_active, created_at")
    .eq("role", "editor")
    .order("created_at", { ascending: true });

  if (userError) {
    throw new Error(`Failed to load editors: ${userError.message}`);
  }

  const { data: perms, error: permError } = await supabase
    .from("cms_permissions")
    .select("editor_id, section_key");

  if (permError) {
    throw new Error(`Failed to load permissions: ${permError.message}`);
  }

  const permissionsMap = new Map<string, CmsSectionKey[]>();
  (perms ?? []).forEach((perm) => {
    const key = perm.editor_id as string;
    const list = permissionsMap.get(key) ?? [];
    list.push(perm.section_key as CmsSectionKey);
    permissionsMap.set(key, list);
  });

  return (users ?? []).map((user) => ({
    ...(user as CmsUser),
    permissions: permissionsMap.get(user.id) ?? [],
  }));
}

export async function updateCmsUser(
  userId: string,
  updates: Partial<Pick<CmsUser, "display_name" | "is_active" | "role">>,
): Promise<void> {
  const { error } = await supabase
    .from("cms_users")
    .update(updates)
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

export async function deleteCmsUser(userId: string): Promise<void> {
  const { error } = await supabase.from("cms_users").delete().eq("id", userId);

  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}

export async function setEditorPermissions(
  editorId: string,
  permissions: CmsSectionKey[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("cms_permissions")
    .delete()
    .eq("editor_id", editorId);

  if (deleteError) {
    throw new Error(`Failed to reset permissions: ${deleteError.message}`);
  }

  if (!permissions.length) {
    return;
  }

  const { error: insertError } = await supabase.from("cms_permissions").insert(
    permissions.map((sectionKey) => ({
      editor_id: editorId,
      section_key: sectionKey,
    })),
  );

  if (insertError) {
    throw new Error(`Failed to save permissions: ${insertError.message}`);
  }
}

export async function createCmsInvite(
  email: string,
  permissions: CmsSectionKey[],
): Promise<void> {
  const { error } = await supabase.from("cms_invites").upsert(
    {
      email,
      role: "editor",
      permissions,
    },
    { onConflict: "email" },
  );

  if (error) {
    throw new Error(`Failed to create invite: ${error.message}`);
  }
}

export async function fetchInviteByEmail(
  email: string,
): Promise<CmsInvite | null> {
  const { data, error } = await supabase
    .from("cms_invites")
    .select("email, role, permissions, created_at")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load invite: ${error.message}`);
  }

  return data ? (data as CmsInvite) : null;
}

export async function deleteInvite(email: string): Promise<void> {
  const { error } = await supabase.from("cms_invites").delete().eq("email", email);

  if (error) {
    throw new Error(`Failed to delete invite: ${error.message}`);
  }
}
