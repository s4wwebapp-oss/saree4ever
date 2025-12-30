import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Health check for Supabase connection
router.get('/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('_prisma_migrations').select('id').limit(1);
    if (error) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Supabase connection failed',
        error: error.message 
      });
    }
    res.json({ status: 'ok', message: 'Supabase connected successfully' });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Supabase connection error',
      error: error.message 
    });
  }
});

export default router;

