import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Define schemas directly to avoid import issues
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, minlength: 6 }
}, { timestamps: true });

const templateSchema = new mongoose.Schema({
  keyword: { type: String, required: true, trim: true, unique: true },
  response: { type: String, required: true }
}, { timestamps: true });

// Models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Template = mongoose.models.Template || mongoose.model('Template', templateSchema);

async function initDB() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB successfully');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: process.env.ADMIN_USERNAME });
    
    if (!existingAdmin) {
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
    } else {
      // Update admin user password
      console.log('Updating admin user password...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, salt);
      
      await User.updateOne(
        { username: process.env.ADMIN_USERNAME },
        { password: hashedPassword }
      );
      console.log('Admin user password updated successfully');
    }

    // Check if we have any templates, if not create some examples
    const templateCount = await Template.countDocuments();
    
    if (templateCount === 0) {
      console.log('Creating example templates...');
      
      const exampleTemplates = [
        {
          keyword: 'hello',
          response: 'Hello! Welcome to our Telegram bot. How can I help you today?'
        },
        {
          keyword: 'help',
          response: 'I can help you with the following:\n- Type "hello" to get a greeting\n- Type "info" to get information about our services\n- Type "contact" to get our contact details'
        },
        {
          keyword: 'info',
          response: 'We provide excellent services in web development, mobile app development, and digital marketing. Our team of experts is ready to help you achieve your business goals.'
        },
        {
          keyword: 'contact',
          response: 'You can reach us at:\nEmail: info@company.com\nPhone: +1 (555) 123-4567\nWebsite: https://company.com'
        }
      ];

      for (const templateData of exampleTemplates) {
        const template = new Template(templateData);
        await template.save();
      }
      
      console.log('Example templates created successfully');
    } else {
      console.log('Templates already exist');
    }

    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the initialization
initDB();