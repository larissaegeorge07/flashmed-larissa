-- FlashMed: armazenamento privado para Biblioteca de Leituras
-- Versão conservadora: não remove políticas existentes.
-- Execute no Supabase Dashboard > SQL Editor do projeto FlashMed.
-- O bucket é privado e os arquivos devem ficar em uma pasta cujo primeiro
-- segmento seja o ID (UUID) do usuário autenticado.

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

-- Cria cada política somente se ainda não existir.
-- Nenhuma política existente é apagada ou substituída.

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'FlashMed library read own files'
  ) then
    execute $policy$
      create policy "FlashMed library read own files"
      on storage.objects for select
      to authenticated
      using (
        bucket_id = 'flashmed-pdfs'
        and (storage.foldername(name))[1] = (select auth.uid())::text
      )
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'FlashMed library upload own files'
  ) then
    execute $policy$
      create policy "FlashMed library upload own files"
      on storage.objects for insert
      to authenticated
      with check (
        bucket_id = 'flashmed-pdfs'
        and (storage.foldername(name))[1] = (select auth.uid())::text
      )
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'FlashMed library update own files'
  ) then
    execute $policy$
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
      )
    $policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'FlashMed library delete own files'
  ) then
    execute $policy$
      create policy "FlashMed library delete own files"
      on storage.objects for delete
      to authenticated
      using (
        bucket_id = 'flashmed-pdfs'
        and (storage.foldername(name))[1] = (select auth.uid())::text
      )
    $policy$;
  end if;
end
$$;
