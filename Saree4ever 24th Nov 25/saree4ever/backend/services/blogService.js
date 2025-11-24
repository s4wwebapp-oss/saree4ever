const { supabase } = require('../config/db');

/**
 * Get all published blog articles
 */
exports.getAllArticles = async ({ limit = 20, offset = 0, category, featured, search } = {}) => {
  let query = supabase
    .from('blog_articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (category) {
    query = query.eq('category', category);
  }

  if (featured === true) {
    query = query.eq('is_featured', true);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

/**
 * Get article by slug
 */
exports.getArticleBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('blog_articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  // Increment view count
  if (data) {
    await supabase
      .from('blog_articles')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', data.id);
  }
  
  return data;
};

/**
 * Get article by ID (admin only)
 */
exports.getArticleById = async (id) => {
  const { data, error } = await supabase
    .from('blog_articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Create new article (admin only)
 */
exports.createArticle = async (articleData) => {
  const {
    title,
    slug,
    excerpt,
    content,
    featured_image_url,
    author_id,
    author_name,
    category,
    tags,
    status = 'draft',
    published_at,
    meta_description,
    meta_keywords,
    is_featured = false,
    instagram_reel_url,
    youtube_short_url,
    content_type = 'article',
  } = articleData;

  // For articles, content is required. For reels/videos, either instagram_reel_url or youtube_short_url is required
  if (content_type === 'article' && (!title || !slug || !content)) {
    throw new Error('Title, slug, and content are required for articles');
  }
  if ((content_type === 'reel' || content_type === 'video') && (!title || !slug || (!instagram_reel_url && !youtube_short_url))) {
    throw new Error(`Title, slug, and ${content_type === 'reel' ? 'Instagram Reel URL' : 'YouTube Video URL'} are required`);
  }

  const { data, error } = await supabase
    .from('blog_articles')
    .insert({
      title,
      slug,
      excerpt: excerpt || null,
      content: content || '',
      featured_image_url: featured_image_url || null,
      author_id: author_id || null,
      author_name: author_name || null,
      category: category || null,
      tags: tags || [],
      status,
      published_at: published_at || (status === 'published' ? new Date().toISOString() : null),
      meta_description: meta_description || null,
      meta_keywords: meta_keywords || [],
      is_featured,
      instagram_reel_url: instagram_reel_url || null,
      youtube_short_url: youtube_short_url || null,
      content_type: content_type || 'article',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update article (admin only)
 */
exports.updateArticle = async (id, articleData) => {
  const updateData = {
    updated_at: new Date().toISOString(),
  };

  if (articleData.title !== undefined) updateData.title = articleData.title;
  if (articleData.slug !== undefined) updateData.slug = articleData.slug;
  if (articleData.excerpt !== undefined) updateData.excerpt = articleData.excerpt;
  if (articleData.content !== undefined) updateData.content = articleData.content;
  if (articleData.featured_image_url !== undefined) updateData.featured_image_url = articleData.featured_image_url;
  if (articleData.author_name !== undefined) updateData.author_name = articleData.author_name;
  if (articleData.category !== undefined) updateData.category = articleData.category;
  if (articleData.tags !== undefined) updateData.tags = articleData.tags;
  if (articleData.status !== undefined) {
    updateData.status = articleData.status;
    // Auto-set published_at if status changes to published
    if (articleData.status === 'published' && !articleData.published_at) {
      updateData.published_at = new Date().toISOString();
    }
  }
  if (articleData.published_at !== undefined) updateData.published_at = articleData.published_at;
  if (articleData.meta_description !== undefined) updateData.meta_description = articleData.meta_description;
  if (articleData.meta_keywords !== undefined) updateData.meta_keywords = articleData.meta_keywords;
  if (articleData.is_featured !== undefined) updateData.is_featured = articleData.is_featured;
  if (articleData.instagram_reel_url !== undefined) updateData.instagram_reel_url = articleData.instagram_reel_url || null;
  if (articleData.youtube_short_url !== undefined) updateData.youtube_short_url = articleData.youtube_short_url || null;
  if (articleData.content_type !== undefined) updateData.content_type = articleData.content_type;

  const { data, error } = await supabase
    .from('blog_articles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Article not found');
    }
    throw error;
  }
  return data;
};

/**
 * Delete article (admin only)
 */
exports.deleteArticle = async (id) => {
  const { error } = await supabase
    .from('blog_articles')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

/**
 * Get all articles for admin (including drafts)
 */
exports.getAllArticlesAdmin = async ({ limit = 50, offset = 0, status, category, search } = {}) => {
  let query = supabase
    .from('blog_articles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (status) {
    query = query.eq('status', status);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

/**
 * Get article categories
 */
exports.getCategories = async () => {
  const { data, error } = await supabase
    .from('blog_articles')
    .select('category')
    .eq('status', 'published')
    .not('category', 'is', null);

  if (error) throw error;
  
  const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
  return categories;
};

