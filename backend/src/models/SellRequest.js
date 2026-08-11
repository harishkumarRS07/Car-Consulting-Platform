import mongoose from 'mongoose';

const sellRequestSchema = new mongoose.Schema(
  {
    // Request Tracking
    requestId: {
      type: String,
      unique: true,
      sparse: true,
    },
    bookingId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Customer Information
    ownerName: {
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
    },

    // Vehicle Information
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
    variant: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },

    // Inspection Information
    fuelType: {
      type: String,
      trim: true,
    },
    transmission: {
      type: String,
      trim: true,
      default: 'Manual',
    },
    kmDriven: {
      type: String,
      trim: true,
    },
    ownership: {
      type: String,
      trim: true,
    },

    // Registration Info
    registrationState: {
      type: String,
      trim: true,
      default: 'Karnataka',
    },
    registrationCity: {
      type: String,
      trim: true,
    },

    // Pricing & Description
    expectedPrice: {
      type: Number,
      default: 500000,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },

    // Cloudinary Images
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],

    // Status System
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Inspection Scheduled', 'Offer Sent', 'Purchased', 'Rejected'],
      default: 'Pending',
    },

    // Backward Compatibility / Legacy Form Fields
    name: {
      type: String,
      trim: true,
    },
    owner: {
      type: String,
      trim: true,
    },
    kms: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      trim: true,
    },
    timeSlot: {
      type: String,
      trim: true,
    },
    whatsappConsent: {
      type: Boolean,
      default: true,
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

// Static method to generate sequential Request ID (SCR-1001, SCR-1002...)
sellRequestSchema.statics.generateNextRequestId = async function () {
  try {
    const lastRequest = await this.findOne(
      { requestId: /^SCR-\d+$/ },
      {},
      { sort: { requestId: -1 } }
    );

    let nextNum = 1001;
    if (lastRequest && lastRequest.requestId) {
      const matches = lastRequest.requestId.match(/SCR-(\d+)/);
      if (matches && matches[1]) {
        nextNum = parseInt(matches[1]) + 1;
      }
    }
    return `SCR-${nextNum}`;
  } catch (err) {
    console.error('Error generating sequential requestId, using timestamp fallback:', err);
    return `SCR-${  Math.floor(1000 + Math.random() * 9000)}`;
  }
};

// Pre-save hook to generate sequential Request ID (SCR-1001, SCR-1002...) and bookingId
sellRequestSchema.pre('save', async function (next) {
  if (!this.requestId) {
    this.requestId = await mongoose.model('SellRequest').generateNextRequestId();
  }

  // Populate bookingId for backwards compatibility
  if (!this.bookingId) {
    this.bookingId = this.requestId;
  }
  
  next();
});

export default mongoose.model('SellRequest', sellRequestSchema);

