import React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { CmsSectionKey, CmsUser } from "../types/cms";
import { deleteInvite, fetchInviteByEmail } from "../services/cmsUsers";

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  cmsUser: CmsUser | null;
  permissions: CmsSectionKey[];
  loading: boolean;
  roleLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [cmsUser, setCmsUser] = React.useState<CmsUser | null>(null);
  const [permissions, setPermissions] = React.useState<CmsSectionKey[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [roleLoading, setRoleLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession ?? null);
        setUser(nextSession?.user ?? null);
        setLoading(false);
      },
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    let isActive = true;

    const hydrateCmsUser = async () => {
      if (!user) {
        if (!isActive) return;
        setCmsUser(null);
        setPermissions([]);
        setRoleLoading(false);
        return;
      }

      setRoleLoading(true);

      const { data, error } = await supabase
        .from("cms_users")
        .select("id, email, display_name, role, is_active, created_at")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        if (!isActive) return;
        setCmsUser(null);
        setPermissions([]);
        setRoleLoading(false);
        return;
      }

      let profile = data as CmsUser | null;

      if (!profile && user.email) {
        try {
          const invite = await fetchInviteByEmail(user.email);
          if (invite) {
            const { error: insertError } = await supabase
              .from("cms_users")
              .insert({
                id: user.id,
                email: user.email,
                role: invite.role,
                display_name:
                  (user.user_metadata?.full_name as string | undefined) ?? null,
                is_active: true,
              });

            if (!insertError && invite.permissions?.length) {
              await supabase.from("cms_permissions").insert(
                invite.permissions.map((sectionKey) => ({
                  editor_id: user.id,
                  section_key: sectionKey,
                })),
              );
            }

            await deleteInvite(invite.email);

            const { data: nextProfile } = await supabase
              .from("cms_users")
              .select("id, email, display_name, role, is_active, created_at")
              .eq("id", user.id)
              .maybeSingle();

            profile = nextProfile as CmsUser | null;
          }
        } catch {
          profile = null;
        }
      }

      if (!isActive) return;
      setCmsUser(profile ?? null);

      if (profile?.role === "editor") {
        const { data: perms } = await supabase
          .from("cms_permissions")
          .select("section_key")
          .eq("editor_id", user.id);
        setPermissions(
          (perms ?? []).map((perm) => perm.section_key as CmsSectionKey),
        );
      } else if (profile?.role === "admin") {
        setPermissions([]);
      } else {
        setPermissions([]);
      }

      setRoleLoading(false);
    };

    void hydrateCmsUser();

    return () => {
      isActive = false;
    };
  }, [user]);

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        cmsUser,
        permissions,
        loading,
        roleLoading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
