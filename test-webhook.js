// Quick test of n8n webhook
const https = require('https');

const data = JSON.stringify({
  body: {
    body: {
      booking_id: 1,
      payment_status: "succeeded",
      amount: 100
    }
  }
});

const options = {
  hostname: 'skywalkers.app.n8n.cloud',
  path: '/webhook/payment-received',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🧪 Testing n8n webhook...');
console.log('URL: https://skywalkers.app.n8n.cloud/webhook/payment-received');
console.log('Payload:', data);
console.log('');

const req = https.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}`);
  console.log('Response Headers:', JSON.stringify(res.headers, null, 2));
  console.log('');

  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('📦 Response Body:');
    console.log(responseData);
    console.log('');
    
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ SUCCESS! n8n webhook is working!');
    } else if (res.statusCode === 404) {
      console.log('❌ ERROR: Webhook not found (404). Make sure workflow is active.');
    } else {
      console.log(`⚠️  WARNING: Unexpected status code ${res.statusCode}`);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ ERROR:', error.message);
  console.log('');
  console.log('Possible issues:');
  console.log('1. n8n workflow is not active');
  console.log('2. Wrong webhook URL');
  console.log('3. Network connection issue');
});

req.write(data);
req.end();
