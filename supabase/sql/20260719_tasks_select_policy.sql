-- Allow authenticated app users to read public task definitions.
-- Run this in Supabase SQL editor.

alter table public.tasks enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tasks'
      and policyname = 'tasks_select_authenticated'
  ) then
    create policy tasks_select_authenticated
      on public.tasks
      for select
      to authenticated
      using (true);
  end if;
end $$;
