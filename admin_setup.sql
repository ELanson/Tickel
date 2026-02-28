-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  is_admin boolean default false,

  constraint full_name_length check (char_length(full_name) >= 3)
);

-- Set up Realtime
alter table profiles replica identity full;

-- Create RLS policies
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- To set a specific user as admin by their UUID:
-- UPDATE profiles SET is_admin = true WHERE id = 'user-uuid-here';

-- To set a specific user as admin by their Email:
-- UPDATE profiles SET is_admin = true WHERE id IN (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
