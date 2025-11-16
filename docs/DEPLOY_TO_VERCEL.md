# Deploy Your App to Vercel (Quick Guide)

## 🎯 Why Deploy?

Your n8n WhatsApp workflow needs to send HTTP requests to your app's API. It can't reach `localhost`, so we need your app online!

## 📋 Simple 3-Step Process

### Step 1: Push to GitHub (If Not Already)

**If you haven't already:**

```bash
# Initialize git (if not done)
git init

# Add files
git add .

# Commit
git commit -m "Add WhatsApp integration"

# Create repo on GitHub.com
# Then connect and push:
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

**If already on GitHub:**
```bash
# Just push your latest changes
git add .
git commit -m "Add WhatsApp integration"
git push
```

---

### Step 2: Deploy to Vercel

1. **Go to:** https://vercel.com/
2. **Sign up/Login** with GitHub
3. **Click:** "Add New..." → "Project"
4. **Import** your GitHub repository
5. **Configure:**
   - Framework: Next.js (auto-detected)
   - Root Directory: `./` (or leave default)
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)

6. **Add Environment Variables:**

Click "Environment Variables" and add these:

```
NEXT_PUBLIC_SUPABASE_URL = your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
```

**Where to find these:**
- Go to Supabase Dashboard
- Project Settings → API
- Copy the values

7. **Click:** "Deploy"

⏳ Wait 2-3 minutes...

✅ **You'll get a URL like:** `https://yourapp.vercel.app`

---

### Step 3: Update n8n Workflow

1. **Copy your Vercel URL** (e.g., `https://yourapp.vercel.app`)

2. **Open your n8n workflow**

3. **Add the 2 HTTP Request nodes** (from N8N_WORKFLOW_UPDATE_INSTRUCTIONS.md)

4. **Use your Vercel URL:**
   ```
   https://yourapp.vercel.app/api/conversations/whatsapp
   ```

5. **Save workflow**

6. **Test:** Send WhatsApp message to your business number!

---

## ✅ Verification

After deploying, test your API:

```bash
curl -X POST https://yourapp.vercel.app/api/conversations/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test",
    "message": "Test message",
    "sender": "user",
    "channel": "whatsapp",
    "whatsappPhoneNumber": "1234567890",
    "whatsappProfileName": "Test"
  }'
```

Should return:
```json
{
  "success": true,
  "messageId": "some-uuid",
  "sessionId": "test"
}
```

---

## 🔧 Important Files to Check Before Deploying

### 1. `.gitignore` should include:
```
.env.local
.env*.local
node_modules/
.next/
```

### 2. `package.json` should have:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

### 3. Don't commit `.env.local`
- ❌ Never push `.env.local` to GitHub
- ✅ Add secrets in Vercel dashboard instead

---

## 🚀 After Deployment

Your app will be at: `https://yourapp.vercel.app`

**Update these in n8n:**

Both HTTP Request nodes should use:
```
https://yourapp.vercel.app/api/conversations/whatsapp
```

---

## 🔄 Making Changes Later

When you update your code:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push
```

Vercel automatically redeploys! 🎉

---

## 📱 Complete Flow After Deployment

```
Customer sends WhatsApp
    ↓
Meta WhatsApp API
    ↓
Your n8n Workflow
    ↓
HTTP POST to: https://yourapp.vercel.app/api/conversations/whatsapp
    ↓
Your Vercel App saves to Supabase
    ↓
AI processes message
    ↓
Response saved to Supabase
    ↓
Response sent via WhatsApp
    ↓
Customer receives reply
    ↓
Everything visible in /dashboard/conversations ✅
```

---

## 🆘 Common Issues

### "Build failed"
- Check `package.json` has all dependencies
- Run `npm install` locally first
- Check for TypeScript errors

### "Environment variables not working"
- Redeploy after adding env vars
- Check spelling matches exactly
- No spaces in variable names

### "404 Not Found" on API
- Verify `app/api/conversations/whatsapp/route.ts` exists in repo
- Check file is committed and pushed
- Redeploy if needed

---

## ✨ That's It!

1. Push to GitHub ✅
2. Deploy to Vercel ✅
3. Add env variables ✅
4. Get your URL ✅
5. Update n8n ✅
6. Test WhatsApp ✅

**Simple and fast! Usually takes 5-10 minutes total.** 🚀
