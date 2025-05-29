-- Create story_ratings table compatible with UUID stories
CREATE TABLE IF NOT EXISTS story_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

-- Enable RLS
ALTER TABLE story_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for story_ratings
CREATE POLICY "Anyone can view ratings" ON story_ratings
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert ratings" ON story_ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON story_ratings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings" ON story_ratings
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_story_ratings_story_id ON story_ratings(story_id);
CREATE INDEX IF NOT EXISTS idx_story_ratings_user_id ON story_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_story_ratings_rating ON story_ratings(rating);

-- Function to update story rating stats with UUID support
CREATE OR REPLACE FUNCTION update_story_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    story_id_val UUID;
    avg_rating DECIMAL(3,2);
    total_ratings INTEGER;
BEGIN
    -- Get story_id from either NEW or OLD record
    story_id_val := COALESCE(NEW.story_id, OLD.story_id);

    -- Calculate new averages
    SELECT
        ROUND(AVG(rating)::DECIMAL, 2),
        COUNT(*)
    INTO avg_rating, total_ratings
    FROM story_ratings
    WHERE story_id = story_id_val;

    -- Update stories table
    UPDATE stories
    SET
        rating_average = COALESCE(avg_rating, 0),
        rating_count = COALESCE(total_ratings, 0),
        updated_at = NOW()
    WHERE id = story_id_val;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update story rating stats
DROP TRIGGER IF EXISTS trigger_update_story_rating_stats ON story_ratings;
CREATE TRIGGER trigger_update_story_rating_stats
    AFTER INSERT OR UPDATE OR DELETE ON story_ratings
    FOR EACH ROW EXECUTE FUNCTION update_story_rating_stats();

-- Add rating columns to stories table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'rating_average') THEN
        ALTER TABLE stories ADD COLUMN rating_average DECIMAL(3,2) DEFAULT 0.0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'rating_count') THEN
        ALTER TABLE stories ADD COLUMN rating_count INTEGER DEFAULT 0;
    END IF;
END $$;
