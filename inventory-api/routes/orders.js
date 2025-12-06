const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getLastOrder,  // <-- imported from controller
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Routes for /api/orders
router.route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router.route('/last')           // Route to get the last order
  .get(protect, getLastOrder);

router.route('/:id')
  .get(protect, getOrder)
  .put(protect, updateOrder)
  .delete(protect, deleteOrder);

module.exports = router;
