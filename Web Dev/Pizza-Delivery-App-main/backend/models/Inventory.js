import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ['base', 'sauce', 'cheese', 'veggie', 'meat'],
      required: [true, 'Please specify stock item type']
    },
    itemName: { type: String, required: [true, 'Please provide an item name'], unique: true },
    quantity: { type: Number, required: [true, 'Please provide the quantity in stock'], default: 100 },
    threshold: { type: Number, required: [true, 'Please provide low-stock warning threshold'], default: 15 },
    price: { type: Number, required: [true, 'Please provide custom pizza addition price'], default: 0 },
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Inventory = mongoose.model('Inventory', InventorySchema);
export default Inventory;
