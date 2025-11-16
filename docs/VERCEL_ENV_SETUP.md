# Vercel Environment Variables Setup Guide

This guide shows you exactly how to set up environment variables for your paragliding webapp on Vercel.

## 📋 Required Environment Variables

Based on your `.env.local.example`, you need these variables:

### **Essential (Required for Basic Functionality)**

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### **WhatsApp Integration (If Using WhatsApp)**

```
WHATSAPP_PHONE_NUMBER_ID=your-whatsapp-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_ACCESS_TOKEN=your-permanent-access-token
WHATSAPP_VERIFY_TOKEN=your-custom-webhook-verify-token
WHATSAPP_API_VERSION=v18.0
```

### **Application URL (Important for Webhooks)**

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### **n8n Integration (If Using Chatbot)**

```
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id/chat
```

---

## 🎯 Method 1: Vercel Dashboard (Recommended)

### Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Navigate to Settings**
   - Click on "Settings" tab
   - Select "Environment Variables" from left sidebar

3. **Add Each Variable**

   For each variable:
   
   a. **Click** "Add New"
   
   b. **Enter Name** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   
   c. **Enter Value** (paste your actual value)
   
   d. **Select Environment(s)**:
      - ✅ Production
      - ✅ Preview
      - ✅ Development
   
   e. **Click** "Save"

4. **Example - Adding Supabase URL**:

   ```
   Name:  NEXT_PUBLIC_SUPABASE_URL
   Value: https://abcdefghijklmnop.supabase.co
   
   Environments:
   ☑ Production
   ☑ Preview  
   ☑ Development
   ```

5. **Repeat for All Variables**

### Required Variables Checklist

Copy these into Vercel (replace with your actual values):

```bash
# ✅ Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ✅ App URL (REQUIRED after first deploy)
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app

# 📱 WhatsApp (Optional - only if using WhatsApp)
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxx
WHATSAPP_VERIFY_TOKEN=your_secret_verify_token_123
WHATSAPP_API_VERSION=v18.0

# 🤖 n8n (Optional - only if using chatbot)
N8N_WEBHOOK_URL=https://your-n8n.app.n8n.cloud/webhook/abc123/chat
```

---

## 🚀 Method 2: Vercel CLI

If you prefer command line:

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login

```bash
vercel login
```

### 3. Link Your Project

```bash
cd c:\Users\mrtan\OneDrive\Desktop\paraglidingwebapp
vercel link
```

### 4. Add Environment Variables

```bash
# Add production variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste value when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste value when prompted

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste value when prompted

# Add to preview and development too
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_URL development

# Repeat for all variables...
```

### 5. Pull Variables Locally (Optional)

```bash
vercel env pull .env.local
```

---

## 📝 Where to Find Your Values

### Supabase Variables

1. Go to: https://app.supabase.com
2. Select your project
3. Click "Settings" → "API"
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### WhatsApp Variables

1. Go to: https://developers.facebook.com/
2. Select your app
3. WhatsApp → Getting Started:
   - **Phone Number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - **Business Account ID** → `WHATSAPP_BUSINESS_ACCOUNT_ID`
   - **Access Token** → `WHATSAPP_ACCESS_TOKEN`
4. **Verify Token** → Create your own (any random string)

### App URL

- **Before first deploy:** Leave blank or set to `http://localhost:3000`
- **After first deploy:** Use your Vercel URL (e.g., `https://yourapp.vercel.app`)
- **Important:** Update this after deployment and redeploy

### n8n Webhook URL

1. Open your n8n workflow
2. Find the Webhook node
3. Copy the webhook URL
4. Should look like: `https://yourname.app.n8n.cloud/webhook/abc123/chat`

---

## ⚠️ Important Notes

### 1. **Security**

- ❌ **NEVER** commit `.env.local` to GitHub
- ❌ **NEVER** share your `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Keep sensitive keys only in Vercel dashboard

### 2. **Redeploy After Adding Variables**

After adding environment variables:

```bash
# Trigger a new deployment
git commit --allow-empty -m "Trigger redeploy"
git push
```

Or in Vercel Dashboard:
- Go to "Deployments"
- Click "⋯" on latest deployment
- Select "Redeploy"

### 3. **Update NEXT_PUBLIC_APP_URL**

**First deployment:**
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**After getting Vercel URL:**
1. Update to: `https://yourapp.vercel.app`
2. Redeploy
3. Update n8n webhook to use this URL

---

## ✅ Verification Steps

### 1. Check Variables Are Set

In Vercel Dashboard:
- Settings → Environment Variables
- Verify all variables are listed
- Check they're enabled for Production, Preview, Development

### 2. Test API Endpoint

After deployment:

```bash
curl https://yourapp.vercel.app/api/conversations/whatsapp \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","message":"Test","sender":"user","channel":"whatsapp"}'
```

Should return `{"success":true,...}`

### 3. Check Build Logs

In Vercel Dashboard:
- Go to "Deployments"
- Click on latest deployment
- Check "Build Logs" for any environment variable errors

---

## 🐛 Troubleshooting

### "Missing environment variables"

**Problem:** Build fails with missing env vars

**Solution:**
1. Check variable names match exactly (case-sensitive)
2. Ensure no spaces in variable names
3. Verify variables are enabled for Production
4. Redeploy after adding

### "Environment variables not working"

**Problem:** Variables seem not to be loaded

**Solution:**
1. Check if variable name starts with `NEXT_PUBLIC_` (for client-side)
2. Non-public variables only work server-side
3. Restart development server: `vercel dev`
4. Clear cache and redeploy

### "Cannot read environment variable"

**Problem:** `process.env.VARIABLE_NAME` returns undefined

**Solution:**
1. Client-side variables MUST start with `NEXT_PUBLIC_`
2. Server-side variables: Only in API routes or server components
3. Check spelling and capitalization
4. Verify variable is set in Vercel

---

## 📱 Complete Deployment Checklist

- [ ] 1. Create project on Vercel (connect GitHub repo)
- [ ] 2. Add Supabase environment variables
- [ ] 3. Add `NEXT_PUBLIC_APP_URL=http://localhost:3000` (temporary)
- [ ] 4. Deploy project
- [ ] 5. Get Vercel URL (e.g., `https://yourapp.vercel.app`)
- [ ] 6. Update `NEXT_PUBLIC_APP_URL` to Vercel URL
- [ ] 7. Add WhatsApp variables (if using WhatsApp)
- [ ] 8. Add n8n webhook URL (if using chatbot)
- [ ] 9. Redeploy to apply updated variables
- [ ] 10. Update n8n workflow with Vercel URL
- [ ] 11. Test WhatsApp integration
- [ ] 12. Verify data in Supabase

---

## 🎯 Quick Start Template

Copy this template and fill in your values:

```bash
# ===================
# VERCEL ENVIRONMENT VARIABLES
# ===================

# --- REQUIRED ---
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=

# --- OPTIONAL: WhatsApp ---
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_API_VERSION=v18.0

# --- OPTIONAL: n8n ---
N8N_WEBHOOK_URL=
```

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Env Vars Docs:** https://vercel.com/docs/projects/environment-variables
- **Supabase Dashboard:** https://app.supabase.com
- **Meta Developers:** https://developers.facebook.com/
- **n8n Cloud:** https://app.n8n.cloud/

---

## 📞 Need Help?

If you're stuck:

1. Check your `.env.local` locally works: `npm run dev`
2. Compare local `.env.local` with Vercel environment variables
3. Check Vercel build logs for specific errors
4. Verify Supabase connection: https://yourapp.vercel.app/api/tours
5. Test WhatsApp webhook: https://yourapp.vercel.app/api/whatsapp/webhook

---

**That's it! Your environment variables should now be properly configured on Vercel.** 🚀
