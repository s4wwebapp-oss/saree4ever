const express = require('express');
const { supabase } = require('../lib/supabase');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all testimonials (public - active only)
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json({ testimonials: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all testimonials (admin - all)
router.get('/admin/all', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;

    let query = supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (search) {
      query = query.ilike('customer_name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ testimonials: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create testimonial (admin)
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { customer_name, customer_role, content, rating, image_url, is_active, display_order } = req.body;

    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        customer_name,
        customer_role,
        content,
        rating,
        image_url,
        is_active: is_active !== undefined ? is_active : true,
        display_order: display_order || 0
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ testimonial: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update testimonial (admin)
router.put('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ testimonial: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete testimonial (admin)
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

