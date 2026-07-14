import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService.js';

// Helper to generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET || 'super_secret_key_pizzaverse_2026', 
    { expiresIn: process.env.JWT_LIFETIME || '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create user (first user is created as admin for testing convenience, others as standard users)
    const totalUsersCount = await User.countDocuments({});
    const role = totalUsersCount === 0 ? 'admin' : 'user';

    const user = await User.create({
      name,
      email,
      password,
      role,
      verificationToken
    });

    // Create an empty Cart database entry for the user
    await Cart.create({ user: user._id, items: [] });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken, process.env.FRONTEND_URL || 'http://localhost:5173');
    } catch (emailError) {
      console.error('[Auth Controller] Verification email failed to send, proceeding with registration:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Register error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        addresses: user.addresses,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Login error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Send Welcome Email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('[Auth Controller] Welcome email failed to send:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: true
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Verify email error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during email verification' });
  }
};

// @desc    Request password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this email' });
    }

    // Generate and hash password token
    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry

    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, process.env.FRONTEND_URL || 'http://localhost:5173');
      res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      console.error('[Auth Controller] Forgot password email failed:', emailError.message);
      res.status(500).json({ success: false, message: 'Failed to send reset email. Please try again later.' });
    }
  } catch (error) {
    console.error('[Auth Controller] Forgot password error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during password reset request' });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    // Hash token to match saved version
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully! You can now log in.' });
  } catch (error) {
    console.error('[Auth Controller] Reset password error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during password update' });
  }
};

// @desc    Get currently logged in user context
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        addresses: user.addresses,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Get profile error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
};

// @desc    Update user profile / addresses
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, addresses, profileImage } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (addresses) user.addresses = addresses;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        addresses: user.addresses,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Update profile error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};
