import 'dotenv/config';
import mongoose from 'mongoose';
import Car from '../models/Car.js';

const seedBrands = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // List of brands that have icon files
    const brandsToAdd = [
      'Toyota',
      'Honda',
      'Hyundai',
      'Kia',
      'Nissan',
      'Suzuki',
      'Ford',
      'Mazda',
      'Mitsubishi',
      'GMC',
      'Mercedes-Benz',
      'Mopar',
    ];

    // Check if brands already exist
    const existingBrands = await Car.distinct('brand');
    console.log('Existing brands in database:', existingBrands);

    // Add missing brands by creating sample cars
    for (const brand of brandsToAdd) {
      const brandExists = existingBrands.some(b => b.toLowerCase() === brand.toLowerCase());
      
      if (!brandExists) {
        // Create a sample car for this brand to ensure brand exists
        const sampleCar = new Car({
          title: `${brand} Sample Car`,
          brand: brand,
          model: 'Sample',
          price: 500000,
          fuelType: 'petrol',
          transmission: 'manual',
          kmsDriven: 0,
          year: 2023,
          bodyType: 'sedan',
          color: 'silver',
          seats: 5,
          owner: '1st',
          location: 'India',
          rto: 'TEST',
          description: `Sample ${brand} car`,
          features: [],
          category: 'budget',
          availability: 'in-stock',
          images: ['https://via.placeholder.com/600x400?text=' + brand],
          rating: 0,
          reviews: 0,
        });
        
        await sampleCar.save();
        console.log(`✅ Added brand: ${brand}`);
      } else {
        console.log(`⏭️  Brand already exists: ${brand}`);
      }
    }

    // Get all unique brands from database
    const allBrands = await Car.distinct('brand');
    console.log(`\n📊 Total brands in database: ${allBrands.length}`);
    console.log('All brands:', allBrands);

    await mongoose.connection.close();
    console.log('\n✅ Brand seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding brands:', error);
    process.exit(1);
  }
};

seedBrands();
