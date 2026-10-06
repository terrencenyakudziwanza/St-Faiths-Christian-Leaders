drop policy if exists "cms_media_uploads_readback" on storage.objects;

create policy "cms_media_uploads_readback" on storage.objects
for select
to authenticated
using (
  bucket_id = 'media'
  and name like 'cms/%'
  and (public.is_admin() or public.is_editor())
);
