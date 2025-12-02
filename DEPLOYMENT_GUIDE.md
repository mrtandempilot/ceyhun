# 🚀 Deploy Your Blog to Production

## ✅ Step 1: Push to GitHub (DONE!)

Your code is now on GitHub! ✅

---

## 📊 Step 2: Run Database Setup in Supabase

1. **Open Supabase Dashboard**: https://supabase.com
2. **Go to SQL Editor** (left sidebar)
3. **Click "New query"**
4. **Copy ALL contents** from `database/CREATE_BLOG_TABLES.sql`
5. **Paste** into SQL Editor
6. **Click "Run"** (or press Ctrl+Enter)

You should see: ✅ **Success. No rows returned**

This creates all the blog tables!

---

## 🌐 Step 3: Deploy to Vercel

### Option A: Automatic Deploy (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Click "Add New..." → "Project"**
3. **Import your GitHub repository**
4. **Vercel will auto-detect** it's a Next.js project
5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add these:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
     ```
6. **Click "Deploy"**
7. **Wait 2-3 minutes** ⏱️

### Option B: Via Git Push (Already Set Up)

Since you're already connected to Vercel:
1. Vercel should **auto-deploy** when you push to main
2. Check your Vercel dashboard
3. You should see a new deployment in progress!

---

## 🔑 Step 4: Get Your Environment Variables

### Supabase URL & Keys:
1. Open Supabase Dashboard
2. Go to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Vercel Domain:
After deployment completes, Vercel gives you a URL like:
```
https://your-app-name.vercel.app
```

Use this for `NEXT_PUBLIC_BASE_URL`

---

## 🎯 Step 5: Update n8n Workflow

1. **Open n8n**
2. **Open your "Blog Auto Publisher with AI Agent" workflow**
3. **Click "Create Blog Post (Live)" node**
4. **Change URL** from:
   ```
   http://localhost:3000/api/blog/create
   ```
   To:
   ```
   https://your-app.vercel.app/api/blog/create
   ```
5. **Save workflow**
6. **Test it!** 🎉

---

## ✅ Step 6: Test Everything

1. **Test the blog page**:
   - Go to: `https://your-app.vercel.app/blog`
   - Should show empty blog (no posts yet)

2. **Test n8n workflow**:
   - In n8n, click "Test workflow"
   - Wait 20-30 seconds
   - Check the success message
   - Visit the blog URL it provides!

3. **Create first post manually** (optional):
   - In Supabase SQL Editor:
   ```sql
   INSERT INTO public.posts (
     title, slug, content, excerpt, author_name, status, published_at
   ) VALUES (
     'Welcome to Our Blog!',
     'welcome-to-our-blog',
     '# Hello World\n\nWelcome to the Oludeniz Tours blog!',
     'Welcome to our new blog!',
     'Admin',
     'published',
     NOW()
   );
   ```

---

## 🎉 You're Live!

Your blog is now live at:
- **Blog**: `https://your-app.vercel.app/blog`
- **n8n**: Can create posts with AI
- **Database**: All set up in Supabase

---

## 🐛 Troubleshooting

### "Module not found" errors
- Vercel might need to install new packages
- The deployment log will show this
- It should auto-install from `package.json`

### "Database table doesn't exist"
- Run the SQL script again in Supabase
- Check that you copied the ENTIRE script (423 lines)

### "n8n workflow fails"
- Make sure you updated the URL to your Vercel domain
- Check that `SUPABASE_SERVICE_ROLE_KEY` is in Vercel environment variables
- Redeploy if you added env vars after deployment

### Need to redeploy?
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

## 📝 Next Steps

1. ✅ Set up database
2. ✅ Deploy to Vercel
3. ✅ Add environment variables
4. ✅ Update n8n workflow URL
5. ✅ Test everything
6. 🎉 Start creating AI blog posts!

**Let me know when you're ready to test the n8n workflow with the production URL!** 🚀
