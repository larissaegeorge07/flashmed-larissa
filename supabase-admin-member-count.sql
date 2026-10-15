-- FlashMed: contagem de membros visível apenas à conta administradora.
-- Execute no SQL Editor do Supabase depois de revisar o conteúdo.
create or replace function public.flashmed_admin_member_count()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  requester_email text;
  member_total bigint;
begin
  select lower(u.email)
    into requester_email
    from auth.users as u
   where u.id = auth.uid();

  if requester_email is distinct from 'dra.larissaalvesfernandes@gmail.com' then
    raise exception 'Acesso não autorizado'
      using errcode = '42501';
  end if;

  select count(*) into member_total
    from public.profiles;

  return member_total;
end;
$$;

revoke all on function public.flashmed_admin_member_count() from public;
revoke all on function public.flashmed_admin_member_count() from anon;
grant execute on function public.flashmed_admin_member_count() to authenticated;
