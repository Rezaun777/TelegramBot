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
        // Only send default response in private chats, not groups
        if (ctx.chat?.type === 'private') {
          await ctx.reply("I'm sorry, I don't understand that command. Please try another one.");
        }
      }
    }
  } catch (error) {
    console.error('Error processing message:', error);
    await ctx.reply('Sorry, something went wrong while processing your message.');
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
  // Use the local URL for development
  const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'}/api/telegram`;
  
  console.log('Setting webhook to:', WEBHOOK_URL);
  
  try {
    await bot.telegram.setWebhook(WEBHOOK_URL);
    return new Response(`Webhook set to ${WEBHOOK_URL}`, { status: 200 });
  } catch (error) {
    console.error('Error setting webhook:', error);
    return new Response('Error setting webhook', { status: 500 });
  }
}