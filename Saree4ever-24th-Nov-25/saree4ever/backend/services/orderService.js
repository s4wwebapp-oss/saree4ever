const { supabase } = require('../config/db');
const inventoryService = require('./inventoryService');
const realtimeService = require('./realtimeService');
const { generateOrderNumber } = require('../utils/helpers');

/**
 * Create new order
 * STEP 1: Reserve stock
 * STEP 2: Create order with status: Pending
 */
exports.createOrder = async (orderData) => {
  const {
    user_id,
    email,
    phone,
    shipping_name,
    shipping_address_line1,
    shipping_address_line2,
    shipping_city,
    shipping_state,
    shipping_postal_code,
    shipping_country = 'India',
    billing_name,
    billing_address_line1,
    billing_address_line2,
    billing_city,
    billing_state,
    billing_postal_code,
    billing_country,
    items, // Array of { variant_id, product_id, quantity, unit_price }
    subtotal,
    tax_amount = 0,
    shipping_amount = 0,
    discount_amount = 0,
    customer_notes,
    order_number,
  } = orderData;

  if (!email || !shipping_name || !items || items.length === 0) {
    throw new Error('Email, shipping name, and items are required');
  }

  // Calculate totals if not provided
  let calculatedSubtotal = subtotal || items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  let calculatedDiscountAmount = discount_amount;

  // Check and apply new user discount if eligible
  if (user_id && discount_amount === 0) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('new_user_discount_used')
      .eq('id', user_id)
      .single();

    if (profile && !profile.new_user_discount_used) {
      // Apply 10% new user discount
      const discountPercentage = 10;
      calculatedDiscountAmount = (calculatedSubtotal * discountPercentage) / 100;
    }
  }

  const total_amount = calculatedSubtotal + tax_amount + shipping_amount - calculatedDiscountAmount;

  // STEP 1: Reserve stock for all items BEFORE creating order
  for (const item of items) {
    const { data: variant } = await supabase
      .from('variants')
      .select('track_inventory')
      .eq('id', item.variant_id)
      .single();

    if (variant?.track_inventory) {
      // Check available stock first
      const stockInfo = await inventoryService.getAvailableStock(item.variant_id);
      if (stockInfo.available_stock < item.quantity) {
        throw new Error(`Insufficient stock for variant. Available: ${stockInfo.available_stock}, Requested: ${item.quantity}`);
      }
    }
  }

  // Create order with status: Pending
  const finalOrderNumber = order_number || generateOrderNumber();
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: finalOrderNumber,
      user_id: user_id || null,
      email,
      phone: phone || null,
      shipping_name,
      shipping_address_line1,
      shipping_address_line2: shipping_address_line2 || null,
      shipping_city,
      shipping_state,
      shipping_postal_code,
      shipping_country,
      billing_name: billing_name || shipping_name,
      billing_address_line1: billing_address_line1 || shipping_address_line1,
      billing_address_line2: billing_address_line2 || shipping_address_line2 || null,
      billing_city: billing_city || shipping_city,
      billing_state: billing_state || shipping_state,
      billing_postal_code: billing_postal_code || shipping_postal_code,
      billing_country: billing_country || shipping_country,
      subtotal: calculatedSubtotal,
      tax_amount,
      shipping_amount,
      discount_amount: calculatedDiscountAmount,
      total_amount,
      payment_status: 'pending',
      status: 'pending', // STEP 2: Order created with status: Pending
      customer_notes: customer_notes || null,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // STEP 1 (continued): Reserve stock now that order is created
  const orderItems = [];
  for (const item of items) {
    // Get product and variant details
    const { data: variant } = await supabase
      .from('variants')
      .select('*, product:products(*)')
      .eq('id', item.variant_id)
      .single();

    if (!variant) {
      // Rollback: Delete order if variant not found
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(`Variant ${item.variant_id} not found`);
    }

    // Reserve stock if tracking inventory
    if (variant.track_inventory) {
      try {
        await inventoryService.reserveStock({
          variant_id: item.variant_id,
          quantity: item.quantity,
          order_id: order.id,
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min expiry
        });
      } catch (error) {
        // Rollback: Delete order if reservation fails
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`Stock reservation failed: ${error.message}`);
      }
    }

    // Create order item
    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        variant_id: item.variant_id,
        product_id: item.product_id,
        product_name: variant.product?.name || '',
        variant_name: variant.name,
        sku: variant.sku,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total_price: item.unit_price * item.quantity,
        product_image_url: variant.product?.primary_image_url || null,
        variant_image_url: variant.image_url || null,
      })
      .select()
      .single();

    if (itemError) {
      // Rollback: Release stock and delete order
      if (variant.track_inventory) {
        try {
          await inventoryService.releaseStock({
            variant_id: item.variant_id,
            quantity: item.quantity,
            order_id: order.id,
          });
        } catch (e) {
          console.error('Error releasing stock during rollback:', e);
        }
      }
      await supabase.from('orders').delete().eq('id', order.id);
      throw itemError;
    }
    orderItems.push(orderItem);
  }

  // Add order event: Order created
  await addOrderEvent(order.id, 'order_created', {
    message: 'Order created',
    status: 'pending',
    payment_status: 'pending',
  });

  // Broadcast order created
  if (order.user_id) {
    realtimeService.broadcastToUser(order.user_id, 'order_created', {
      order_id: order.id,
      order_number: finalOrderNumber,
      status: 'pending',
    });
  }

  // Fetch complete order with items
  const { data: completeOrder } = await supabase
    .from('orders')
    .select('*, order_items(*, variant:variants(*), product:products(*))')
    .eq('id', order.id)
    .single();

  return completeOrder;
};

/**
 * STEP 3 & 4: Payment provider processes payment and calls webhook
 * STEP 5: Backend commits stock and updates order to Paid
 */
exports.processPaymentSuccess = async (orderId, paymentData) => {
  const { payment_method, payment_transaction_id } = paymentData;

  // Get order
  const order = await exports.getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.payment_status === 'paid') {
    return order; // Already paid
  }

  // STEP 5: Commit stock (convert reserved to sold)
  for (const item of order.order_items || []) {
    if (item.variant?.track_inventory) {
      try {
        await inventoryService.commitStock({
          variant_id: item.variant_id,
          quantity: item.quantity,
          order_id: orderId,
        });
      } catch (error) {
        console.error(`Failed to commit stock for variant ${item.variant_id}:`, error);
        // Continue with other items
      }
    }
  }

  // Update order to Paid
  const { data: updatedOrder, error } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      payment_method: payment_method || null,
      payment_transaction_id: payment_transaction_id || null,
      status: 'confirmed', // Order confirmed after payment
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select('*, order_items(*)')
    .single();

  if (error) throw error;

  // Mark new user discount as used if this was the user's first paid order with discount
  if (order.user_id && updatedOrder.discount_amount > 0) {
    // Check if this is their first paid order (discount only applies to first order)
    const { data: previousOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', order.user_id)
      .eq('payment_status', 'paid')
      .neq('id', orderId)
      .limit(1);

    // If no previous paid orders and discount was applied, mark discount as used
    if (!previousOrders || previousOrders.length === 0) {
      await supabase
        .from('user_profiles')
        .update({ new_user_discount_used: true })
        .eq('id', order.user_id);
    }
  }

  // Add order event: Payment successful
  await addOrderEvent(orderId, 'payment_success', {
    message: 'Payment successful',
    payment_method,
    payment_transaction_id,
    status: 'confirmed',
    payment_status: 'paid',
  });

  // Broadcast payment success
  if (order.user_id) {
    realtimeService.broadcastToUser(order.user_id, 'payment_success', {
      order_id: orderId,
      order_number: order.order_number,
      payment_status: 'paid',
      status: 'confirmed',
    });
  }

  return updatedOrder;
};

/**
 * Handle payment failure
 * Release reserved stock
 */
exports.processPaymentFailure = async (orderId, reason) => {
  const order = await exports.getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Release reserved stock
  for (const item of order.order_items || []) {
    if (item.variant?.track_inventory) {
      try {
        await inventoryService.releaseStock({
          variant_id: item.variant_id,
          quantity: item.quantity,
          order_id: orderId,
        });
      } catch (error) {
        console.error(`Failed to release stock for variant ${item.variant_id}:`, error);
      }
    }
  }

  // Update order payment status
  const { data: updatedOrder, error } = await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select('*, order_items(*)')
    .single();

  if (error) throw error;

  // Add order event: Payment failed
  await addOrderEvent(orderId, 'payment_failed', {
    message: 'Payment failed',
    reason: reason || 'Payment processing failed',
    payment_status: 'failed',
  });

  // Broadcast payment failure
  if (order.user_id) {
    realtimeService.broadcastToUser(order.user_id, 'payment_failed', {
      order_id: orderId,
      order_number: order.order_number,
      payment_status: 'failed',
      reason,
    });
  }

  return updatedOrder;
};

/**
 * STEP 6: Admin prepares shipment
 * STEP 7: Backend updates order to Shipped
 */
exports.shipOrder = async (orderId, shipmentData) => {
  const { tracking_number, courier_name, tracking_url } = shipmentData;

  const order = await exports.getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status === 'shipped' || order.status === 'delivered') {
    throw new Error('Order already shipped or delivered');
  }

  // Update order to Shipped
  const { data: updatedOrder, error } = await supabase
    .from('orders')
    .update({
      status: 'shipped',
      tracking_number: tracking_number || null,
      shipped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select('*, order_items(*)')
    .single();

  if (error) throw error;

  // Add order event: Order shipped
  await addOrderEvent(orderId, 'order_shipped', {
    message: 'Order shipped',
    tracking_number,
    courier_name,
    tracking_url,
    status: 'shipped',
    shipped_at: updatedOrder.shipped_at,
  });

  // Broadcast order shipped
  if (order.user_id) {
    realtimeService.broadcastToUser(order.user_id, 'order_shipped', {
      order_id: orderId,
      order_number: order.order_number,
      status: 'shipped',
      tracking_number,
      courier_name,
      tracking_url,
    });
  }

  return updatedOrder;
};

/**
 * STEP 8: Courier updates tracking
 */
exports.updateTracking = async (orderId, trackingData) => {
  const { tracking_number, courier_name, tracking_url } = trackingData;

  const { data: updatedOrder, error } = await supabase
    .from('orders')
    .update({
      tracking_number: tracking_number || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select('*, order_items(*)')
    .single();

  if (error) throw error;

  // Add order event: Tracking updated
  await addOrderEvent(orderId, 'tracking_updated', {
    message: 'Tracking information updated',
    tracking_number,
    courier_name,
    tracking_url,
  });

  // Get order to find user_id
  const order = await exports.getOrderById(orderId);
  
  // Broadcast tracking update
  if (order?.user_id) {
    realtimeService.broadcastToUser(order.user_id, 'tracking_updated', {
      order_id: orderId,
      order_number: order.order_number,
      tracking_number,
      courier_name,
      tracking_url,
    });
  }

  return updatedOrder;
};

/**
 * STEP 9: Backend updates order to Delivered
 */
exports.deliverOrder = async (orderId) => {
  const order = await exports.getOrderById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status === 'delivered') {
    return order; // Already delivered
  }

  // Update order to Delivered
  const { data: updatedOrder, error } = await supabase
    .from('orders')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select('*, order_items(*)')
    .single();

  if (error) throw error;

  // Add order event: Order delivered
  await addOrderEvent(orderId, 'order_delivered', {
    message: 'Order delivered',
    status: 'delivered',
    delivered_at: updatedOrder.delivered_at,
  });

  // Broadcast order delivered
  if (order.user_id) {
    realtimeService.broadcastToUser(order.user_id, 'order_delivered', {
      order_id: orderId,
      order_number: order.order_number,
      status: 'delivered',
      delivered_at: updatedOrder.delivered_at,
    });
  }

  return updatedOrder;
};

/**
 * Get order by order number
 */
exports.getOrderByNumber = async (orderNumber) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, variant:variants(*), product:products(*))')
    .eq('order_number', orderNumber)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Get order by ID
 */
exports.getOrderById = async (id) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, variant:variants(*), product:products(*))')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Get user orders with timeline
 * Only returns orders for the specified user (enforced by user_id filter)
 */
exports.getUserOrders = async (userId, { limit = 50, offset = 0, status } = {}) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId) // Security: Only get user's own orders
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: orders, error } = await query;
  if (error) throw error;

  // Get timeline for each order
  const ordersWithTimeline = await Promise.all(
    orders.map(async (order) => {
      const timeline = await exports.getOrderTimeline(order.id);
      return { ...order, timeline };
    })
  );

  return ordersWithTimeline;
};

/**
 * Get order timeline/events (Amazon-style)
 */
exports.getOrderTimeline = async (orderId) => {
  // For now, we'll create timeline from order status changes
  // In future, can add dedicated order_events table
  const order = await exports.getOrderById(orderId);
  if (!order) return [];

  const timeline = [];

  // Order created
  timeline.push({
    event: 'order_created',
    message: 'Order placed',
    timestamp: order.created_at,
    status: 'pending',
    icon: '📦',
  });

  // Payment success
  if (order.payment_status === 'paid') {
    timeline.push({
      event: 'payment_success',
      message: 'Payment received',
      timestamp: order.updated_at,
      status: 'confirmed',
      icon: '✅',
    });
  }

  // Payment failed
  if (order.payment_status === 'failed') {
    timeline.push({
      event: 'payment_failed',
      message: 'Payment failed',
      timestamp: order.updated_at,
      status: 'pending',
      icon: '❌',
    });
  }

  // Order cancelled
  if (order.status === 'cancelled') {
    timeline.push({
      event: 'order_cancelled',
      message: 'Order cancelled',
      timestamp: order.updated_at,
      status: 'cancelled',
      icon: '🚫',
    });
  }

  // Order shipped
  if (order.shipped_at) {
    timeline.push({
      event: 'order_shipped',
      message: order.tracking_number 
        ? `Shipped via ${order.tracking_number}`
        : 'Order shipped',
      timestamp: order.shipped_at,
      status: 'shipped',
      tracking_number: order.tracking_number,
      icon: '🚚',
    });
  }

  // Order delivered
  if (order.delivered_at) {
    timeline.push({
      event: 'order_delivered',
      message: 'Order delivered',
      timestamp: order.delivered_at,
      status: 'delivered',
      icon: '🎉',
    });
  }

  // Sort by timestamp
  return timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

/**
 * Add order event to timeline
 * Note: This is a simplified version. In production, use a dedicated order_events table
 */
async function addOrderEvent(orderId, eventType, eventData) {
  // For now, we store events in order's admin_notes or use a separate events table
  // This is a placeholder - implement proper event logging
  console.log(`Order Event [${orderId}]: ${eventType}`, eventData);
  
  // TODO: Create order_events table and store events there
  // For now, events are derived from order status changes
}

/**
 * Update order status
 */
exports.updateOrderStatus = async (id, { status, tracking_number, admin_notes, updated_by }) => {
  const updateData = {
    updated_at: new Date().toISOString(),
  };

  if (status) {
    updateData.status = status;
    if (status === 'shipped' && !updateData.shipped_at) {
      updateData.shipped_at = new Date().toISOString();
    }
    if (status === 'delivered' && !updateData.delivered_at) {
      updateData.delivered_at = new Date().toISOString();
    }
  }
  if (tracking_number) updateData.tracking_number = tracking_number;
  if (admin_notes) updateData.admin_notes = admin_notes;

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select('*, order_items(*)')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Order not found');
    }
    throw error;
  }

  // Add event
  if (status) {
    await addOrderEvent(id, 'status_updated', {
      message: `Order status updated to ${status}`,
      status,
      updated_by,
    });
  }

  return data;
};

/**
 * Update payment status
 */
exports.updatePaymentStatus = async (id, { payment_status, payment_method, payment_transaction_id }) => {
  // Use the new processPaymentSuccess/processPaymentFailure methods instead
  if (payment_status === 'paid') {
    return await exports.processPaymentSuccess(id, { payment_method, payment_transaction_id });
  } else if (payment_status === 'failed') {
    return await exports.processPaymentFailure(id, 'Payment failed');
  }

  // For other statuses, just update
  const updateData = {
    payment_status,
    updated_at: new Date().toISOString(),
  };

  if (payment_method) updateData.payment_method = payment_method;
  if (payment_transaction_id) updateData.payment_transaction_id = payment_transaction_id;

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select('*, order_items(*)')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Order not found');
    }
    throw error;
  }
  return data;
};

/**
 * Cancel order
 */
exports.cancelOrder = async (id, userId) => {
  const order = await exports.getOrderById(id);
  if (!order) {
    throw new Error('Order not found');
  }

  // Check if user owns the order or is admin
  if (order.user_id !== userId) {
    throw new Error('Access denied');
  }

  // Can only cancel pending or confirmed orders
  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new Error('Order cannot be cancelled at this stage');
  }

  // Release reserved stock
  for (const item of order.order_items || []) {
    if (item.variant?.track_inventory) {
      try {
        await inventoryService.releaseStock({
          variant_id: item.variant_id,
          quantity: item.quantity,
          order_id: id,
        });
      } catch (error) {
        console.error(`Failed to release stock for variant ${item.variant_id}:`, error);
      }
    }
  }

  // Update order status
  const updatedOrder = await exports.updateOrderStatus(id, {
    status: 'cancelled',
    admin_notes: `Cancelled by user ${userId}`,
  });

  // Add event
  await addOrderEvent(id, 'order_cancelled', {
    message: 'Order cancelled',
    status: 'cancelled',
    cancelled_by: userId,
  });

  return updatedOrder;
};

/**
 * Get all orders (admin)
 */
exports.getAllOrders = async ({ limit = 50, offset = 0, status, payment_status } = {}) => {
  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (status) query = query.eq('status', status);
  if (payment_status) query = query.eq('payment_status', payment_status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Get order statistics (admin)
 */
exports.getOrderStats = async () => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('status, payment_status, total_amount');

  if (error) throw error;

  const stats = {
    total_orders: orders.length,
    total_revenue: orders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0),
    by_status: {},
    by_payment_status: {},
  };

  orders.forEach(order => {
    stats.by_status[order.status] = (stats.by_status[order.status] || 0) + 1;
    stats.by_payment_status[order.payment_status] = (stats.by_payment_status[order.payment_status] || 0) + 1;
  });

  return stats;
};
