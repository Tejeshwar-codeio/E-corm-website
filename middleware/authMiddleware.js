import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - user must be logged in
const protect = async (req, res, next) => {
  let token;

  // Read JWT from the HTTP-only cookie
  token = req.cookies?.jwt;

  // Fallback: Check Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shopsphere_secret_key_12345');
      req.user = await User.findById(decoded.userId).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      res.json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401);
    res.json({ message: 'Not authorized, no token provided' });
  }
};

// Admin middleware - user must be an admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    res.json({ message: 'Not authorized as an admin' });
  }
};

export { protect, admin };
