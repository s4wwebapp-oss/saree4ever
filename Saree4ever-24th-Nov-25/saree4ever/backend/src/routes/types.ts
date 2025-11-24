import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get all types (with admin option to see inactive)
router.get('/', async (req, res) => {
  try {
    const { admin } = req.query;
    let query = supabase.from('types').select('*');
    
    // If not admin request, only show active types
    if (!admin) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query.order('display_order', { ascending: true });

    if (error) throw error;

    res.json({ types: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single type by slug
router.get('/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('types')
      .select('*')
      .eq('slug', req.params.slug)
      .single();

    if (error) throw error;

    res.json({ type: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new type (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, slug, description, image_url, is_active, display_order } = req.body;

    const { data, error } = await supabase
      .from('types')
      .insert({
        name,
        slug,
        description,
        image_url,
        is_active: is_active ?? true,
        display_order: display_order ?? 0,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ type: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update type (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { name, slug, description, image_url, is_active, display_order } = req.body;
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (display_order !== undefined) updateData.display_order = display_order;

    const { data, error } = await supabase
      .from('types')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ type: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete type (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('types')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Type deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

