const { supabase } = require('../config/db');

/**
 * Get audit logs (admin only)
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const {
      actor_id,
      action,
      resource_type,
      resource_id,
      limit = 50,
      offset = 0,
      start_date,
      end_date,
    } = req.query;

    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (actor_id) {
      query = query.eq('actor_id', actor_id);
    }
    if (action) {
      query = query.eq('action', action);
    }
    if (resource_type) {
      query = query.eq('resource_type', resource_type);
    }
    if (resource_id) {
      query = query.eq('resource_id', resource_id);
    }
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ logs: data || [], count: data?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get import history (admin only)
 */
exports.getImportHistory = async (req, res) => {
  try {
    const {
      import_type,
      status,
      limit = 50,
      offset = 0,
      start_date,
      end_date,
    } = req.query;

    let query = supabase
      .from('import_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (import_type) {
      query = query.eq('import_type', import_type);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ imports: data || [], count: data?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



