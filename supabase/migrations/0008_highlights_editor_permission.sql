drop policy if exists "cms_content_editor_update" on public.cms_content;

create policy "cms_content_editor_update" on public.cms_content
for insert, update
to authenticated
using (
  public.can_edit_section(section_key)
  or (section_key = 'site.highlights' and public.can_edit_section('content.events'))
)
with check (
  public.can_edit_section(section_key)
  or (section_key = 'site.highlights' and public.can_edit_section('content.events'))
);
