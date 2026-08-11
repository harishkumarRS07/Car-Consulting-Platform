import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const adminEmail = process.env.ADMIN_EMAIL || 'harishvicky07@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || '123456';

    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      // Create admin user with credentials from environment
      const admin = new User({
        name: 'Admin User',
        phone: '9999999999', // Provide a mock phone number to pass User model validation
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      await admin.save();
      console.log(`✅ Admin user created: ${adminEmail}`);
    } else {
      console.log(`⚠️ Admin user already exists (${adminEmail})`);
    }

    // Seed Testimonials
    const Testimonial = (await import('../models/Testimonial.js')).default;
    const existingTestimonialsCount = await Testimonial.countDocuments();
    if (existingTestimonialsCount === 0) {
      const sampleTestimonials = [
        {
          customerName: "Devendra K.",
          city: "Pune",
          review: "The best car purchasing experience I have ever had. The transparency and attention to detail were second to none. Truly elite.",
          carName: "Porsche Panamera",
          customerPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
          carPhoto: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
          rating: 5,
          status: "active",
          displayOrder: 1
        },
        {
          customerName: "Anita R.",
          city: "Mumbai",
          review: "Selling my luxury sedan was incredibly fast and easy. The team handled everything and got me a great valuation in hours.",
          carName: "Audi A6",
          customerPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
          carPhoto: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80",
          rating: 5,
          status: "active",
          displayOrder: 2
        },
        {
          customerName: "Harish S.",
          city: "Bangalore",
          review: "Superb customer service! The certified inspection gave me total peace of mind when buying my luxury SUV. Highly recommend.",
          carName: "BMW X5",
          customerPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
          carPhoto: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
          rating: 5,
          status: "active",
          displayOrder: 3
        },
        {
          customerName: "Rahul M.",
          city: "Delhi",
          review: "Excellent response and very quick handling of RC transfer. Vishnu Car Consulting is by far the most professional broker in town.",
          carName: "Mercedes E-Class",
          customerPhoto: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
          carPhoto: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
          rating: 5,
          status: "active",
          displayOrder: 4
        }
      ];
      await Testimonial.insertMany(sampleTestimonials);
      console.log('✅ Sample testimonials seeded successfully!');
    }

    // Sample cars data removed - add cars through admin dashboard

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
