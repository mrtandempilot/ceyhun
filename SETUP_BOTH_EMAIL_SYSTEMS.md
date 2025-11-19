# Complete Email System Setup Guide 📧

You're absolutely right - you need BOTH email systems! Here's how to set them up.

---

## 🎯 What You'll Have After Setup:

1. **OUTGOING EMAILS** - Send booking confirmations, payment receipts, notifications
2. **INCOMING EMAILS** - Receive customer emails in your dashboard, auto-reply, forward, etc.

---

## STEP 1: Set Up OUTGOING EMAILS (Sending) 📤

### Option A: SendGrid (Recommended - Free 100 emails/day)

1. **Sign up at SendGrid:**
   - Go to https://sendgrid.com
   - Create free account
   - Verify your email

2. **Create API Key:**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name: "Paragliding App"
   - Permissions: "Full Access"
   - Copy the API key (save it!)

3. **Add to .env.local:**
```env
# SendGrid Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_actual_api_key_here
FROM_EMAIL="Oludeniz Tours" <noreply@yourdomain.com>
```

### Option B: Gmail (Easier but limited)

1. **Enable 2-Factor Authentication** on your Gmail account

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other" → Type "Paragliding App"
   - Click "Generate"
   - Copy the 16-character password

3. **Add to .env.local:**
```env
# Gmail Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=your-16-char-app-password
FROM_EMAIL="Oludeniz Tours" <youremail@gmail.com>
```

---

## STEP 2: Set Up INCOMING EMAILS (Receiving) 📥

### Step 2.1: Create Database Tables

1. **Open Supabase SQL Editor**
2. **Copy and paste** the file `database/CREATE_INCOMING_EMAILS_TABLE.sql`
3. **Click RUN**

This creates:
- ✅ `incoming_emails` table
- ✅ `email_forwarding_config` table
- ✅ All indexes and security policies

### Step 2.2: Get Your Webhook URL

Your webhook URL will be:
```
https://yourvercelapp.vercel.app/api/emails/incoming
```

**Find your Vercel URL:**
- Go to Vercel dashboard
- Find your app
- Copy the production URL
- Add `/api/emails/incoming` to the end

### Step 2.3: Configure Email Provider

#### Option A: SendGrid Inbound Parse (Recommended)

1. **Go to SendGrid:**
   - Settings → Inbound Parse
   - Click "Add Host & URL"

2. **Set up domain:**
   - Domain: `mail.yourdomain.com` (or use SendGrid's domain)
   - URL: `https://yourvercelapp.vercel.app/api/emails/incoming`
   - Check "POST the raw, full MIME message"

3. **DNS Setup (if using your domain):**
   Add MX record:
   ```
   Type: MX
   Host: mail
   Value: mx.sendgrid.net
   Priority: 10
   ```

4. **Test it:**
   Send email to: `anything@mail.yourdomain.com`

#### Option B: Mailgun (Alternative)

1. **Sign up at Mailgun:** https://mailgun.com

2. **Add Route:**
   - Go to Receiving → Routes
   - Create Route
   - Expression Type: "Match Recipient"
   - Recipient: `.*@yourdomain.com`
   - Actions: "Forward to URL"
   - URL: `https://yourvercelapp.vercel.app/api/emails/incoming`

3. **DNS Setup:**
   Follow Mailgun's DNS setup instructions

---

## STEP 3: Verify Everything Works 🧪

### Test Outgoing Emails:

1. **Create a test booking** on your website
2. **Check** if you receive confirmation email
3. **Check logs** in Vercel if no email arrives

### Test Incoming Emails:

1. **Send email** to your configured address
2. **Go to** `/dashboard/mail` in your app
3. **Check** if email appears

---

## 🎉 What You Can Do After Setup:

### Outgoing Emails:
- ✅ Customers get booking confirmations automatically
- ✅ You get notified about new bookings
- ✅ Payment receipts sent automatically
- ✅ Professional branded emails

### Incoming Emails:
- ✅ All customer emails in one dashboard
- ✅ Mark as read/unread
- ✅ Archive old emails
- ✅ Auto-forward important emails to staff
- ✅ Auto-reply to customers
- ✅ Search all emails
- ✅ Assign emails to team members

---

## 🔒 Security Note:

**NEVER commit your .env.local file to GitHub!**

Your `.gitignore` already excludes it, but double-check.

---

## 🆘 Troubleshooting:

### Outgoing emails not sending:
- Check SMTP credentials in `.env.local`
- Check Vercel environment variables match `.env.local`
- Look at Vercel logs for errors
- Check SendGrid/Gmail delivery logs

### Incoming emails not appearing:
- Verify webhook URL is correct
- Check Supabase tables were created
- Test webhook with curl or Postman
- Check Vercel function logs
- Verify DNS records are correct

---

## 📞 Need Help?

Just ask! I can help you:
- Configure any email provider
- Debug webhook issues
- Set up custom domains
- Create custom email templates
- Add auto-reply rules

---

## Next Steps:

1. Choose your OUTGOING email provider (SendGrid or Gmail)
2. Add credentials to `.env.local`
3. Run the incoming emails SQL in Supabase
4. Configure inbound email webhook
5. Test both systems!

Would you like me to help with any specific step?
