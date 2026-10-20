import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUserWishlist,
  toggleWishlist,
  getUserCart,
  syncUserCart,
  addUserAddress,
  deleteUserAddress,
  googleAuth
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/google', googleAuth);
router.post('/logout', protect, logoutUser);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router
  .route('/wishlist')
  .get(protect, getUserWishlist)
  .post(protect, toggleWishlist);

router
  .route('/cart')
  .get(protect, getUserCart);

router.post('/cart/sync', protect, syncUserCart);

router.route('/addresses').post(protect, addUserAddress);
router.route('/addresses/:id').delete(protect, deleteUserAddress);

export default router;
