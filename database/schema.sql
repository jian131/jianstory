-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Stories table
create table public.stories (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  author text not null,
  cover_image_url text,
  status text default 'ongoing' check (status in ('ongoing', 'completed', 'hiatus')),
  genres text[],
  total_chapters integer default 0,
  total_views integer default 0,
  rating decimal(2,1) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chapters table
create table public.chapters (
  id uuid default uuid_generate_v4() primary key,
  story_id uuid references public.stories(id) on delete cascade not null,
  chapter_number integer not null,
  title text not null,
  content text not null,
  views integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(story_id, chapter_number)
);

-- Users/Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reading history table
create table public.reading_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  story_id uuid references public.stories(id) on delete cascade not null,
  chapter_id uuid references public.chapters(id) on delete cascade not null,
  last_read_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, story_id)
);

-- Ratings table
create table public.ratings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  story_id uuid references public.stories(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, story_id)
);

-- Comments table
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  story_id uuid references public.stories(id) on delete cascade not null,
  chapter_id uuid references public.chapters(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_stories_title on public.stories using gin(to_tsvector('english', title));
create index idx_stories_author on public.stories using gin(to_tsvector('english', author));
create index idx_stories_genres on public.stories using gin(genres);
create index idx_stories_created_at on public.stories(created_at desc);
create index idx_chapters_story_id on public.chapters(story_id);
create index idx_chapters_story_chapter on public.chapters(story_id, chapter_number);
create index idx_reading_history_user_id on public.reading_history(user_id);
create index idx_comments_story_id on public.comments(story_id);

-- Row Level Security (RLS)
alter table public.stories enable row level security;
alter table public.chapters enable row level security;
alter table public.profiles enable row level security;
alter table public.reading_history enable row level security;
alter table public.ratings enable row level security;
alter table public.comments enable row level security;

-- RLS Policies

-- Stories: Public read, admin write
create policy "Stories are viewable by everyone" on public.stories
  for select using (true);

create policy "Stories are manageable by admins" on public.stories
  for all using (auth.uid() in (
    select id from public.profiles where role = 'admin'
  ));

-- Chapters: Public read, admin write
create policy "Chapters are viewable by everyone" on public.chapters
  for select using (true);

create policy "Chapters are manageable by admins" on public.chapters
  for all using (auth.uid() in (
    select id from public.profiles where role = 'admin'
  ));

-- Profiles: Users can read all, update own
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Reading history: Users can read/write own
create policy "Users can manage own reading history" on public.reading_history
  for all using (auth.uid() = user_id);

-- Ratings: Users can read all, write own
create policy "Ratings are viewable by everyone" on public.ratings
  for select using (true);

create policy "Users can manage own ratings" on public.ratings
  for all using (auth.uid() = user_id);

-- Comments: Users can read all, write own
create policy "Comments are viewable by everyone" on public.comments
  for select using (true);

create policy "Users can manage own comments" on public.comments
  for all using (auth.uid() = user_id);

-- Functions and triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_stories_updated_at
  before update on public.stories
  for each row execute procedure public.handle_updated_at();

create trigger handle_chapters_updated_at
  before update on public.chapters
  for each row execute procedure public.handle_updated_at();

create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_comments_updated_at
  before update on public.comments
  for each row execute procedure public.handle_updated_at();

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
