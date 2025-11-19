# SendGrid Setup Guide - Step by Step 🚀

Perfect choice! Let's set up SendGrid for both outgoing AND incoming emails.

---

## 📋 PART 1: Create SendGrid Account (5 minutes)

### Step 1: Sign Up
1. Go to **https://sendgrid.com**
2. Click **"Start for Free"** or **"Sign Up"**
3. Fill in:
   - Email: (your email)
   - Password: (create strong password)
   - Click "Create Account"
4. **Verify your email** (check inbox for verification email)

### Step 2: Complete Setup
1. Answer the setup questions:
   - "What's your role?" → Choose "Developer" or "Business Owner"
   - "Which option best describes you?" → Choose "I send email for my business"
   - "What will you use SendGrid for?" → Choose "Transactional Emails"
2. Click "Get Started"

---

## 📤 PART 2: Setup OUTGOING Emails (10 minutes)

### Step 3: Create API Key

1. **In SendGrid Dashboard:**
   - Click **Settings** (left sidebar)
   - Click **API Keys**
   - Click **"Create API Key"** (blue button)

2. **Configure the key:**
   - Name: `Paragliding App SMTP`
   - Type: **Full Access** (select this option)
   - Click **"Create & View"**

3. **IMPORTANT: Copy the API Key!**
   ```
   Looks like: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   - **Save it somewhere safe!** You can't see it again!
   - Click "Done"

### Step 4: Verify Sender Email

1. **In SendGrid Dashboard:**
   - Click **Settings** → **Sender Authentication**
   - Under "Single Sender Verification", click **"Get Started"**

2. **Fill in your details:**
   - From Name: `Oludeniz Tours`
   - From Email: `your-business-email@gmail.com` (or your domain)
   - Reply To: (same as from email)
   - Company Address: (your business address)
   - Nickname: `Oludeniz Tours`
   - Click **"Create"**

3. **Verify:**
   - Check your email inbox
   - Click the verification link from SendGrid
   - Done!

### Step 5: Add to Your Project

1. **Open `.env.local` file** in your project
2. **Add these lines:**
```env
# SendGrid SMTP Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_actual_api_key_paste_it_here
FROM_EMAIL="Oludeniz Tours" <your-verified-email@gmail.com>
```

3. **Replace:**
   - `SG.your_actual_api_key_paste_it_here` → Your actual API key from Step 3
   - `your-verified-email@gmail.com` → The email you verified in Step 4

4. **Save the file**

### Step 6: Add to Vercel (For Production)

1. **Go to Vercel Dashboard:** https://vercel.com
2. **Find your project**
3. **Click Settings → Environment Variables**
4. **Add these variables:**

   | Name | Value |
   |------|-------|
   | `SMTP_HOST` | `smtp.sendgrid.net` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | `apikey` |
   | `SMTP_PASS` | `SG.your_actual_api_key` |
   | `FROM_EMAIL` | `"Oludeniz Tours" <your-email@gmail.com>` |

5. **Click "Save"**

---

## 📥 PART 3: Setup INCOMING Emails (15 minutes)

### Step 7: Create Database Tables

1. **Open Supabase:** https://supabase.com
2. **Go to SQL Editor**
3. **Open file:** `database/CREATE_INCOMING_EMAILS_TABLE.sql` from your project
4. **Copy ALL the content**
5. **Paste into Supabase SQL Editor**
6. **Click "RUN"**
7. **Verify success:** You should see "Success. No rows returned"

### Step 8: Get Your Webhook URL

1. **Find your Vercel production URL:**
   - Go to Vercel dashboard
   - Find your app
   - Copy the URL (e.g., `https://your-app.vercel.app`)

2. **Your webhook URL will be:**
```
https://your-app.vercel.app/api/emails/incoming
```
   - **Write this down!** You'll need it in the next step.

### Step 9: Configure SendGrid Inbound Parse

1. **In SendGrid Dashboard:**
   - Click **Settings** → **Inbound Parse**
   - Click **"Add Host & URL"**

2. **Option A: Use SendGrid's Domain (Easiest)**
   - Domain: Leave as `inbound.sendgrid.net`
   - Subdomain: Type any name (e.g., `oludeniztours`)
   - URL: `https://your-app.vercel.app/api/emails/incoming`
   - Check: ✅ "POST the raw, full MIME message"
   - Click **"Add"**

   **Your incoming email address will be:**
   ```
   anything@oludeniztours.inbound.sendgrid.net
   ```
   (Use this to receive emails!)

3. **Option B: Use Your Own Domain (Advanced)**
   - Domain: `yourdomain.com`
   - Subdomain: `mail` (creates mail.yourdomain.com)
   - URL: `https://your-app.vercel.app/api/emails/incoming`
   - Check: ✅ "POST the raw, full MIME message"
   - Click **"Add"**

   **Then add MX record to your DNS:**
   ```
   Type: MX
   Host: mail
   Value: mx.sendgrid.net
   Priority: 10
   ```

   **Your incoming email address will be:**
   ```
   anything@mail.yourdomain.com
   ```

---

## 🧪 PART 4: Test Everything!

### Test 1: Outgoing Emails (SMTP)

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Create a test booking** on your website
3. **Check your email** - you should receive confirmation
4. **If no email arrives:**
   - Check Vercel logs for errors
   - Verify API key is correct in `.env.local`
   - Check FROM_EMAIL matches verified sender

### Test 2: Incoming Emails (Webhook)

1. **Send a test email TO:**
   ```
   test@oludeniztours.inbound.sendgrid.net
   (or your custom domain)
   ```

2. **Go to your app:** `https://your-app.vercel.app/dashboard/mail`

3. **Check if email appears** in the mail inbox

4. **If no email appears:**
   - Check SendGrid Inbound Parse settings
   - Verify webhook URL is correct
   - Check Vercel function logs
   - Verify database tables were created

---

## ✅ Success Checklist

After completing all steps, you should have:

- [x] SendGrid account created
- [x] API key generated and saved
- [x] Sender email verified
- [x] `.env.local` configured with SMTP settings
- [x] Vercel environment variables added
- [x] Database tables created in Supabase
- [x] Inbound Parse webhook configured
- [x] Test outgoing email sent successfully
- [x] Test incoming email received in dashboard

---

## 🎉 What You Can Do Now:

### Outgoing:
- ✅ Customers receive booking confirmations automatically
- ✅ You get notified about new bookings
- ✅ Payment receipts sent automatically

### Incoming:
- ✅ All customer emails appear in `/dashboard/mail`
- ✅ Mark as read/unread
- ✅ Archive emails
- ✅ Set up auto-replies
- ✅ Forward to team members

---

## 🆘 Troubleshooting

### "Can't send emails"
- Verify API key is correct
- Check FROM_EMAIL matches verified sender in SendGrid
- Look at Vercel logs for error messages
- Make sure env variables are in Vercel (not just local)

### "Incoming emails not showing"
- Verify you sent to correct address (check Step 9)
- Check SendGrid Activity Feed for webhook calls
- Check Vercel function logs
- Verify database tables exist in Supabase

### "Invalid API Key" error
- Make sure SMTP_USER is exactly: `apikey` (not your email)
- Make sure SMTP_PASS starts with `SG.`
- No extra spaces or quotes in `.env.local`

---

## 📞 Need Help?

If you get stuck on any step, just let me know:
- Which step you're on
- What error you're seeing
- Screenshots help!

Ready to start? Begin with **PART 1: Create SendGrid Account** 🚀
