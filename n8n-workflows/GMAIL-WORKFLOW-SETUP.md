# Gmail Complete Mail System - Setup Guide

## ✅ Fixed Connection Issue

The workflow has been updated with the missing connection:
- **New Email Trigger** → **Store New Email Notification**

All nodes are now properly connected!

## 🔧 Workflow Overview

This n8n workflow provides a complete Gmail integration with:

### 1. **Email Trigger** (Automatic)
- Monitors Gmail inbox every minute
- Triggers on new unread emails
- Stores notifications in Supabase

### 2. **Webhook Endpoints** (On-demand)
- `GET /emails/inbox` - Fetch inbox emails
- `GET /emails/sent` - Fetch sent emails  
- `GET /emails/all` - Fetch both inbox and sent emails

## 📋 Node Connections

```
AUTOMATIC FLOW:
New Email Trigger → Store New Email Notification

WEBHOOK FLOWS:
1. Get Inbox Webhook → Fetch Inbox → Process Inbox Data → Respond Inbox

2. Get Sent Webhook → Fetch Sent → Process Sent Data → Respond Sent

3. Get All Emails Webhook → Fetch All Inbox ↘
                         → Fetch All Sent  ↗→ Combine All Emails → Respond All Emails
```

## 🚀 Setup Instructions

### Step 1: Configure Gmail Credentials in n8n

1. In n8n, go to **Credentials**
2. Add **Gmail OAuth2** credential
3. Follow Google OAuth setup:
   - Create OAuth credentials in Google Cloud Console
   - Add authorized redirect URI: `https://your-n8n-instance/rest/oauth2-credential/callback`
   - Enable Gmail API
   - Copy Client ID and Client Secret to n8n

### Step 2: Configure Supabase Connection

1. In n8n, add **Supabase** credential
2. Enter your Supabase details:
   - **Host**: Your Supabase URL
   - **Service Role Key**: From Supabase dashboard

### Step 3: Create Supabase Table

Run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id TEXT NOT NULL UNIQUE,
  from_address TEXT NOT NULL,
  subject TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_email_notifications_received_at ON email_notifications(received_at DESC);
CREATE INDEX idx_email_notifications_is_read ON email_notifications(is_read);
```

### Step 4: Import Workflow

1. Open n8n
2. Click **Import from File**
3. Select `Gmail Complete Mail System (1).json`
4. Click **Import**

### Step 5: Configure Credentials for Each Node

Select credentials for these nodes:
- **New Email Trigger**: Gmail OAuth2
- **Fetch Inbox**: Gmail OAuth2
- **Fetch Sent**: Gmail OAuth2
- **Fetch All Inbox**: Gmail OAuth2
- **Fetch All Sent**: Gmail OAuth2
- **Store New Email Notification**: Supabase

### Step 6: Activate Workflow

1. Click **Active** toggle in top-right
2. Workflow will start monitoring for new emails

## 🌐 Webhook URLs

After activation, you'll get these webhook URLs:

```
Production URLs:
https://your-n8n-instance.com/webhook/emails/inbox
https://your-n8n-instance.com/webhook/emails/sent
https://your-n8n-instance.com/webhook/emails/all

Test URLs (for development):
https://your-n8n-instance.com/webhook-test/emails/inbox
https://your-n8n-instance.com/webhook-test/emails/sent
https://your-n8n-instance.com/webhook-test/emails/all
```

## 📡 Using the Webhooks in Your App

### Fetch Inbox Emails

```javascript
const response = await fetch('https://your-n8n-instance.com/webhook/emails/inbox');
const data = await response.json();

// Response format:
{
  success: true,
  type: 'inbox',
  count: 10,
  emails: [
    {
      id: "abc123",
      threadId: "thread123",
      from: "sender@example.com",
      fromName: "John Doe",
      to: "you@example.com",
      subject: "Meeting Tomorrow",
      snippet: "Quick preview of email...",
      date: "2025-11-21T15:00:00Z",
      isRead: false,
      hasAttachment: false,
      labels: ["INBOX", "UNREAD"],
      body: "Full email content..."
    }
  ],
  fetchedAt: "2025-11-21T15:30:00Z"
}
```

### Fetch Sent Emails

```javascript
const response = await fetch('https://your-n8n-instance.com/webhook/emails/sent');
const data = await response.json();

// Response format:
{
  success: true,
  type: 'sent',
  count: 5,
  emails: [
    {
      id: "xyz789",
      threadId: "thread456",
      from: "you@example.com",
      to: "recipient@example.com",
      toName: "Jane Smith",
      subject: "Re: Meeting Tomorrow",
      snippet: "Thanks for confirming...",
      date: "2025-11-21T14:00:00Z",
      hasAttachment: true,
      labels: ["SENT"],
      body: "Full email content..."
    }
  ],
  fetchedAt: "2025-11-21T15:30:00Z"
}
```

### Fetch All Emails (Combined)

```javascript
const response = await fetch('https://your-n8n-instance.com/webhook/emails/all');
const data = await response.json();

// Response format:
{
  success: true,
  inboxCount: 10,
  sentCount: 5,
  totalCount: 15,
  emails: [
    {
      id: "abc123",
      threadId: "thread123",
      type: "inbox",  // or "sent"
      from: "sender@example.com",
      to: "you@example.com",
      subject: "Latest Email",
      snippet: "Preview...",
      date: "2025-11-21T15:00:00Z",
      isRead: false
    }
    // ... more emails sorted by date (newest first)
  ],
  fetchedAt: "2025-11-21T15:30:00Z"
}
```

## 🔗 Integration with Your Web App

### Create API Route Handler

Create `app/api/emails/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

const N8N_WEBHOOK_BASE = process.env.N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'all'; // inbox, sent, or all

  try {
    const response = await fetch(`${N8N_WEBHOOK_BASE}/emails/${type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch emails from n8n');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}
```

### Use in Your Dashboard

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function EmailDashboard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async (type = 'all') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/emails?type=${type}`);
      const data = await response.json();
      setEmails(data.emails || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Email Dashboard</h1>
      <div className="filters">
        <button onClick={() => fetchEmails('all')}>All</button>
        <button onClick={() => fetchEmails('inbox')}>Inbox</button>
        <button onClick={() => fetchEmails('sent')}>Sent</button>
      </div>
      
      {loading ? (
        <p>Loading emails...</p>
      ) : (
        <div className="email-list">
          {emails.map((email) => (
            <div key={email.id} className="email-item">
              <h3>{email.subject}</h3>
              <p>From: {email.from}</p>
              <p>Date: {new Date(email.date).toLocaleString()}</p>
              <p>{email.snippet}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 🔔 Email Notifications

The **Store New Email Notification** node saves incoming emails to Supabase. Query notifications:

```sql
-- Get unread email notifications
SELECT * FROM email_notifications 
WHERE is_read = false 
ORDER BY received_at DESC;

-- Mark notification as read
UPDATE email_notifications 
SET is_read = true 
WHERE email_id = 'abc123';

-- Get recent notifications (last 24 hours)
SELECT * FROM email_notifications 
WHERE received_at > NOW() - INTERVAL '24 hours'
ORDER BY received_at DESC;
```

## 🔒 Environment Variables

Add to your `.env.local`:

```bash
# n8n Webhook URL
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook

# Optional: n8n API Key (if using API instead of webhooks)
N8N_API_KEY=your-api-key
```

## 🧪 Testing

### Test Individual Webhooks

```bash
# Test inbox endpoint
curl https://your-n8n-instance.com/webhook/emails/inbox

# Test sent endpoint
curl https://your-n8n-instance.com/webhook/emails/sent

# Test all emails endpoint
curl https://your-n8n-instance.com/webhook/emails/all
```

### Test Email Trigger

1. Send a test email to your Gmail
2. Wait ~1 minute (polling interval)
3. Check Supabase table:
```sql
SELECT * FROM email_notifications ORDER BY created_at DESC LIMIT 1;
```

## 🐛 Troubleshooting

### Issue: No emails fetched
- Verify Gmail OAuth credentials are valid
- Check Gmail API is enabled in Google Cloud Console
- Ensure proper scopes are granted

### Issue: Supabase insertion fails
- Verify table exists in Supabase
- Check Supabase credentials in n8n
- Ensure Service Role Key has write permissions

### Issue: Webhooks return errors
- Check workflow is **Active**
- Verify webhook URLs are correct
- Test with n8n's built-in webhook testing

### Issue: Trigger not firing
- Ensure **Active** toggle is ON
- Check execution logs in n8n
- Verify polling interval settings

## 📝 Next Steps

1. ✅ Import workflow to n8n
2. ✅ Configure Gmail OAuth credentials
3. ✅ Create Supabase table
4. ✅ Activate workflow
5. ✅ Test webhooks
6. ✅ Integrate with your web app
7. ✅ Monitor email notifications

## 🎉 Success!

Your Gmail workflow is now connected and ready to use. The automatic trigger will monitor incoming emails, and the webhooks provide on-demand access to your inbox and sent emails.
