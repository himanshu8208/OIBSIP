import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  pizza: { type: mongoose.Schema.Types.ObjectId, ref: 'Pizza' },
  isCustom: { type: Boolean, default: false },
  customPizzaDetails: {
    base: { type: String },
    sauce: { type: String },
    cheeses: [{ type: String }],
    veggies: [{ type: String }],
    meats: [{ type: String }]
  },
  quantity: { type: Number, default: 1, min: 1 },
  size: { type: String, enum: ['Small', 'Medium', 'Large'], default: 'Medium' },
  price: { type: Number, required: true }
});

const CartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema]
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', CartSchema);
export default Cart;
