import Order from '../models/Order.js';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import Pizza from '../models/Pizza.js';

// @desc    Retrieve overall analytics metrics for Admin Dashboard
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalyticsDashboardStats = async (req, res) => {
  try {
    // 1. Calculate overall financial revenue (Paid orders only)
    const paidOrders = await Order.find({ paymentStatus: 'Paid' });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const paidOrdersCount = paidOrders.length;
    const averageOrderValue = paidOrdersCount > 0 ? Math.round(totalRevenue / paidOrdersCount) : 0;

    // 2. Count metrics
    const totalOrdersCount = await Order.countDocuments({});
    const activeUsersCount = await User.countDocuments({ role: 'user' });
    
    // 3. Count inventory warnings
    const lowStockCount = await Inventory.countDocuments({
      $expr: { $lt: ['$quantity', '$threshold'] }
    });

    // 4. Retrieve recent active orders
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.pizza')
      .sort('-createdAt')
      .limit(5);

    // 5. Gather category popularity statistics
    const pizzaDetails = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.isCustom': false } },
      {
        $group: {
          _id: '$items.pizza',
          count: { $sum: '$items.quantity' }
        }
      }
    ]);

    // Populate pizza names to categorize veg vs non-veg
    let vegCount = 0;
    let nonVegCount = 0;
    let customCount = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.isCustom': true } },
      { $group: { _id: null, total: { $sum: '$items.quantity' } } }
    ]);

    const customPizzasOrdered = customCount[0]?.total || 0;

    for (const group of pizzaDetails) {
      const p = await Pizza.findById(group._id);
      if (p) {
        if (p.category === 'veg') vegCount += group.count;
        else nonVegCount += group.count;
      }
    }

    // 6. Generate 7-day daily performance records (Recharts ready!)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: 'Paid'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format stats with day names for visual charting
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = dailyStats.find(item => item._id === dateStr);

      chartData.push({
        day: dayNames[d.getDay()],
        date: dateStr,
        revenue: match ? match.revenue : 0,
        orders: match ? match.orders : 0
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrdersCount,
        activeUsersCount,
        lowStockCount,
        vegCount,
        nonVegCount,
        customPizzasOrdered,
        recentOrders,
        chartData,
        averageOrderValue,
        paidOrdersCount
      }
    });
  } catch (error) {
    console.error('[Admin Analytics] Fetch error:', error.message);
    res.status(500).json({ success: false, message: 'Server error loading dashboard analytics statistics' });
  }
};

// @desc    Retrieve all users registered
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('[Admin Users] Query error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving system user accounts' });
  }
};
