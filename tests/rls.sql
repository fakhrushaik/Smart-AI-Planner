begin;
-- Synthetic fixtures are rolled back; no messages or real accounts are created.
insert into auth.users(id,email) values ('f0000000-0000-4000-8000-000000000001','rls-a@example.invalid'),('f0000000-0000-4000-8000-000000000002','rls-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"f0000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
insert into public.profiles(id,email) values(auth.uid(),'rls-a@example.invalid');
insert into public.events(id,title,date,start_time,end_time,category) values('e0000000-0000-4000-8000-000000000001','Private A','2026-10-26','09:00','10:00','class');
insert into public.tasks(id,title,date,category) values('d0000000-0000-4000-8000-000000000001','Private task A','2026-10-26','focus');
do $$ begin
  if (select count(*) from public.events)<>1 or (select count(*) from public.tasks)<>1 then raise exception 'Own read failed'; end if;
  begin update public.events set user_id='f0000000-0000-4000-8000-000000000002'; raise exception 'Ownership reassignment permitted'; exception when insufficient_privilege then null; end;
  begin perform public.save_planner('{"version":1,"events":[],"tasks":[]}'::jsonb,0); raise exception 'Stale revision accepted'; exception when serialization_failure then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"f0000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
insert into public.profiles(id,email) values(auth.uid(),'rls-b@example.invalid');
do $$ declare affected integer; begin
  if exists(select 1 from public.events) or exists(select 1 from public.tasks) or (select count(*) from public.profiles)<>1 then raise exception 'Cross-user read'; end if;
  update public.events set title='stolen' where id='e0000000-0000-4000-8000-000000000001'; get diagnostics affected=row_count;if affected<>0 then raise exception 'Cross-user update';end if;
  delete from public.tasks where id='d0000000-0000-4000-8000-000000000001';get diagnostics affected=row_count;if affected<>0 then raise exception 'Cross-user delete';end if;
  begin insert into public.events(user_id,title,date,start_time,end_time,category) values('f0000000-0000-4000-8000-000000000001','bad','2026-10-26','09:00','10:00','class');raise exception 'Cross-user insert';exception when insufficient_privilege then null;end;
  begin perform public.delete_own_account();raise exception 'Deletion without live session';exception when insufficient_privilege then null;end;
  perform public.save_planner('{"version":1,"events":[{"id":"e0000000-0000-4000-8000-000000000002","title":"B event","date":"2026-10-26","start":"11:00","end":"12:00","category":"work","location":""}],"tasks":[]}'::jsonb,0);
  if (select count(*) from public.events)<>1 then raise exception 'Own RPC write failed';end if;
end $$;
select set_config('request.jwt.claims','{"sub":"f0000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$ begin if (select title from public.events) is distinct from 'Private A' or (select title from public.tasks) is distinct from 'Private task A' then raise exception 'User A altered';end if;end $$;
set local role anon;
do $$ begin begin perform * from public.events;raise exception 'Anonymous read permitted';exception when insufficient_privilege then null;end;end $$;
reset role;
select 'PASS: own CRUD/RPC, cross-user SELECT/INSERT/UPDATE/DELETE, ownership transfer, stale revision, anonymous denial, live-session deletion requirement' as result;
rollback;
