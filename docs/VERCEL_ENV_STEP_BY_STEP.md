# Vercel Environment Variables - Simple Step-by-Step Guide

Follow these exact steps to set up your environment variables on Vercel.

---

## 🎯 STEP 1: Get Your Supabase Credentials

1. Open your browser
2. Go to: **https://app.supabase.com**
3. Log in to your account
4. Click on your **paragliding project**
5. Click the **Settings** icon (gear) in the left sidebar
6. Click **API** in the settings menu
7. You'll see a page with your credentials

**Copy these 3 values** (keep them in a notepad):

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...
```

✅ **Done with Step 1**

---

## 🚀 STEP 2: Go to Vercel

1. Open your browser
2. Go to: **https://vercel.com/login**
3. Click **"Continue with GitHub"**
4. Log in with your GitHub account
5. You should see your Vercel dashboard

✅ **Done with Step 2**

---

## 📦 STEP 3: Import Your Project (If Not Already Deployed)

**Skip this step if your project is already on Vercel**

1. On Vercel dashboard, click **"Add New..."** button (top right)
2. Select **"Project"**
3. Find your **paraglidingwebapp** repository
4. Click **"Import"**
5. Leave all settings as default for now
6. Click **"Deploy"** at the bottom

⏳ Wait 2-3 minutes for deployment...

7. You'll see: **"Congratulations! 🎉"**
8. You'll get a URL like: `https://paraglidingwebapp-xxxxx.vercel.app`

**Copy your Vercel URL** (save it in notepad)

✅ **Done with Step 3**

---

## ⚙️ STEP 4: Open Environment Variables Settings

1. On your Vercel dashboard, click on your **project name**
2. Click the **"Settings"** tab at the top
3. In the left sidebar, click **"Environment Variables"**
4. You should see an empty list (or existing variables)

✅ **Done with Step 4**

---

## 🔑 STEP 5: Add SUPABASE_URL

1. Click the button **"Add New"** or **"Add Variable"**
2. You'll see fields for Name and Value

Fill in:
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** (paste your Supabase Project URL from Step 1)

3. Under **Environments**, check all 3 boxes:
   - ☑ Production
   - ☑ Preview
   - ☑ Development

4. Click **"Save"**

✅ **Done - Variable 1 of 4**

---

## 🔑 STEP 6: Add SUPABASE_ANON_KEY

1. Click **"Add New"** again

Fill in:
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** (paste your Supabase anon public key from Step 1)

2. Check all 3 environments:
   - ☑ Production
   - ☑ Preview
   - ☑ Development

3. Click **"Save"**

✅ **Done - Variable 2 of 4**

---

## 🔑 STEP 7: Add SUPABASE_SERVICE_ROLE_KEY

1. Click **"Add New"** again

Fill in:
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** (paste your Supabase service_role key from Step 1)

2. Check all 3 environments:
   - ☑ Production
   - ☑ Preview
   - ☑ Development

3. Click **"Save"**

⚠️ **IMPORTANT:** This is a secret key - never share it!

✅ **Done - Variable 3 of 4**

---

## 🔑 STEP 8: Add APP_URL

1. Click **"Add New"** again

Fill in:
- **Name:** `NEXT_PUBLIC_APP_URL`
- **Value:** (paste your Vercel URL from Step 3)
  - Example: `https://paraglidingwebapp-xxxxx.vercel.app`

2. Check all 3 environments:
   - ☑ Production
   - ☑ Preview
   - ☑ Development

3. Click **"Save"**

✅ **Done - Variable 4 of 4**

---

## 🔄 STEP 9: Redeploy Your Site

Now we need to redeploy so the variables take effect:

1. At the top of the page, click **"Deployments"** tab
2. Find your latest deployment (should be at the top)
3. Click the **3 dots (⋯)** on the right side
4. Click **"Redeploy"**
5. Click **"Redeploy"** again to confirm

⏳ Wait 2-3 minutes for redeployment...

✅ **Done with Step 9**

---

## ✅ STEP 10: Verify It Works

Let's test if everything is working:

1. Go to your Vercel URL + `/api/tours`
   - Example: `https://paraglidingwebapp-xxxxx.vercel.app/api/tours`

2. You should see either:
   - A list of tours (if you have data): `[{...}]`
   - An empty array: `[]`
   - Success message

❌ **If you see an error:**
- Go back to Step 4
- Check all variable names are spelled correctly (case-sensitive!)
- Make sure no extra spaces
- Try redeploying again (Step 9)

✅ **If you see data or empty array - SUCCESS!** 🎉

---

## 📱 STEP 11 (Optional): Add WhatsApp Variables

**Only do this if you're using WhatsApp integration**

For each variable below, repeat this process:

1. Click **"Add New"** in Environment Variables
2. Enter the **Name** and **Value**
3. Check all 3 environments
4. Click **"Save"**

### Variables to Add:

**1. WHATSAPP_PHONE_NUMBER_ID**
- Get from: Meta for Developers → WhatsApp → Getting Started
- Example value: `123456789012345`

**2. WHATSAPP_BUSINESS_ACCOUNT_ID**
- Get from: Meta for Developers → WhatsApp → Getting Started
- Example value: `123456789012345`

**3. WHATSAPP_ACCESS_TOKEN**
- Get from: Meta for Developers → WhatsApp → Getting Started
- Example value: `EAAxxxxxxxxxxxxxxxxxx`

**4. WHATSAPP_VERIFY_TOKEN**
- Make up your own secret token
- Example value: `my_secret_verify_token_123`

**5. WHATSAPP_API_VERSION**
- Use: `v18.0`

After adding all WhatsApp variables:
- Go back to **Deployments** tab
- Click **3 dots (⋯)** → **Redeploy**

✅ **Done with WhatsApp**

---

## 🤖 STEP 12 (Optional): Add n8n Webhook

**Only do this if you're using n8n chatbot**

1. Go to your n8n workflow
2. Find the Webhook node
3. Copy the webhook URL
   - Should look like: `https://yourname.app.n8n.cloud/webhook/abc123/chat`

4. In Vercel Environment Variables, click **"Add New"**

Fill in:
- **Name:** `N8N_WEBHOOK_URL`
- **Value:** (paste your n8n webhook URL)

5. Check all 3 environments
6. Click **"Save"**
7. Redeploy (Deployments → 3 dots → Redeploy)

✅ **Done with n8n**

---

## 📋 Final Checklist

Make sure you have all these in Vercel:

**Required (Basic Setup):**
- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `SUPABASE_SERVICE_ROLE_KEY`
- [x] `NEXT_PUBLIC_APP_URL`

**Optional (WhatsApp):**
- [ ] `WHATSAPP_PHONE_NUMBER_ID`
- [ ] `WHATSAPP_BUSINESS_ACCOUNT_ID`
- [ ] `WHATSAPP_ACCESS_TOKEN`
- [ ] `WHATSAPP_VERIFY_TOKEN`
- [ ] `WHATSAPP_API_VERSION`

**Optional (n8n):**
- [ ] `N8N_WEBHOOK_URL`

---

## 🎉 YOU'RE DONE!

Your environment variables are now set up on Vercel!

**Your app is live at:** `https://paraglidingwebapp-xxxxx.vercel.app`

**Next steps:**
1. Test your booking system
2. Test WhatsApp (if configured)
3. Check dashboard: `https://your-url.vercel.app/dashboard`

---

## ❓ Having Issues?

### Problem: "Cannot read Supabase"

**Solution:**
1. Go to Settings → Environment Variables
2. Click on `NEXT_PUBLIC_SUPABASE_URL`
3. Make sure it says `NEXT_PUBLIC_SUPABASE_URL` exactly (case-sensitive)
4. Check value has no spaces before/after
5. Redeploy

### Problem: "404 Error"

**Solution:**
1. Check your Vercel URL is correct
2. Try adding `/api/tours` at the end
3. Wait a few minutes for propagation

### Problem: "Build Failed"

**Solution:**
1. Go to Deployments
2. Click on the failed deployment
3. Read the error message
4. Usually means a variable name is misspelled

---

## 🆘 Quick Help Reference

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **Meta Developers:** https://developers.facebook.com/

---

**That's it! Each step should take 1-2 minutes. Total time: 15-20 minutes.** ⏱️
