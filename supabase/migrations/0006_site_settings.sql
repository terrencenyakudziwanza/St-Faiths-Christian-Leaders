-- Editors can manage the shared appearance and two CMS restore points.
create policy "cms_site_settings_admin_editor"
on public.cms_content
for all
to authenticated
using (
  section_key in ('site.theme', 'site.restore_points')
  and exists (
    select 1 from public.cms_users
    where id = auth.uid() and is_active = true and role in ('admin', 'editor')
  )
)
with check (
  section_key in ('site.theme', 'site.restore_points')
  and exists (
    select 1 from public.cms_users
    where id = auth.uid() and is_active = true and role in ('admin', 'editor')
  )
);
