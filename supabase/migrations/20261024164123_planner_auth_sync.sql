-- Private per-user planner data. No anonymous table access.
create schema if not exists private;
revoke all on schema private from public;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null check (char_length(email) <= 320),
  display_name text not null default '' check (char_length(display_name) <= 120),
  planner_revision bigint not null default 0,
  created_at timestamptz not null default now()
);
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  date date not null check (date between date '2000-01-01' and date '2100-12-31'),
  start_time time not null, end_time time not null check (end_time > start_time),
  category text not null check (category in ('class','focus','work','personal')),
  location text not null default '' check (char_length(location) <= 120),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index events_user_date_idx on public.events(user_id,date);
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  date date not null check (date between date '2000-01-01' and date '2100-12-31'),
  category text not null check (category in ('class','focus','work','personal')),
  done boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index tasks_user_date_idx on public.tasks(user_id,date);
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.tasks enable row level security;
create policy profiles_select on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy profiles_insert on public.profiles for insert to authenticated with check ((select auth.uid())=id);
create policy profiles_update on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy profiles_delete on public.profiles for delete to authenticated using ((select auth.uid())=id);
create policy events_select on public.events for select to authenticated using ((select auth.uid())=user_id);
create policy events_insert on public.events for insert to authenticated with check ((select auth.uid())=user_id);
create policy events_update on public.events for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy events_delete on public.events for delete to authenticated using ((select auth.uid())=user_id);
create policy tasks_select on public.tasks for select to authenticated using ((select auth.uid())=user_id);
create policy tasks_insert on public.tasks for insert to authenticated with check ((select auth.uid())=user_id);
create policy tasks_update on public.tasks for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy tasks_delete on public.tasks for delete to authenticated using ((select auth.uid())=user_id);
revoke all on public.profiles,public.events,public.tasks from anon,authenticated;
grant select,insert,update,delete on public.profiles,public.events,public.tasks to authenticated;

-- Serializes writes for one owner, enforces limits even for direct Data API calls,
-- and invalidates old snapshots after every mutation.
create function public.planner_row_guard() returns trigger language plpgsql security invoker set search_path='' as $$
declare owner_id uuid; item_count integer;
begin
  owner_id := case when TG_OP='DELETE' then OLD.user_id else NEW.user_id end;
  if owner_id is distinct from auth.uid() then raise exception 'Not authorized' using errcode='42501'; end if;
  perform 1 from public.profiles where id=owner_id for update;
  if TG_OP='INSERT' and not (case when TG_TABLE_NAME='events' then exists(select 1 from public.events where id=NEW.id) else exists(select 1 from public.tasks where id=NEW.id) end) then
    if TG_TABLE_NAME='events' then select count(*) into item_count from public.events where user_id=owner_id;
    else select count(*) into item_count from public.tasks where user_id=owner_id; end if;
    if item_count>=1000 then raise exception 'Maximum 1000 entries per type'; end if;
  end if;
  update public.profiles set planner_revision=planner_revision+1 where id=owner_id;
  if TG_OP='DELETE' then return OLD; end if;
  NEW.updated_at:=now(); return NEW;
end $$;
revoke all on function public.planner_row_guard() from public,anon,authenticated;
create trigger events_guard before insert or update or delete on public.events for each row execute function public.planner_row_guard();
create trigger tasks_guard before insert or update or delete on public.tasks for each row execute function public.planner_row_guard();

-- A coherent snapshot and a transactionally atomic save protect multi-device edits.
create function public.load_planner() returns jsonb language plpgsql security invoker set search_path='' as $$
declare rev bigint; result jsonb;
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
  select planner_revision into rev from public.profiles where id=auth.uid() for update;
  if not found then raise exception 'Profile required'; end if;
  select jsonb_build_object('revision',rev,'version',1,
    'events',coalesce((select jsonb_agg(jsonb_build_object('id',id,'title',title,'date',date,'start',to_char(start_time,'HH24:MI'),'end',to_char(end_time,'HH24:MI'),'category',category,'location',location) order by date,start_time,id) from public.events where user_id=auth.uid()),'[]'::jsonb),
    'tasks',coalesce((select jsonb_agg(jsonb_build_object('id',id,'title',title,'date',date,'category',category,'done',done) order by date,id) from public.tasks where user_id=auth.uid()),'[]'::jsonb)) into result;
  return result;
end $$;
create function public.save_planner(payload jsonb, expected_revision bigint) returns bigint language plpgsql security invoker set search_path='' as $$
declare rev bigint; item jsonb; actor uuid:=auth.uid();
begin
  if actor is null then raise exception 'Sign in required' using errcode='42501'; end if;
  select planner_revision into rev from public.profiles where id=actor for update;
  if not found then raise exception 'Profile required'; end if;
  if rev is distinct from expected_revision then raise exception 'Your plans changed in another tab or device. Export unsaved work, then reload.' using errcode='40001'; end if;
  if payload->>'version' is distinct from '1' or jsonb_typeof(payload->'events') is distinct from 'array' or jsonb_typeof(payload->'tasks') is distinct from 'array' then raise exception 'Invalid planner data'; end if;
  if jsonb_array_length(payload->'events')>1000 or jsonb_array_length(payload->'tasks')>1000 then raise exception 'Maximum 1000 entries per type'; end if;
  if (select count(*) from (select x->>'id' id from jsonb_array_elements(payload->'events') x union all select x->>'id' from jsonb_array_elements(payload->'tasks') x) entries) <> (select count(distinct id) from (select x->>'id' id from jsonb_array_elements(payload->'events') x union all select x->>'id' from jsonb_array_elements(payload->'tasks') x) entries) then raise exception 'Duplicate or missing IDs'; end if;
  delete from public.events where user_id=actor and id not in (select (x->>'id')::uuid from jsonb_array_elements(payload->'events') x);
  delete from public.tasks where user_id=actor and id not in (select (x->>'id')::uuid from jsonb_array_elements(payload->'tasks') x);
  for item in select value from jsonb_array_elements(payload->'events') loop
    insert into public.events(id,user_id,title,date,start_time,end_time,category,location)
    values ((item->>'id')::uuid,actor,item->>'title',(item->>'date')::date,(item->>'start')::time,(item->>'end')::time,item->>'category',coalesce(item->>'location',''))
    on conflict(id) do update set title=excluded.title,date=excluded.date,start_time=excluded.start_time,end_time=excluded.end_time,category=excluded.category,location=excluded.location;
  end loop;
  for item in select value from jsonb_array_elements(payload->'tasks') loop
    insert into public.tasks(id,user_id,title,date,category,done)
    values ((item->>'id')::uuid,actor,item->>'title',(item->>'date')::date,item->>'category',(item->>'done')::boolean)
    on conflict(id) do update set title=excluded.title,date=excluded.date,category=excluded.category,done=excluded.done;
  end loop;
  select planner_revision into rev from public.profiles where id=actor;
  return rev;
end $$;
revoke all on function public.load_planner(),public.save_planner(jsonb,bigint) from public,anon;
grant execute on function public.load_planner(),public.save_planner(jsonb,bigint) to authenticated;

-- The sole privileged operation: revoke the caller's sessions, then delete only
-- that authenticated account. Existence of the live session is verified first.
create function private.delete_own_account() returns void language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); session uuid:=(auth.jwt()->>'session_id')::uuid;
begin
  if actor is null or session is null or not exists(select 1 from auth.sessions where id=session and user_id=actor) then raise exception 'A live signed-in session is required' using errcode='42501'; end if;
  delete from public.events where user_id=actor;
  delete from public.tasks where user_id=actor;
  delete from auth.sessions where user_id=actor;
  delete from auth.users where id=actor;
end $$;
revoke all on function private.delete_own_account() from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.delete_own_account() to authenticated;
create function public.delete_own_account() returns void language sql security invoker set search_path='' as $$ select private.delete_own_account(); $$;
revoke all on function public.delete_own_account() from public,anon;
grant execute on function public.delete_own_account() to authenticated;
