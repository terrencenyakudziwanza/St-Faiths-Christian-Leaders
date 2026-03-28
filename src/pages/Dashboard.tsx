import React from "react";
import { useNavigate } from "react-router-dom";
import { cmsSectionLabels, cmsSectionOrder } from "../data/cmsDefaults";
import { useAuth } from "../contexts/AuthContext";
import type {
  CmsFocusContent,
  CmsHeroContent,
  CmsSectionKey,
  CmsWeekContent,
} from "../types/cms";
import { resolveCmsMedia, normalizeText } from "../lib/cms";
import { uploadMediaFile } from "../services/mediaUpload";
import { upsertCmsContent } from "../services/cmsContent";
import { useCmsSection } from "../hooks/useCmsSection";
import {
  createCmsInvite,
  deleteCmsUser,
  fetchEditorsWithPermissions,
  setEditorPermissions,
} from "../services/cmsUsers";
import { supabase } from "../lib/supabase";
import {
  validateFocus,
  validateHero,
  validateWeek,
} from "../lib/cmsValidation";

const panelShellClass =
  "rounded-[28px] border border-[color:var(--panel-border)] bg-[color:var(--panel-bg)] text-[color:var(--panel-text)] shadow-[0_24px_60px_rgba(0,0,0,0.22)]";
const panelMutedClass =
  "border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)]";
const panelInputClass =
  "rounded-xl border border-[color:var(--panel-border)] bg-[color:var(--panel-input)] px-4 py-2 text-body-sm text-[color:var(--panel-text)] outline-none placeholder:text-[color:var(--panel-text-muted)] focus:border-accent";
const panelTextareaClass =
  "rounded-xl border border-[color:var(--panel-border)] bg-[color:var(--panel-input)] px-4 py-3 text-body-sm text-[color:var(--panel-text)] outline-none placeholder:text-[color:var(--panel-text-muted)] focus:border-accent";
const panelSubtextClass = "text-body-xs text-[color:var(--panel-text-muted)]";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { cmsUser, permissions, roleLoading, signOut } = useAuth();
  const [activeSection, setActiveSection] = React.useState<CmsSectionKey>(
    cmsSectionOrder[0],
  );
  const [showAdminControls, setShowAdminControls] = React.useState(false);

  React.useEffect(() => {
    if (!roleLoading && !cmsUser?.is_active) {
      navigate("/login", { replace: true });
    }
  }, [cmsUser, roleLoading, navigate]);

  const isAdmin = cmsUser?.role === "admin";
  const allowedSections = isAdmin
    ? cmsSectionOrder
    : cmsSectionOrder.filter((key) => permissions.includes(key));

  React.useEffect(() => {
    if (!allowedSections.includes(activeSection)) {
      setActiveSection(allowedSections[0] ?? cmsSectionOrder[0]);
    }
  }, [allowedSections, activeSection]);

  const handleSignOut = () => {
    void signOut();
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-page text-ink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,var(--accent-soft),transparent_52%),radial-gradient(circle_at_88%_12%,rgba(0,0,0,0.2),transparent_55%),linear-gradient(180deg,var(--page-bg),var(--surface-soft))]"></div>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-6 pb-16 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-overline text-accent">CMS Dashboard</p>
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

        <div className="mt-10 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside
            className={`flex flex-col gap-3 rounded-[24px] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)] ${panelMutedClass}`}
          >
            <p className="text-caption uppercase tracking-[0.3em] text-[color:var(--panel-text-muted)]">
              Sections
            </p>
            {allowedSections.map((sectionKey) => (
              <button
                key={sectionKey}
                type="button"
                onClick={() => setActiveSection(sectionKey)}
                className={`rounded-2xl px-4 py-3 text-left text-body-sm transition-colors ${
                  activeSection === sectionKey
                    ? "bg-[color:var(--panel-text)] text-[color:var(--panel-ink)]"
                    : "text-[color:var(--panel-text-muted)] hover:bg-[color:var(--panel-input)] hover:text-[color:var(--panel-text)]"
                }`}
              >
                {cmsSectionLabels[sectionKey]}
              </button>
            ))}
          </aside>

          <main className="flex flex-col gap-6">
            {isAdmin && (
              <TeamEditor
                key="team"
                visible={showAdminControls}
                allowedSections={cmsSectionOrder}
              />
            )}
            {activeSection === "home.hero" && (
              <HeroEditor canEdit={isAdmin || permissions.includes("home.hero")} />
            )}
            {activeSection === "home.focus" && (
              <FocusEditor
                canEdit={isAdmin || permissions.includes("home.focus")}
              />
            )}
            {activeSection === "home.week" && (
              <WeekEditor canEdit={isAdmin || permissions.includes("home.week")} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const SectionShell: React.FC<{
  title: string;
  description: string;
  canEdit: boolean;
  saving: boolean;
  onSave: () => void;
  status: string | null;
  errors: string[];
  children: React.ReactNode;
}> = ({
  title,
  description,
  canEdit,
  saving,
  onSave,
  status,
  errors,
  children,
}) => {
  return (
    <section className={`${panelShellClass} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-heading-md font-semibold">{title}</h2>
          <p className="mt-2 text-body-sm text-[color:var(--panel-text-muted)]">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={!canEdit || saving}
          className="rounded-full bg-[color:var(--panel-text)] px-5 py-2 text-body-sm font-semibold text-[color:var(--panel-ink)] transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
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
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<string[]>([]);

  React.useEffect(() => {
    setDraft(initialContent);
  }, [initialContent]);

  const handleSlideUpload = async (index: number, file: File) => {
    const result = await uploadMediaFile(file, {
      folder: "cms/home-hero",
      prefix: `slide-${index + 1}`,
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
    if (!canEdit) return;

    const sanitized: CmsHeroContent = {
      ...draft,
      heroHeader: draft.heroHeader.map(normalizeText).filter(Boolean),
      heroSecondary: draft.heroSecondary.map(normalizeText).filter(Boolean),
      slides: draft.slides.map((slide) => ({
        ...slide,
        label: normalizeText(slide.label),
      })),
    };

    const validation = validateHero(sanitized);
    setErrors(validation.errors);

    if (!validation.valid) {
      return;
    }

    setSaving(true);
    setStatus(null);

    try {
      await upsertCmsContent("home.hero", sanitized);
      setStatus("Hero content saved.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed.";
      setStatus(message);
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

      <div className="grid gap-6 lg:grid-cols-2">
        {draft.slides.map((slide, index) => (
          <div
            key={slide.id}
            className="rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-4"
          >
            <label className="flex flex-col gap-2">
              <span className="text-body-sm font-medium">Slide label</span>
              <input
                type="text"
                value={slide.label}
                onChange={(event) => {
                  const value = event.target.value;
                  setDraft((prev) => {
                    const nextSlides = [...prev.slides];
                    nextSlides[index] = { ...nextSlides[index], label: value };
                    return { ...prev, slides: nextSlides };
                  });
                }}
                className={panelInputClass}
                disabled={!canEdit}
              />
            </label>
            <div className="mt-4">
              <MediaUploadField
                label="Slide image"
                helper="16:9 or portrait is fine."
                value={resolveCmsMedia(slide.image)}
                onUpload={(file) => handleSlideUpload(index, file)}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
};

const FocusEditor: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const initialContent = useCmsSection("home.focus");
  const [draft, setDraft] = React.useState<CmsFocusContent>(initialContent);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<string[]>([]);

  React.useEffect(() => {
    setDraft(initialContent);
  }, [initialContent]);

  const handleItemUpload = async (index: number, file: File) => {
    const result = await uploadMediaFile(file, {
      folder: "cms/home-focus",
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
    if (!canEdit) return;

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
      return;
    }

    setSaving(true);
    setStatus(null);

    try {
      await upsertCmsContent("home.focus", sanitized);
      setStatus("Focus section saved.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed.";
      setStatus(message);
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

      <div className="grid gap-6 lg:grid-cols-2">
        {draft.items.map((item, index) => (
          <div
            key={item.id}
            className="rounded-2xl border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-4"
          >
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
      </div>
    </SectionShell>
  );
};

const WeekEditor: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const initialContent = useCmsSection("home.week");
  const [draft, setDraft] = React.useState<CmsWeekContent>(initialContent);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<string[]>([]);

  React.useEffect(() => {
    setDraft(initialContent);
  }, [initialContent]);

  const handleSlideUpload = async (index: number, file: File) => {
    const result = await uploadMediaFile(file, {
      folder: "cms/home-week",
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
    if (!canEdit) return;

    const sanitized: CmsWeekContent = {
      ...draft,
      overline: normalizeText(draft.overline),
      title: normalizeText(draft.title),
      description: normalizeText(draft.description),
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
      return;
    }

    setSaving(true);
    setStatus(null);

    try {
      await upsertCmsContent("home.week", sanitized);
      setStatus("Week content saved.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed.";
      setStatus(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionShell
      title="Week In Leaders"
      description="Edit the weekly rhythm carousel and the day-by-day highlights."
      canEdit={canEdit}
      saving={saving}
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

      <div className="grid gap-6">
        {draft.slides.map((slide, index) => (
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
    </SectionShell>
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
