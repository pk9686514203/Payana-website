import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Vehicle Schema (if model not imported)
const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['car', 'suv', 'van', 'bus', 'bike'],
      required: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerKm: {
      type: Number,
      required: true,
      default: 0,
    },
    location: {
      type: String,
      required: true,
    },
    image: String,
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    features: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// Comprehensive vehicle seed data
const vehicles = [
  {
    name: 'Toyota Innova',
    type: 'car',
    seats: 7,
    pricePerKm: 12,
    location: 'Bengaluru',
    image: 'https://via.placeholder.com/300?text=Toyota+Innova',
    rating: 4.8,
    verified: true,
    available: true,
    features: ['AC', 'WiFi', 'USB Charging', 'Comfortable Seating'],
  },
  {
    name: 'Mahindra XUV500',
    type: 'suv',
    seats: 7,
    pricePerKm: 15,
    location: 'Mysuru',
    image: 'https://via.placeholder.com/300?text=XUV500',
    rating: 4.6,
    verified: true,
    available: true,
    features: ['AC', 'Power Steering', 'ABS', 'Audio System'],
  },
  {
    name: 'Force Traveller',
    type: 'van',
    seats: 14,
    pricePerKm: 18,
    location: 'Chennai',
    image: 'https://via.placeholder.com/300?text=Force+Traveller',
    rating: 4.7,
    verified: true,
    available: true,
    features: ['AC', 'Spacious Interior', 'First Aid Kit', 'Safety Equipment'],
  },
  {
    name: 'Volvo Coach',
    type: 'bus',
    seats: 42,
    pricePerKm: 25,
    location: 'Hyderabad',
    image: 'https://via.placeholder.com/300?text=Volvo+Coach',
    rating: 4.9,
    verified: true,
    available: true,
    features: ['AC', 'Reclining Seats', 'Onboard Toilet', 'WiFi'],
  },
  {
    name: 'Tempo Traveller',
    type: 'van',
    seats: 12,
    pricePerKm: 16,
    location: 'Coimbatore',
    image: 'https://via.placeholder.com/300?text=Tempo+Traveller',
    rating: 4.5,
    verified: true,
    available: true,
    features: ['AC', 'Spacious Cargo', 'Good Suspension', 'Audio System'],
  },
  {
    name: 'Royal Enfield Bullet',
    type: 'bike',
    seats: 2,
    pricePerKm: 8,
    location: 'Ooty',
    image: 'https://via.placeholder.com/300?text=Royal+Enfield',
    rating: 4.7,
    verified: true,
    available: true,
    features: ['Fuel Efficient', 'Reliable', 'Classic Design', 'Smooth Ride'],
  },
  {
    name: 'Skoda Superb',
    type: 'car',
    seats: 5,
    pricePerKm: 14,
    location: 'Bengaluru',
    image: 'https://via.placeholder.com/300?text=Skoda+Superb',
    rating: 4.8,
    verified: true,
    available: true,
    features: ['AC', 'Leather Seats', 'Advanced Audio', 'Sunroof'],
  },
  {
    name: 'Hummer H2',
    type: 'suv',
    seats: 6,
    pricePerKm: 20,
    location: 'Goa',
    image: 'https://via.placeholder.com/300?text=Hummer+H2',
    rating: 4.4,
    verified: true,
    available: true,
    features: ['AC', 'Premium Interior', 'Entertainment System', 'GPS Navigation'],
  },
  {
    name: 'Mercedes Sprinter',
    type: 'van',
    seats: 16,
    pricePerKm: 22,
    location: 'Munnar',
    image: 'https://via.placeholder.com/300?text=Mercedes+Sprinter',
    rating: 4.6,
    verified: true,
    available: true,
    features: ['AC', 'Luxury Interior', 'Luggage Space', 'Premium Service'],
  },
  {
    name: 'Tata Harrier',
    type: 'suv',
    seats: 5,
    pricePerKm: 13,
    location: 'Pune',
    image: 'https://via.placeholder.com/300?text=Tata+Harrier',
    rating: 4.7,
    verified: true,
    available: true,
    features: ['AC', 'Touchscreen Display', 'Apple CarPlay', 'Safety Features'],
  },
];

/**
 * Seed vehicles into MongoDB
 * Usage: node seed.js
 */
const seedVehicles = async () => {
  try {
    // Validate MONGO_URI
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined. Check your .env file.');
    }

    console.log('🔗 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing vehicles
    console.log('🧹 Clearing existing vehicles...');
    const deletedCount = await Vehicle.deleteMany({});
    console.log(`   Deleted ${deletedCount.deletedCount} vehicles`);

    // Insert new vehicles
    console.log('📝 Inserting vehicles...');
    const result = await Vehicle.insertMany(vehicles);
    console.log(`✅ Inserted ${result.length} vehicles successfully`);

    // Display inserted data
    console.log('\n📊 Vehicle Summary:');
    const vehicleTypes = await Vehicle.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricePerKm' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log('   Type       | Count | Avg Price/km');
    console.log('   -----------|-------|-------------');
    vehicleTypes.forEach((v) => {
      console.log(
        `   ${v._id.padEnd(10)} | ${String(v.count).padEnd(5)} | ₹${v.avgPrice.toFixed(2)}`
      );
    });

    const totalVehicles = await Vehicle.countDocuments();
    console.log(`\n   Total Vehicles: ${totalVehicles}`);

    console.log('\n✨ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding vehicles:', error.message);
    if (error.name === 'MongoServerError') {
      console.error('   MongoDB Server Error:', error.message);
    }
    if (error.name === 'MongoNetworkError') {
      console.error('   Network Error: Unable to connect to MongoDB');
      console.log('   Check your MONGO_URI and ensure MongoDB is running');
    }
    if (error.name === 'ValidationError') {
      console.error('   Validation Error:', error.message);
    }
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
};

// Run seeding
seedVehicles();