const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'digital wallet'],
    required: true
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true,
        min: 0
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
