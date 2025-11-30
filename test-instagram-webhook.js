// Test script to check if Instagram webhook saves to database
// Run this with: node test-instagram-webhook.js

const testData = {
  entry: [{
    messaging: [{
      sender: { id: 'test_user_123456789' },
      message: {
        mid: 'test_message_' + Date.now(),
        text: 'Hello from test user!',
        is_echo: false
      }
    }]
  }]
};

fetch('https://ceyhun.vercel.app/api/instagram/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
  console.log('Test response:', data);

  // Check if message was saved in database
  console.log('Now check your Supabase instagram_messages table for: test_user_123456789');
})
.catch(error => {
  console.error('Test failed:', error);
});
