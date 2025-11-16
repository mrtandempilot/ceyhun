# Google OAuth Redirect URIs for Vercel

## What Are Redirect URIs?

When users click "Sign in with Google", they're redirected to Google to authenticate. After authentication, Google needs to know where to send them back. These are called "Authorized redirect URIs".

---

## 🎯 The URIs You Need

### For Supabase Authentication (Your Current Setup)

Since you're using Supabase for authentication, Google redirects users back to **Supabase**, not directly to Vercel.

**Add this URI in Google Cloud Console:**

```
https://wpprlxuqvrinqefybatt.supabase.co/auth/v1/callback
```

**Replace `wpprlxuqvrinqefybatt` with your actual Supabase project reference.**

### For Local Development

Also add this for testing locally:

```
http://localhost:3000/api/auth/callback/google
```

Or if using Supabase locally:

```
http://localhost:54321/auth/v1/callback
```

---

## 📋 Step-by-Step: Adding Redirect URIs to Google Cloud Console

### Step 1: Go to Google Cloud Console

1. Visit https://console.cloud.google.com/
2. Select your project
3. Go to **"APIs & Services"** → **"Credentials"**

### Step 2: Find Your OAuth 2.0 Client ID

1. Look for your OAuth 2.0 Client ID in the list
2. Click on it to edit

### Step 3: Add Authorized Redirect URIs

Under **"Authorized redirect URIs"**, add:

**For Production (Supabase):**
```
https://wpprlxuqvrinqefybatt.supabase.co/auth/v1/callback
```

**For Local Development:**
```
http://localhost:3000
```

### Step 4: Click Save

1. Scroll down and click **"SAVE"**
2. Wait a few seconds for changes to propagate

---

## 🔍 How to Find Your Supabase Project Reference

Your Supabase callback URL includes your project reference. Here's how to find it:

### Method 1: From Your Supabase URL

Your `NEXT_PUBLIC_SUPABASE_URL` looks like:
```
https://wpprlxuqvrinqefybatt.supabase.co
```

The project reference is: `wpprlxuqvrinqefybatt`

So your callback URL is:
```
https://wpprlxuqvrinqefybatt.supabase.co/auth/v1/callback
```

### Method 2: From Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Look for **"URL"** - the callback is `[URL]/auth/v1/callback`

### Method 3: From Supabase Auth Settings

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Authentication** → **Providers**
4. Click on **Google**
5. You'll see the **"Callback URL (for Google)"** - copy this exact URL!

---

## 🚀 What About Vercel URLs?

**Important:** You do NOT need to add your Vercel URL as a redirect URI for Google OAuth!

Here's why:

```
User → Click "Sign in with Google"
  ↓
Google OAuth Login Page
  ↓
User authenticates
  ↓
Google redirects to → Supabase Callback URL ✅
  ↓
Supabase processes authentication
  ↓
Supabase redirects to → Your Vercel App ✅
  ↓
User is logged in!
```

**Vercel is NOT involved in the OAuth redirect - only Supabase is!**

---

## ✅ Complete List of Redirect URIs to Add

### In Google Cloud Console → OAuth Client → Authorized redirect URIs:

```
# Production - Supabase callback
https://wpprlxuqvrinqefybatt.supabase.co/auth/v1/callback

# Local development
http://localhost:3000
```

**That's it! Just these two URLs.**

---

## 🔧 Common Issues & Solutions

### Issue: "redirect_uri_mismatch" error

**Solution:**
1. Check the redirect URI in Google Console matches EXACTLY
2. Common mistakes:
   - Missing `/auth/v1/callback` at the end
   - Using `http://` instead of `https://` for Supabase
   - Wrong project reference in the URL
   - Extra spaces or typos

### Issue: Google login works locally but not in production

**Solution:**
1. Make sure you added the Supabase callback URL (not your Vercel URL)
2. Verify it's using `https://` (not `http://`)

### Issue: "Access blocked: Authorization Error"

**Solution:**
1. Your OAuth consent screen needs to be configured
2. Go to Google Cloud Console → OAuth consent screen
3. Fill in required fields (app name, support email, etc.)
4. Add test users if not published

---

## 📝 Environment Variable Setup

After adding redirect URIs, make sure these are in your Vercel environment variables:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

**Note:** These are configured in **Supabase Dashboard**, not Vercel!

### Where to Configure:

1. Go to https://app.supabase.com
2. Select your project
3. **Authentication** → **Providers**
4. Enable **Google**
5. Enter your Client ID and Secret
6. Click **Save**

---

## 🎯 Quick Checklist

Before testing Google OAuth:

- [ ] Added Supabase callback URL to Google Console
  - `https://[your-project].supabase.co/auth/v1/callback`

- [ ] Added localhost for development (optional)
  - `http://localhost:3000`

- [ ] Saved changes in Google Console

- [ ] Configured Google provider in Supabase Dashboard
  - Entered Client ID
  - Entered Client Secret
  - Enabled the provider

- [ ] OAuth consent screen configured in Google Console
  - App name filled
  - Support email filled
  - Scopes added (email, profile)

---

## 🔗 Useful Links

- **Google Cloud Console:** https://console.cloud.google.com/
- **Supabase Dashboard:** https://app.supabase.com
- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth/social-login/auth-google

---

## 📱 Testing

After setup:

1. **Test locally first:**
   ```bash
   npm run dev
   ```
   - Go to http://localhost:3000/login
   - Click "Continue with Google"
   - Should work if localhost is in redirect URIs

2. **Test on Vercel:**
   - Go to your Vercel URL
   - Click "Continue with Google"
   - Should redirect through Supabase and back to your app

---

**Summary:** You only need to add the Supabase callback URL to Google OAuth, NOT your Vercel URL! 🎉
