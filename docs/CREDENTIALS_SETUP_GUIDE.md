# 🔐 Credentials Setup Guide

## Overview
This guide will help you configure all integration credentials for your application directly from the dashboard, without needing to access Supabase or Vercel.

---

## 🚀 Getting Started

### Step 1: Access the Settings Dashboard

1. Log in to your dashboard as admin
2. Navigate to `/dashboard/settings` or click **Settings** in the sidebar
3. You'll see tabs for different integration categories:
   - **Social Media** - Facebook, Instagram, WhatsApp
   - **Automation & Workflows** - n8n webhooks
   - **Email & Communication** - SMTP settings
   - **Google Services** - OAuth, Calendar API

---

## 📱 Social Media Platforms

### Facebook

**What you need:**
- App ID
- App Secret
- Access Token (long-lived)
- Page ID (optional)

**How to get them:**

1. **Create Facebook App:**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Click "My Apps" → "Create App"
   - Choose "Business" type
   - Name your app and create it

2. **Get App ID and App Secret:**
   - In your app dashboard, go to **Settings** → **Basic**
   - Copy **App ID** and **App Secret**

3. **Get Access Token:**
   - Go to **Tools** → **Graph API Explorer**
   - Select your app from dropdown
   - Click "Get Token" → "Get Page Access Token"
   - Select your Facebook Page
   - Grant these permissions:
     - `pages_manage_posts`
     - `pages_read_engagement`
   - Copy the token

4. **Make Token Long-Lived:**
   ```bash
   curl "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_TOKEN"
   ```

5. **Get Page ID (optional):**
   ```bash
   curl "https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_LONG_TOKEN"
   ```

**Enter in Settings:**
- Go to **Settings** → **Social Media** → **Facebook**
- Paste your App ID, App Secret, Access Token, and Page ID
- Click **Save Credentials**
- Click **Test Connection** to verify

---

### Instagram Business

**What you need:**
- Instagram Business Account ID

**How to get it:**

1. Make sure your Instagram is a **Business Account** linked to a Facebook Page
2. Use your Facebook Access Token:
   ```bash
   curl "https://graph.facebook.com/v18.0/YOUR_PAGE_ID?fields=instagram_business_account&access_token=YOUR_FACEBOOK_TOKEN"
   ```
3. Copy the `instagram_business_account.id`

**Enter in Settings:**
- Go to **Settings** → **Social Media** → **Instagram**
- Paste your Business Account ID
- Click **Save** and **Test Connection**

---

### WhatsApp Business

**What you need:**
- Phone Number ID
- Access Token
- Verify Token (optional)
- Business Account ID (optional)

**How to get them:**

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Select your app → **WhatsApp** → **API Setup**
3. **Copy Phone Number ID** from the "Phone Number" section
4. **Copy Access Token** (create a permanent token)
5. **Create a Verify Token** (any random string you choose)

**Enter in Settings:**
- Go to **Settings** → **Social Media** → **WhatsApp**
- Paste all credentials
- Click **Save** and **Test Connection**

---

## 🤖 Automation & Workflows

### n8n Webhooks

**What you need:**
- Chat Webhook URL
- Social Media Webhook URL
- Webhook Secret (optional)

**How to get them:**

1. Open your n8n instance
2. Find your workflow (e.g., "Chat Automation")
3. Click the **Webhook** node
4. Click **Test** to activate it
5. Copy the **Production URL**
6. Repeat for other workflows

**Enter in Settings:**
- Go to **Settings** → **Automation & Workflows** → **n8n**
- Paste webhook URLs
- Optionally add a secret key for security
- Click **Save** and **Test Connection**

---

## 📧 Email & Communication

### SMTP Configuration

**What you need:**
- SMTP Host
- SMTP Port
- Username
- Password
- From Email (optional)

**Example for Gmail:**
- Host: `smtp.gmail.com`
- Port: `587`
- Username: `your-email@gmail.com`
- Password: App Password (not your regular password!)

**How to create Gmail App Password:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate a password for "Mail"
5. Copy the 16-character password

**Enter in Settings:**
- Go to **Settings** → **Email & Communication** → **SMTP**
- Fill in all fields
- Click **Save** and **Test Connection**

---

## 🔵 Google Services

### Google OAuth

**What you need:**
- Client ID
- Client Secret

**How to get them:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen if needed
6. Choose "Web application"
7. Copy **Client ID** and **Client Secret**

**Enter in Settings:**
- Go to **Settings** → **Google Services** → **Google OAuth**
- Paste credentials
- Click **Save**

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep your credentials private and never share them
- Use strong, unique passwords and secrets
- Regularly rotate access tokens (especially Facebook)
- Test connections after saving to ensure they work
- Monitor the audit log for any suspicious activity

### ❌ DON'T:
- Don't share screenshots of credentials with anyone
- Don't commit credentials to Git repositories
- Don't use the same password across multiple platforms
- Don't share admin access unless absolutely necessary

---

## 🧪 Testing Connections

After entering credentials:

1. Click the **Test Connection** button for each platform
2. Wait for the test to complete
3. **Green checkmark** = Success! ✅
4. **Red X** = Error - check credentials and try again ❌

Common error messages:
- "Invalid access token" → Token expired or incorrect
- "Missing required credentials" → Fill in all required fields
- "Connection timeout" → Check your internet or webhook URL

---

## ❓ Troubleshooting

### Facebook Token Expired
- Facebook tokens expire regularly
- Generate a new long-lived token using the exchange method
- Update in settings and test again

### WhatsApp Not Working
- Verify Phone Number ID is correct
- Check that access token has WhatsApp permissions
- Ensure webhook verify token matches

### n8n Webhook Not Reachable
- Make sure n8n workflow is **Active** (not paused)
- Verify the URL is accessible from the internet
- Check firewall settings

### Email Not Sending
- For Gmail, ensure you're using an App Password, not your regular password
- Check port number (587 for TLS, 465 for SSL)
- Verify SMTP host is correct

---

## 📞 Support

If you need help:
1. Check the error message carefully
2. Review this guide for the specific platform
3. Test each field individually
4. Contact support with:
   - Platform name
   - Error message
   - Steps you've tried

---

**🎉 You're all set!** Your integrations will work seamlessly without needing to touch Supabase or Vercel again.
