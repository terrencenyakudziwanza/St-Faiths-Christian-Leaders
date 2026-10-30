-- Create the board table without inserting demo members.
-- Safe to run whether the legacy board migration was applied or not.
create table if not exists public.board_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null default '',
  board_tier text not null default 'Board Member',
  quote text not null default '',
  image_path text,
  executive boolean not null default false,
  sort_order integer not null default 0,
  board_year integer not null default extract(year from now())::integer,
  created_at timestamptz not null default now()
);

alter table public.board_members
  add column if not exists board_year integer not null default extract(year from now())::integer;

alter table public.board_members enable row level security;

grant select on public.board_members to anon, authenticated;
grant insert, update, delete on public.board_members to authenticated;

drop policy if exists "read_board_members" on public.board_members;
create policy "read_board_members" on public.board_members
  for select to anon, authenticated using (true);

drop policy if exists "cms_manage_board_members" on public.board_members;
create policy "cms_manage_board_members" on public.board_members
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

notify pgrst, 'reload schema';
