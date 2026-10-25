-- Keeps email-keyed tables consistent when drivers.email changes after a
-- confirmed Supabase Auth email change. NOT applied automatically: review and
-- run it manually in the Supabase SQL editor.
create or replace function public.propagate_driver_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if new.email is distinct from old.email and old.email is not null then
        update public.vehicles
            set signeddriveremail = new.email
            where signeddriveremail = old.email;

        update public.fleet_signed_contracts
            set driver_email = new.email
            where driver_email = old.email;

        update public.driver_location_updates
            set driver_email = new.email
            where driver_email = old.email;
    end if;
    return new;
end;
$$;

drop trigger if exists drivers_email_change_propagate on public.drivers;
create trigger drivers_email_change_propagate
    after update of email on public.drivers
    for each row
    execute function public.propagate_driver_email_change();
