// controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const authController = {
  // POST /api/auth/register
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body; //  destructures the username, email, and password from the request body.

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] // Queries the database to see if a user with the provided email OR username already exists. 
      });

      if (existingUser) {
        return res.status(400).json({ 
          error: 'User with this email or username already exists' 
        });
      }

      // Create new user
      const user = new User({ username, email, password });
      await user.save();

      
      const token = jwt.sign(
        { id: user._id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          stats: user.stats
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          stats: user.stats
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default authController;