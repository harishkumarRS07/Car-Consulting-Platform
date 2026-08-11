import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Car title is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      lowercase: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      lowercase: true,
    },
    variant: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'cng', 'electric', 'hybrid'],
      required: [true, 'Fuel type is required'],
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic'],
      required: [true, 'Transmission is required'],
    },
    kmsDriven: {
      type: Number,
      required: [true, 'KMs driven is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    bodyType: {
      type: String,
      enum: ['sedan', 'suv', 'hatchback', 'muv', 'coupe', 'convertible', 'sports'],
      required: [true, 'Body type is required'],
      lowercase: true,
      trim: true,
    },
    color: {
      type: String,
      lowercase: true,
    },
    seats: {
      type: Number,
      default: 5,
    },
    owner: {
      type: String,
      enum: ['1st', '2nd', '3rd', 'more'],
      default: '1st',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    rto: {
      type: String,
    },
    description: {
      type: String,
      default: '',
    },
    features: [
      {
        type: String,
        enum: ['sunroof', 'abs', 'airbags', 'power-steering', 'leather-seats', 'climate-control', 'touchscreen', 'gps', 'parking-sensors', 'backup-camera'],
      },
    ],
    category: {
      type: String,
      enum: ['budget', 'assured', 'luxury'],
      default: 'budget',
    },
    availability: {
      type: String,
      enum: ['in-stock', 'booked', 'upcoming', 'sold'],
      default: 'in-stock',
    },
    images: {
      type: [String],
      default: [
        'https://via.placeholder.com/600x400?text=Car+Image+1',
        'https://via.placeholder.com/600x400?text=Car+Image+2',
      ],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create indexes for better query performance
carSchema.index({ brand: 1, price: 1, year: 1 });
carSchema.index({ title: 'text', description: 'text' });
carSchema.index({ location: 1 });

export default mongoose.model('Car', carSchema);
