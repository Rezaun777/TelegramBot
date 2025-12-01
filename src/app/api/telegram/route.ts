import { Telegraf } from 'telegraf';
import dbConnect from '@/lib/mongodb';
import Template from '@/models/Template';
import { NextRequest } from 'next/server';

// Force this route to run in Node.js runtime instead of Edge Runtime
export const runtime = 'nodejs';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
}

const bot = new Telegraf(BOT_TOKEN);

// Auto-reply middleware - handle all text messages
bot.on('text', async (ctx) => {
  console.log('Received text message:', ctx.message.text);
  console.log('Chat type:', ctx.chat?.type);
  console.log('Message from:', ctx.from?.username);
  
  try {
    await dbConnect();
    
    // Get the message text
    const messageText = ctx.message.text.toLowerCase().trim();
    
    // Look for a template that matches the message
    const template = await Template.findOne({
      keyword: messageText
    });
    
    console.log('Found template:', template);
    
    // If we found a template, send the response
    if (template) {
      console.log('Sending template response:', template.response);
      await ctx.reply(template.response);
    } else {
      // Check for partial matches
      const partialMatchTemplates = await Template.find({
        keyword: { $regex: messageText, $options: 'i' }
      });
      
      console.log('Partial match templates:', partialMatchTemplates);
      
      if (partialMatchTemplates.length > 0) {
        await ctx.reply(partialMatchTemplates[0].response);
      } else {
        // Default response if no match found
        console.log('Sending default response');
        // Send default response in both private chats and groups now
        // But only if the message doesn't start with '/' (to avoid interfering with commands)
        if (!ctx.message.text.startsWith('/')) {
          await ctx.reply("I'm sorry, I don't understand that command. Please try another one.");
        }
      }
    }
  } catch (error) {
    console.error('Error processing message:', error);
    // Only reply with error message in private chats to avoid spamming groups
    if (ctx.chat?.type === 'private') {
      await ctx.reply('Sorry, something went wrong while processing your message.');
    }
  }
});

// Help command
bot.command('help', async (ctx) => {
  console.log('Received /help command');
  try {
    await dbConnect();
    const templates = await Template.find({}, 'keyword');
    const keywords = templates.map(t => t.keyword);
    
    let helpText = "Available commands:\n";
    helpText += "/start - Start the bot\n";
    helpText += "/help - Show this help message\n";
    
    if (keywords.length > 0) {
      helpText += "\nOther supported keywords:\n";
      helpText += keywords.map(k => `- ${k}`).join('\n');
    }
    
    console.log('Sending help response:', helpText);
    await ctx.reply(helpText);
  } catch (error) {
    console.error('Error in help command:', error);
    await ctx.reply('Sorry, something went wrong while fetching help.');
  }
});

// Start command
bot.command('start', (ctx) => {
  console.log('Received /start command');
  console.log('Sending welcome response');
  ctx.reply('Welcome to our Telegram bot! Send /help to see available commands.');
});

// Settings command to help with group configuration
bot.command('settings', async (ctx) => {
  console.log('Received /settings command');
  try {
    let settingsText = "Bot Settings Information:\n\n";
    settingsText += `Chat type: ${ctx.chat?.type}\n\n`;
    
    if (ctx.chat?.type !== 'private') {
      settingsText += "For group chats, make sure:\n";
      settingsText += "1. The bot is an administrator in the group\n";
      settingsText += "2. Privacy mode is disabled in BotFather (/setprivacy -> Disable)\n";
      settingsText += "3. The bot can read all messages in the group\n\n";
    }
    
    settingsText += "Available templates:\n";
    
    // Get all templates
    await dbConnect();
    const templates = await Template.find({}, 'keyword response');
    
    if (templates.length > 0) {
      templates.slice(0, 10).forEach((template, index) => {
        settingsText += `${index + 1}. "${template.keyword}" -> "${template.response.substring(0, 50)}${template.response.length > 50 ? '...' : ''}"\n`;
      });
      
      if (templates.length > 10) {
        settingsText += `... and ${templates.length - 10} more templates.\n`;
      }
    } else {
      settingsText += "No templates found. Please add some in the admin dashboard.\n";
    }
    
    await ctx.reply(settingsText);
  } catch (error) {
    console.error('Error in settings command:', error);
    await ctx.reply('Unable to fetch settings information.');
  }
});

// New command to help with group issues
bot.command('groupfix', async (ctx) => {
  console.log('Received /groupfix command');
  try {
    let fixText = "🔧 Group Messaging Fix Guide:\n\n";
    
    if (ctx.chat?.type === 'private') {
      fixText += "This command is meant to be used in groups, but here are general tips:\n\n";
    }
    
    fixText += "1. Make sure I'm an ADMIN in this group\n";
    fixText += "2. Check that privacy mode is DISABLED in @BotFather (/setprivacy)\n";
    fixText += "3. Try sending messages that match my templates\n";
    fixText += "4. View available templates with /settings\n\n";
    fixText += "If issues persist, contact the bot administrator.";
    
    await ctx.reply(fixText);
  } catch (error) {
    console.error('Error in groupfix command:', error);
    await ctx.reply('Unable to provide fix information.');
  }
});

// Webhook handler
export async function POST(request: NextRequest) {
  console.log('Telegram webhook received');
  try {
    const body = await request.json();
    console.log('Webhook body:', JSON.stringify(body, null, 2));
    
    // Process the update with Telegraf
    await bot.handleUpdate(body);
    
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error', { status: 500 });
  }
}

// For setting webhook
export async function GET() {
  // Use the Vercel URL for production
  const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/api/telegram`;
  
  console.log('Setting webhook to:', WEBHOOK_URL);
  
  try {
    await bot.telegram.setWebhook(WEBHOOK_URL);
    const webhookInfo = await bot.telegram.getWebhookInfo();
    return new Response(`Webhook set to ${WEBHOOK_URL}\nWebhook Info: ${JSON.stringify(webhookInfo, null, 2)}`, { 
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  } catch (error) {
    console.error('Error setting webhook:', error);
    return new Response('Error setting webhook', { status: 500 });
  }
}