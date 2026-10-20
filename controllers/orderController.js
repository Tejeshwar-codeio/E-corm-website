import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize payment gateways conditionally
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
  : null;

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  } = req.body;

  try {
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Verify stock and decrement inventory
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.countInStock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
    }

    // Create Order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    const createdOrder = await order.save();

    // Decrement stock in database
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.quantity }
      });
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      // Check if authorized (User who placed order or Admin)
      if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = 'Delivered';

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order shipping status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;
      if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Stripe Checkout Session
// @route   POST /api/orders/:id/stripe-session
// @access  Private
const createStripeSession = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!stripe) {
      // Mock Stripe response if no secret key configured
      console.warn('Stripe not configured. Simulating success...');
      order.stripeSessionId = 'mock_stripe_session_id_' + Math.random().toString(36).substr(2, 9);
      await order.save();
      return res.json({ id: order.stripeSessionId, url: `${req.body.successUrl}?session_id=${order.stripeSessionId}` });
    }

    const lineItems = order.orderItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image]
        },
        unit_amount: Math.round(item.price * 100) // cents
      },
      quantity: item.quantity
    }));

    // Add shipping price as line item if present
    if (order.shippingPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Shipping Charge' },
          unit_amount: Math.round(order.shippingPrice * 100)
        },
        quantity: 1
      });
    }

    // Add tax price as line item if present
    if (order.taxPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Tax/VAT' },
          unit_amount: Math.round(order.taxPrice * 100)
        },
        quantity: 1
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.body.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: req.body.cancelUrl,
      client_reference_id: order._id.toString()
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/orders/:id/razorpay-order
// @access  Private
const createRazorpayOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!razorpay) {
      // Mock Razorpay response if no keys configured
      console.warn('Razorpay keys not configured. Simulating order response...');
      const orderId = 'mock_rzp_order_id_' + Math.random().toString(36).substr(2, 9);
      order.razorpayOrderId = orderId;
      await order.save();
      return res.json({ id: orderId, amount: Math.round(order.totalPrice * 100), currency: 'INR', isMock: true });
    }

    const options = {
      amount: Math.round(order.totalPrice * 100), // paise
      currency: 'INR',
      receipt: order._id.toString(),
      payment_capture: 1
    };

    const rzpOrder = await razorpay.orders.create(options);
    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    res.json(rzpOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/orders/:id/razorpay-verify
// @access  Private
const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!razorpay) {
      // Mock validation
      order.isPaid = true;
      order.paidAt = Date.now();
      order.razorpayPaymentId = razorpay_payment_id || 'mock_rzp_pay_id';
      order.paymentResult = {
        id: razorpay_payment_id || 'mock_rzp_pay_id',
        status: 'success',
        update_time: Date.now().toString(),
        email_address: req.user.email
      };
      await order.save();
      return res.json({ success: true, order });
    }

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest === razorpay_signature) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.razorpayPaymentId = razorpay_payment_id;
      order.paymentResult = {
        id: razorpay_payment_id,
        status: 'success',
        update_time: Date.now().toString(),
        email_address: req.user.email
      };

      await order.save();
      res.json({ success: true, order });
    } else {
      res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
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
};
