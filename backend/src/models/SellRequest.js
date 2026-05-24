import mongoose from 'mongoose';

const sellRequestSchema = new mongoose.Schema(
  {
    // Car Details
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    variant: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: String,
      required: true,
      trim: true,
    },
    kms: {
      type: String,
      required: true,
    },

    // Seller Details
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})?$/, 'Please provide a valid email address'],
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },

    // Scheduling
    date: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },

    // Status & Tracking
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    bookingId: {
      type: String,
      unique: true,
      sparse: true,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    whatsappMessageId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Generate booking ID before saving
sellRequestSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    this.bookingId = 'BK' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

export default mongoose.model('SellRequest', sellRequestSchema);
