import React from "react";
import { useNavigate } from "react-router-dom";
import { cmsSectionLabels, cmsSectionOrder } from "../data/cmsDefaults";
import { useAuth } from "../contexts/AuthContext";
import type {
  CmsFocusContent,
  CmsGalleryContent,
  CmsHeroContent,
  CmsSectionKey,
  CmsWeekContent,
  CmsFamilyContent,
} from "../types/cms";
import { resolveCmsMedia, normalizeText, slugify } from "../lib/cms";
import { CMS_MEDIA_FOLDERS } from "../lib/cmsMedia";
import { uploadMediaFile } from "../services/mediaUpload";
import { upsertCmsContent } from "../services/cmsContent";
import { useCmsSection } from "../hooks/useCmsSection";
import {
  createCmsInvite,
  deleteCmsUser,
  fetchEditorsWithPermissions,
  setEditorPermissions,
} from "../services/cmsUsers";
import { BIBLE_TRANSLATIONS, fetchBibleVerse } from "../services/bibleApi";
import { supabase } from "../lib/supabase";
import {
  validateFocus,
  validateHero,
  validateWeek,
} from "../lib/cmsValidation";
import type { FeedType } from "../types/domain";
import {
  createEvent,
  deleteEvent,
  fetchAllEvents,
  updateEvent,
} from "../services/eventsAdmin";
import {
  createTestimonial,
  deleteTestimonial,
  fetchTestimonials,
  updateTestimonial,
} from "../services/testimonials";
import { fetchBoardMembers, removeBoardMember, saveBoardMember } from "../services/boardMembers";

const panelShellClass =
  "rounded-[28px] border border-[color:var(--panel-border)] bg-[color:var(--panel-bg)] text-[color:var(--panel-text)] shadow-[0_24px_60px_rgba(0,0,0,0.22)]";
const panelMutedClass =
  "border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)]";
const panelInputClass =
  "rounded-xl border border-[color:var(--panel-border)] bg-[color:var(--panel-input)] px-4 py-2 text-body-sm text-[color:var(--panel-text)] outline-none placeholder:text-[color:var(--panel-text-muted)] focus:border-accent";
const panelTextareaClass =
  "rounded-xl border border-[color:var(--panel-border)] bg-[color:var(--panel-input)] px-4 py-3 text-body-sm text-[color:var(--panel-text)] outline-none placeholder:text-[color:var(--panel-text-muted)] focus:border-accent";
const panelSubtextClass = "text-body-xs text-[color:var(--panel-text-muted)]";
type DashboardArea = "home" | "events" | "family";

type RestorePoint = { id: string; label: string; createdAt: string; content: Record<string, unknown> };
const isImageField = (key: string) => /image|avatar|photo|media|thumbnail|storage.?path|url/i.test(key);
const withoutImages = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(withoutImages);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => !isImageField(key)).map(([key, item]) => [key, withoutImages(item)]));
};
const restoreWithCurrentImages = (saved: unknown, current: unknown): unknown => {
  if (Array.isArray(saved)) return saved.map((item, index) => restoreWithCurrentImages(item, Array.isArray(current) ? current[index] : undefined));
  if (!saved || typeof saved !== "object") return saved;
  const savedRecord = saved as Record<string, unknown>;
  const currentRecord = current && typeof current === "object" ? current as Record<string, unknown> : {};
  return Object.fromEntries([...new Set([...Object.keys(savedRecord), ...Object.keys(currentRecord).filter(isImageField)])].map((key) => [key, isImageField(key) ? currentRecord[key] : restoreWithCurrentImages(savedRecord[key], currentRecord[key])]));
};

const SiteAppearanceEditor: React.FC = () => {
  type ThemePreset = { id: string; name: string; accent: string; secondaryAccent: string; createdAt: string };
  const [accent, setAccent] = React.useState("#ffd500");
  const [secondaryAccent, setSecondaryAccent] = React.useState("#4700b8");
  const [presets, setPresets] = React.useState<ThemePreset[]>([]);
  const [presetName, setPresetName] = React.useState("");
  const [status, setStatus] = React.useState("");
  React.useEffect(() => {
    void supabase.from("cms_content").select("content").eq("section_key", "site.theme").maybeSingle().then(({ data }) => {
      const theme = data?.content as { accent?: string; secondaryAccent?: string } | undefined;
      if (theme?.accent && /^#[0-9a-f]{6}$/i.test(theme.accent)) setAccent(theme.accent);
      if (theme?.secondaryAccent && /^#[0-9a-f]{6}$/i.test(theme.secondaryAccent)) setSecondaryAccent(theme.secondaryAccent);
    });
    void supabase.from("cms_content").select("content").eq("section_key", "site.theme_presets").maybeSingle().then(({ data }) => {
      const items = (data?.content as { items?: ThemePreset[] } | undefined)?.items;
      if (Array.isArray(items)) setPresets(items.slice(-4));
    });
  }, []);
  const applyColors = (primary: string, secondary: string) => {
    document.documentElement.style.setProperty("--accent", primary);
    document.documentElement.style.setProperty("--accent-strong", primary);
    document.documentElement.style.setProperty("--accent-soft", `color-mix(in srgb, ${primary} 18%, transparent)`);
    document.documentElement.style.setProperty("--accent-soft-faint", `color-mix(in srgb, ${primary} 10%, transparent)`);
    document.documentElement.style.setProperty("--accent-soft-subtle", `color-mix(in srgb, ${primary} 6%, transparent)`);
    document.documentElement.style.setProperty("--accent-purple", secondary);
    document.documentElement.style.setProperty("--accent-purple-soft", `color-mix(in srgb, ${secondary} 22%, transparent)`);
    document.documentElement.style.setProperty("--accent-purple-glow", `color-mix(in srgb, ${secondary} 58%, transparent)`);
  };
  const save = async () => {
    const { error } = await supabase.from("cms_content").upsert({ section_key: "site.theme", content: { accent, secondaryAccent }, is_published: true }, { onConflict: "section_key" });
    if (error) { setStatus(error.message); return; }
    applyColors(accent, secondaryAccent);
    setStatus("Accent colors saved.");
  };
  const savePreset = async () => {
    if (presets.length >= 4) { setStatus("You can save up to four presets. Remove one to make room."); return; }
    const name = presetName.trim() || `Color preset ${presets.length + 1}`;
    const next = [...presets, { id: crypto.randomUUID(), name, accent, secondaryAccent, createdAt: new Date().toISOString() }];
    const { error } = await supabase.from("cms_content").upsert({ section_key: "site.theme_presets", content: { items: next }, is_published: true }, { onConflict: "section_key" });
    if (error) { setStatus(error.message); return; }
    setPresets(next); setPresetName(""); setStatus("Color preset saved.");
  };
  const removePreset = async (id: string) => {
    const next = presets.filter((preset) => preset.id !== id);
    const { error } = await supabase.from("cms_content").upsert({ section_key: "site.theme_presets", content: { items: next }, is_published: true }, { onConflict: "section_key" });
    if (error) { setStatus(error.message); return; }
    setPresets(next); setStatus("Color preset removed.");
  };
  const choosePreset = async (preset: ThemePreset) => {
    const { error } = await supabase.from("cms_content").upsert({ section_key: "site.theme", content: { accent: preset.accent, secondaryAccent: preset.secondaryAccent }, is_published: true }, { onConflict: "section_key" });
    if (error) { setStatus(error.message); return; }
    setAccent(preset.accent); setSecondaryAccent(preset.secondaryAccent); applyColors(preset.accent, preset.secondaryAccent); setStatus(`${preset.name} applied.`);
  };
  return <section className={`${panelShellClass} p-6`}><h2 className="text-heading-md font-semibold">Site appearance</h2><p className="mt-2 text-body-sm text-[color:var(--panel-text-muted)]">Choose both accent colors used across the site.</p><div className="mt-4 flex flex-wrap items-end gap-5"><label className="grid gap-2 text-body-xs"><span>Primary accent</span><span className="flex items-center gap-2"><input aria-label="Primary accent color" type="color" value={accent} onChange={(event) => setAccent(event.target.value)} className="h-11 w-16 cursor-pointer rounded-lg border border-[color:var(--panel-border)] bg-transparent"/><span>{accent}</span></span></label><label className="grid gap-2 text-body-xs"><span>Secondary accent</span><span className="flex items-center gap-2"><input aria-label="Secondary accent color" type="color" value={secondaryAccent} onChange={(event) => setSecondaryAccent(event.target.value)} className="h-11 w-16 cursor-pointer rounded-lg border border-[color:var(--panel-border)] bg-transparent"/><span>{secondaryAccent}</span></span></label><button type="button" onClick={() => void save()} className="rounded-full bg-[color:var(--panel-text)] px-4 py-2 text-body-sm font-semibold text-[color:var(--panel-ink)]">Save colors</button></div><div className="mt-5 border-t border-[color:var(--panel-border)] pt-4"><p className="text-body-sm font-semibold">Color presets <span className="font-normal text-[color:var(--panel-text-muted)]">({presets.length}/4)</span></p><div className="mt-3 flex flex-wrap gap-2"><input aria-label="Preset name" placeholder="Name this preset" value={presetName} onChange={(event) => setPresetName(event.target.value)} className={`${panelInputClass} min-w-[170px]`} /><button type="button" disabled={presets.length >= 4} onClick={() => void savePreset()} className="rounded-full border border-[color:var(--panel-border)] px-4 py-2 text-body-xs disabled:opacity-50">Save current preset</button></div>{presets.map((preset) => <div key={preset.id} className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-3"><span className="mr-auto text-body-xs">{preset.name}</span><span aria-label={`Primary ${preset.accent}`} className="h-5 w-5 rounded-full border border-white/30" style={{ backgroundColor: preset.accent }} /><span aria-label={`Secondary ${preset.secondaryAccent}`} className="h-5 w-5 rounded-full border border-white/30" style={{ backgroundColor: preset.secondaryAccent }} /><button type="button" onClick={() => void choosePreset(preset)} className="rounded-full border border-[color:var(--panel-border)] px-3 py-1.5 text-body-xs">Apply</button><button type="button" onClick={() => void removePreset(preset.id)} className="rounded-full px-3 py-1.5 text-body-xs text-[color:var(--panel-text-muted)] hover:text-[color:var(--panel-text)]">Remove</button></div>)}</div>{status && <p className={`mt-3 ${panelSubtextClass}`}>{status}</p>}</section>;
};

const RestorePointsEditor: React.FC = () => {
  const [points, setPoints] = React.useState<RestorePoint[]>([]);
  const [status, setStatus] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const load = React.useCallback(async () => {
    const { data } = await supabase.from("cms_content").select("content").eq("section_key", "site.restore_points").maybeSingle();
    const items = (data?.content as { items?: RestorePoint[] } | undefined)?.items;
    setPoints(Array.isArray(items) ? items : []);
  }, []);
  React.useEffect(() => { void load(); }, [load]);
  const create = async () => {
    setBusy(true); setStatus("");
    const { data, error } = await supabase.from("cms_content").select("section_key,content").neq("section_key", "site.restore_points");
    if (error) { setStatus(error.message); setBusy(false); return; }
    const point: RestorePoint = { id: crypto.randomUUID(), label: `Restore point ${new Date().toLocaleString()}`, createdAt: new Date().toISOString(), content: Object.fromEntries((data ?? []).map((row) => [row.section_key, withoutImages(row.content)])) };
    const next = [...points, point].slice(-2);
    const result = await supabase.from("cms_content").upsert({ section_key: "site.restore_points", content: { items: next }, is_published: true }, { onConflict: "section_key" });
    setStatus(result.error?.message ?? "Restore point created. The oldest point is removed when a third is created.");
    if (!result.error) setPoints(next);
    setBusy(false);
  };
  const restore = async (point: RestorePoint) => {
    if (!window.confirm(`Restore “${point.label}”? Current text content will be replaced.`)) return;
    setBusy(true); setStatus("");
    const { data, error } = await supabase.from("cms_content").select("section_key,content");
    if (error) { setStatus(error.message); setBusy(false); return; }
    const current = Object.fromEntries((data ?? []).map((row) => [row.section_key, row.content]));
    const writes = Object.entries(point.content).map(([section_key, content]) => supabase.from("cms_content").upsert({ section_key, content: restoreWithCurrentImages(content, current[section_key]), is_published: true }, { onConflict: "section_key" }));
    const results = await Promise.all(writes);
    const failed = results.find((result) => result.error);
    setStatus(failed?.error?.message ?? "Saved text content restored. Reload the site to see all changes.");
    setBusy(false);
  };
  return <section className={`${panelShellClass} p-6`}><h2 className="text-heading-md font-semibold">Restore points</h2><p className="mt-2 text-body-sm text-[color:var(--panel-text-muted)]">Save and restore CMS section content. Image fields are left out of the saved copy. Keep up to two points.</p><button type="button" disabled={busy} onClick={() => void create()} className="mt-4 rounded-full bg-[color:var(--panel-text)] px-4 py-2 text-body-sm font-semibold text-[color:var(--panel-ink)] disabled:opacity-50">{busy ? "Working…" : "Create restore point"}</button><div className="mt-4 grid gap-3">{points.map((point) => <div key={point.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-4"><span className="text-body-sm">{point.label}</span><button type="button" disabled={busy} onClick={() => void restore(point)} className="rounded-full border border-[color:var(--panel-border)] px-4 py-2 text-body-xs">Restore this point</button></div>)}</div>{status && <p className={`mt-3 ${panelSubtextClass}`}>{status}</p>}</section>;
};



const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { cmsUser, permissions, roleLoading, signOut } = useAuth();
  const [activeArea, setActiveArea] = React.useState<DashboardArea>("home");
  const [expandedArea, setExpandedArea] = React.useState<DashboardArea | null>(null);
  const [showAdminControls, setShowAdminControls] = React.useState(false);
  const headerRef = React.useRef<HTMLDivElement | null>(null);
  const [showGoBackUp, setShowGoBackUp] = React.useState(false);

  React.useEffect(() => {
  const checkSession = async () => {
    const { data, error } = await supabase.auth.getUser();

    console.log("SUPABASE USER:", data.user);
    console.log("SUPABASE USER ID:", data.user?.id);
    console.log("SUPABASE USER EMAIL:", data.user?.email);
    console.log("SUPABASE USER ERROR:", error);
  };

  void checkSession();
}, []);

  React.useEffect(() => {
    if (!roleLoading && !cmsUser?.is_active) {
      navigate("/login", { replace: true });
    }
  }, [cmsUser, roleLoading, navigate]);

  React.useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const observer = new IntersectionObserver(([entry]) => setShowGoBackUp(!entry.isIntersecting), { threshold: 0 });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const isAdmin = cmsUser?.role === "admin";
  const allowedSections = isAdmin
    ? cmsSectionOrder
    : cmsSectionOrder.filter((key) => permissions.includes(key));
  const allowedAreas: { key: DashboardArea; label: string }[] = [
    ...(isAdmin || permissions.some((key) => ["home.hero", "home.focus", "home.week", "home.gallery", "content.testimonials"].includes(key)) ? [{ key: "home" as const, label: "Home" }] : []),
    ...(isAdmin || permissions.includes("content.events") ? [{ key: "events" as const, label: "Events" }] : []),
    ...(isAdmin || permissions.includes("content.board") || permissions.includes("family.content") ? [{ key: "family" as const, label: "Family" }] : []),
  ];
  const areaSections: Record<DashboardArea, { label: string; id: string }[]> = {
    home: [{ label: "Hero", id: "dashboard-hero" }, { label: "Focus", id: "dashboard-focus" }, { label: "Week", id: "dashboard-week" }, { label: "Gallery", id: "dashboard-gallery" }, { label: "Testimonials", id: "dashboard-testimonials" }],
    events: [{ label: "Events", id: "dashboard-events" }],
    family: [{ label: "Family details", id: "dashboard-family" }, { label: "Board", id: "dashboard-board" }],
  };
  const goToDashboardSection = (area: DashboardArea, id: string) => {
    setActiveArea(area);
    setExpandedArea(area);
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  React.useEffect(() => {
    if (!allowedAreas.some((area) => area.key === activeArea) && allowedAreas[0]) {
      setActiveArea(allowedAreas[0].key);
    }
  }, [allowedAreas, activeArea]);

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-page text-ink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,var(--accent-soft),transparent_52%),radial-gradient(circle_at_88%_12%,rgba(0,0,0,0.2),transparent_55%),linear-gradient(180deg,var(--page-bg),var(--surface-soft))]"></div>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-6 pb-16 pt-10">
        <div ref={headerRef} className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-overline text-accent">Dashboard</p>
            <h1 className="mt-2 text-heading-xl font-semibold">
              {cmsUser?.display_name
                ? `Welcome, ${cmsUser.display_name}`
                : "Content Studio"}
            </h1>
            <p className="text-body text-muted">
              Manage hero storytelling, weekly rhythm, and the focus section.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-full border border-strong px-4 py-2 text-body-sm hover:bg-contrast hover:text-inverse"
            >
              Site
            </button>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => setShowAdminControls((prev) => !prev)}
                className={`rounded-full border border-strong px-4 py-2 text-body-sm transition-colors ${
                  showAdminControls
                    ? "bg-contrast text-inverse"
                    : "hover:bg-contrast hover:text-inverse"
                }`}
                aria-pressed={showAdminControls}
              >
                Manage Accounts
              </button>
            ) : (
              <span className="rounded-full border border-subtle bg-surface-muted px-4 py-2 text-body-xs uppercase tracking-[0.22em] text-muted">
                {cmsUser?.role ?? ""}
              </span>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-strong px-4 py-2 text-body-sm hover:bg-contrast hover:text-inverse"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 pb-28 lg:pb-0 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside
            className={`fixed inset-x-0 bottom-0 z-40 flex max-w-full justify-center gap-2 overflow-x-auto rounded-t-[24px] rounded-b-none p-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] lg:sticky lg:top-6 lg:h-fit lg:flex-col lg:justify-start lg:gap-3 lg:rounded-[24px] lg:p-4 lg:shadow-[0_20px_50px_rgba(0,0,0,0.24)] ${panelMutedClass}`}
          >
            <p className="hidden text-caption uppercase tracking-[0.3em] text-[color:var(--panel-text-muted)] lg:block">
              Sections
            </p>
            {allowedAreas.map((area) => <div key={area.key} className="relative shrink-0 lg:w-full">
              <div className="flex items-center gap-1 rounded-full lg:rounded-2xl">
                <button type="button" onClick={() => { setActiveArea(area.key); setExpandedArea((prev) => prev === area.key ? null : area.key); }} className={`rounded-full px-4 py-3 text-center text-body-sm transition-colors lg:flex-1 lg:rounded-2xl lg:text-left ${activeArea === area.key ? "bg-[color:var(--panel-text)] text-[color:var(--panel-ink)]" : "text-[color:var(--panel-text-muted)] hover:bg-[color:var(--panel-input)] hover:text-[color:var(--panel-text)]"}`}>{area.label}</button>
                <button type="button" aria-label={`Toggle ${area.label} sections`} aria-expanded={expandedArea === area.key} onClick={() => { setActiveArea(area.key); setExpandedArea((prev) => prev === area.key ? null : area.key); }} className="hidden h-9 w-9 items-center justify-center rounded-xl text-[color:var(--panel-text-muted)] hover:bg-[color:var(--panel-input)] lg:flex"><span className={`transition-transform ${expandedArea === area.key ? "rotate-180" : ""}`}>⌄</span></button>
              </div>
              {expandedArea === area.key && <div className="absolute bottom-full left-1/2 mb-2 flex max-h-[45vh] -translate-x-1/2 flex-col gap-1 overflow-y-auto rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-bg)] p-2 shadow-xl lg:static lg:mt-1 lg:max-h-none lg:translate-x-0 lg:border-0 lg:bg-transparent lg:p-0 lg:pl-3 lg:shadow-none">{areaSections[area.key].map((section) => <button key={section.id} type="button" onClick={() => goToDashboardSection(area.key, section.id)} className="whitespace-nowrap rounded-xl px-3 py-2 text-left text-body-xs text-[color:var(--panel-text-muted)] hover:bg-[color:var(--panel-input)] hover:text-[color:var(--panel-text)]">{section.label}</button>)}</div>}
            </div>)}
          </aside>

          <main className="flex flex-col gap-6">
            {(isAdmin || cmsUser?.role === "editor") && <div className="grid gap-6 md:grid-cols-2"><SiteAppearanceEditor /><RestorePointsEditor /></div>}
            {isAdmin && (
              <TeamEditor
                  key="team"
                  visible={showAdminControls}
                  allowedSections={allowedSections}
                />
            )}
            {activeArea === "home" && (
              <>
                {(isAdmin || permissions.includes("home.hero")) && <div id="dashboard-hero"><HeroEditor canEdit={isAdmin || permissions.includes("home.hero")} /></div>}
                {(isAdmin || permissions.includes("home.focus")) && <div id="dashboard-focus"><FocusEditor canEdit={isAdmin || permissions.includes("home.focus")} /></div>}
                {(isAdmin || permissions.includes("home.week")) && <div id="dashboard-week"><WeekEditor canEdit={isAdmin || permissions.includes("home.week")} /></div>}
                {(isAdmin || permissions.includes("home.gallery")) && <div id="dashboard-gallery"><GalleryEditor canEdit={isAdmin || permissions.includes("home.gallery")} /></div>}
                {(isAdmin || permissions.includes("content.testimonials")) && <div id="dashboard-testimonials"><TestimonialsEditor canEdit={isAdmin || permissions.includes("content.testimonials")} /></div>}
              </>
            )}
            {activeArea === "events" && (
              <div id="dashboard-events"><EventsEditor
                canEdit={isAdmin || permissions.includes("content.events")}
              /></div>
            )}
            {activeArea === "family" && (
              <>
                {(isAdmin || permissions.includes("family.content") || permissions.includes("content.board")) && <div id="dashboard-family"><FamilyContentEditor canEdit={isAdmin || permissions.includes("family.content") || permissions.includes("content.board")} /></div>}
                <div id="dashboard-board"><BoardMembersEditor canEdit={isAdmin || permissions.includes("content.board")} /></div>
              </>
            )}
          </main>
        </div>
      </div>
      {showGoBackUp && <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed right-5 top-5 z-[120] rounded-full border border-[color:var(--panel-border)] bg-[color:var(--panel-bg)] px-4 py-2.5 text-body-sm font-semibold text-[color:var(--panel-text)] shadow-xl">Go Back Up</button>}
    </div>
  );
};

const SectionShell: React.FC<{
  title: string;
  description: string;
  canEdit: boolean;
  saving: boolean;
  dirty?: boolean;
  onSave: () => void;
  status: string | null;
  errors: string[];
  children: React.ReactNode;
}> = ({
  title,
  description,
  canEdit,
  saving,
  dirty = true,
  onSave,
  status,
  errors,
  children,
}) => {
  return (
    <section className={`${panelShellClass} p-6`}>
      <div className="flex flex-col items-start gap-4">
        <div>
          <h2 className="text-heading-md font-semibold">{title}</h2>
          <p className="mt-2 text-body-sm text-[color:var(--panel-text-muted)]">
            {description}
          </p>
        </div>
      </div>

      {!canEdit && (
        <div className="mt-4 rounded-xl border border-dashed border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] px-4 py-3 text-body-sm text-[color:var(--panel-text-muted)]">
          You can view this section but you do not have edit permissions.
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-[color:var(--danger)] bg-[rgba(185,28,28,0.08)] px-4 py-3 text-body-sm text-danger">
          <p className="font-semibold">Validation issues</p>
          <ul className="mt-2 list-disc pl-5">
            {errors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {status && (
        <div className="mt-4 rounded-xl border border-dashed border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] px-4 py-3 text-body-sm text-[color:var(--panel-text-muted)]">
          {status}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-6">{children}</div>
      <button
        type="button"
        onClick={onSave}
        disabled={!canEdit || saving || !dirty}
        className={`mt-6 rounded-full bg-[color:var(--panel-text)] px-5 py-2 text-body-sm font-semibold text-[color:var(--panel-ink)] transition-opacity disabled:opacity-50 ${dirty ? "animate-save-pulse" : ""}`}
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </section>
  );
};

const MediaUploadField: React.FC<{
  label: string;
  helper?: string;
  value?: string | null;
  onUpload: (file: File) => Promise<void>;
}> = ({ label, helper, value, onUpload }) => {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const file = event.target.files[0];
    setUploading(true);
    setError(null);

    try {
      await onUpload(file);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-body-sm font-medium">{label}</span>
        <label className="cursor-pointer rounded-full border border-[color:var(--panel-border)] px-3 py-1 text-body-xs text-[color:var(--panel-text-muted)] hover:text-[color:var(--panel-text)]">
          {uploading ? "Uploading..." : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
            disabled={uploading}
          />
        </label>
      </div>
      {helper && <p className={panelSubtextClass}>{helper}</p>}
      {value && (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--panel-border)]">
          <img src={value} alt="Preview" className="h-48 w-full object-cover" />
        </div>
      )}
      {error && <p className="text-body-xs text-danger">{error}</p>}
    </div>
  );
};

const HeroEditor: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const initialContent = useCmsSection("home.hero");
  const [draft, setDraft] = React.useState<CmsHeroContent>(initialContent);
  const [savedSnapshot, setSavedSnapshot] = React.useState(JSON.stringify(initialContent));
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [newSlideLabel, setNewSlideLabel] = React.useState("");
  const [newSlideImage, setNewSlideImage] = React.useState<CmsHeroContent["slides"][number]["image"] | null>(null);
  const [editingSlideId, setEditingSlideId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDraft(initialContent);
    setSavedSnapshot(JSON.stringify(initialContent));
  }, [initialContent]);

  const handleSlideUpload = async (file: File) => {
    const result = await uploadMediaFile(file, {
      folder: CMS_MEDIA_FOLDERS.homeHero,
      prefix: slugify(newSlideLabel || "hero-slide"),
    });
    setNewSlideImage({ storagePath: result.storagePath });
  };

  const addSlide = () => {
    const label = normalizeText(newSlideLabel);
    if (!label || !newSlideImage) {
      setErrors(["Enter a slide label and upload its image before adding it."]);
      return;
    }
    setDraft((prev) => ({
      ...prev,
      slides: editingSlideId
        ? prev.slides.map((slide) => slide.id === editingSlideId ? { ...slide, label, image: newSlideImage } : slide)
        : [...prev.slides, { id: crypto.randomUUID(), label, image: newSlideImage }],
    }));
    setEditingSlideId(null);
    setNewSlideLabel("");
    setNewSlideImage(null);
    setErrors([]);
  };

  const handleSave = async () => {
    if (!canEdit) return false;

    const sanitized: CmsHeroContent = {
      ...draft,
      heroHeader: draft.heroHeader.map(normalizeText).filter(Boolean),
      heroSecondary: draft.heroSecondary.map(normalizeText).filter(Boolean),
      slides: draft.slides.map((slide) => ({
        ...slide,
        label: normalizeText(slide.label),
      })),
      finalSlideId: draft.slides.some((slide) => slide.id === draft.finalSlideId)
        ? draft.finalSlideId
        : draft.slides[draft.slides.length - 1]?.id ?? "",
    };

    const validation = validateHero(sanitized);
    setErrors(validation.errors);

    if (!validation.valid) {
      return false;
    }

    setSaving(true);
    setStatus(null);

    try {
      await upsertCmsContent("home.hero", sanitized);
      setDraft(sanitized);
      setSavedSnapshot(JSON.stringify(sanitized));
      setStatus("Hero content saved.");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed.";
      setStatus(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionShell
      title="Hero Story"
      description="Control the opening headline and the rotating hero slides. The last slide becomes the anchored background image."
      canEdit={canEdit}
      saving={saving}
      dirty={JSON.stringify(draft) !== savedSnapshot}
      onSave={handleSave}
      status={status}
      errors={errors}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {draft.heroHeader.map((line, index) => (
          <label key={`header-${index}`} className="flex flex-col gap-2">
            <span className="text-body-sm font-medium">
              Header line {index + 1}
            </span>
            <input
              type="text"
              value={line}
              onChange={(event) => {
                const value = event.target.value;
                setDraft((prev) => {
                  const next = [...prev.heroHeader];
                  next[index] = value;
                  return { ...prev, heroHeader: next };
                });
              }}
              className={panelInputClass}
              disabled={!canEdit}
            />
          </label>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {draft.heroSecondary.map((line, index) => (
          <label key={`secondary-${index}`} className="flex flex-col gap-2">
            <span className="text-body-sm font-medium">
              Secondary line {index + 1}
            </span>
            <input
              type="text"
              value={line}
              onChange={(event) => {
                const value = event.target.value;
                setDraft((prev) => {
                  const next = [...prev.heroSecondary];
                  next[index] = value;
                  return { ...prev, heroSecondary: next };
                });
              }}
              className={panelInputClass}
              disabled={!canEdit}
            />
          </label>
        ))}
      </div>

      <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-4">
        <h3 className="text-heading-sm font-semibold">{editingSlideId ? "Edit slide" : "Add a slide"}</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2"><span className="text-body-sm font-medium">Slide label</span><input value={newSlideLabel} onChange={(event) => setNewSlideLabel(event.target.value)} className={panelInputClass} disabled={!canEdit} placeholder="e.g. Community Worship" /></label>
          <MediaUploadField label="Slide image" helper="Upload the image for this slide." value={resolveCmsMedia(newSlideImage)} onUpload={handleSlideUpload} />
        </div>
        <button type="button" onClick={addSlide} disabled={!canEdit || !newSlideLabel.trim() || !newSlideImage} className="mt-4 rounded-full border border-[color:var(--panel-border)] px-4 py-2 text-body-sm disabled:opacity-50">{editingSlideId ? "Update slide" : "Add slide"}</button>
        {editingSlideId && <button type="button" onClick={() => { setEditingSlideId(null); setNewSlideLabel(""); setNewSlideImage(null); }} className="ml-2 rounded-full border border-[color:var(--panel-border)] px-4 py-2 text-body-sm">Cancel edit</button>}
      </div>
      {draft.slides.find((slide) => slide.id === draft.finalSlideId) && (
        <div className="rounded-2xl border border-accent bg-accent-soft/20 p-4">
          <p className="text-overline font-semibold text-accent">Final intro image</p>
          <p className="mt-1 text-body-sm text-[color:var(--panel-text-muted)]">This selected slide stays as the Home hero background when the intro finishes.</p>
          <div className="mt-3 flex items-center gap-4">
            <img src={resolveCmsMedia(draft.slides.find((slide) => slide.id === draft.finalSlideId)?.image) ?? undefined} alt="" className="h-20 w-28 rounded-xl object-cover" />
            <p className="font-semibold">{draft.slides.find((slide) => slide.id === draft.finalSlideId)?.label}</p>
            <span className="ml-auto rounded-full bg-accent px-3 py-1 text-body-xs font-semibold text-[color:var(--panel-ink)]">Shown after intro</span>
          </div>
        </div>
      )}
      <div>
        <h3 className="text-heading-sm font-semibold">Existing slides</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {draft.slides.map((slide) => (
          <div
            key={slide.id}
            className="rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-4"
          >
            <div className="flex items-center justify-between gap-2"><p className="font-semibold">{slide.label}</p><div className="flex gap-2"><button type="button" disabled={!canEdit} onClick={() => { setNewSlideLabel(slide.label); setNewSlideImage(slide.image); setEditingSlideId(slide.id); }} className="rounded-full border border-[color:var(--panel-border)] px-3 py-1 text-body-xs disabled:opacity-50">Edit</button><button type="button" disabled={!canEdit} onClick={() => { setDraft((prev) => { const slides = prev.slides.filter((entry) => entry.id !== slide.id); return { ...prev, slides, finalSlideId: prev.finalSlideId === slide.id ? slides[slides.length - 1]?.id ?? "" : prev.finalSlideId }; }); if (editingSlideId === slide.id) { setEditingSlideId(null); setNewSlideLabel(""); setNewSlideImage(null); } }} className="rounded-full border border-[color:var(--danger)] px-3 py-1 text-body-xs text-danger disabled:opacity-50">Delete</button></div></div>
            <img src={resolveCmsMedia(slide.image) ?? undefined} alt={slide.label} className="mt-3 h-36 w-full rounded-xl object-cover" />
            <label className="mt-3 flex items-center gap-2 text-body-xs text-[color:var(--panel-text-muted)]"><input type="radio" name="hero-final-slide" checked={draft.finalSlideId === slide.id} onChange={() => setDraft((previous) => ({ ...previous, finalSlideId: slide.id }))} disabled={!canEdit} />Use as final background</label>
          </div>
        ))}
        </div>
      </div>
    </SectionShell>
  );
};

const FocusEditor: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const initialContent = useCmsSection("home.focus");
  const [draft, setDraft] = React.useState<CmsFocusContent>(initialContent);
  const [savedSnapshot, setSavedSnapshot] = React.useState(JSON.stringify(initialContent));
  const [selectedItemId, setSelectedItemId] = React.useState(initialContent.items[0]?.id ?? "");
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<string[]>([]);

  React.useEffect(() => {
    setDraft(initialContent);
    setSavedSnapshot(JSON.stringify(initialContent));
    setSelectedItemId(initialContent.items[0]?.id ?? "");
  }, [initialContent]);

  const handleItemUpload = async (index: number, file: File) => {
    const result = await uploadMediaFile(file, {
      folder: CMS_MEDIA_FOLDERS.homeFocus,
      prefix: draft.items[index]?.title ?? `focus-${index + 1}`,
    });

    setDraft((prev) => {
      const nextItems = [...prev.items];
      nextItems[index] = {
        ...nextItems[index],
        image: { storagePath: result.storagePath },
      };
      return { ...prev, items: nextItems };
    });
  };

  const handleSave = async () => {
    if (!canEdit) return false;

    const sanitized: CmsFocusContent = {
      ...draft,
      overline: normalizeText(draft.overline),
      title: normalizeText(draft.title),
      description: normalizeText(draft.description),
      items: draft.items.map((item) => ({
        ...item,
        title: normalizeText(item.title),
        copy: normalizeText(item.copy),
      })),
    };

    const validation = validateFocus(sanitized);
    setErrors(validation.errors);

    if (!validation.valid) {
      return false;
    }

    setSaving(true);
    setStatus(null);

    try {
      await upsertCmsContent("home.focus", sanitized);
      setDraft(sanitized);
      setSavedSnapshot(JSON.stringify(sanitized));
      setStatus("Focus section saved.");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed.";
      setStatus(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionShell
      title="Focus Section"
      description="Update the guiding copy and the rotating focus cards in the intercession section."
      canEdit={canEdit}
      saving={saving}
      dirty={JSON.stringify(draft) !== savedSnapshot}
      onSave={handleSave}
      status={status}
      errors={errors}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Overline</span>
          <input
            type="text"
            value={draft.overline}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, overline: event.target.value }))
            }
            className={panelInputClass}
            disabled={!canEdit}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Title</span>
          <input
            type="text"
            value={draft.title}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, title: event.target.value }))
            }
            className={panelInputClass}
            disabled={!canEdit}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-body-sm font-medium">Description</span>
        <textarea
          value={draft.description}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, description: event.target.value }))
          }
          className={`${panelTextareaClass} min-h-[110px]`}
          disabled={!canEdit}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {draft.items.map((item) => (
          <button key={item.id} type="button" onClick={() => setSelectedItemId(item.id)} className={`rounded-full px-4 py-2 text-body-sm ${selectedItemId === item.id ? "bg-[color:var(--panel-text)] text-[color:var(--panel-ink)]" : "border border-[color:var(--panel-border)] text-[color:var(--panel-text-muted)]"}`}>
            {item.title || "Untitled item"}
          </button>
        ))}
      </div>
      {draft.items.map((item, index) => item.id === selectedItemId && (
          <div key={item.id} className="rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-4">
            <label className="flex flex-col gap-2">
              <span className="text-body-sm font-medium">Item title</span>
              <input
                type="text"
                value={item.title}
                onChange={(event) => {
                  const value = event.target.value;
                  setDraft((prev) => {
                    const nextItems = [...prev.items];
                    nextItems[index] = { ...nextItems[index], title: value };
                    return { ...prev, items: nextItems };
                  });
                }}
                className={panelInputClass}
                disabled={!canEdit}
              />
            </label>
            <label className="mt-3 flex flex-col gap-2">
              <span className="text-body-sm font-medium">Item copy</span>
              <textarea
                value={item.copy}
                onChange={(event) => {
                  const value = event.target.value;
                  setDraft((prev) => {
                    const nextItems = [...prev.items];
                    nextItems[index] = { ...nextItems[index], copy: value };
                    return { ...prev, items: nextItems };
                  });
                }}
                className={`${panelTextareaClass} min-h-[90px]`}
                disabled={!canEdit}
              />
            </label>
            <div className="mt-4">
              <MediaUploadField
                label="Item image"
                helper="Upload a textured, story-driven visual."
                value={resolveCmsMedia(item.image)}
                onUpload={(file) => handleItemUpload(index, file)}
              />
            </div>
          </div>
        ))}
    </SectionShell>
  );
};

const WeekEditor: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const initialContent = useCmsSection("home.week");
  const [draft, setDraft] = React.useState<CmsWeekContent>(initialContent);
  const [savedSnapshot, setSavedSnapshot] = React.useState(JSON.stringify(initialContent));
  const [selectedDay, setSelectedDay] = React.useState(initialContent.slides[0]?.id ?? "");
  const [pendingDay, setPendingDay] = React.useState<string | null>(null);
  const [skipDayWarning, setSkipDayWarning] = React.useState(() => localStorage.getItem("skip-week-day-warning") === "true");
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<string[]>([]);

  React.useEffect(() => {
    setDraft(initialContent);
    setSavedSnapshot(JSON.stringify(initialContent));
    setSelectedDay(initialContent.slides[0]?.id ?? "");
  }, [initialContent]);

  const handleSlideUpload = async (index: number, file: File) => {
    const result = await uploadMediaFile(file, {
      folder: CMS_MEDIA_FOLDERS.homeWeek,
      prefix: draft.slides[index]?.day ?? `week-${index + 1}`,
    });

    setDraft((prev) => {
      const nextSlides = [...prev.slides];
      nextSlides[index] = {
        ...nextSlides[index],
        image: { storagePath: result.storagePath },
      };
      return { ...prev, slides: nextSlides };
    });
  };

  const handleSave = async () => {
    if (!canEdit) return false;

    setSaving(true);
    setStatus(null);

    try {
      const themeTitle = normalizeText(draft.themeOfWeek.title);
      const themeVerseReference = normalizeText(
        draft.themeOfWeek.verseReference,
      );
      const themeVerseVersion = draft.themeOfWeek.verseVersion?.trim() || null;

      let resolvedVerseText = draft.themeOfWeek.verseText;
      let resolvedTranslation = draft.themeOfWeek.verseTranslation ?? null;
      let resolvedReference = themeVerseReference;
      let resolvedVersion = themeVerseVersion;

      if (themeVerseReference) {
        const verse = await fetchBibleVerse(
          themeVerseReference,
          themeVerseVersion,
        );
        resolvedVerseText = verse.text;
        resolvedReference = verse.reference;
        resolvedVersion = verse.translationId;
        resolvedTranslation = verse.translationName;
      }

      const sanitized: CmsWeekContent = {
        ...draft,
        overline: normalizeText(draft.overline),
        title: normalizeText(draft.title),
        description: normalizeText(draft.description),
        themeOfWeek: {
          title: themeTitle,
          verseReference: resolvedReference,
          verseVersion: resolvedVersion,
          verseText: resolvedVerseText,
          verseTranslation: resolvedTranslation,
        },
        slides: draft.slides.map((slide) => ({
          ...slide,
          day: normalizeText(slide.day),
          title: normalizeText(slide.title),
          description: normalizeText(slide.description),
          activities: slide.activities.map(normalizeText).filter(Boolean),
        })),
      };

      const validation = validateWeek(sanitized);
      setErrors(validation.errors);

      if (!validation.valid) {
        setSaving(false);
        return false;
      }

      await upsertCmsContent("home.week", sanitized);
      setDraft(sanitized);
      setSavedSnapshot(JSON.stringify(sanitized));
      setStatus("Week content saved.");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed.";
      setStatus(message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionShell
      title="A Week In Christian Leaders"
      description="Edit the weekly rhythm carousel and the day-by-day highlights."
      canEdit={canEdit}
      saving={saving}
      dirty={JSON.stringify(draft) !== savedSnapshot}
      onSave={handleSave}
      status={status}
      errors={errors}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Overline</span>
          <input
            type="text"
            value={draft.overline}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, overline: event.target.value }))
            }
            className={panelInputClass}
            disabled={!canEdit}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Title</span>
          <input
            type="text"
            value={draft.title}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, title: event.target.value }))
            }
            className={panelInputClass}
            disabled={!canEdit}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-body-sm font-medium">Description</span>
        <textarea
          value={draft.description}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, description: event.target.value }))
          }
          className={`${panelTextareaClass} min-h-[110px]`}
          disabled={!canEdit}
        />
      </label>

      <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-4">
        <h3 className="text-heading-sm font-semibold">Theme of the Week</h3>
        <p className={`${panelSubtextClass} mt-1`}>
          Enter a verse reference and optional translation. We&apos;ll fetch the
          verse text from bible-api.com on save.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-body-sm font-medium">Theme title</span>
            <input
              type="text"
              value={draft.themeOfWeek.title}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  themeOfWeek: {
                    ...prev.themeOfWeek,
                    title: event.target.value,
                  },
                }))
              }
              className={panelInputClass}
              disabled={!canEdit}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-body-sm font-medium">Verse reference</span>
            <input
              type="text"
              value={draft.themeOfWeek.verseReference}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  themeOfWeek: {
                    ...prev.themeOfWeek,
                    verseReference: event.target.value,
                  },
                }))
              }
              className={panelInputClass}
              disabled={!canEdit}
              placeholder="e.g. John 3:16"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-body-sm font-medium">Verse version</span>
            <select
              value={draft.themeOfWeek.verseVersion ?? ""}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  themeOfWeek: {
                    ...prev.themeOfWeek,
                    verseVersion: event.target.value || null,
                  },
                }))
              }
              className={panelInputClass}
              disabled={!canEdit}
            >
              <option value="">Default (WEB)</option>
              {BIBLE_TRANSLATIONS.map((translation) => (
                <option key={translation.id} value={translation.id}>
                  {translation.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-2">
            <span className="text-body-sm font-medium">Resolved verse</span>
            <div className="rounded-xl border border-[color:var(--panel-border)] bg-[color:var(--panel-input)] px-4 py-3 text-body-sm text-[color:var(--panel-text-muted)] min-h-[72px]">
              {draft.themeOfWeek.verseText
                ? draft.themeOfWeek.verseText
                : "Verse text will populate after saving."}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {draft.slides.map((slide) => (
          <button key={slide.id} type="button" onClick={() => {
            if (slide.id === selectedDay) return;
            if (JSON.stringify(draft) !== savedSnapshot && !skipDayWarning) setPendingDay(slide.id);
            else setSelectedDay(slide.id);
          }} className={`rounded-full px-4 py-2 text-body-sm ${selectedDay === slide.id ? "bg-[color:var(--panel-text)] text-[color:var(--panel-ink)]" : "border border-[color:var(--panel-border)] text-[color:var(--panel-text-muted)]"}`}>
            {slide.day}
          </button>
        ))}
      </div>
      <div className="grid gap-6">
        {draft.slides.map((slide, index) => slide.id === selectedDay && (
          <div
            key={slide.id}
            className="rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-body-sm font-medium">Day label</span>
                <input
                  type="text"
                  value={slide.day}
                  onChange={(event) => {
                    const value = event.target.value;
                    setDraft((prev) => {
                      const nextSlides = [...prev.slides];
                      nextSlides[index] = { ...nextSlides[index], day: value };
                      return { ...prev, slides: nextSlides };
                    });
                  }}
                  className={panelInputClass}
                  disabled={!canEdit}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-body-sm font-medium">Slide title</span>
                <input
                  type="text"
                  value={slide.title}
                  onChange={(event) => {
                    const value = event.target.value;
                    setDraft((prev) => {
                      const nextSlides = [...prev.slides];
                      nextSlides[index] = {
                        ...nextSlides[index],
                        title: value,
                      };
                      return { ...prev, slides: nextSlides };
                    });
                  }}
                  className={panelInputClass}
                  disabled={!canEdit}
                />
              </label>
            </div>

            <label className="mt-3 flex flex-col gap-2">
              <span className="text-body-sm font-medium">Description</span>
              <textarea
                value={slide.description}
                onChange={(event) => {
                  const value = event.target.value;
                  setDraft((prev) => {
                    const nextSlides = [...prev.slides];
                    nextSlides[index] = {
                      ...nextSlides[index],
                      description: value,
                    };
                    return { ...prev, slides: nextSlides };
                  });
                }}
                className={`${panelTextareaClass} min-h-[90px]`}
                disabled={!canEdit}
              />
            </label>

            <label className="mt-3 flex flex-col gap-2">
              <span className="text-body-sm font-medium">Activities</span>
              <input
                type="text"
                value={slide.activities.join(", ")}
                onChange={(event) => {
                  const value = event.target.value;
                  setDraft((prev) => {
                    const nextSlides = [...prev.slides];
                    nextSlides[index] = {
                      ...nextSlides[index],
                      activities: value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    };
                    return { ...prev, slides: nextSlides };
                  });
                }}
                className={panelInputClass}
                disabled={!canEdit}
              />
              <span className={panelSubtextClass}>
                Separate activities with commas.
              </span>
            </label>

            <div className="mt-4">
              <MediaUploadField
                label="Slide image"
                helper="Aim for cinematic, atmospheric visuals."
                value={resolveCmsMedia(slide.image)}
                onUpload={(file) => handleSlideUpload(index, file)}
              />
            </div>
          </div>
        ))}
      </div>
      {pendingDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="unsaved-week-title">
          <div className={`${panelShellClass} w-full max-w-md p-6`}>
            <h3 id="unsaved-week-title" className="text-heading-sm font-semibold">Unsaved changes</h3>
            <p className="mt-2 text-body-sm text-[color:var(--panel-text-muted)]">Save your edits before switching days?</p>
            <label className="mt-4 flex items-center gap-3 text-body-sm"><input type="radio" checked={skipDayWarning} onChange={() => { setSkipDayWarning(true); localStorage.setItem("skip-week-day-warning", "true"); }} />Never remind me again</label>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" className="rounded-full border border-[color:var(--panel-border)] px-4 py-2 text-body-sm" onClick={() => setPendingDay(null)}>Stay here</button>
              <button type="button" className="rounded-full border border-[color:var(--panel-border)] px-4 py-2 text-body-sm" onClick={() => { const target = pendingDay; setDraft(JSON.parse(savedSnapshot) as CmsWeekContent); if (target) setSelectedDay(target); setPendingDay(null); }}>Discard &amp; switch</button>
              <button type="button" className="rounded-full bg-[color:var(--panel-text)] px-4 py-2 text-body-sm font-semibold text-[color:var(--panel-ink)]" onClick={async () => { const target = pendingDay; const saved = await handleSave(); if (saved && target) setSelectedDay(target); if (saved) setPendingDay(null); }}>Save &amp; switch</button>
            </div>
          </div>
        </div>
      )}
    </SectionShell>
  );
};

const GalleryEditor: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const initialContent = useCmsSection("home.gallery");
  const [draft, setDraft] = React.useState<CmsGalleryContent>(initialContent);
  const [savedSnapshot, setSavedSnapshot] = React.useState(JSON.stringify(initialContent));
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [image, setImage] = React.useState<{ storagePath: string } | null>(null);
  const [ratio, setRatio] = React.useState("4 / 5");
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const dirty = JSON.stringify(draft) !== savedSnapshot;

  React.useEffect(() => {
    setDraft(initialContent);
    setSavedSnapshot(JSON.stringify(initialContent));
  }, [initialContent]);

  const handleUpload = async (file: File) => {
    const result = await uploadMediaFile(file, {
      folder: CMS_MEDIA_FOLDERS.homeGallery,
      prefix: title || "gallery",
    });
    setImage({ storagePath: result.storagePath });
  };

  const addItem = () => {
    if (!title.trim() || !image) return;
    const item = {
      id: crypto.randomUUID(),
      title: normalizeText(title),
      description: normalizeText(description) || normalizeText(title),
      tags: tags.split(",").map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean).map((tag) => `#${tag}`),
      image,
      ratio,
      termId: "term-2-2026",
      likes: 0,
    };
    setDraft((previous) => ({ ...previous, items: [...previous.items, item] }));
    setTitle("");
    setDescription("");
    setTags("");
    setImage(null);
  };

  const handleSave = async () => {
    if (!canEdit || !dirty) return;
    setSaving(true);
    setStatus(null);
    try {
      await upsertCmsContent("home.gallery", draft);
      setSavedSnapshot(JSON.stringify(draft));
      setStatus("Gallery content saved. Seed images are unchanged.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save gallery content.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionShell
      title="Gallery"
      description="Add images and captions to the Home gallery. Existing seed images remain in place."
      canEdit={canEdit}
      saving={saving}
      dirty={dirty}
      onSave={handleSave}
      status={status}
      errors={[]}
    >
      <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-4">
        <h3 className="text-heading-sm font-semibold">Add a gallery image</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2"><span className="text-body-sm font-medium">Image title</span><input className={panelInputClass} value={title} onChange={(event) => setTitle(event.target.value)} disabled={!canEdit} /></label>
          <label className="flex flex-col gap-2"><span className="text-body-sm font-medium">Image shape</span><select className={panelInputClass} value={ratio} onChange={(event) => setRatio(event.target.value)} disabled={!canEdit}><option>4 / 5</option><option>3 / 4</option><option>1 / 1</option><option>2 / 3</option><option>3 / 5</option></select></label>
          <label className="flex flex-col gap-2 md:col-span-2"><span className="text-body-sm font-medium">Caption</span><textarea className={`${panelTextareaClass} min-h-[90px]`} value={description} onChange={(event) => setDescription(event.target.value)} disabled={!canEdit} /></label>
          <label className="flex flex-col gap-2 md:col-span-2"><span className="text-body-sm font-medium">Hashtags</span><input className={panelInputClass} value={tags} onChange={(event) => setTags(event.target.value)} disabled={!canEdit} placeholder="#worship, #community" /><span className={panelSubtextClass}>Separate hashtags with commas.</span></label>
          <div className="md:col-span-2"><MediaUploadField label="Gallery image" value={resolveCmsMedia(image)} onUpload={handleUpload} /></div>
        </div>
        <button type="button" onClick={addItem} disabled={!canEdit || !title.trim() || !image} className="mt-5 rounded-full border border-[color:var(--panel-border)] px-4 py-2 text-body-sm disabled:opacity-50">Add to gallery</button>
      </div>
      <div>
        <h3 className="text-heading-sm font-semibold">Added gallery images</h3>
        {draft.items.length === 0 ? <p className={`${panelSubtextClass} mt-3`}>No dashboard images added yet. Seed images will continue to appear.</p> : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">{draft.items.map((item) => <article key={item.id} className="flex items-center gap-3 rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-3">
            <img src={resolveCmsMedia(item.image) ?? ""} alt="" className="h-16 w-16 rounded-xl object-cover" />
            <div className="min-w-0 flex-1"><p className="truncate font-semibold">{item.title}</p><p className={panelSubtextClass}>{item.tags.join(" ")}</p></div>
            <button type="button" disabled={!canEdit} onClick={() => setDraft((previous) => ({ ...previous, items: previous.items.filter((entry) => entry.id !== item.id) }))} className="rounded-full border border-[color:var(--danger)] px-3 py-1 text-body-xs text-danger disabled:opacity-50">Remove</button>
          </article>)}</div>
        )}
      </div>
    </SectionShell>
  );
};

const TestimonialsEditor: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<
    Awaited<ReturnType<typeof fetchTestimonials>>
  >([]);
  const [draft, setDraft] = React.useState({
    name: "",
    profileDetails: "",
    testimonial: "",
    avatarPath: null as string | null,
    avatarUrl: null as string | null,
    isPublished: true,
  });

  const loadTestimonials = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTestimonials(true);
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadTestimonials();
  }, [loadTestimonials]);

  const handleAvatarUpload = async (file: File) => {
    const result = await uploadMediaFile(file, {
      folder: CMS_MEDIA_FOLDERS.testimonials,
      prefix: draft.name || "testimonial",
    });

    setDraft((prev) => ({
      ...prev,
      avatarPath: result.storagePath,
      avatarUrl: result.publicUrl,
    }));
  };

  const handleCreate = async () => {
    if (!canEdit) return;

    const nextErrors: string[] = [];
    if (!normalizeText(draft.name)) {
      nextErrors.push("Name is required.");
    }
    if (!normalizeText(draft.testimonial)) {
      nextErrors.push("Testimonial text is required.");
    }
    setErrors(nextErrors);

    if (nextErrors.length) {
      return;
    }

    setSaving(true);
    setStatus(null);

    try {
      await createTestimonial({
        name: normalizeText(draft.name),
        profileDetails: normalizeText(draft.profileDetails) || null,
        avatarPath: draft.avatarPath,
        testimonial: normalizeText(draft.testimonial),
        isPublished: draft.isPublished,
      });
      setStatus("Testimonial added.");
      setDraft({
        name: "",
        profileDetails: "",
        testimonial: "",
        avatarPath: null,
        avatarUrl: null,
        isPublished: true,
      });
      await loadTestimonials();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed.";
      setStatus(message);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (id: string, nextValue: boolean) => {
    if (!canEdit) return;
    await updateTestimonial(id, { isPublished: nextValue });
    await loadTestimonials();
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    const confirmDelete = window.confirm("Delete this testimonial?");
    if (!confirmDelete) return;
    await deleteTestimonial(id);
    await loadTestimonials();
  };

  return (
    <section className={`${panelShellClass} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-heading-md font-semibold">Testimonials</h2>
          <p className="mt-2 text-body-sm text-[color:var(--panel-text-muted)]">
            Register new testimonials and manage what appears on the site.
          </p>
        </div>
      </div>

      {!canEdit && (
        <div className="mt-4 rounded-xl border border-dashed border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] px-4 py-3 text-body-sm text-[color:var(--panel-text-muted)]">
          You can view testimonials but you do not have edit permissions.
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-[color:var(--danger)] bg-[rgba(185,28,28,0.08)] px-4 py-3 text-body-sm text-danger">
          <p className="font-semibold">Validation issues</p>
          <ul className="mt-2 list-disc pl-5">
            {errors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {status && (
        <div className="mt-4 rounded-xl border border-dashed border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] px-4 py-3 text-body-sm text-[color:var(--panel-text-muted)]">
          {status}
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Name</span>
          <input
            type="text"
            value={draft.name}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, name: event.target.value }))
            }
            className={panelInputClass}
            disabled={!canEdit}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Profile details</span>
          <input
            type="text"
            value={draft.profileDetails}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                profileDetails: event.target.value,
              }))
            }
            className={panelInputClass}
            disabled={!canEdit}
            placeholder="e.g. Form 3, Alumni, Parent"
          />
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-2">
        <span className="text-body-sm font-medium">Testimonial</span>
        <textarea
          value={draft.testimonial}
          onChange={(event) =>
            setDraft((prev) => ({
              ...prev,
              testimonial: event.target.value,
            }))
          }
          className={`${panelTextareaClass} min-h-[120px]`}
          disabled={!canEdit}
        />
      </label>

      <div className="mt-4">
        <MediaUploadField
          label="Profile image"
          helper="Optional. Upload a headshot."
          value={draft.avatarUrl}
          onUpload={handleAvatarUpload}
        />
      </div>

      <label className="mt-4 flex items-center gap-3 text-body-sm">
        <input
          type="checkbox"
          checked={draft.isPublished}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, isPublished: event.target.checked }))
          }
          disabled={!canEdit}
        />
        Publish immediately
      </label>

      <button
        type="button"
        onClick={handleCreate}
        disabled={!canEdit || saving}
        className="mt-5 rounded-full bg-[color:var(--panel-text)] px-5 py-2 text-body-sm font-semibold text-[color:var(--panel-ink)] transition-opacity disabled:opacity-50"
      >
        {saving ? "Saving..." : "Add testimonial"}
      </button>

      <div className="mt-8">
        <h3 className="text-heading-sm font-semibold">Existing testimonials</h3>
        {loading && <p className={panelSubtextClass}>Loading...</p>}
        {error && <p className="text-body-sm text-danger">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className={panelSubtextClass}>No testimonials yet.</p>
        )}
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-body font-semibold">{item.name}</p>
                  {item.profileDetails && (
                    <p className={panelSubtextClass}>{item.profileDetails}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item.id, !item.isPublished)}
                    className="rounded-full border border-[color:var(--panel-border)] px-3 py-1 text-body-xs text-[color:var(--panel-text-muted)] hover:text-[color:var(--panel-text)]"
                    disabled={!canEdit}
                  >
                    {item.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-full border border-[color:var(--danger)] px-3 py-1 text-body-xs text-danger"
                    disabled={!canEdit}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-3 text-body-sm text-[color:var(--panel-text-muted)]">
                {item.testimonial}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const EventsEditor: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [events, setEvents] = React.useState<
    Awaited<ReturnType<typeof fetchAllEvents>>
  >([]);
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [draft, setDraft] = React.useState({
    title: "",
    slug: "",
    feedType: "Services" as FeedType,
    summary: "",
    eventDate: "",
    presenterName: "",
    presenterRole: "",
    presenterAvatarPath: null as string | null,
    presenterAvatarUrl: null as string | null,
    themeTopic: "",
    verseReference: "",
    verseVersion: "",
    intercessionPrayerPoints: "",
    praiseHighlights: "",
    isPublished: true,
  });

  const loadEvents = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllEvents();
      setEvents(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const handleTitleChange = (value: string) => {
    setDraft((prev) => ({
      ...prev,
      title: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  };

  const handleAvatarUpload = async (file: File) => {
    const result = await uploadMediaFile(file, {
      folder: CMS_MEDIA_FOLDERS.presenterAvatars,
      prefix: draft.presenterName || "presenter",
    });
    setDraft((prev) => ({
      ...prev,
      presenterAvatarPath: result.storagePath,
      presenterAvatarUrl: result.publicUrl,
    }));
  };

  const handleCreate = async () => {
    if (!canEdit) return;

    const nextErrors: string[] = [];
    if (!normalizeText(draft.title)) nextErrors.push("Title is required.");
    if (!normalizeText(draft.slug)) nextErrors.push("Slug is required.");
    if (!normalizeText(draft.eventDate)) nextErrors.push("Event date is required.");
    if (!normalizeText(draft.presenterName))
      nextErrors.push("Presenter name is required.");
    if (!normalizeText(draft.themeTopic))
      nextErrors.push("Theme topic is required.");
    if (!normalizeText(draft.verseReference))
      nextErrors.push("Verse reference is required.");

    setErrors(nextErrors);

    if (nextErrors.length) {
      return;
    }

    setSaving(true);
    setStatus(null);

    try {
      const verse = await fetchBibleVerse(
        draft.verseReference,
        draft.verseVersion || null,
      );

      const prayerPoints = draft.intercessionPrayerPoints
        .split("\n")
        .map((item) => normalizeText(item))
        .filter(Boolean);
      const praiseHighlights = draft.praiseHighlights
        .split("\n")
        .map((item) => normalizeText(item))
        .filter(Boolean);

      await createEvent({
        slug: normalizeText(draft.slug),
        title: normalizeText(draft.title),
        feedType: draft.feedType,
        summary: normalizeText(draft.summary),
        eventDate: new Date(draft.eventDate).toISOString(),
        presenterName: normalizeText(draft.presenterName),
        presenterRole: normalizeText(draft.presenterRole),
        presenterAvatarPath: draft.presenterAvatarPath,
        themeTopic: normalizeText(draft.themeTopic),
        themeScriptureReference: verse.reference,
        themeScriptureVersion: verse.translationId,
        themeScriptureText: verse.text,
        intercessionPrayerPoints: prayerPoints,
        praiseHighlights,
        isPublished: draft.isPublished,
      });

      setStatus("Event registered.");
      setDraft({
        title: "",
        slug: "",
        feedType: "Services",
        summary: "",
        eventDate: "",
        presenterName: "",
        presenterRole: "",
        presenterAvatarPath: null,
        presenterAvatarUrl: null,
        themeTopic: "",
        verseReference: "",
        verseVersion: "",
        intercessionPrayerPoints: "",
        praiseHighlights: "",
        isPublished: true,
      });
      setSlugTouched(false);
      await loadEvents();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed.";
      setStatus(message);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (id: string, nextValue: boolean) => {
    if (!canEdit) return;
    await updateEvent(id, { isPublished: nextValue });
    await loadEvents();
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    const confirmDelete = window.confirm("Delete this event?");
    if (!confirmDelete) return;
    await deleteEvent(id);
    await loadEvents();
  };

  return (
    <section className={`${panelShellClass} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-heading-md font-semibold">Events</h2>
          <p className="mt-2 text-body-sm text-[color:var(--panel-text-muted)]">
            Register new events and keep preacher verses synced from
            bible-api.com.
          </p>
        </div>
      </div>

      {!canEdit && (
        <div className="mt-4 rounded-xl border border-dashed border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] px-4 py-3 text-body-sm text-[color:var(--panel-text-muted)]">
          You can view events but you do not have edit permissions.
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-[color:var(--danger)] bg-[rgba(185,28,28,0.08)] px-4 py-3 text-body-sm text-danger">
          <p className="font-semibold">Validation issues</p>
          <ul className="mt-2 list-disc pl-5">
            {errors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {status && (
        <div className="mt-4 rounded-xl border border-dashed border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] px-4 py-3 text-body-sm text-[color:var(--panel-text-muted)]">
          {status}
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Title</span>
          <input
            type="text"
            value={draft.title}
            onChange={(event) => handleTitleChange(event.target.value)}
            className={panelInputClass}
            disabled={!canEdit}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Slug</span>
          <input
            type="text"
            value={draft.slug}
            onChange={(event) => {
              setSlugTouched(true);
              setDraft((prev) => ({ ...prev, slug: event.target.value }));
            }}
            className={panelInputClass}
            disabled={!canEdit}
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Feed type</span>
          <select
            value={draft.feedType}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                feedType: event.target.value as FeedType,
              }))
            }
            className={panelInputClass}
            disabled={!canEdit}
          >
            {(["Services", "Revivals", "Specials"] as FeedType[]).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Event date</span>
          <input
            type="date"
            value={draft.eventDate}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, eventDate: event.target.value }))
            }
            className={panelInputClass}
            disabled={!canEdit}
          />
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-2">
        <span className="text-body-sm font-medium">Summary</span>
        <textarea
          value={draft.summary}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, summary: event.target.value }))
          }
          className={`${panelTextareaClass} min-h-[110px]`}
          disabled={!canEdit}
        />
      </label>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Presenter name</span>
          <input
            type="text"
            value={draft.presenterName}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                presenterName: event.target.value,
              }))
            }
            className={panelInputClass}
            disabled={!canEdit}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Presenter role</span>
          <input
            type="text"
            value={draft.presenterRole}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                presenterRole: event.target.value,
              }))
            }
            className={panelInputClass}
            disabled={!canEdit}
          />
        </label>
      </div>

      <div className="mt-4">
        <MediaUploadField
          label="Presenter avatar"
          helper="Optional. Upload a headshot for the preacher."
          value={draft.presenterAvatarUrl}
          onUpload={handleAvatarUpload}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Theme topic</span>
          <input
            type="text"
            value={draft.themeTopic}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                themeTopic: event.target.value,
              }))
            }
            className={panelInputClass}
            disabled={!canEdit}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Verse reference</span>
          <input
            type="text"
            value={draft.verseReference}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                verseReference: event.target.value,
              }))
            }
            className={panelInputClass}
            disabled={!canEdit}
            placeholder="e.g. John 3:16"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Verse version</span>
          <select
            value={draft.verseVersion}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                verseVersion: event.target.value,
              }))
            }
            className={panelInputClass}
            disabled={!canEdit}
          >
            <option value="">Default (WEB)</option>
            {BIBLE_TRANSLATIONS.map((translation) => (
              <option key={translation.id} value={translation.id}>
                {translation.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Publishing</span>
          <label className="flex items-center gap-3 text-body-sm">
            <input
              type="checkbox"
              checked={draft.isPublished}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  isPublished: event.target.checked,
                }))
              }
              disabled={!canEdit}
            />
            Publish immediately
          </label>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Prayer points</span>
          <textarea
            value={draft.intercessionPrayerPoints}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                intercessionPrayerPoints: event.target.value,
              }))
            }
            className={`${panelTextareaClass} min-h-[120px]`}
            disabled={!canEdit}
            placeholder="One point per line"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-body-sm font-medium">Praise highlights</span>
          <textarea
            value={draft.praiseHighlights}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                praiseHighlights: event.target.value,
              }))
            }
            className={`${panelTextareaClass} min-h-[120px]`}
            disabled={!canEdit}
            placeholder="One highlight per line"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={handleCreate}
        disabled={!canEdit || saving}
        className="mt-6 rounded-full bg-[color:var(--panel-text)] px-5 py-2 text-body-sm font-semibold text-[color:var(--panel-ink)] transition-opacity disabled:opacity-50"
      >
        {saving ? "Saving..." : "Add event"}
      </button>

      <div className="mt-8">
        <h3 className="text-heading-sm font-semibold">Existing events</h3>
        {loading && <p className={panelSubtextClass}>Loading...</p>}
        {error && <p className="text-body-sm text-danger">{error}</p>}
        {!loading && !error && events.length === 0 && (
          <p className={panelSubtextClass}>No events yet.</p>
        )}
        <div className="mt-4 grid gap-3">
          {events.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-body font-semibold">{item.title}</p>
                  <p className={panelSubtextClass}>
                    {new Date(item.eventDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleTogglePublish(item.id, !item.isPublished)
                    }
                    className="rounded-full border border-[color:var(--panel-border)] px-3 py-1 text-body-xs text-[color:var(--panel-text-muted)] hover:text-[color:var(--panel-text)]"
                    disabled={!canEdit}
                  >
                    {item.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-full border border-[color:var(--danger)] px-3 py-1 text-body-xs text-danger"
                    disabled={!canEdit}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className={`${panelSubtextClass} mt-2`}>
                {item.feedType} · {item.slug}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FamilyContentEditor: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const initial = useCmsSection("family.content");
  const [draft, setDraft] = React.useState<CmsFamilyContent>(initial);
  const [snapshot, setSnapshot] = React.useState(JSON.stringify(initial));
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  React.useEffect(() => { setDraft(initial); setSnapshot(JSON.stringify(initial)); }, [initial]);
  const dirty = JSON.stringify(draft) !== snapshot;
  const update = (key: Exclude<keyof CmsFamilyContent, "patron" | "matron">, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));
  const updateProfile = (profile: "patron" | "matron", key: Exclude<keyof CmsFamilyContent["patron"], "image">, value: string) => setDraft((prev) => ({ ...prev, [profile]: { ...prev[profile], [key]: value } }));
  const uploadPortrait = async (profile: "patron" | "matron", file: File) => {
    const result = await uploadMediaFile(file, { folder: CMS_MEDIA_FOLDERS.boardMembers, prefix: `${profile}-portrait` });
    setDraft((prev) => ({ ...prev, [profile]: { ...prev[profile], image: { storagePath: result.storagePath } } }));
  };
  const save = async () => {
    if (!canEdit || !dirty) return;
    setSaving(true); setMessage(null);
    try { await upsertCmsContent("family.content", draft); setSnapshot(JSON.stringify(draft)); setMessage("Family page content saved."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not save Family content."); }
    finally { setSaving(false); }
  };
  const field = (label: string, key: Exclude<keyof CmsFamilyContent, "patron" | "matron">, multiline = false) => <label className="flex flex-col gap-2"><span className="text-body-sm font-medium">{label}</span>{multiline ? <textarea className={`${panelTextareaClass} min-h-[90px]`} value={draft[key]} onChange={(event) => update(key, event.target.value)} disabled={!canEdit} /> : <input className={panelInputClass} value={draft[key]} onChange={(event) => update(key, event.target.value)} disabled={!canEdit} />}</label>;
  return <section className={`${panelShellClass} p-6`}>
    <h2 className="text-heading-md font-semibold">Family page and Patrons</h2>
    <p className="mt-2 text-body-sm text-[color:var(--panel-text-muted)]">Edit the Family page headings, descriptions, and Patron and Matron profiles.</p>
    <div className="mt-5 grid gap-4 md:grid-cols-2">{field("Page eyebrow", "pageEyebrow")}{field("Page title", "pageTitle")}{field("Page description", "pageDescription", true)}{field("Patron and Matron section title", "patronMatronTitle")}{field("Patron and Matron section description", "patronMatronDescription", true)}{field("Departments section title", "departmentsTitle")}{field("Departments section description", "departmentsDescription", true)}{field("Board section title", "boardTitle")}{field("Board section description", "boardDescription", true)}</div>
    {(["patron", "matron"] as const).map((profile) => <div key={profile} className="mt-6 rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-4">
      <h3 className="text-heading-sm font-semibold capitalize">{profile}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {(["role", "name", "phone", "email", "about"] as const).map((key) => <label key={key} className={`flex flex-col gap-2 ${key === "about" ? "md:col-span-2" : ""}`}><span className="text-body-sm font-medium">{key === "about" ? "Description" : key[0].toUpperCase() + key.slice(1)}</span>{key === "about" ? <textarea className={`${panelTextareaClass} min-h-[90px]`} value={draft[profile][key]} onChange={(event) => updateProfile(profile, key, event.target.value)} disabled={!canEdit} /> : <input className={panelInputClass} value={draft[profile][key]} onChange={(event) => updateProfile(profile, key, event.target.value)} disabled={!canEdit} />}</label>)}
        <div className="md:col-span-2"><MediaUploadField label={`${profile} portrait`} value={resolveCmsMedia(draft[profile].image)} onUpload={(file) => uploadPortrait(profile, file)} /></div>
      </div>
    </div>)}
    <button type="button" onClick={() => void save()} disabled={!canEdit || !dirty || saving} className={`mt-5 rounded-full bg-[color:var(--panel-text)] px-5 py-2 text-body-sm font-semibold text-[color:var(--panel-ink)] disabled:opacity-50 ${dirty ? "animate-save-pulse" : ""}`}>{saving ? "Saving..." : "Save Family content"}</button>
    {message && <p className="mt-3 text-body-sm text-[color:var(--panel-text-muted)]">{message}</p>}
  </section>;
};

const BoardMembersEditor: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  type Member = Awaited<ReturnType<typeof fetchBoardMembers>>[number];
  const empty = { name: "", position: "", boardTier: "Board Member", quote: "", imagePath: null as string | null, executive: false };
  const [members, setMembers] = React.useState<Member[]>([]);
  const [draft, setDraft] = React.useState(empty);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = React.useState(JSON.stringify(empty));
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try { setMembers(await fetchBoardMembers()); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not load board members."); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  const startEdit = (member: Member) => {
    const next = { name: member.name, position: member.position, boardTier: member.boardTier, quote: member.quote, imagePath: member.imagePath, executive: member.executive };
    setDraft(next);
    setSavedSnapshot(JSON.stringify(next));
    setEditingId(member.id);
    setMessage(null);
  };
  const reset = () => { setDraft(empty); setSavedSnapshot(JSON.stringify(empty)); setEditingId(null); };
  const uploadPortrait = async (file: File) => {
    const result = await uploadMediaFile(file, { folder: CMS_MEDIA_FOLDERS.boardMembers, prefix: draft.name || "board-member" });
    setDraft((previous) => ({ ...previous, imagePath: result.storagePath }));
  };
  const submit = async () => {
    if (!canEdit || !draft.name.trim()) return;
    setSaving(true); setMessage(null);
    try {
      await saveBoardMember({ id: editingId ?? "", ...draft }, editingId ?? undefined);
      await load(); reset(); setMessage(editingId ? "Board member updated." : "Board member added.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save board member."); }
    finally { setSaving(false); }
  };
  const remove = async (member: Member) => {
    if (!window.confirm(`Delete ${member.name} from the board?`)) return;
    try { await removeBoardMember(member.id); await load(); if (editingId === member.id) reset(); setMessage("Board member deleted."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not delete board member."); }
  };
  const dirty = JSON.stringify(draft) !== savedSnapshot;

  return (
    <section className={`${panelShellClass} p-6`}>
      <h2 className="text-heading-md font-semibold">Board Members</h2>
      <p className="mt-2 text-body-sm text-[color:var(--panel-text-muted)]">Register and maintain the people featured on the Family page.</p>
      <div className="mt-6 rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-4">
        <h3 className="text-heading-sm font-semibold">{editingId ? "Edit board member" : "Add a board member"}</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2"><span className="text-body-sm font-medium">Name</span><input className={panelInputClass} value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} disabled={!canEdit} /></label>
          <label className="flex flex-col gap-2"><span className="text-body-sm font-medium">Position</span><input className={panelInputClass} value={draft.position} onChange={(event) => setDraft((prev) => ({ ...prev, position: event.target.value }))} disabled={!canEdit} /></label>
          <label className="flex flex-col gap-2"><span className="text-body-sm font-medium">Board tier</span><select className={panelInputClass} value={draft.boardTier} onChange={(event) => setDraft((prev) => ({ ...prev, boardTier: event.target.value }))} disabled={!canEdit}><option>Board Member</option><option>Executive Member</option></select></label>
          <label className="flex items-center gap-3 text-body-sm"><input type="checkbox" checked={draft.executive} onChange={(event) => setDraft((prev) => ({ ...prev, executive: event.target.checked }))} disabled={!canEdit} />Executive member</label>
          <label className="flex flex-col gap-2 md:col-span-2"><span className="text-body-sm font-medium">Quote</span><textarea className={`${panelTextareaClass} min-h-[90px]`} value={draft.quote} onChange={(event) => setDraft((prev) => ({ ...prev, quote: event.target.value }))} disabled={!canEdit} /></label>
          <div className="md:col-span-2"><MediaUploadField label="Portrait" value={resolveCmsMedia(draft.imagePath ? { storagePath: draft.imagePath } : null)} onUpload={uploadPortrait} /></div>
        </div>
        <button type="button" onClick={submit} disabled={!canEdit || !dirty || saving || !draft.name.trim()} className={`mt-5 rounded-full bg-[color:var(--panel-text)] px-5 py-2 text-body-sm font-semibold text-[color:var(--panel-ink)] disabled:opacity-50 ${dirty ? "animate-save-pulse" : ""}`}>{saving ? "Saving..." : editingId ? "Save member" : "Add member"}</button>
        {editingId && <button type="button" onClick={reset} className="mt-4 rounded-full border border-[color:var(--panel-border)] px-4 py-2 text-body-sm">Cancel edit</button>}
      </div>
      <div className="mt-8">
        <h3 className="text-heading-sm font-semibold">Existing members</h3>
        {loading && <p className={`${panelSubtextClass} mt-3`}>Loading...</p>}
        {!loading && members.length === 0 && <p className={`${panelSubtextClass} mt-3`}>No board members registered.</p>}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">{members.map((member) => <article key={member.id} className="flex items-center gap-3 rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-3">
          <img src={member.imageSrc} alt="" className="h-14 w-14 rounded-xl object-cover" />
          <div className="min-w-0 flex-1"><p className="truncate font-semibold">{member.name}</p><p className={panelSubtextClass}>{member.position}</p></div>
          <div className="flex gap-2"><button type="button" disabled={!canEdit} onClick={() => startEdit(member)} className="rounded-full border border-[color:var(--panel-border)] px-3 py-1 text-body-xs">Edit</button><button type="button" disabled={!canEdit} onClick={() => void remove(member)} className="rounded-full border border-[color:var(--danger)] px-3 py-1 text-body-xs text-danger">Delete</button></div>
        </article>)}</div>
      </div>
      {message && <p className="mt-4 text-body-sm text-[color:var(--panel-text-muted)]">{message}</p>}
    </section>
  );
};

const TeamEditor: React.FC<{
  visible: boolean;
  allowedSections: CmsSectionKey[];
}> = ({ visible, allowedSections }) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editors, setEditors] = React.useState<
    Awaited<ReturnType<typeof fetchEditorsWithPermissions>>
  >([]);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [invitePermissions, setInvitePermissions] = React.useState<
    CmsSectionKey[]
  >([]);
  const [inviteStatus, setInviteStatus] = React.useState<string | null>(null);

  const loadEditors = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEditorsWithPermissions();
      setEditors(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!visible) return;
    void loadEditors();
  }, [visible, loadEditors]);

  const toggleInvitePermission = (sectionKey: CmsSectionKey) => {
    setInvitePermissions((prev) =>
      prev.includes(sectionKey)
        ? prev.filter((key) => key !== sectionKey)
        : [...prev, sectionKey],
    );
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      setInviteStatus("Provide an email address to invite.");
      return;
    }

    setInviteStatus(null);

    try {
      await createCmsInvite(inviteEmail, invitePermissions);
      await supabase.auth.signInWithOtp({
        email: inviteEmail,
        options: {
          shouldCreateUser: true,
        },
      });
      setInviteStatus("Invite sent. Editor should check email to activate.");
      setInviteEmail("");
      setInvitePermissions([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invite failed.";
      setInviteStatus(message);
    }
  };

  const handlePermissionsSave = async (
    editorId: string,
    nextPermissions: CmsSectionKey[],
  ) => {
    await setEditorPermissions(editorId, nextPermissions);
    await loadEditors();
  };

  const handleResetPassword = async (email: string) => {
    await supabase.auth.resetPasswordForEmail(email);
  };

  const handleDeleteEditor = async (editorId: string) => {
    const confirmDelete = window.confirm(
      "Delete this editor account? This removes CMS access but does not delete the auth user.",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteCmsUser(editorId);
      await loadEditors();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed.";
      setError(message);
    }
  };

  if (!visible) {
    return null;
  }

  const activeEditors = editors.filter((editor) => editor.is_active);

  return (
    <section className={`${panelShellClass} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-heading-md font-semibold">Admin Control</h2>
          <p className="mt-2 text-body-sm text-[color:var(--panel-text-muted)]">
            Manage editor access, invite new editors, and adjust section
            permissions.
          </p>
        </div>
        <button
          type="button"
          onClick={loadEditors}
          className="rounded-full border border-[color:var(--panel-border)] px-4 py-2 text-body-sm text-[color:var(--panel-text-muted)] hover:bg-[color:var(--panel-text)] hover:text-[color:var(--panel-ink)]"
        >
          Refresh
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-4">
        <h3 className="text-heading-sm font-semibold">Invite editor</h3>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-2 text-body-sm">
            Email
            <input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              className={panelInputClass}
              placeholder="editor@example.com"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {allowedSections.map((sectionKey) => (
              <button
                key={`invite-${sectionKey}`}
                type="button"
                onClick={() => toggleInvitePermission(sectionKey)}
                className={`rounded-full border px-3 py-1 text-body-xs ${
                  invitePermissions.includes(sectionKey)
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-[color:var(--panel-border)] text-[color:var(--panel-text-muted)]"
                }`}
              >
                {cmsSectionLabels[sectionKey]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleInvite}
            className="rounded-full bg-[color:var(--panel-text)] px-5 py-2 text-body-sm font-semibold text-[color:var(--panel-ink)]"
          >
            Send Invite
          </button>
          {inviteStatus && <p className={panelSubtextClass}>{inviteStatus}</p>}
        </div>
      </div>

      <div className="mt-6">
        {loading && <p className={panelSubtextClass}>Loading editors...</p>}
        {error && <p className="text-body-sm text-danger">{error}</p>}
        {!loading && !error && activeEditors.length === 0 && (
          <p className={panelSubtextClass}>
            No active editor accounts yet.
          </p>
        )}

        <div className="grid gap-4">
          {activeEditors.map((editor) => (
            <div
              key={editor.id}
              className="rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-body font-semibold">
                    {editor.display_name || editor.email}
                  </p>
                  <p className={panelSubtextClass}>{editor.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleResetPassword(editor.email)}
                    className="rounded-full border border-[color:var(--panel-border)] px-3 py-1 text-body-xs text-[color:var(--panel-text-muted)] hover:text-[color:var(--panel-text)]"
                  >
                    Reset password
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEditor(editor.id)}
                    className="rounded-full border border-[color:var(--danger)] px-3 py-1 text-body-xs text-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {allowedSections.map((sectionKey) => {
                  const isAllowed = editor.permissions.includes(sectionKey);
                  return (
                    <button
                      key={`${editor.id}-${sectionKey}`}
                      type="button"
                      onClick={() => {
                        const nextPermissions = isAllowed
                          ? editor.permissions.filter((key) => key !== sectionKey)
                          : [...editor.permissions, sectionKey];
                        void handlePermissionsSave(editor.id, nextPermissions);
                      }}
                      className={`rounded-full border px-3 py-1 text-body-xs ${
                        isAllowed
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-[color:var(--panel-border)] text-[color:var(--panel-text-muted)]"
                      }`}
                    >
                      {cmsSectionLabels[sectionKey]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
