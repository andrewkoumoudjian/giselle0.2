const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'jobseeker' } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Validate role
    const validRoles = ['jobseeker', 'employer', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword,
        role,
      })
      .select('id, email, name, role')
      .single();
    
    if (createError) {
      console.error('Error creating user:', createError);
      return res.status(500).json({ message: 'Error creating user' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Server error in POST /auth/register:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/auth/login
 * @description Login a user
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, password')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Server error in POST /auth/login:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/auth/me
 * @description Get current user
 * @access Private
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Continue anyway, we'll just return the user without profile data
    }
    
    // Get user's company if they are an employer
    let company = null;
    if (req.user.role === 'employer') {
      const { data: companyUser, error: companyUserError } = await supabase
        .from('company_users')
        .select(`
          company_id,
          role,
          companies (
            id,
            name,
            logo_url
          )
        `)
        .eq('user_id', req.user.id)
        .single();
      
      if (!companyUserError && companyUser) {
        company = {
          id: companyUser.company_id,
          name: companyUser.companies.name,
          logo_url: companyUser.companies.logo_url,
          role: companyUser.role,
        };
      }
    }
    
    // Return user data with profile
    return res.status(200).json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      profile: profile || null,
      company,
    });
  } catch (error) {
    console.error('Server error in GET /auth/me:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/auth/logout
 * @description Logout a user (client-side only)
 * @access Public
 */
router.post('/logout', (req, res) => {
  // JWT tokens are stateless, so we don't need to do anything server-side
  // The client should remove the token from storage
  return res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;
