-- Review and apply to staging first; no hosted database was changed by this PR.
-- Kept outside Auth metadata so DOB and photos never enter JWTs.
create table public.account_details (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 120),
  avatar text not null default '' check (octet_length(avatar) <= 65536 and (avatar = '' or avatar ~ '^data:image/jpeg;base64,[A-Za-z0-9+/=]+$')),
  dob date check (dob >= date '1900-01-01' and dob <= current_date)
);
alter table public.account_details enable row level security;
revoke all on public.account_details from public, anon, authenticated;
grant select, insert, update, delete on public.account_details to authenticated;
create policy account_details_select on public.account_details for select to authenticated using ((select auth.uid()) = id);
create policy account_details_insert on public.account_details for insert to authenticated with check ((select auth.uid()) = id);
create policy account_details_update on public.account_details for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy account_details_delete on public.account_details for delete to authenticated using ((select auth.uid()) = id);
