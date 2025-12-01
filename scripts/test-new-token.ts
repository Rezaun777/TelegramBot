import { Telegraf } from 'telegraf';

// Use the token directly for testing
const BOT_TOKEN = '8109788735:AAFD1X_MNbHVrB4Pxy2kKohIYMUOGTKU4pY';

async function testToken() {
  try {
    console.log('Testing new bot token...');
    const bot = new Telegraf(BOT_TOKEN);
    const botInfo = await bot.telegram.getMe();
    console.log(`✅ Token is valid!`);
    console.log(`🤖 Bot name: ${botInfo.first_name}`);
    console.log(`👤 Username: @${botInfo.username}`);
    console.log(`🆔 Bot ID: ${botInfo.id}`);
  } catch (error: any) {
    console.error('❌ Invalid bot token or connection error:');
    console.error(error.message);
  }
}

testToken();