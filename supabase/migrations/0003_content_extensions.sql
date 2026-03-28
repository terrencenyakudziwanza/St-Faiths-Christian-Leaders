alter table public.events
  add column if not exists theme_topic text,
  add column if not exists theme_scripture_reference text,
  add column if not exists theme_scripture_version text,
  add column if not exists theme_scripture_text text,
  add column if not exists intercession_prayer_points text[] not null default '{}',
  add column if not exists praise_highlights text[] not null default '{}';

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  profile_details text,
  avatar_path text,
  testimonial text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

drop policy if exists "read_published_testimonials" on public.testimonials;
create policy "read_published_testimonials"
on public.testimonials
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "cms_manage_testimonials" on public.testimonials;
create policy "cms_manage_testimonials"
on public.testimonials
for all
to authenticated
using (public.is_admin() or public.is_editor())
with check (public.is_admin() or public.is_editor());

drop policy if exists "cms_manage_events" on public.events;
create policy "cms_manage_events"
on public.events
for all
to authenticated
using (public.is_admin() or public.is_editor())
with check (public.is_admin() or public.is_editor());

drop policy if exists "cms_manage_event_media" on public.event_media;
create policy "cms_manage_event_media"
on public.event_media
for all
to authenticated
using (public.is_admin() or public.is_editor())
with check (public.is_admin() or public.is_editor());
