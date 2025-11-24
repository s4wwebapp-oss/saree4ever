-- Create blog_articles table
CREATE TABLE IF NOT EXISTS blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author_id UUID, -- Optional: Can reference auth.users(id) if needed, but not enforced
  author_name VARCHAR(255),
  category VARCHAR(100), -- e.g., 'Collections', 'Saree Care', 'Fashion Tips', 'History'
  tags TEXT[], -- Array of tags
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  published_at TIMESTAMP,
  meta_description TEXT,
  meta_keywords TEXT[],
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON blog_articles(slug);

-- Create index on status and published_at for filtering
CREATE INDEX IF NOT EXISTS idx_blog_articles_status ON blog_articles(status);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published_at ON blog_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_articles_featured ON blog_articles(is_featured) WHERE is_featured = true;

-- Create index on category
CREATE INDEX IF NOT EXISTS idx_blog_articles_category ON blog_articles(category);

-- Enable Row Level Security
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published articles
CREATE POLICY "Anyone can read published articles"
  ON blog_articles FOR SELECT
  USING (status = 'published');

-- Policy: Authenticated users (admins) can do everything
CREATE POLICY "Admins can manage all articles"
  ON blog_articles FOR ALL
  USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_blog_articles_updated_at
  BEFORE UPDATE ON blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_articles_updated_at();

-- Insert sample blog articles (optional - for testing)
INSERT INTO blog_articles (title, slug, excerpt, content, author_name, category, tags, status, published_at, is_featured) VALUES
(
  'The Timeless Elegance of Kanjivaram Sarees',
  'timeless-elegance-kanjivaram-sarees',
  'Discover the rich heritage and intricate craftsmanship behind Kanjivaram sarees, one of India''s most treasured traditional garments.',
  '<h2>The Heritage of Kanjivaram</h2><p>Kanjivaram sarees, also known as Kanchipuram sarees, are a symbol of South Indian tradition and craftsmanship. These exquisite silk sarees have been woven for over 400 years in the temple town of Kanchipuram, Tamil Nadu.</p><h3>What Makes Kanjivaram Special?</h3><p>The uniqueness of Kanjivaram sarees lies in their:</p><ul><li><strong>Pure Silk:</strong> Made from the finest mulberry silk threads</li><li><strong>Zari Work:</strong> Intricate gold and silver thread patterns</li><li><strong>Durability:</strong> Known to last for generations</li><li><strong>Rich Colors:</strong> Vibrant hues that never fade</li></ul><h3>Choosing Your Perfect Kanjivaram</h3><p>When selecting a Kanjivaram saree, consider the occasion, color preferences, and the intricacy of the zari work. Traditional motifs like peacocks, temples, and floral patterns are timeless choices.</p>',
  'Saree4Ever Editorial',
  'Collections',
  ARRAY['Kanjivaram', 'Silk', 'Traditional', 'Heritage'],
  'published',
  NOW(),
  true
),
(
  'Banarasi Sarees: A Royal Legacy',
  'banarasi-sarees-royal-legacy',
  'Explore the opulent world of Banarasi sarees, where Mughal artistry meets Indian tradition in the most beautiful way.',
  '<h2>The Royal Heritage</h2><p>Banarasi sarees from Varanasi are renowned for their luxurious silk and intricate brocade work. These sarees have adorned royalty and continue to be a symbol of elegance and sophistication.</p><h3>Types of Banarasi Sarees</h3><ul><li><strong>Katan:</strong> Pure silk with zari work</li><li><strong>Organza:</strong> Lightweight with delicate patterns</li><li><strong>Georgette:</strong> Modern twist on traditional designs</li><li><strong>Shiffon:</strong> Contemporary and comfortable</li></ul>',
  'Saree4Ever Editorial',
  'Collections',
  ARRAY['Banarasi', 'Silk', 'Brocade', 'Royal'],
  'published',
  NOW(),
  true
)
ON CONFLICT (slug) DO NOTHING;

