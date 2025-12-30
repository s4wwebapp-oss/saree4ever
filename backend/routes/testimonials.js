const express = require('express');
const router = express.Router();
const { supabase } = require('../config/db');
const { authenticate, isAdmin, optionalAuth } = require('../middleware/auth');

// Public route - Get active testimonials
router.get('/active', optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      // If table doesn't exist, return empty array
      if (error.message?.includes('Could not find the table')) {
        console.warn('Testimonials table not found. Run migration: create_testimonials_table.sql');
        return res.json({ testimonials: [] });
      }
      throw error;
    }

    res.json({ testimonials: data || [] });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    // Return empty array instead of error for graceful degradation
    res.json({ testimonials: [] });
  }
});

// Get all testimonials (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      // If table doesn't exist, return empty array
      if (error.message?.includes('Could not find the table')) {
        console.warn('Testimonials table not found. Run migration: create_testimonials_table.sql');
        return res.json({ testimonials: [] });
      }
      throw error;
    }

    res.json({ testimonials: data || [] });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    // Return empty array instead of error for graceful degradation
    res.json({ testimonials: [] });
  }
});

// Admin routes - Only admins can manage testimonials
router.use(authenticate);
router.use(isAdmin);

// Get testimonial by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.json({ testimonial: data });
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch testimonial' });
  }
});

// Create testimonial
router.post('/', async (req, res) => {
  try {
    const testimonial = req.body;
    const { data, error } = await supabase
      .from('testimonials')
      .insert(testimonial)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ testimonial: data });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ error: error.message || 'Failed to create testimonial' });
  }
});

// Update testimonial
router.put('/:id', async (req, res) => {
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
    if (!data) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.json({ testimonial: data });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ error: error.message || 'Failed to update testimonial' });
  }
});

// Delete testimonial
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ error: error.message || 'Failed to delete testimonial' });
  }
});

module.exports = router;

