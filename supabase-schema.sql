-- supabase_schema.sql
-- Use pgcrypto extension if not already enabled for gen_random_uuid()
create extension if not exists "pgcrypto";

-- profiles: linked to auth.users
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  vpoints bigint default 0,
  video_passes int default 0,
  referral_code text unique,
  referred_by text,
  role text default 'normal_user', -- normal_user | deskman
  created_at timestamptz default now()
);

create table if not exists transfers (
  id uuid primary key default gen_random_uuid(),
  sender uuid references profiles(id),
  receiver uuid references profiles(id),
  amount bigint not null,
  note text,
  created_at timestamptz default now()
);

create table if not exists exchange_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  amount bigint,
  method text,
  status text default 'pending', -- pending | approved | rejected
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles(id),
  action_type text,
  payload jsonb,
  created_at timestamptz default now()
);

create table if not exists referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referrer uuid references profiles(id),
  referee uuid references profiles(id),
  rewarded boolean default false,
  created_at timestamptz default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid references exchange_requests(id),
  sender uuid references profiles(id),
  message text,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
