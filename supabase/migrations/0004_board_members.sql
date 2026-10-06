create table if not exists public.board_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null default '',
  board_tier text not null default 'Board Member',
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

insert into public.board_members (name, position, board_tier, quote, image_path, executive, sort_order)
values
('Pastor Joel Mensah', 'Board Chair', 'Executive Member', 'Lead with calm conviction and keep the family aligned around prayer.', 'presenters/pastor-joel.jpg', true, 0),
('Sister Ama Boateng', 'Board Secretary', 'Executive Member', 'Order creates room for warmth, follow-through, and shared peace.', 'presenters/sister-ama.jpg', true, 1),
('Elder Kojo Asare', 'Treasurer', 'Executive Member', 'Stewardship is worship when every decision protects the people.', 'presenters/elder-kojo.jpg', true, 2),
('Deacon Lydia Ofori', 'Welfare Lead', 'Board Member', 'Care should feel practical, immediate, and impossible to miss.', 'presenters/sister-ama.jpg', false, 3),
('Brother Daniel Addo', 'Youth Coordinator', 'Board Member', 'A healthy church always leaves room for the next generation to rise.', 'presenters/pastor-joel.jpg', false, 4),
('Sister Mabel Agyemang', 'Prayer Director', 'Board Member', 'Prayer keeps every family conversation anchored in grace.', 'presenters/pastor-joel.jpg', false, 5),
('Emmanuel Owusu', 'Worship Liaison', 'Board Member', 'Worship softens the room before strategy ever speaks.', 'presenters/elder-kojo.jpg', false, 6),
('Grace Nyarko', 'Outreach Coordinator', 'Board Member', 'Every outward invitation should feel as warm as the room inside.', 'presenters/pastor-joel.jpg', false, 7),
('Ruth Mensah', 'Family Care Lead', 'Board Member', 'Care becomes visible when follow-up is gentle and consistent.', 'presenters/pastor-joel.jpg', false, 8),
('Isaac Boadi', 'Media Director', 'Board Member', 'Good media work should disappear into the clarity of the message.', 'presenters/elder-kojo.jpg', false, 9),
('Deborah Quaye', 'Discipleship Lead', 'Board Member', 'Growth is strongest when people feel seen before they are taught.', 'presenters/pastor-joel.jpg', false, 10),
('Samuel Opoku', 'Missions Liaison', 'Board Member', 'Mission stays alive when local faithfulness keeps meeting distant need.', 'presenters/pastor-joel.jpg', false, 11)
on conflict do nothing;
