create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  phone_e164 text unique,
  email text unique,
  name text,
  photo_url text,
  created_at timestamptz default now()
);

-- Preferences
alter table users add column if not exists language text;

create type if not exists visibility as enum ('public','network','friends_of_friends','request_only');
create type if not exists service_type as enum ('plumber','cleaner','nanny','electrician','carpenter','hair','henna','chef','other');

create table if not exists provider (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  service_type service_type not null,
  city text,
  photo_url text,
  phone_enc bytea,
  phone_hash text unique not null,
  visibility visibility not null default 'request_only',
  owner_user_id uuid references users(id),
  created_at timestamptz default now()
);

create table if not exists recommendation (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references provider(id) on delete cascade,
  recommender_user_id uuid references users(id) on delete cascade,
  note text,
  created_at timestamptz default now()
);

create type if not exists attr as enum ('job_quality','timeliness','cleanliness','respectfulness','reliability');
create type if not exists vote as enum ('like','note');

create table if not exists provider_attribute_vote (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references provider(id) on delete cascade,
  voter_user_id uuid references users(id) on delete cascade,
  attribute attr not null,
  vote vote not null,
  text text,
  created_at timestamptz default now(),
  unique(provider_id, voter_user_id, attribute, vote)
);

-- Optional: track multiple reported cities for a provider (from seekers or provider)
create table if not exists provider_city_sighting (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references provider(id) on delete cascade,
  city text not null,
  source text not null, -- 'seeker' | 'provider'
  created_at timestamptz default now()
);

-- Optional: track alternative names (aliases) reported for a provider
create table if not exists provider_name_alias (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references provider(id) on delete cascade,
  alias text not null,
  source text not null, -- 'seeker' | 'provider'
  created_at timestamptz default now(),
  unique(provider_id, alias)
);

create type if not exists req_status as enum ('pending','approved','denied','expired','cancelled');

create table if not exists contact_request (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references provider(id) on delete cascade,
  requester_user_id uuid references users(id) on delete cascade,
  status req_status not null default 'pending',
  created_at timestamptz default now(),
  responded_at timestamptz
);

-- Connection requests between users
create table if not exists connection_request (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid references users(id) on delete cascade,
  recipient_user_id uuid references users(id) on delete cascade,
  status req_status not null default 'pending',
  created_at timestamptz default now(),
  responded_at timestamptz
);

create table if not exists user_contact_hash (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  contact_hash text not null,
  label text,
  created_at timestamptz default now()
);

-- TODO: Enable RLS and write policies per spec



-- Bi-directional connection graph between users (one row per connection)
create table if not exists connection (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid references users(id) on delete cascade,
  user_b_id uuid references users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_a_id, user_b_id)
);
