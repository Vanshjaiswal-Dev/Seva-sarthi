require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sevasarthi';

async function fix() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    // Update all users who are providers but don't have city set in User model
    // Specifically, let's just update the seeded ones or all providers
    const users = await User.find({ role: 'provider' });
    let updatedCount = 0;
    
    for (const user of users) {
      if (!user.address || !user.address.city || user.address.city.toLowerCase() !== 'indore') {
        user.address = {
          ...user.address,
          city: 'Indore'
        };
        await user.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} users with city 'Indore'!`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
