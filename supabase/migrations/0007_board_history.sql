alter table public.board_members
  add column if not exists board_year integer not null default 2026;
