const jwt = require('jsonwebtoken');
const { supabase } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('⚠️  JWT_SECRET is not set in .env file!');
}

/**
 * Middleware to verify JWT token
 */
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Optionally verify with Supabase (for RLS)
    let user = decoded;
    
    // If token has Supabase session, verify with Supabase
    if (decoded.supabase_session) {
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(decoded.supabase_session);
      if (!error && supabaseUser) {
        user = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          role: decoded.role || 'user',
        };
      }
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user is authenticated (optional)
 * Allows both authenticated and public access
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
      } catch (error) {
        // Invalid token, but continue as public user
        req.user = null;
      }
    } else {
      req.user = null;
    }
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Middleware to check if user is admin
 * Requires authentication first
 */
exports.isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      // Also check Supabase RLS if user is authenticated via Supabase
      if (req.user.id) {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', req.user.id)
          .single();

        // For now, admin check is via JWT role
        // In production, you'd check a roles table or Supabase RLS
        if (req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Admin access required' });
        }
      } else {
        return res.status(403).json({ error: 'Admin access required' });
      }
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Admin access required' });
  }
};

/**
 * Middleware to check if user is authenticated (required)
 */
exports.requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

/**
 * Generate JWT token with role
 */
exports.generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
};

/**
 * Generate admin token (for server-side use only)
 */
exports.generateAdminToken = (adminId, email) => {
  return jwt.sign(
    {
      id: adminId,
      email,
      role: 'admin',
    },
    JWT_SECRET,
    {
      expiresIn: '24h', // Admin tokens expire in 24 hours
    }
  );
};
