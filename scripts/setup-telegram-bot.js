#!/usr/bin/env node

/**
 * Setup Telegram Bot for Skywalkers Tours Chat System
 *
 * This script helps you:
 * 1. Create a Telegram bot (if you haven't already)
 * 2. Set the webhook URL for your bot
 * 3. Test the webhook connection
 *
 * Prerequisites:
 * - Node.js installed
 * - Bot token from BotFather
 * - Vercel deployment URL
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function makeTelegramRequest(token, method, params = {}) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const data = JSON.stringify(params);

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json);
        } catch (e) {
          resolve({ error: 'Invalid JSON response', body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function setupWebhook(botToken, webhookUrl) {
  console.log('🔧 Setting webhook URL...');
  console.log('📡 URL:', webhookUrl);

  const result = await makeTelegramRequest(botToken, 'setWebhook', {
    url: webhookUrl,
    max_connections: 100,
    allowed_updates: ['message', 'callback_query']
  });

  if (result.ok) {
    console.log('✅ Webhook set successfully!');
    console.log('📋 Webhook info:', JSON.stringify(result.result, null, 2));
  } else {
    console.error('❌ Failed to set webhook:', result.description);
    console.error('💡 Make sure your webhook URL is HTTPS and accessible.');
  }

  return result;
}

async function getWebhookInfo(botToken) {
  console.log('🔍 Checking current webhook info...');

  const result = await makeTelegramRequest(botToken, 'getWebhookInfo');

  if (result.ok) {
    console.log('ℹ️  Current webhook info:');
    console.log(JSON.stringify(result.result, null, 2));
  } else {
    console.error('❌ Failed to get webhook info:', result.description);
  }

  return result;
}

async function testWebhook(webhookUrl) {
  console.log('🧪 Testing webhook endpoint...');

  return new Promise((resolve) => {
    const url = webhookUrl.replace('/telegram/webhook', '/test');

    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          console.log('✅ Test endpoint response:', JSON.stringify(data, null, 2));
          resolve(true);
        } catch (e) {
          console.log('⚠️  Test endpoint response:', body);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.error('❌ Cannot reach webhook URL:', err.message);
      resolve(false);
    });
  });
}

async function main() {
  console.log('🤖 Telegram Bot Setup for Skywalkers Tours\n');
  console.log('📋 Before starting:');
  console.log('   1. Go to @BotFather on Telegram');
  console.log('   2. Run /newbot command');
  console.log('   3. Choose a bot name and username');
  console.log('   4. Get your bot token\n');

  const botToken = await askQuestion('🔑 Enter your Telegram bot token: ');
  if (!botToken) {
    console.error('❌ Bot token is required!');
    process.exit(1);
  }

  const vercelUrl = await askQuestion('🌐 Enter your Vercel app URL (e.g., https://yourapp.vercel.app): ');
  if (!vercelUrl) {
    console.error('❌ Vercel URL is required!');
    process.exit(1);
  }

  const webhookUrl = `${vercelUrl.replace(/\/$/, '')}/api/telegram/webhook`;

  console.log('\n🚀 Setup Summary:');
  console.log('   🤖 Bot Token:', botToken.substring(0, 20) + '...');
  console.log('   📡 Webhook URL:', webhookUrl);
  console.log('');

  // Test webhook URL first
  const webhookReachable = await testWebhook(webhookUrl);
  if (!webhookReachable) {
    console.log('⚠️  Webhook URL may not be reachable. Continuing anyway...\n');
  }

  // Check current webhook
  await getWebhookInfo(botToken);
  console.log('');

  // Setup new webhook
  const setupResult = await setupWebhook(botToken, webhookUrl);
  if (!setupResult.ok) {
    console.log('❌ Webhook setup failed. Check your configuration.');
    process.exit(1);
  }

  console.log('');
  console.log('🎉 Telegram bot setup completed!');
  console.log('');
  console.log('📱 Next steps:');
  console.log('   1. Send a message to your bot on Telegram');
  console.log('   2. Check https://ceyhun.vercel.app/dashboard/landing/');
  console.log('   3. You should see your conversation in the list!');
  console.log('');
  console.log('📋 Remember to add these to Vercel Environment Variables:');
  console.log('   TELEGRAM_BOT_TOKEN=' + botToken);
  console.log('   TELEGRAM_WEBHOOK_SECRET=[choose-a-secret]');

  rl.close();
}

if (require.main === module) {
  main().catch(console.error);
}
