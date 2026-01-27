create table if not exists products (
  id text primary key,
  name text not null,
  price numeric not null,
  store_id text not null,
  synonyms text[]
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  store_id text not null,
  total numeric not null,
  currency text not null default 'MXN',
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id text references products(id),
  quantity int not null,
  unit_price numeric not null,
  subtotal numeric not null
);

insert into products (id, name, price, store_id, synonyms) values
('prod_coca_600','Coca-Cola 600ml',18,'tiendita_001',ARRAY['coca','coca cola','coca-cola','refresco','cocas']),
('prod_pan_blanco','Pan blanco',8,'tiendita_001',ARRAY['pan','bolillo','pan blanco'])
on conflict (id) do nothing;

