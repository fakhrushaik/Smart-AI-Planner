-- Profile fields for Smart-AI-Planner, 2026-11-18.
-- Run this file in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- It is idempotent: safe to run more than once. Do NOT run it from the app.
-- The display_name non-empty check below is safe because the app now guarantees
-- a non-empty display name at sign-up (falls back to the email local-part) and
-- on profile edit; the backfill first repairs any legacy empty display names.

-- 1. New profile columns.
alter table public.profiles add column if not exists dob date;
alter table public.profiles add column if not exists pronouns text check (char_length(pronouns) <= 80);
alter table public.profiles add column if not exists avatar_url text check (char_length(avatar_url) <= 500);

-- 2. Backfill legacy empty display names, then require a non-empty display name.
update public.profiles set display_name = split_part(email, '@', 1) where btrim(display_name) = '';
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_display_name_not_empty') then
    alter table public.profiles add constraint profiles_display_name_not_empty check (char_length(btrim(display_name)) >= 1);
  end if;
end $$;

-- 3. Private storage bucket for profile photos. No public access: the app
-- reads photos through signed URLs (see docs/cloud.js uploadAvatar).
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- 4. Owner-only policies: each account may only touch objects under its own
-- user-id folder (<uid>/avatar.<ext>).
drop policy if exists "avatars owner insert" on storage.objects;
create policy "avatars owner insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars owner select" on storage.objects;
create policy "avatars owner select" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars owner update" on storage.objects;
create policy "avatars owner update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars owner delete" on storage.objects;
create policy "avatars owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
