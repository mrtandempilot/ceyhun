# 🖼️ Setup Supabase Image Storage for Blog

## Step 1: Create Storage Bucket

1. **Run SQL in Supabase**:
   - Open Supabase Dashboard
   - Go to SQL Editor
   - Copy contents of `database/CREATE_BLOG_STORAGE.sql`
   - Run it

2. **Verify**:
   - Go to Storage section in Supabase
   - You should see new bucket: `blog-images`
   - It should be marked as PUBLIC ✅

---

## Step 2: Get Supabase Service Role Key

The n8n workflow needs this to upload images.

**Already have it?** Check your `.env.local` file for `SUPABASE_SERVICE_ROLE_KEY`

**Need it?**
1. Supabase Dashboard → Settings → API
2. Copy **service_role** key (the secret one)
3. Save it - you'll add to n8n

---

## Step 3: Add to n8n Credentials

1. Open n8n
2. Go to **Settings** → **Credentials**
3. Click **"+ Add Credential"**
4. Search for **"Supabase"** or create **"HTTP Header Auth"**:
   - Name: `Supabase API`
   - Header: `Authorization`
   - Value: `Bearer YOUR_SERVICE_ROLE_KEY_HERE`
5. Save

---

## Step 4: Import Updated Workflow

The new workflow will:
- ✅ Scrape article for image
- ✅ Download image
- ✅ Upload to Supabase Storage
- ✅ Use Supabase URL (fast, reliable!)
- ✅ Fallback to default if fails

**Import**: `daily-paragliding-news.json`

---

## 🎯 How It Works

**Old way:**
```
Article URL → Extract URL → Use external URL → ❌ Often broken
```

**New way:**
```
Article URL → Extract URL → Download → Upload to Supabase → ✅ Never breaks!
```

**Image URL format:**
```
https://YOUR_PROJECT.supabase.co/storage/v1/object/public/blog-images/2024-12-02-article-slug.jpg
```

---

## ✅ Benefits

- 🚀 **Fast loading** - Same CDN as your site
- 🔒 **Reliable** - You own the images
- 🎨 **No CORS issues** - Same domain
- 💾 **Organized** - All blog images in one place
- ♾️ **Never expires** - External sites can't remove them

---

## 💰 Cost

Supabase Free Tier:
- **Storage**: 1 GB free
- **Bandwidth**: 2 GB/month free

**Average blog image**: 200 KB
- **~5,000 images** before you need to upgrade!
- **Daily posts for 13+ years** ✅

---

## 🐛 Troubleshooting

**"Bucket not found"**
- Run the SQL script again
- Check bucket name is exactly `blog-images`

**"Upload failed"**
- Check service role key is correct in n8n
- Verify storage policies are active

**"Images not showing"**
- Check bucket is marked as PUBLIC
- Verify image URL format is correct

---

**You're all set!** Run the SQL script and re-import the workflow! 🚀
