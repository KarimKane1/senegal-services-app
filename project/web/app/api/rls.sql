-- Enable RLS and apply policies per MVP spec

-- USERS TABLE
alter table if exists users enable row level security;

-- Allow users to select their own user row; public listing not required
create policy users_select_self on users
  for select using (id = auth.uid());

-- Allow upsert of own user record when authenticated
create policy users_insert_self on users
  for insert with check (coalesce(id, auth.uid()) = auth.uid());

create policy users_update_self on users
  for update using (id = auth.uid());

-- PROVIDER TABLE
alter table if exists provider enable row level security;

-- Anyone (including anon) can read non-sensitive provider fields.
-- NOTE: API should avoid selecting phone_enc except when authorized by app logic.
create policy provider_select_all on provider for select using (true);

-- Any authenticated user can insert a provider (dedupe is handled in API via phone_hash)
create policy provider_insert_auth on provider for insert to authenticated with check (auth.uid() is not null);

-- Only owner can update/delete
create policy provider_update_owner on provider for update using (owner_user_id = auth.uid());
create policy provider_delete_owner on provider for delete using (owner_user_id = auth.uid());

-- RECOMMENDATION TABLE
alter table if exists recommendation enable row level security;

-- Everyone can read recommendations
create policy recommendation_select_all on recommendation for select using (true);

-- Only authenticated users can insert and only as themselves
create policy recommendation_insert_auth on recommendation for insert to authenticated with check (recommender_user_id = auth.uid());

-- Only author can update/delete
create policy recommendation_update_author on recommendation for update using (recommender_user_id = auth.uid());
create policy recommendation_delete_author on recommendation for delete using (recommender_user_id = auth.uid());

-- PROVIDER ATTRIBUTE VOTE TABLE
alter table if exists provider_attribute_vote enable row level security;

create policy pav_select_all on provider_attribute_vote for select using (true);
create policy pav_insert_auth on provider_attribute_vote for insert to authenticated with check (voter_user_id = auth.uid());
create policy pav_update_author on provider_attribute_vote for update using (voter_user_id = auth.uid());
create policy pav_delete_author on provider_attribute_vote for delete using (voter_user_id = auth.uid());

-- CONTACT REQUEST TABLE
alter table if exists contact_request enable row level security;

-- Requester can read own requests; provider owner can read requests to their provider
create policy cr_select_requester_or_owner on contact_request
  for select using (
    requester_user_id = auth.uid() or exists (
      select 1 from provider p where p.id = contact_request.provider_id and p.owner_user_id = auth.uid()
    )
  );

-- Only authenticated user can insert and must be requester
create policy cr_insert_requester on contact_request
  for insert to authenticated with check (requester_user_id = auth.uid());

-- Only provider owner can update status
create policy cr_update_owner on contact_request
  for update using (
    exists (
      select 1 from provider p where p.id = contact_request.provider_id and p.owner_user_id = auth.uid()
    )
  );

-- USER CONTACT HASH TABLE
alter table if exists user_contact_hash enable row level security;

create policy uch_select_owner on user_contact_hash for select using (user_id = auth.uid());
create policy uch_insert_owner on user_contact_hash for insert to authenticated with check (user_id = auth.uid());
create policy uch_update_owner on user_contact_hash for update using (user_id = auth.uid());
create policy uch_delete_owner on user_contact_hash for delete using (user_id = auth.uid());


