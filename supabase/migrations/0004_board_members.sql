create table if not exists public.board_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null default '',
  board_tier text not null default 'Board Member',
  board_year integer not null default 2026,
  quote text not null default '',
  image_path text,
  executive boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.board_members enable row level security;

create policy "read_board_members" on public.board_members
for select to anon, authenticated using (true);

create policy "cms_manage_board_members" on public.board_members
for all to authenticated
using (public.is_admin()) with check (public.is_admin());
