require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Provider = require('./models/Provider');
const Service = require('./models/Service');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sevasarthi';

const names = ['Ramesh Sharma', 'Vikram Singh', 'Abdul Rahman', 'Priya Patel', 'Sanjay Verma'];
const businessNames = ['Sharma Services', 'Singh Electric & Plumbing', 'Rahman Cleaning Agency', 'Priya Care & Repair', 'Verma Home Solutions'];
const categories = ['Home Maintenance', 'Professional Cleaning', 'Electrical Works', 'Gardening & Landscaping', 'Plumbing', 'Pest Control', 'Painting', 'Carpentry', 'Appliance Repair', 'Personal Care'];
const icons = ['home_repair_service', 'cleaning_services', 'electrical_services', 'yard', 'plumbing', 'pest_control', 'format_paint', 'handyman', 'build', 'spa'];

// High-quality Unsplash image URLs for different categories
const categoryImages = {
  'Home Maintenance': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
  'Professional Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80', // Replace later
  'Electrical Works': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
  'Plumbing': 'https://images.unsplash.com/photo-1607472586893-edb57cbceb42?w=800&q=80',
  'Painting': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80',
  'Carpentry': 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=800&q=80',
  'Appliance Repair': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
};
// Fallback image
const defaultImg = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80';

const servicesToCreate = [
  { name: 'Deep Home Cleaning', cat: 'Professional Cleaning', price: 1500, desc: 'Complete deep cleaning of your 2BHK/3BHK including bathrooms and kitchen.' },
  { name: 'Electrical Wiring Repair', cat: 'Electrical Works', price: 400, desc: 'Fixing short circuits, replacing old wires, and general electrical maintenance.' },
  { name: 'AC Servicing & Repair', cat: 'Appliance Repair', price: 650, desc: 'Split and Window AC cleaning, gas top-up, and part replacement.' },
  { name: 'Leaking Pipe Fixing', cat: 'Plumbing', price: 300, desc: 'Fixing leaking taps, pipes, and blocked drainage systems quickly.' },
  { name: 'Interior Wall Painting', cat: 'Painting', price: 5000, desc: 'High-quality interior painting using premium paints and minimal mess.' },
  { name: 'Custom Wardrobe Build', cat: 'Carpentry', price: 8000, desc: 'Customized wooden wardrobes built to fit your room perfectly.' },
  { name: 'Garden Maintenance', cat: 'Gardening & Landscaping', price: 600, desc: 'Lawn mowing, plant pruning, and fertilizer application.' },
  { name: 'Termite Control Treatment', cat: 'Pest Control', price: 1200, desc: 'Effective termite eradication with 1-year guarantee.' },
  { name: 'Washing Machine Repair', cat: 'Appliance Repair', price: 450, desc: 'Fixing all brands of top-load and front-load washing machines.' },
  { name: 'Sofa Dry Cleaning', cat: 'Professional Cleaning', price: 800, desc: 'Deep vacuum and dry cleaning of 5-seater sofas.' },
  { name: 'Ceiling Fan Installation', cat: 'Electrical Works', price: 250, desc: 'Safe installation of new ceiling fans and regulators.' },
  { name: 'Bathroom Waterproofing', cat: 'Home Maintenance', price: 3500, desc: 'Fixing bathroom leakages with advanced waterproofing chemicals.' },
  { name: 'Kitchen Sink Installation', cat: 'Plumbing', price: 500, desc: 'Professional installation of stainless steel kitchen sinks.' },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    const providerIds = [];

    // Create 5 Providers
    for (let i = 0; i < 5; i++) {
      const email = `provider${Date.now()}_${i}@test.com`;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const user = await User.create({
        name: names[i],
        email: email,
        password: hashedPassword,
        phone: `987654321${i}`,
        role: 'provider',
        isVerified: true
      });

      const provider = await Provider.create({
        userId: user._id,
        businessType: 'individual',
        businessName: businessNames[i],
        ownerName: names[i],
        city: 'Indore', // User specified Indore
        fullAddress: '123 Test Street, Palasia',
        pincode: '452001',
        primaryCategory: categories[i % categories.length],
        verificationStatus: 'pending', // Set to pending so admin can approve
        isAvailable: true,
      });

      providerIds.push(user._id);
      console.log(`Created Provider: ${names[i]} (Indore)`);
    }

    // Create 13 Services distributed among the 5 providers
    for (let i = 0; i < servicesToCreate.length; i++) {
      const svc = servicesToCreate[i];
      const pId = providerIds[i % providerIds.length];
      const catIndex = categories.indexOf(svc.cat);
      const icon = catIndex !== -1 ? icons[catIndex] : icons[0];
      const img = categoryImages[svc.cat] || defaultImg;

      await Service.create({
        name: svc.name,
        category: svc.cat,
        description: svc.desc,
        icon: icon,
        basePrice: svc.price,
        image: img,
        providerId: pId,
        approvalStatus: 'pending', // Set to pending so admin can approve
        isActive: true,
        workingHours: { start: '09:00', end: '18:00' }
      });
      console.log(`Created Service: ${svc.name}`);
    }

    console.log('Successfully seeded test data!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
