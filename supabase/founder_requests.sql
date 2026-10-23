-- Inkdraft · solicitudes de plaza de fundador desde la landing.
-- Se pega en el SQL Editor del proyecto "inkdraft" de Supabase y se ejecuta una vez.

create table if not exists public.founder_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  instagram text,
  style text check (style in ('blackwork', 'traditional', 'neotraditional', 'fineline', 'ornamental', 'stamp', 'otro')),
  lang text not null default 'es'
);
create index if not exists founder_requests_created_at on public.founder_requests (created_at desc);

-- Seguridad: sin políticas, nadie con la clave pública puede leer ni escribir.
-- Solo el servidor de la landing (rol service_role, clave secreta) puede añadir y leer.
alter table public.founder_requests enable row level security;
grant select, insert on public.founder_requests to service_role;

-- 23 oct 2026: el formulario ofrece los seis estilos de la app + Otro. Si la tabla ya existía, ejecutar también esto una vez:
alter table public.founder_requests drop constraint if exists founder_requests_style_check;
alter table public.founder_requests add constraint founder_requests_style_check
  check (style in ('blackwork', 'traditional', 'neotraditional', 'fineline', 'ornamental', 'stamp', 'otro'));
