-- EXTENSÕES
create extension if not exists "uuid-ossp";

-- 1️⃣ PRODUTOS (SEUS SISTEMAS)
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- 2️⃣ TENANTS (CLIENTES)
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  created_at timestamp with time zone default now()
);

-- 3️⃣ RELAÇÃO TENANT ↔ PRODUTO
create table tenant_products (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  trial_ends_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique (tenant_id, product_id)
);

-- 4️⃣ ASSINATURAS
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  status text not null check (status in ('trial', 'active', 'past_due', 'canceled')),
  mercadopago_subscription_id text,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- 5️⃣ PAGAMENTOS
create table payments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  mercadopago_payment_id text not null,
  amount numeric(10,2) not null,
  status text not null,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now()
);
