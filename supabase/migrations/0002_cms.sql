create table if not exists public.cms_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  role text not null check (role in ('admin', 'editor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.cms_permissions (
  editor_id uuid not null references public.cms_users(id) on delete cascade,
  section_key text not null,
  primary key (editor_id, section_key)
);

create table if not exists public.cms_content (
  section_key text primary key,
  content jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.cms_invites (
  email text primary key,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  permissions text[] not null default '{}',
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.cms_users
    where id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

create or replace function public.is_editor()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.cms_users
    where id = auth.uid()
      and role = 'editor'
      and is_active = true
  );
$$;

create or replace function public.can_edit_section(section_key text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.cms_permissions
    where editor_id = auth.uid()
      and cms_permissions.section_key = can_edit_section.section_key
  );
$$;

create or replace function public.set_cms_audit()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists cms_content_audit on public.cms_content;
create trigger cms_content_audit
before insert or update on public.cms_content
for each row
execute function public.set_cms_audit();

alter table public.cms_users enable row level security;
alter table public.cms_permissions enable row level security;
alter table public.cms_content enable row level security;
alter table public.cms_invites enable row level security;

-- cms_users policies
create policy "cms_users_select_admin" on public.cms_users
for select
to authenticated
using (public.is_admin());

create policy "cms_users_select_self" on public.cms_users
for select
to authenticated
using (id = auth.uid());

create policy "cms_users_admin_insert" on public.cms_users
for insert
to authenticated
with check (public.is_admin());

create policy "cms_users_admin_update" on public.cms_users
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "cms_users_admin_delete" on public.cms_users
for delete
to authenticated
using (public.is_admin());

create policy "cms_users_self_invite_insert" on public.cms_users
for insert
to authenticated
with check (
  id = auth.uid()
  and email = (auth.jwt() ->> 'email')
  and exists (
    select 1
    from public.cms_invites
    where cms_invites.email = (auth.jwt() ->> 'email')
      and cms_invites.role = cms_users.role
  )
);

-- cms_permissions policies
create policy "cms_permissions_select" on public.cms_permissions
for select
to authenticated
using (public.is_admin() or editor_id = auth.uid());

create policy "cms_permissions_admin_all" on public.cms_permissions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "cms_permissions_self_claim" on public.cms_permissions
for insert
to authenticated
with check (
  editor_id = auth.uid()
  and exists (
    select 1
    from public.cms_invites
    where cms_invites.email = (auth.jwt() ->> 'email')
      and cms_permissions.section_key = any (cms_invites.permissions)
  )
);

-- cms_invites policies
create policy "cms_invites_admin_all" on public.cms_invites
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "cms_invites_select_self" on public.cms_invites
for select
to authenticated
using (email = (auth.jwt() ->> 'email'));

create policy "cms_invites_delete_self" on public.cms_invites
for delete
to authenticated
using (email = (auth.jwt() ->> 'email'));

-- cms_content policies
create policy "cms_content_read_published" on public.cms_content
for select
to anon, authenticated
using (is_published = true);

create policy "cms_content_admin_all" on public.cms_content
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "cms_content_editor_update" on public.cms_content
for insert, update
to authenticated
using (public.can_edit_section(section_key))
with check (public.can_edit_section(section_key));

-- storage policies for media uploads
create policy "cms_media_uploads_readback" on storage.objects
for select
to authenticated
using (
  bucket_id = 'media'
  and name like 'cms/%'
  and (public.is_admin() or public.is_editor())
);

create policy "cms_media_uploads" on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'media'
  and name like 'cms/%'
  and (public.is_admin() or public.is_editor())
);

create policy "cms_media_updates" on storage.objects
for update
to authenticated
using (
  bucket_id = 'media'
  and name like 'cms/%'
  and (public.is_admin() or public.is_editor())
);
