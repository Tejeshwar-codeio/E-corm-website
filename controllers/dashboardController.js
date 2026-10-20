import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/dashboard/analytics
// @access  Private/Admin
const getDashboardAnalytics = async (req, res) => {
  try {
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();
    const usersCount = await User.countDocuments({ isAdmin: false });

    // Calculate total sales
    const salesData = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalPrice' }
        }
      }
    ]);
    const totalSales = salesData[0]?.totalSales || 0;

    // Monthly Sales Aggregation
    const monthlySales = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: {
            month: { $month: '$paidAt' },
            year: { $year: '$paidAt' }
          },
          sales: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly sales for charts
    const monthlySalesFormatted = monthlySales.map((item) => {
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return {
        name: `${months[item._id.month - 1]} ${item._id.year}`,
        sales: item.sales,
        orders: item.count
      };
    });

    // Category Sales Distribution (Aggregation on Order items)
    const categorySales = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          value: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0
        }
      }
    ]);

    // Low stock inventory warnings (countInStock < 10)
    const lowStockAlerts = await Product.find({ countInStock: { $lt: 10 } })
      .select('name price countInStock category brand')
      .limit(10);

    // Latest Orders
    const latestOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      summary: {
        productsCount,
        ordersCount,
        usersCount,
        totalSales
      },
      monthlySales: monthlySalesFormatted,
      categorySales,
      lowStockAlerts,
      latestOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getDashboardAnalytics };
