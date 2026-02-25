# Archer

Archer is a React + TypeScript + Vite frontend that now reads public event content from Supabase.

Phase 1 scope:
- Supabase-backed events, event media, and shorts
- Public storage bucket media delivery
- No authentication workflow yet (navbar login is a placeholder notice)

## 1. Local app setup

Install dependencies and run:

```bash
npm install
npm run dev
```

## 2. Environment variables

Create a `.env` file in the repo root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
VITE_MEDIA_MODE=online
```

If either value is missing, the app fails fast with a clear Supabase env error.

`VITE_MEDIA_MODE` options:
- `online`: always use Supabase bucket URLs.
- `offline`: always use local fallback files from `public/offline-media`.
- `auto`: in development, uses fallback when browser is offline.

## 3. Supabase setup (dashboard flow)

1. Create a Supabase project.
2. In SQL Editor, run:
   - `supabase/migrations/0001_initial_content.sql`
3. Then run seed data:
   - `supabase/seeds/0001_seed_content.sql`

The migration also creates the public `media` storage bucket.

## 4. Storage path convention

Upload files to `media` bucket with these path patterns:

- `events/<event_id>/pictures/<file>`
- `events/<event_id>/videos/<file>`
- `shorts/<short_id>/<file>`
- `presenters/<file>`

Seed SQL already references paths using this structure.

## 4.1 Offline media fallback

Local fallback assets now live in:
- `public/offline-media`

This folder mirrors storage paths exactly (`events/...`, `shorts/...`, `presenters/...`) so the same `storage_path` values work in both online and offline mode.

## 5. Database objects created

Migration creates:
- public storage bucket `media`
- `events`
- `event_media`
- `shorts`

And configures:
- RLS enabled on all three tables
- Read-only public policies for published content
- No client write policies
- Supporting indexes for feed/date/sort queries

## 6. Frontend data flow

- `src/services/events.ts`
  - `fetchEvents(feedType)`
  - `fetchEventMedia(eventId)`
- `src/services/shorts.ts`
  - `fetchShorts(limit?)`

Supabase storage paths are translated to public URLs client-side before render.

## 7. Verification checklist

1. `npm run lint` passes.
2. `npm run build` passes.
3. Events feed tabs show different published rows per feed type.
4. Clicking an event opens modal with Supabase media.
5. Shorts list renders Supabase content in published date order.
6. Login button shows placeholder "auth coming later" notice.

## 8. Troubleshooting

- "Missing required environment variable":
  - verify `.env` exists and values are not empty.
- Media not rendering:
  - confirm files exist in `media` bucket and match `storage_path` exactly.
  - confirm bucket visibility is public.
- Empty event/short lists:
  - verify rows have `is_published = true`.
  - verify migration and seed SQL ran successfully.
