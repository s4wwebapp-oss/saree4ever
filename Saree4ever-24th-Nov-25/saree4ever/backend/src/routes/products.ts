import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get all products (with filters)
router.get('/', async (req, res) => {
  try {
    const { collection, category, type, featured, active, limit = 50, offset = 0, admin } = req.query;
    
    // Check if this is an admin request (has Authorization header)
    const isAdmin = admin === 'true' || req.headers.authorization?.startsWith('Bearer');

    let query = supabase
      .from('products')
      .select(`
        *,
        collection:collections(*),
        category:categories(*),
        type:types(*),
        variants(*)
      `)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    // Only filter by active status if not admin
    if (!isAdmin) {
      // For public API, default to active only
      query = query.eq('is_active', true);
    } else {
      // Admin can see all, but can filter by active status
      if (active === 'true') {
        query = query.eq('is_active', true);
      } else if (active === 'false') {
        query = query.eq('is_active', false);
      }
      // If active is not set, show all products (no filter)
    }

    if (collection) {
      query = query.eq('collection_id', collection);
    }
    if (category) {
      query = query.eq('category_id', category);
    }
    if (type) {
      query = query.eq('type_id', type);
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ products: data, count: data?.length || 0 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        collection:collections(*),
        category:categories(*),
        type:types(*),
        variants(*)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

