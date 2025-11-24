import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get all collections
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    res.json({ collections: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

