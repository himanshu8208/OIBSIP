import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  pizza: { type: mongoose.Schema.Types.ObjectId, ref: 'Pizza' }, // Reference to menu pizza, optional if fully custom
  isCustom: { type: Boolean, default: false },
  customPizzaDetails: {
    base: { type: String },
    sauce: { type: String },
    cheeses: [{ type: String }],
    veggies: [{ type: String }],
    meats: [{ type: String }]
  },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  size: { type: String, enum: ['Small', 'Medium', 'Large'], default: 'Medium' },
  price: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending'
    },
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String
    },
    orderStatus: {
      type: String,
      enum: ['Order Received', 'Preparing', 'In Kitchen', 'Out for Delivery', 'Delivered'],
      default: 'Order Received'
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true }
    },
    deliveryETA: { type: Date }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);
export default Order;
