import 'dotenv/config';
import mongoose from 'mongoose';
import Car from '../models/Car.js';
import User from '../models/User.js';

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'harishvicky07@gmail.com' });
    
    if (!existingAdmin) {
      // Create admin user with your credentials
      const admin = new User({
        email: 'harishvicky07@gmail.com',
        password: '123456',
        role: 'admin',
      });
      await admin.save();
      console.log('✅ Admin user created: harishvicky07@gmail.com');
    } else {
      console.log('⚠️ Admin user already exists');
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
