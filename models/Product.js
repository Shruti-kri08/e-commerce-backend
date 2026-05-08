const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: [
      'fashion',
      'food',
      'electronics',
      'grocery',
      'cosmetics',
      'perfume',
      'equipment',
      'book',
      'toys',
      'other'
    ],
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  imageId: {
    type: String,
    required: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);