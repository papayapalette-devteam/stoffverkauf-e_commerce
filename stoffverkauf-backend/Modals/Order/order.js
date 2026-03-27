const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  price: Number,
  quantity: Number,
  variant: {
    color: String,
    size: String,
    pattern: String
  }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  items: [OrderItemSchema],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    zip: String,
    country: String,
    phone: String,
    email: String
  },
  paymentMethod: {
    type: String, // 'stripe', 'paypal', etc.
    required: true
  },
  paymentResult: {
    id: String, // transaction ID
    status: String,
    update_time: String,
    email_address: String,
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  trackingNumber: String,
  discount: {
    type: Number,
    default: 0
  },
  appliedCoupon: {
    type: String,
    default: ""
  },
  viewedByAdmin: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
