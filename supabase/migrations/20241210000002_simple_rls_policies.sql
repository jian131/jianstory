-- Tạm thời disable RLS cho bookmarks và reading_progress để test
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress DISABLE ROW LEVEL SECURITY;

-- Keep stories and chapters accessible publicly
ALTER TABLE stories DISABLE ROW LEVEL SECURITY;
ALTER TABLE chapters DISABLE ROW LEVEL SECURITY;

-- Only keep RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
