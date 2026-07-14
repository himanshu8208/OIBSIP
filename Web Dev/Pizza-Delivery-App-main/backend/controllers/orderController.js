import Order from '../models/Order.js';
import Inventory from '../models/Inventory.js';
import User from '../models/User.js';
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/paymentService.js';
import { sendOrderConfirmationEmail, sendStockAlertEmail } from '../services/emailService.js';

// @desc    Place a new pending order & generate Razorpay order ID
// @route   POST /api/orders
// @access  Private
export const placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // 1. Verify and deduct stock from inventory for customized toppings
    for (const item of items) {
      if (item.isCustom && item.customPizzaDetails) {
        // Collect all ingredient names from this custom builder pizza
        const ingredientsToDeduct = [
          item.customPizzaDetails.base,
          item.customPizzaDetails.sauce,
          ...(item.customPizzaDetails.cheeses || []),
          ...(item.customPizzaDetails.veggies || []),
          ...(item.customPizzaDetails.meats || [])
        ].filter(Boolean);

        for (const itemName of ingredientsToDeduct) {
          const invItem = await Inventory.findOne({ itemName });
          if (invItem) {
            // Check if we have enough stock available
            if (invItem.quantity < item.quantity) {
              return res.status(400).json({
                success: false,
                message: `Sorry, ${itemName} is currently out of stock. Please edit your custom pizza.`
              });
            }

            // Deduct stock count
            invItem.quantity = Math.max(0, invItem.quantity - item.quantity);
            await invItem.save();

            // Check if stock has dropped below alert threshold
            if (invItem.quantity < invItem.threshold) {
              console.log(`[Inventory Alert] ${itemName} is low in stock: ${invItem.quantity} units!`);
              // Find administrator accounts
              try {
                const admins = await User.find({ role: 'admin' });
                for (const adminUser of admins) {
                  await sendStockAlertEmail(adminUser.email, invItem.itemName, invItem.quantity, invItem.threshold);
                }
              } catch (alertError) {
                console.error('[Inventory Alert] Failed to dispatch stock emails:', alertError.message);
              }
            }
          }
        }
      }
    }

    // 2. Generate Razorpay order reference
    const receiptId = `receipt_order_${Date.now()}`;
    const razorpayOrder = await createRazorpayOrder(totalAmount, receiptId);

    // 3. Create database Order entry (Pending state)
    const deliveryETA = new Date(Date.now() + 35 * 60000); // 35 minutes default

    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount,
      deliveryAddress,
      deliveryETA,
      paymentStatus: 'Pending',
      paymentDetails: {
        razorpayOrderId: razorpayOrder.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order placed! Complete transaction to verify.',
      order,
      razorpayOrder
    });
  } catch (error) {
    console.error('[Order Controller] Place order error:', error.message);
    res.status(500).json({ success: false, message: 'Server error processing order details' });
  }
};

// @desc    Verify payment signature & update database status
// @route   POST /api/orders/verify
// @access  Private
export const verifyOrderPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // 1. Verify Razorpay Payment Signature
    const isSignatureValid = verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    const order = await Order.findById(orderId).populate('items.pizza');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order reference not found' });
    }

    if (isSignatureValid) {
      // 2. Update order payment status
      order.paymentStatus = 'Paid';
      order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
      order.paymentDetails.razorpaySignature = razorpaySignature;
      await order.save();

      // 3. Send Order Confirmation Email
      try {
        const user = await User.findById(req.user.id);
        await sendOrderConfirmationEmail(user.email, user.name, order);
      } catch (emailError) {
        console.error('[Order Controller] Order email notification failed:', emailError.message);
      }

      // 4. Emit real-time tracking update through WebSocket
      const io = req.app.get('io');
      if (io) {
        io.to(order.user.toString()).emit('orderStatusUpdated', {
          orderId: order._id,
          orderStatus: order.orderStatus,
          deliveryETA: order.deliveryETA,
          message: 'Order paid successfully!'
        });
      }

      res.status(200).json({ success: true, message: 'Payment verified and completed successfully!', order });
    } else {
      order.paymentStatus = 'Failed';
      await order.save();
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('[Order Controller] Verify payment error:', error.message);
    res.status(500).json({ success: false, message: 'Server error verifying signature' });
  }
};

// @desc    Get orders for current user
// @route   GET /api/orders/my-orders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.pizza')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('[Order Controller] Get user orders error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving order logs' });
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.pizza').populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Block standard users from requesting other profiles' records
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order record' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('[Order Controller] Get order ID error:', error.message);
    res.status(500).json({ success: false, message: 'Server error loading order details' });
  }
};

// @desc    Get all orders (Admin operations panel)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('items.pizza')
      .populate('user', 'name email')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('[Order Controller] Admin loading orders error:', error.message);
    res.status(500).json({ success: false, message: 'Server error loading admin order list' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order reference not found' });
    }

    order.orderStatus = orderStatus;

    // Adjust ETA dynamically based on current tracking status
    if (orderStatus === 'Delivered') {
      order.deliveryETA = new Date();
    } else if (orderStatus === 'Preparing') {
      order.deliveryETA = new Date(Date.now() + 25 * 60000);
    } else if (orderStatus === 'In Kitchen') {
      order.deliveryETA = new Date(Date.now() + 15 * 60000);
    } else if (orderStatus === 'Out for Delivery') {
      order.deliveryETA = new Date(Date.now() + 8 * 60000);
    }

    await order.save();

    // Emit live updates instantly to tracking client
    const io = req.app.get('io');
    if (io) {
      console.log(`[Socket.IO] Emitting status change to room ${order.user.toString()}: ${orderStatus}`);
      io.to(order.user.toString()).emit('orderStatusUpdated', {
        orderId: order._id,
        orderStatus: order.orderStatus,
        deliveryETA: order.deliveryETA,
        message: `Your order status was updated to: ${orderStatus}`
      });
    }

    res.status(200).json({ success: true, message: 'Status updated successfully!', order });
  } catch (error) {
    console.error('[Order Controller] Update status error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating order tracking status' });
  }
};
