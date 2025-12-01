import { Telegraf } from 'telegraf';

// Use the token directly for testing
const BOT_TOKEN = '8109788735:AAFD1X_MNbHVrB4Pxy2kKohIYMUOGTKU4pY';
const WEBHOOK_URL = 'https://telegram-bot-eight-sandy.vercel.app/api/telegram';

async function setWebhook() {
  try {
    console.log('Setting webhook for bot...');
    const bot = new Telegraf(BOT_TOKEN);
    
    console.log(`Setting webhook to: ${WEBHOOK_URL}`);
    await bot.telegram.setWebhook(WEBHOOK_URL);
    console.log('✅ Webhook set successfully!');
    
    // Get webhook info to confirm
    const webhookInfo = await bot.telegram.getWebhookInfo();
    console.log('Current webhook info:', JSON.stringify(webhookInfo, null, 2));
  } catch (error: any) {
    console.error('❌ Error setting webhook:');
    console.error(error.message);
  }
}

setWebhook();