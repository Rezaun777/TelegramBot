import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Define user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, minlength: 6 }
}, { timestamps: true });

// Model
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function resetUsers() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB successfully');

    // Delete all existing users
    console.log('Deleting all existing users...');
    await User.deleteMany({});
    console.log('All users deleted');
    
    // Create admin user
    console.log('Creating admin user...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, salt);
    
    const adminUser = new User({
      username: process.env.ADMIN_USERNAME,
      password: hashedPassword,
    });
    
    await adminUser.save();
    console.log('Admin user created successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting users:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the script
resetUsers();