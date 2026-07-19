# Backend Integration Architecture (Supabase)

This project relies on Supabase for auth, database, and storage. The goal is a single public storage bucket (`media`) with a structured `seed/` area for static assets, a `cms/` subtree for dashboard-managed assets, and structured `events/` + `shorts/` content paths.

## Core Services

- **Auth**: Supabase Auth (email/password + OTP invites).
- **Database**: Postgres tables for events, shorts, testimonials, and CMS content.
- **Storage**: Public bucket `media` with RLS-protected uploads for `cms/*`.

## Database Model (Summary)

- `cms_users`
  - One row per authenticated CMS user (admin/editor).
  - Used by RLS helpers: `is_admin()` and `is_editor()`.
- `cms_permissions`
  - Maps editors to allowed CMS sections.
- `cms_invites`
  - Admin-only table for invite workflow.
- `cms_content`
  - Stores JSON per section key (`home.hero`, `home.focus`, `home.week`).
- `events`
  - Public event feed items.
- `event_media`
  - Event media items (pictures/videos) linked to `events`.
- `shorts`
  - Short-form clips for the events page.
- `testimonials`
  - CMS-managed testimonials with optional avatars.

## CMS Content Model

CMS section keys are the contract between frontend and backend:

- `home.hero`
- `home.focus`
- `home.week`
- `content.events`
- `content.testimonials`

Each `cms_content` row stores the section JSON payload. Media references inside CMS JSON use a `storagePath` that points into the `media/cms/` structure below.

## Storage Layout

All uploads are stored in the public `media` bucket. CMS-managed uploads live under `cms/`:

```text
media/
  seed/
    images/
    presenters/
  cms/
    home/
      hero/
      focus/
      week/
    content/
      testimonials/
      events/
        presenters/
  events/
    <event_id>/
      pictures/
      videos/
  shorts/
    <short_id>/
  presenters/                 (legacy only if old rows still reference it)
```

Seed assets are static and should be managed via CLI or service role tooling. Dashboard uploads are restricted to the `cms/` subtree by RLS.

### CMS Folder Mapping

- `home.hero` -> `cms/home/hero`
- `home.focus` -> `cms/home/focus`
- `home.week` -> `cms/home/week`
- `content.testimonials` -> `cms/content/testimonials`
- `content.events` (presenter avatars) -> `cms/content/events/presenters`

## RLS + Storage Policies (Critical)

`storage.objects` uploads are allowed only when:

- `bucket_id = 'media'`
- `name like 'cms/%'`
- `public.is_admin()` or `public.is_editor()` is true

These policies are defined in `supabase/migrations/0002_cms.sql`. If they are missing or if the uploader is not a valid CMS user, uploads will fail with: `new row violates row-level security policy`.

## Dashboard Write Flow (Simplified)

1. Authenticated CMS user uploads a file to `media/cms/...`.
2. `uploadMediaFile` returns a `storagePath`.
3. CMS JSON is saved to `cms_content` via `upsertCmsContent`.
4. Public pages resolve `storagePath` to a public URL via `resolveMediaUrl`.

## Scaffolding Checklist

1. Run migrations in order:
   - `supabase/migrations/0001_initial_content.sql`
   - `supabase/migrations/0002_cms.sql`
   - `supabase/migrations/0003_content_extensions.sql`
2. Confirm bucket `media` exists and is public.
3. Pre-create the `cms/` folder structure (optional but helpful for organization).
4. Ensure admin/editor accounts exist in `cms_users` (and are `is_active = true`).
5. Upload CMS media only into the `cms/` subtree.
