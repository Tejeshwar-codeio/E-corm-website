import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  getMyOrders,
  getOrders,
  createStripeSession,
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

// Payment configurations
router.route('/:id/stripe-session').post(protect, createStripeSession);
router.route('/:id/razorpay-order').post(protect, createRazorpayOrder);
router.route('/:id/razorpay-verify').post(protect, verifyRazorpayPayment);

export default router;
