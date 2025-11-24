import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get all categories (with admin option to see inactive)
router.get('/', async (req, res) => {
  try {
    const { admin } = req.query;
    let query = supabase.from('categories').select('*');
    
    // If not admin request, only show active categories
    if (!admin) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query.order('display_order', { ascending: true });

    if (error) throw error;

    res.json({ categories: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single category by slug
router.get('/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', req.params.slug)
      .single();

    if (error) throw error;

    res.json({ category: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new category (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, slug, description, image_url, icon, is_active, display_order } = req.body;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        description,
        image_url,
        icon,
        is_active: is_active ?? true,
        display_order: display_order ?? 0,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ category: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update category (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { name, slug, description, image_url, icon, is_active, display_order } = req.body;
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (icon !== undefined) updateData.icon = icon;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (display_order !== undefined) updateData.display_order = display_order;

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ category: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete category (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

