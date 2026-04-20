import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from '../models/Admin';
import DatabaseConnection from '../config/database';

// Load environment variables
dotenv.config();

const updateAdmin = async () => {
  console.log('👤 Updating admin credentials...\n');

  try {
    // Connect to database
    const dbConnection = new DatabaseConnection();
    await dbConnection.connect();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@l7it.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'bo3bola2026';

    // Delete existing admin
    await Admin.deleteMany({});
    console.log('✓ Cleared existing admin users');

    // Create new admin with updated credentials
    const admin = await Admin.create({
      email: adminEmail,
      password: adminPassword
    });

    console.log(`✓ Created new admin user: ${admin.email}`);
    console.log(`✓ Password updated successfully\n`);

    console.log('📊 Admin Update Summary:');
    console.log('=======================');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${adminPassword}`);

    console.log('\n✅ Admin credentials updated successfully!');

    // Disconnect
    await dbConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin credentials:', error);
    process.exit(1);
  }
};

// Run update function
updateAdmin();