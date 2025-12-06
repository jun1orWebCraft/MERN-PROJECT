const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,   // this already creates an index
    trim: true,
    uppercase: true
  },
  imageUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Text index for searching
productSchema.index({ name: 'text', description: 'text' });

// Index for category (optional but helpful)
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
