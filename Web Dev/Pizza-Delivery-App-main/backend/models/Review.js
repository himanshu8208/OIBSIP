import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pizza: { type: mongoose.Schema.Types.ObjectId, ref: 'Pizza', required: true },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5
    },
    comment: { type: String, required: [true, 'Please write your feedback comment'] }
  },
  { timestamps: true }
);

// Compound index so that a user can only leave one review per pizza
ReviewSchema.index({ user: 1, pizza: 1 }, { unique: true });

const Review = mongoose.model('Review', ReviewSchema);
export default Review;
