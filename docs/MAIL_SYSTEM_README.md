# Mail System for Admin Dashboard

This document describes the incoming email system that has been added to the admin dashboard, allowing admins to receive and manage emails sent to them.

## Overview

The mail system consists of:
- **Database Tables**: `incoming_emails` and `email_forwarding_config`
- **API Endpoint**: `/api/emails/incoming` for receiving emails via webhooks
- **Dashboard Pages**: Mail inbox and forwarding configuration
- **Email Processing**: Automatic forwarding and auto-reply functionality

## Database Setup

Run the SQL script `CREATE_INCOMING_EMAILS_TABLE.sql` in your Supabase SQL editor to create the necessary tables:

```sql
-- This creates:
-- 1. incoming_emails table for storing received emails
-- 2. email_forwarding_config table for forwarding rules
-- 3. All necessary indexes, triggers, and RLS policies
```

## Features

### 1. Email Reception
- Supports multiple email providers (SendGrid, Mailgun, custom)
- Stores emails with full content (HTML/text), attachments metadata
- Tracks read/unread status, priority, and processing state

### 2. Email Management
- Mark emails as read/unread
- Archive emails
- Mark as spam
- Search functionality
- Filter by status (all, unread, archived, spam)

### 3. Automatic Email Forwarding
- Forward emails based on sender domain
- Subject pattern matching
- Priority-based filtering
- Auto-archive forwarded emails

### 4. Auto-Reply System
- Send automatic replies to incoming emails
- Customizable templates with variables
- Domain-based triggering

## API Usage

### Receiving Emails

Send a POST request to `/api/emails/incoming` with email data:

```javascript
// SendGrid format
{
  "sg_message_id": "unique-message-id",
  "from": "sender@example.com",
  "to": "admin@yourdomain.com",
  "subject": "Email Subject",
  "text": "Plain text content",
  "html": "<p>HTML content</p>",
  "attachments": []
}

// Mailgun format
{
  "message-id": "mailgun-message-id",
  "sender": "sender@example.com",
  "recipient": "admin@yourdomain.com",
  "subject": "Email Subject",
  "body-plain": "Plain text content",
  "body-html": "<p>HTML content</p>"
}

// Custom format
{
  "messageId": "custom-id",
  "fromEmail": "sender@example.com",
  "toEmail": "admin@yourdomain.com",
  "emailSubject": "Subject",
  "plainText": "Content",
  "htmlContent": "<p>Content</p>",
  "emailAttachments": []
}
```

### Retrieving Emails

GET `/api/emails/incoming` returns recent emails for testing.

## Email Provider Setup

### SendGrid
1. Set up an inbound webhook in SendGrid
2. Point it to: `https://yourdomain.com/api/emails/incoming`
3. Configure the webhook to send the required fields

### Mailgun
1. Create a route in Mailgun
2. Set action URL to: `https://yourdomain.com/api/emails/incoming`
3. Configure webhook format

### Other Providers
The API accepts custom webhook formats. Ensure your provider sends the required fields or map them to the expected format.

## Dashboard Access

### Mail Inbox
Navigate to `/dashboard/mail` to:
- View all incoming emails
- Search and filter emails
- Mark emails as read/unread
- Archive or mark as spam
- View email details and attachments

### Forwarding Configuration
Navigate to `/dashboard/mail/forwarding` to:
- Create forwarding rules
- Set up auto-reply templates
- Configure domain-based filtering
- Manage active/inactive rules

## Auto-Reply Template Variables

Available variables in auto-reply templates:
- `{{sender_name}}` - Name of the sender (if available)
- `{{original_subject}}` - Original email subject
- `{{received_date}}` - Date the email was received

Example template:
```
Dear {{sender_name}},

Thank you for your email regarding "{{original_subject}}". We received your message on {{received_date}} and will respond within 24 hours.

Best regards,
Oludeniz Tours Team
```

## Testing

Use the provided test script:

```bash
# Install dependencies if needed
npm install node-fetch

# Run the test
node test-email-webhook.js
```

This will:
1. Send a test email to the webhook
2. Verify it was stored correctly
3. Retrieve emails to confirm storage

## Security Notes

- The webhook endpoint validates incoming data
- Emails are stored with proper RLS policies
- Only authenticated users can access the mail system
- Webhook data is logged for debugging

## Troubleshooting

### Emails not appearing
1. Check webhook URL is correct
2. Verify email provider is sending required fields
3. Check server logs for webhook processing errors
4. Ensure database tables are created

### Forwarding not working
1. Verify forwarding rules are active
2. Check domain matching logic
3. Confirm SMTP settings for outgoing emails
4. Check email forwarding logs

### Auto-reply not sending
1. Ensure auto-reply is enabled in configuration
2. Verify template is set
3. Check SMTP configuration
4. Confirm domain matching

## Future Enhancements

Potential improvements:
- Email threading/conversations
- Attachment download
- Email categorization
- Priority scoring
- Integration with CRM contacts
- Bulk email operations
- Email templates for replies
