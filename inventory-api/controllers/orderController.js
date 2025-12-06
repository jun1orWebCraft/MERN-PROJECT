const Order = require('../models/Order');

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate('products.productId');

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.productId');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching order', error: error.message });
  }
};

// Create order
exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ success: true, message: 'Order created successfully', data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating order', error: error.message });
  }
};

// Update order
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, message: 'Order updated successfully', data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating order', error: error.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, message: 'Order deleted successfully', data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting order', error: error.message });
  }
};

// Get the last order
exports.getLastOrder = async (req, res) => {
  try {
    const lastOrder = await Order.findOne().sort({ createdAt: -1 }).populate('products.productId');
    if (!lastOrder) return res.status(404).json({ success: false, message: 'No orders found' });
    res.status(200).json({ success: true, data: lastOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching last order', error: error.message });
  }
};
