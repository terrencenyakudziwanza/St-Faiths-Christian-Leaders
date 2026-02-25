create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  feed_type text not null check (feed_type in ('Services', 'Revivals', 'Specials')),
  summary text not null default '',
  event_date timestamptz not null default now(),
  presenter_name text not null,
  presenter_role text not null default '',
  presenter_avatar_path text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  media_type text not null check (media_type in ('picture', 'video')),
  storage_path text not null,
  caption text not null default '',
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.shorts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  storage_path text not null,
  thumbnail_path text,
  like_count integer not null default 0 check (like_count >= 0),
  published_at timestamptz not null default now(),
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists events_feed_type_event_date_idx
  on public.events (feed_type, event_date desc);

create index if not exists events_is_published_event_date_idx
  on public.events (is_published, event_date desc);

create index if not exists event_media_event_id_sort_order_idx
  on public.event_media (event_id, sort_order, created_at);

create index if not exists shorts_is_published_published_at_idx
  on public.shorts (is_published, published_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

alter table public.events enable row level security;
alter table public.event_media enable row level security;
alter table public.shorts enable row level security;

drop policy if exists "read_published_events" on public.events;
create policy "read_published_events"
on public.events
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "read_media_for_published_events" on public.event_media;
create policy "read_media_for_published_events"
on public.event_media
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = event_media.event_id
      and events.is_published = true
  )
);

drop policy if exists "read_published_shorts" on public.shorts;
create policy "read_published_shorts"
on public.shorts
for select
to anon, authenticated
using (is_published = true);
