import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Agency from './models/Agency.js';
import Vehicle from './models/Vehicle.js';
import Package from './models/Package.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Agency.deleteMany({});
    await Vehicle.deleteMany({});
    await Package.deleteMany({});

    // Create admin/agency owner user
    const adminUser = await User.create({
      name: 'SoaringX Admin',
      email: 'soaring.xofficial@gmail.com',
      phone: '9390071812',
      password: 'soaringx@123',
      role: 'agent',
      verified: true,
    });

    console.log('Admin user created:', adminUser.email);

    // Create SoaringX agency
    const soaringxAgency = await Agency.create({
      name: 'SoaringX Tours & Packages',
      owner: adminUser._id,
      location: 'Bengaluru',
      description:
        'SoaringX Tours & Packages is a premier travel agency offering exciting tour packages across India. We specialize in adventure trips, hill station getaways, and beach vacations.',
      phone: '9390071812',
      email: 'soaring.xofficial@gmail.com',
      verified: true,
      rating: 4.9,
      packagesCount: 0,
    });

    console.log('SoaringX agency created successfully');
    console.log('Agency ID:', soaringxAgency._id);

    // Create a test customer
    const testCustomer = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      phone: '9876543210',
      password: 'test@123',
      role: 'user',
    });

    console.log('Test customer created:', testCustomer.email);

    // Create SoaringX Vehicles
    const vehicles = await Vehicle.insertMany([
      {
        name: 'Innova Crysta',
        type: 'suv',
        seats: 7,
        pricePerKm: 16,
        owner: adminUser._id,
        agency: soaringxAgency._id,
        location: 'Bengaluru',
        image: '/images/innova.jpg',
        rating: 4.8,
        verified: true,
        features: ['AC', 'Music System', 'GPS', 'First Aid Kit'],
      },
      {
        name: 'Tempo Traveller (12 Seater)',
        type: 'van',
        seats: 12,
        pricePerKm: 22,
        owner: adminUser._id,
        agency: soaringxAgency._id,
        location: 'Bengaluru',
        image: '/images/tempo-traveller.jpg',
        rating: 4.6,
        verified: true,
        features: ['AC', 'Push Back Seats', 'LCD Screen', 'Luggage Space'],
      },
    ]);

    console.log(`✅ ${vehicles.length} vehicles created for SoaringX`);

    // Create SoaringX Packages
    const packages = await Package.insertMany([
      {
        name: 'Ooty Budget Trip',
        price: 4499,
        duration: '2 Days / 1 Night',
        locations: ['Bengaluru', 'Ooty'],
        description:
          "Escape to the Queen of Hill Stations! This budget-friendly Ooty package includes everything — comfortable transport from Bengaluru, 4 meals with snacks and tea/coffee, the iconic Toy Train ride, entry tickets with boating, and a cozy 3-star hotel stay.",
        image: '/images/ooty-package.png',
        itinerary: [
          'Day 1: Bengaluru to Ooty, Botanical Garden, Ooty Lake Boating, Toy Train Ride, Hotel check-in',
          'Day 2: Rose Garden, Tea Factory Visit, Doddabetta Peak, Shopping, Return to Bengaluru',
        ],
        includes: [
          'Transport',
          '4 Meals + Snacks + Tea/Coffee',
          'Toy Train Ticket',
          'Entry Tickets + Boating',
          '1 Night 3★ Hotel Stay',
        ],
        agency: soaringxAgency._id,
        rating: 4.8,
        reviews: 278,
        verified: true,
      },
      {
        name: 'Kerala Adventure Trip',
        price: 6499,
        duration: '3 Days / 2 Nights',
        locations: ['Bengaluru', 'Munnar', 'Alleppey'],
        description:
          "Experience the ultimate Kerala adventure! Explore the misty hills of Munnar, witness the breathtaking sunrise at Kolukkumalai, and cruise through the serene backwaters of Alleppey. This trip is packed with thrilling jeep rides, scenic boat cruises, and authentic Kerala cuisine.",
        image: '/images/kerala-package.png',
        itinerary: [
          'Day 1: Pickup from Bengaluru, drive to Munnar. Evening: Explore local markets & tea gardens',
          'Day 2: Early morning Kolukkumalai Jeep Ride, Mattupetty Dam, Echo Point. Drive to Alleppey',
          'Day 3: Alleppey Shikara Boat Ride, Alleppey Beach, Return journey',
        ],
        includes: [
          'Transport',
          'Hygienic Stay',
          'Food Included',
          'Jeep Ride',
          'Shikara Boat Ride',
        ],
        agency: soaringxAgency._id,
        rating: 4.9,
        reviews: 342,
        verified: true,
      },
      {
        name: 'Chikmagalur Hill Retreat',
        price: 5499,
        duration: '2 Days / 1 Night',
        locations: ['Bengaluru', 'Chikmagalur'],
        description:
          'Discover the coffee capital of India with stunning mountain views, trekking trails, and serene homestays.',
        image: '/images/chikmagalur-package.png',
        itinerary: [
          'Day 1: Bengaluru to Chikmagalur, Mullayanagiri Trek, Coffee Estate Visit',
          'Day 2: Baba Budangiri, Hebbe Falls, Return',
        ],
        includes: ['Transport', 'Homestay', 'Breakfast & Dinner'],
        agency: soaringxAgency._id,
        rating: 4.7,
        reviews: 189,
        verified: true,
      },
    ]);

    console.log(`✅ ${packages.length} packages created for SoaringX`);

    // Update agency packages count
    soaringxAgency.packagesCount = packages.length;
    await soaringxAgency.save();

    console.log('\n✅ Database seeded successfully!');
    console.log('Test Login Credentials:');
    console.log('Email:', testCustomer.email);
    console.log('Password: test@123');
    console.log('\nAgency Details:');
    console.log('Name:', soaringxAgency.name);
    console.log('Email:', soaringxAgency.email);
    console.log('Phone:', soaringxAgency.phone);
    console.log(`\nCreated: ${vehicles.length} vehicles and ${packages.length} packages`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
