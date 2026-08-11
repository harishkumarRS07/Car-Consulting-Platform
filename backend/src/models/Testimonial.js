import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    review: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
    },
    carName: {
      type: String,
      required: [true, 'Purchased car name is required'],
      trim: true,
    },
    customerPhoto: {
      type: String,
      required: [true, 'Customer photo is required'],
    },
    carPhoto: {
      type: String,
      required: [true, 'Car photo is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    status: {
      type: String,
      enum: ['active', 'hidden'],
      default: 'active',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index to support sorting by displayOrder and search queries
testimonialSchema.index({ displayOrder: 1, createdAt: -1 });
testimonialSchema.index({ customerName: 'text', carName: 'text', review: 'text' });

export default mongoose.model('Testimonial', testimonialSchema);
