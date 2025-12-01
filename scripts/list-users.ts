import dotenv from 'dotenv';
import mongoose from 'mongoose';

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

async function listData() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB successfully');

    // List users
    console.log('\n--- USERS ---');
    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found');
    } else {
      users.forEach(user => {
        console.log(`- ${user.username} (ID: ${user._id})`);
      });
    }

    // List templates
    console.log('\n--- TEMPLATES ---');
    const templates = await Template.find({});
    if (templates.length === 0) {
      console.log('No templates found');
    } else {
      templates.forEach(template => {
        console.log(`- Keyword: "${template.keyword}"`);
        console.log(`  Response: "${template.response}"`);
        console.log(`  ID: ${template._id}`);
        console.log('');
      });
    }

    console.log('Data listing completed');
    process.exit(0);
  } catch (error) {
    console.error('Error listing data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the listing
listData();