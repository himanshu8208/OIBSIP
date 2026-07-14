import mongoose from 'mongoose';

const PizzaSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please provide a pizza name'], unique: true },
    description: { type: String, required: [true, 'Please provide a description'] },
    category: {
      type: String,
      enum: ['veg', 'non-veg'],
      required: [true, 'Please specify if pizza is veg or non-veg']
    },
    basePrice: { type: Number, required: [true, 'Please provide a base price'] },
    rating: { type: Number, default: 4.5 },
    reviewsCount: { type: Number, default: 0 },
    ingredients: [{ type: String }],
    image: { type: String, required: [true, 'Please provide a pizza image URL'] },
    sizes: [
      {
        size: { type: String, enum: ['Small', 'Medium', 'Large'], required: true },
        priceMultiplier: { type: Number, required: true, default: 1.0 }
      }
    ],
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Pizza = mongoose.model('Pizza', PizzaSchema);
export default Pizza;
