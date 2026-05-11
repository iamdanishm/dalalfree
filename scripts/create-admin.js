const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = 'mongodb://localhost:27017/dalalfree';

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    const adminEmail = 'admin@dalalfree.com';
    const adminPassword = 'admin12345678';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = {
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      accountStatus: 'active',
      subscription: undefined // Admins don't have subscriptions based on the model pre-save hook
    };

    const result = await mongoose.connection.collection('users').updateOne(
      { email: adminEmail },
      { $set: adminUser },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user updated successfully.');
    }

    console.log('-------------------------');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('-------------------------');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

createAdmin();
