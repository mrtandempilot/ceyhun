# Vercel Authorized Redirect URIs for OAuth

When you deploy to Vercel and use OAuth (Google login, etc.), you need to add your Vercel URLs to the OAuth provider's authorized redirect URIs.

## 🎯 What Are Redirect URIs?

After a user logs in with Google (or another OAuth provider), they need to be redirected back to your app. The OAuth provider needs to know which URLs are safe to redirect to.

---

## 📋 Your Vercel Redirect URIs

### For Supabase Auth (Google OAuth)

When using Supabase for authentication on Vercel, you need **2 redirect URIs**:

#### 1. **Supabase Callback URL** (Most Important!)
```
https://wpprlxuqvrinqefybatt.supabase.co/auth/v1/callback
```

This is your Supabase project's callback URL. Users will be redirected here after Google login, then Supabase will redirect them back to your app.

#### 2. **Your Vercel App URL** (After Deployment)
```
https://your-app-name.vercel.app
```

Replace `your-app-name` with your actual Vercel deployment URL.

Examples:
- `https://paraglidingwebapp.vercel.app`
- `https://skywalkersfull.vercel.app`
- Or whatever URL Vercel gives you

---

## 🔧 Where to Add These URLs

### Google Cloud Console

1. **Go to:** https://console.cloud.google.com/
2. **Select your project**
3. **Navigate to:** APIs & Services → Credentials
4. **Click on your OAuth 2.0 Client ID**
5. **Under "Authorized redirect URIs", add:**

```
https://wpprlxuqvrinqefybatt.supabase.co/auth/v1/callback
https://your-app-name.vercel.app
http://localhost:3000
```

6. **Click Save**

### Why These Three?

