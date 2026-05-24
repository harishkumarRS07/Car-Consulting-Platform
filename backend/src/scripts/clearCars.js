import 'dotenv/config';
import mongoose from 'mongoose';
import Car from '../models/Car.js';

const clearCars = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const result = await Car.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} cars from database`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing cars:', error);
    process.exit(1);
  }
};

clearCars();
