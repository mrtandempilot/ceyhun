-- ============================================
-- BLOG SYSTEM DATABASE SCHEMA
-- Complete blog with posts, categories, tags, and comments
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- MAIN TABLES
-- ============================================

-- POST CATEGORIES
CREATE TABLE IF NOT EXISTS public.post_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT,
    parent_id UUID REFERENCES public.post_categories(id) ON DELETE SET NULL,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POST TAGS
CREATE TABLE IF NOT EXISTS public.post_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BLOG POSTS
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    
    -- Media
    featured_image TEXT,
    featured_image_alt TEXT,
    
    -- Author Info
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    author_bio TEXT,
    
    -- Publishing
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'password')),
    password TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    
    -- SEO
    meta_description TEXT,
    meta_keywords TEXT[],
    og_image TEXT,
    canonical_url TEXT,
    
    -- Analytics
    views INTEGER DEFAULT 0,
    reading_time_minutes INTEGER,
    
    -- Options
    allow_comments BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POST-CATEGORY RELATIONS (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.post_category_relations (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.post_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

-- POST-TAG RELATIONS (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.post_tag_relations (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.post_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- COMMENTS (Optional)
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_website TEXT,
    author_ip TEXT,
    
    content TEXT NOT NULL,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam', 'rejected')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON public.posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_posts_views ON public.posts(views DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_posts_search ON public.posts 
USING GIN(to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || COALESCE(content, '')));

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.post_categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.post_categories(parent_id);

-- Tags indexes
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.post_tags(slug);

-- Relations indexes
CREATE INDEX IF NOT EXISTS idx_post_categories_post ON public.post_category_relations(post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_category ON public.post_category_relations(category_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_post ON public.post_tag_relations(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON public.post_tag_relations(tag_id);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON public.post_comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.post_comments(parent_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_unique_slug(base_slug TEXT, table_name TEXT DEFAULT 'posts')
RETURNS TEXT AS $$
DECLARE
    new_slug TEXT;
    counter INTEGER := 1;
BEGIN
    new_slug := base_slug;
    
    -- Check if slug exists
    WHILE EXISTS (SELECT 1 FROM public.posts WHERE slug = new_slug) LOOP
        new_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate reading time (assuming 200 words per minute)
CREATE OR REPLACE FUNCTION calculate_reading_time(content_text TEXT)
RETURNS INTEGER AS $$
DECLARE
    word_count INTEGER;
    reading_time INTEGER;
BEGIN
    -- Count words (simple approach - count spaces + 1)
    word_count := array_length(string_to_array(content_text, ' '), 1);
    
    -- Calculate reading time (200 words per minute, minimum 1 minute)
    reading_time := GREATEST(CEIL(word_count / 200.0), 1);
    
    RETURN reading_time;
END;
$$ LANGUAGE plpgsql;

-- Function to update post category counts
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.post_categories
        SET post_count = post_count + 1
        WHERE id = NEW.category_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.post_categories
        SET post_count = post_count - 1
        WHERE id = OLD.category_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update post tag counts
CREATE OR REPLACE FUNCTION update_tag_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.post_tags
        SET post_count = post_count + 1
        WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.post_tags
        SET post_count = post_count - 1
        WHERE id = OLD.tag_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update reading time before insert/update
CREATE OR REPLACE FUNCTION auto_calculate_reading_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reading_time_minutes := calculate_reading_time(NEW.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-set published_at when status changes to published
CREATE OR REPLACE FUNCTION auto_set_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' AND OLD.status != 'published' AND NEW.published_at IS NULL THEN
        NEW.published_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment post views
CREATE OR REPLACE FUNCTION increment_post_views(post_slug TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET views = views + 1
    WHERE slug = post_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for updated_at on posts
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
CREATE TRIGGER posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS categories_updated_at ON public.post_categories;
CREATE TRIGGER categories_updated_at
    BEFORE UPDATE ON public.post_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS comments_updated_at ON public.post_comments;
CREATE TRIGGER comments_updated_at
    BEFORE UPDATE ON public.post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger for auto-calculating reading time
DROP TRIGGER IF EXISTS auto_reading_time ON public.posts;
CREATE TRIGGER auto_reading_time
    BEFORE INSERT OR UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_reading_time();

-- Trigger for auto-setting published_at
DROP TRIGGER IF EXISTS auto_published_at ON public.posts;
CREATE TRIGGER auto_published_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_published_at();

-- Triggers for category post counts
DROP TRIGGER IF EXISTS category_count_insert ON public.post_category_relations;
CREATE TRIGGER category_count_insert
    AFTER INSERT ON public.post_category_relations
    FOR EACH ROW
    EXECUTE FUNCTION update_category_post_count();

DROP TRIGGER IF EXISTS category_count_delete ON public.post_category_relations;
CREATE TRIGGER category_count_delete
    AFTER DELETE ON public.post_category_relations
    FOR EACH ROW
    EXECUTE FUNCTION update_category_post_count();

-- Triggers for tag post counts
DROP TRIGGER IF EXISTS tag_count_insert ON public.post_tag_relations;
CREATE TRIGGER tag_count_insert
    AFTER INSERT ON public.post_tag_relations
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_post_count();

DROP TRIGGER IF EXISTS tag_count_delete ON public.post_tag_relations;
CREATE TRIGGER tag_count_delete
    AFTER DELETE ON public.post_tag_relations
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_post_count();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_category_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Posts policies
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
CREATE POLICY "Anyone can view published posts"
    ON public.posts
    FOR SELECT
    USING (
        status = 'published' 
        AND published_at <= NOW() 
        AND visibility = 'public'
        OR auth.uid() IS NOT NULL
    );

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts"
    ON public.posts
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authors can update own posts" ON public.posts;
CREATE POLICY "Authors can update own posts"
    ON public.posts
    FOR UPDATE
    USING (auth.uid() = author_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;
CREATE POLICY "Authors can delete own posts"
    ON public.posts
    FOR DELETE
    USING (auth.uid() = author_id OR auth.uid() IS NOT NULL);

-- Categories policies
DROP POLICY IF EXISTS "Anyone can view categories" ON public.post_categories;
CREATE POLICY "Anyone can view categories"
    ON public.post_categories
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.post_categories;
CREATE POLICY "Authenticated users can manage categories"
    ON public.post_categories
    FOR ALL
    USING (auth.uid() IS NOT NULL);

-- Tags policies
DROP POLICY IF EXISTS "Anyone can view tags" ON public.post_tags;
CREATE POLICY "Anyone can view tags"
    ON public.post_tags
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage tags" ON public.post_tags;
CREATE POLICY "Authenticated users can manage tags"
    ON public.post_tags
    FOR ALL
    USING (auth.uid() IS NOT NULL);

-- Relations policies
DROP POLICY IF EXISTS "Anyone can view post category relations" ON public.post_category_relations;
CREATE POLICY "Anyone can view post category relations"
    ON public.post_category_relations
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage post category relations" ON public.post_category_relations;
CREATE POLICY "Authenticated users can manage post category relations"
    ON public.post_category_relations
    FOR ALL
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view post tag relations" ON public.post_tag_relations;
CREATE POLICY "Anyone can view post tag relations"
    ON public.post_tag_relations
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage post tag relations" ON public.post_tag_relations;
CREATE POLICY "Authenticated users can manage post tag relations"
    ON public.post_tag_relations
    FOR ALL
    USING (auth.uid() IS NOT NULL);

-- Comments policies
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.post_comments;
CREATE POLICY "Anyone can view approved comments"
    ON public.post_comments
    FOR SELECT
    USING (status = 'approved' OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can create comments" ON public.post_comments;
CREATE POLICY "Anyone can create comments"
    ON public.post_comments
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage comments" ON public.post_comments;
CREATE POLICY "Authenticated users can manage comments"
    ON public.post_comments
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- ============================================
-- GRANTS
-- ============================================

GRANT ALL ON public.posts TO authenticated;
GRANT SELECT ON public.posts TO anon;
GRANT ALL ON public.post_categories TO authenticated;
GRANT SELECT ON public.post_categories TO anon;
GRANT ALL ON public.post_tags TO authenticated;
GRANT SELECT ON public.post_tags TO anon;
GRANT ALL ON public.post_category_relations TO authenticated;
GRANT SELECT ON public.post_category_relations TO anon;
GRANT ALL ON public.post_tag_relations TO authenticated;
GRANT SELECT ON public.post_tag_relations TO anon;
GRANT ALL ON public.post_comments TO authenticated;
GRANT SELECT, INSERT ON public.post_comments TO anon;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample categories
INSERT INTO public.post_categories (name, slug, description, color) VALUES
    ('Adventures', 'adventures', 'Exciting adventure stories and experiences', '#F59E0B'),
    ('Tips & Guides', 'tips-guides', 'Helpful tips for travelers', '#10B981'),
    ('Destinations', 'destinations', 'Explore amazing destinations', '#3B82F6'),
    ('Safety', 'safety', 'Safety guidelines and best practices', '#EF4444')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample tags
INSERT INTO public.post_tags (name, slug) VALUES
    ('Paragliding', 'paragliding'),
    ('Oludeniz', 'oludeniz'),
    ('Turkey', 'turkey'),
    ('Adventure Sports', 'adventure-sports'),
    ('Travel Tips', 'travel-tips'),
    ('Safety', 'safety')
ON CONFLICT (slug) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Blog database schema created successfully!';
    RAISE NOTICE '📝 Tables: posts, post_categories, post_tags, relations, comments';
    RAISE NOTICE '🔧 Functions: slug generation, reading time, view counter';
    RAISE NOTICE '🔐 RLS policies enabled';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Verify tables in Supabase dashboard';
    RAISE NOTICE '2. Install npm packages for blog';
    RAISE NOTICE '3. Create API endpoints';
    RAISE NOTICE '4. Build frontend pages';
END $$;
