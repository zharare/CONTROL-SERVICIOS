create extension if not exists "pgcrypto";

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  comercial text not null,
  curso text not null,
  instructor text not null,
  fechas jsonb not null,
  precio numeric(12,2) not null default 0,
  facturado boolean not null default false,
  pagado boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fechas_array_check check (
    jsonb_typeof(fechas) = 'array'
    and jsonb_array_length(fechas) > 0
  )
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
before update on public.services
for each row execute procedure public.touch_updated_at();

alter table public.services enable row level security;

create policy "Allow read services"
on public.services
for select
using (true);

create policy "Allow insert services"
on public.services
for insert
with check (true);

create policy "Allow update services"
on public.services
for update
using (true)
with check (true);

create policy "Allow delete services"
on public.services
for delete
using (true);
