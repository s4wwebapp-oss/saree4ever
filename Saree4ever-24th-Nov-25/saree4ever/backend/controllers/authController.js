const { supabase } = require('../config/db');
const { generateToken, generateAdminToken } = require('../middleware/auth');

/**
 * Sign up new user
 */
exports.signup = async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!phone || phone.trim() === '') {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || null,
          phone: phone || null,
        },
      },
    });

    if (error) throw error;

    // Create user profile
    if (data.user) {
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        full_name: full_name || null,
        phone: phone.trim(),
      });
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Sign in user
 */
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // Generate JWT token
    const token = generateToken({
      id: data.user.id,
      email: data.user.email,
      role: 'user', // Default role, can be updated from profile or roles table
    });

    res.json({
      message: 'Sign in successful',
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name || null,
        role: 'user',
      },
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid email or password' });
  }
};

/**
 * Sign out user
 */
exports.signout = async (req, res) => {
  try {
    const { supabase } = require('../config/db');
    await supabase.auth.signOut();
    res.json({ message: 'Sign out successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get current user
 */
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user profile from Supabase
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role || 'user',
        profile: profile || null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Check if user is eligible for new user discount
 */
exports.checkNewUserDiscountEligibility = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('new_user_discount_used')
      .eq('id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Check if user has already used the discount
    const discountUsed = profile?.new_user_discount_used || false;

    // New user discount configuration
    const discountPercentage = 10; // 10% discount
    const discountCode = 'WELCOME10';

    res.json({
      eligible: !discountUsed,
      discount_code: discountCode,
      discount_percentage: discountPercentage,
      discount_amount: null, // Will be calculated based on order total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Admin sign in (server-only, for admin dashboard)
 */
exports.adminSignin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Check if user is admin
    // In production, check against a roles table or Supabase RLS
    // For now, you can maintain a list of admin emails in .env
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
    
    if (!adminEmails.includes(email)) {
      return res.status(403).json({ error: 'Admin access denied' });
    }

    // Generate admin token
    const token = generateAdminToken(data.user.id, data.user.email);

    res.json({
      message: 'Admin sign in successful',
      token,
      supabaseSession: data.session, // Include Supabase session for direct uploads
      user: {
        id: data.user.id,
        email: data.user.email,
        role: 'admin',
      },
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid email or password' });
  }
};

