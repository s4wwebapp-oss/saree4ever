import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authenticate, isAdmin } from '../middleware/auth';

const router = express.Router();

// Public route - Get all menu configs
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('menu_config')
      .select('*')
      .order('menu_type', { ascending: true });

    if (error) throw error;

    // Convert array to object keyed by menu_type for easier access
    const configMap: Record<string, any> = {};
    data?.forEach((config) => {
      configMap[config.menu_type] = config;
    });

    res.json({ configs: configMap, raw: data });
  } catch (error: any) {
    console.error('Error fetching menu config:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch menu config' });
  }
});

// Admin route - Get single menu config
router.get('/:menuType', authenticate, isAdmin, async (req, res) => {
  try {
    const { menuType } = req.params;
    const { data, error } = await supabase
      .from('menu_config')
      .select('*')
      .eq('menu_type', menuType)
      .single();

    if (error) throw error;
    res.json({ config: data });
  } catch (error: any) {
    console.error('Error fetching menu config:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch menu config' });
  }
});

// Admin route - Update menu config
router.put('/:menuType', authenticate, isAdmin, async (req, res) => {
  try {
    const { menuType } = req.params;
    const { column_1_title, column_2_title, column_3_title } = req.body;

    if (!column_1_title || !column_2_title || !column_3_title) {
      return res.status(400).json({ error: 'All column titles are required' });
    }

    const { data, error } = await supabase
      .from('menu_config')
      .update({
        column_1_title,
        column_2_title,
        column_3_title,
        updated_at: new Date().toISOString(),
      })
      .eq('menu_type', menuType)
      .select()
      .single();

    if (error) throw error;
    res.json({ config: data, message: 'Menu config updated successfully' });
  } catch (error: any) {
    console.error('Error updating menu config:', error);
    res.status(500).json({ error: error.message || 'Failed to update menu config' });
  }
});

export default router;

