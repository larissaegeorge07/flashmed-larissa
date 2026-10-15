-- FlashMed: allow authenticated users to create only their own profile row.
-- Run once in Supabase Dashboard > SQL Editor before enabling public sign-up.
-- Existing SELECT/UPDATE policies used by the current account are left unchanged.

alter table public.profiles enable row level security;

drop policy if exists "flashmed_profiles_insert_own" on public.profiles;

create policy "flashmed_profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);
