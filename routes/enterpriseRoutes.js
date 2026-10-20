import express from 'express';
import {
  getWarehouses,
  adjustStock,
  transferStock,
  getSuppliers,
  createSupplier,
  getSellers,
  createSeller,
  updateSellerStatus,
  getAuditLogs,
  createAuditLogEntry,
  getTickets,
  createTicket,
  replyToTicket
} from '../controllers/enterpriseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Warehouses
router.route('/warehouses').get(protect, admin, getWarehouses);
router.route('/warehouses/adjust').post(protect, admin, adjustStock);
router.route('/warehouses/transfer').post(protect, admin, transferStock);

// Suppliers
router.route('/suppliers').get(protect, admin, getSuppliers).post(protect, admin, createSupplier);

// Sellers
router.route('/sellers').get(protect, admin, getSellers).post(protect, admin, createSeller);
router.route('/sellers/:id').put(protect, admin, updateSellerStatus);

// Audit Logs
router.route('/audit-logs').get(protect, admin, getAuditLogs).post(protect, createAuditLogEntry);

// Support Tickets
router.route('/support/tickets').get(protect, getTickets).post(protect, createTicket);
router.route('/support/tickets/:id/reply').post(protect, replyToTicket);

export default router;
