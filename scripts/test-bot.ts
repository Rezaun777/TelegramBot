import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Template from '../src/models/Template';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testBotLogic() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB successfully');

    // Test cases
    const testMessages = [
      'hello',
      'Hello',
      'HELLO',
      ' hello ',
      'help',
      'info',
      'contact',
      'unknown'
    ];

    console.log('\n--- TESTING BOT LOGIC ---');
    
    for (const message of testMessages) {
      console.log(`\nTesting message: "${message}"`);
      
      // Simulate the bot's text processing logic
      const processedMessage = message.toLowerCase().trim();
      console.log(`Processed message: "${processedMessage}"`);
      
      // Look for exact match
      const template = await Template.findOne({
        keyword: processedMessage
      });
      
      if (template) {
        console.log(`✓ Found exact match! Response: "${template.response}"`);
      } else {
        console.log(`✗ No exact match found`);
        
        // Check for partial matches
        const partialMatchTemplates = await Template.find({
          keyword: { $regex: processedMessage, $options: 'i' }
        });
        
        if (partialMatchTemplates.length > 0) {
          console.log(`✓ Found partial match! Response: "${partialMatchTemplates[0].response}"`);
        } else {
          console.log(`✗ No partial matches found`);
        }
      }
    }
    
    console.log('\nTest completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during test:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the test
testBotLogic();