-- FlashMed: armazenamento privado para Biblioteca de Leituras
-- Execute este arquivo no Supabase Dashboard > SQL Editor, conectado ao projeto FlashMed.
-- Os arquivos ficam em pasta com o ID do usuário autenticado; não use bucket público.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'flashmed-pdfs',
  'flashmed-pdfs',
  false,
  26214400,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Recria apenas as quatro políticas específicas da Biblioteca FlashMed.
drop policy if exists "FlashMed library read own files" on storage.objects;
drop policy if exists "FlashMed library upload own files" on storage.objects;
drop policy if exists "FlashMed library update own files" on storage.objects;
drop policy if exists "FlashMed library delete own files" on storage.objects;

create policy "FlashMed library read own files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'flashmed-pdfs'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "FlashMed library upload own files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'flashmed-pdfs'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "FlashMed library update own files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'flashmed-pdfs'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'flashmed-pdfs'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "FlashMed library delete own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'flashmed-pdfs'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
