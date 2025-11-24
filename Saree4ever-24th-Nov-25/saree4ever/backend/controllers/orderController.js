const orderService = require('../services/orderService');
const { generateOrderNumber } = require('../utils/helpers');
const emailService = require('../services/emailService');

const buildCustomerFromOrder = (order) => ({
  name:
    order?.shipping_name ||
    order?.billing_name ||
    order?.customer?.name ||
    order?.email ||
    'Customer',
  email: order?.email,
});

const sendEmailSafe = (label, fn) => {
  try {
    const maybePromise = fn();
    if (maybePromise && typeof maybePromise.then === 'function') {
      maybePromise.catch((error) =>
        console.error(`[Email] Failed to send ${label}:`, error?.message || error)
      );
    }
  } catch (error) {
    console.error(`[Email] Failed to send ${label}:`, error?.message || error);
  }
};

/**
 * Create new order
 * STEP 1: Reserve stock
 * STEP 2: Create order with status: Pending
 */
exports.createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      order_number: generateOrderNumber(),
    };
    
    const order = await orderService.createOrder(orderData);

    sendEmailSafe('order confirmation', () =>
      emailService.sendOrderConfirmation(order, buildCustomerFromOrder(order))
    );

    res.status(201).json({
      order,
      message: 'Order created successfully. Please proceed to payment.',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get order by order number
 */
exports.getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await orderService.getOrderByNumber(orderNumber);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get timeline
    const timeline = await orderService.getOrderTimeline(order.id);
    
    res.json({ order, timeline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get order by ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if user owns the order or is admin
    // Public users cannot access orders by ID (use order number instead)
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You can only view your own orders.' });
    }
    
    // Get timeline
    const timeline = await orderService.getOrderTimeline(id);
    
    res.json({ order, timeline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user's orders with timeline (Amazon-style)
 */
exports.getUserOrders = async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    const orders = await orderService.getUserOrders(req.user.id, { limit, offset, status });
    res.json({ orders, count: orders?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * STEP 3 & 4: Payment webhook handler
 * STEP 5: Process payment success (commit stock, update to Paid)
 */
exports.processPaymentWebhook = async (req, res) => {
  try {
    const { order_id, payment_status, payment_method, payment_transaction_id, signature } = req.body;

    // TODO: Verify webhook signature (Razorpay/Stripe)
    
    if (payment_status === 'paid' || payment_status === 'success') {
      const order = await orderService.processPaymentSuccess(order_id, {
        payment_method,
        payment_transaction_id,
      });

      sendEmailSafe('payment confirmation', () =>
        emailService.sendPaymentConfirmation(order, buildCustomerFromOrder(order))
      );

      res.json({
        success: true,
        order,
        message: 'Payment processed successfully',
      });
    } else if (payment_status === 'failed') {
      const order = await orderService.processPaymentFailure(order_id, 'Payment failed');
      
      res.json({ 
        success: false,
        order,
        message: 'Payment failed' 
      });
    } else {
      res.status(400).json({ error: 'Invalid payment status' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * STEP 6 & 7: Ship order (admin)
 */
exports.shipOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { tracking_number, courier_name, tracking_url } = req.body;
    
    const order = await orderService.shipOrder(id, {
      tracking_number,
      courier_name,
      tracking_url,
    });

    sendEmailSafe('shipping update', () =>
      emailService.sendShippingUpdate(
        order,
        {
          tracking_number: tracking_number || order.tracking_number,
          carrier: courier_name || 'Courier',
          tracking_url: tracking_url || null,
        },
        buildCustomerFromOrder(order)
      )
    );

    res.json({ 
      order,
      message: 'Order shipped successfully' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * STEP 8: Update tracking (admin)
 */
exports.updateTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const { tracking_number, courier_name, tracking_url } = req.body;
    
    const order = await orderService.updateTracking(id, {
      tracking_number,
      courier_name,
      tracking_url,
    });
    
    res.json({ 
      order,
      message: 'Tracking updated successfully' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * STEP 9: Mark order as delivered (admin)
 */
exports.deliverOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.deliverOrder(id);
    
    sendEmailSafe('delivery confirmation', () =>
      emailService.sendDeliveryConfirmation(order, buildCustomerFromOrder(order))
    );
    
    res.json({ 
      order,
      message: 'Order marked as delivered' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update order status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tracking_number, admin_notes } = req.body;
    
    const order = await orderService.updateOrderStatus(id, {
      status,
      tracking_number,
      admin_notes,
      updated_by: req.user.id,
    });
    
    res.json({ 
      order,
      message: 'Order status updated successfully' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update payment status (legacy - use webhook instead)
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_method, payment_transaction_id } = req.body;
    
    if (payment_status === 'paid') {
      const order = await orderService.processPaymentSuccess(id, {
        payment_method,
        payment_transaction_id,
      });
      return res.json({ order, message: 'Payment status updated successfully' });
    }
    
    const order = await orderService.updatePaymentStatus(id, {
      payment_status,
      payment_method,
      payment_transaction_id,
    });
    
    res.json({ order, message: 'Payment status updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Cancel order
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.cancelOrder(id, req.user.id);
    
    res.json({ 
      order,
      message: 'Order cancelled successfully' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get all orders (admin)
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { limit = 50, offset = 0, status, payment_status } = req.query;
    const orders = await orderService.getAllOrders({ limit, offset, status, payment_status });
    res.json({ orders, count: orders?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get order statistics (admin)
 */
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await orderService.getOrderStats();
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
