import Warehouse from '../models/Warehouse.js';
import Supplier from '../models/Supplier.js';
import AuditLog from '../models/AuditLog.js';
import SupportTicket from '../models/SupportTicket.js';
import Seller from '../models/Seller.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// --- Warehouses ---
export const getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find().populate('inventory.product');
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adjustStock = async (req, res) => {
  const { warehouseId, productId, quantity } = req.body;
  try {
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });

    const item = warehouse.inventory.find(i => i.product.toString() === productId);
    if (item) {
      item.quantity += quantity;
      if (item.quantity < 0) item.quantity = 0;
    } else {
      warehouse.inventory.push({ product: productId, quantity: Math.max(0, quantity) });
    }

    await warehouse.save();

    if (req.io) {
      req.io.emit('notification', {
        id: Math.random().toString(36).substring(7),
        title: 'Stock Level Alert',
        description: `Product stock levels adjusted in ${warehouse.name}`,
        type: 'inventory',
        timestamp: new Date()
      });
    }

    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const transferStock = async (req, res) => {
  const { fromWarehouseId, toWarehouseId, productId, quantity } = req.body;
  try {
    const fromWH = await Warehouse.findById(fromWarehouseId);
    const toWH = await Warehouse.findById(toWarehouseId);

    if (!fromWH || !toWH) return res.status(404).json({ message: 'One or both warehouses not found' });

    const fromItem = fromWH.inventory.find(i => i.product.toString() === productId);
    if (!fromItem || fromItem.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock in source warehouse' });
    }

    fromItem.quantity -= quantity;
    await fromWH.save();

    const toItem = toWH.inventory.find(i => i.product.toString() === productId);
    if (toItem) {
      toItem.quantity += quantity;
    } else {
      toWH.inventory.push({ product: productId, quantity });
    }
    await toWH.save();

    if (req.io) {
      req.io.emit('notification', {
        id: Math.random().toString(36).substring(7),
        title: 'Inventory Transfer',
        description: `Transferred ${quantity} items from ${fromWH.name} to ${toWH.name}`,
        type: 'inventory',
        timestamp: new Date()
      });
    }

    res.json({ message: 'Stock transferred successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Suppliers ---
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Sellers ---
export const getSellers = async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSeller = async (req, res) => {
  try {
    const seller = await Seller.create(req.body);
    res.status(201).json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSellerStatus = async (req, res) => {
  const { id } = req.params;
  const { status, commissionRate } = req.body;
  try {
    const seller = await Seller.findById(id);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    if (status !== undefined) seller.status = status;
    if (commissionRate !== undefined) seller.commissionRate = commissionRate;

    await seller.save();
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Audit Logs ---
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAuditLogEntry = async (req, res) => {
  const { action, details } = req.body;
  try {
    const log = await AuditLog.create({
      user: req.user._id,
      action,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Support Tickets & Live Chat ---
export const getTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTicket = async (req, res) => {
  const { subject, priority, initialMessage } = req.body;
  try {
    const ticket = await SupportTicket.create({
      user: req.user._id,
      subject,
      priority,
      messages: [{ sender: 'Customer', text: initialMessage }]
    });

    if (req.io) {
      req.io.emit('notification', {
        id: Math.random().toString(36).substring(7),
        title: 'New Support Ticket',
        description: `Ticket #${ticket._id.toString().substring(18)} created by ${req.user.name}`,
        type: 'support',
        timestamp: new Date()
      });
    }

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const replyToTicket = async (req, res) => {
  const { id } = req.params;
  const { text, sender } = req.body;
  try {
    const ticket = await SupportTicket.findById(id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.messages.push({ sender, text });
    if (sender === 'Admin') ticket.status = 'In Progress';
    await ticket.save();

    if (req.io) {
      req.io.to(id).emit('chat_message', { sender, text, timestamp: new Date() });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
