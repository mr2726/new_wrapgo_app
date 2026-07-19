create table if not exists public.driver_location_updates (
    id uuid primary key default gen_random_uuid(),
    user_id uuid,
    driver_email text,
    latitude double precision not null,
    longitude double precision not null,
    altitude double precision,
    accuracy double precision,
    heading double precision,
    speed double precision,
    recorded_at timestamptz not null,
    payload jsonb not null,
    created_at timestamptz not null default timezone('utc', now())
);

delete from public.driver_location_updates
where driver_email is null;

delete from public.driver_location_updates current_row
using public.driver_location_updates newer_row
where current_row.driver_email is not null
    and newer_row.driver_email = current_row.driver_email
    and (
        newer_row.recorded_at > current_row.recorded_at
        or (
            newer_row.recorded_at = current_row.recorded_at
            and newer_row.created_at > current_row.created_at
        )
    );

alter table public.driver_location_updates
    alter column driver_email set not null;

create unique index if not exists driver_location_updates_driver_email_unique_idx
    on public.driver_location_updates (driver_email);

create index if not exists driver_location_updates_user_id_recorded_at_idx
    on public.driver_location_updates (user_id, recorded_at desc);

create index if not exists driver_location_updates_driver_email_recorded_at_idx
    on public.driver_location_updates (driver_email, recorded_at desc);