# 📱 Social Media Auto-Post Setup Guide

## Overview
This workflow automatically posts your blog articles to **Facebook** and **Instagram** when published.

---

## 🔑 Step 1: Get Facebook Access Token

### 1.1 Create Facebook App
1. Go to https://developers.facebook.com/
2. Click **"My Apps"** → **"Create App"**
3. Choose **"Business"** type
4. Name: "Oludeniz Blog Auto-Post"
5. Click **Create**

### 1.2 Add Instagram Basic Display
1. In your app dashboard → **Add Product**
2. Find **"Instagram Basic Display"** → **Set Up**
3. Click **"Create New App"**
4. Fill in details, Accept terms

### 1.3 Get Page Access Token
1. Go to **Tools** → **Graph API Explorer**
2. Select your app from dropdown
3. Click **"Get Token"** → **"Get Page Access Token"**
4. Select your Facebook Page
5. Grant permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_content_publish`
6. **Copy the token** (save it!)

### 1.4 Get Long-Lived Token
Your token expires in 1 hour. Make it permanent:

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_TOKEN"
```

Replace:
- `YOUR_APP_ID` - From app dashboard
- `YOUR_APP_SECRET` - From app dashboard → Settings → Basic
- `YOUR_SHORT_TOKEN` - Token from step 1.3

**Save the long-lived token!** ✅

### 1.5 Get Page ID
```bash
curl "https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_LONG_LIVED_TOKEN"
```

Find your page and copy the **`id`**

### 1.6 Get Instagram Account ID
```bash
curl "https://graph.facebook.com/v18.0/YOUR_PAGE_ID?fields=instagram_business_account&access_token=YOUR_LONG_LIVED_TOKEN"
```

Copy the **`instagram_business_account.id`**

---

## ⚙️ Step 2: Configure n8n

### 2.1 Import Workflow
1. Open n8n
2. Import `social-media-auto-post.json`
3. Workflow will appear

### 2.2 Add Facebook Credentials
1. Click any Facebook/Instagram node
2. Click **"Create New Credential"**
3. Set **"Credential Type"** → **"Generic Credential"**
4. Add fields:
   - `accessToken`: Your long-lived token
   - `pageId`: Your Facebook Page ID
   - `instagramAccountId`: Your Instagram Business Account ID
5. **Save**

### 2.3 Get Webhook URL
1. Click **"Blog Post Published"** node
2. Click **"Test"**
3. Copy the **Production URL** (looks like: `https://your-n8n.com/webhook/social-post`)

---

## 🔗 Step 3: Connect to Blog

### 3.1 Update Blog API
Add webhook call after successful post creation:

```typescript
// In app/api/blog/create/route.ts
// After successful post insert, add:

const webhookUrl = process.env.N8N_SOCIAL_WEBHOOK_URL;
if (webhookUrl) {
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: data.title,
      excerpt: data.excerpt,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${newPost.slug}`,
      featured_image: data.featured_image
    })
  }).catch(err => console.error('Webhook failed:', err));
}
```

### 3.2 Add Environment Variable
In Vercel dashboard:
- Key: `N8N_SOCIAL_WEBHOOK_URL`
- Value: Your webhook URL from step 2.3

---

## ✅ Step 4: Test

1. **Activate workflow** in n8n (toggle to "Active")
2. **Create test blog post** via n8n or API
3. Check:
   - ✅ Post appears on Facebook Page
   - ✅ Post appears on Instagram
   - ✅ Images loaded properly
   - ✅ Links work

---

## 🎨 Customization

### Change Post Format
Edit the **"Format for Social Media"** node:

```javascript
// Facebook (longer)
const fbPost = `${post.title}

${post.excerpt}

Read the full article: ${post.url}

#paragliding #oludeniz #turkey`;

// Instagram (hashtag heavy)
const instaCaption = `${post.title}

${post.excerpt}

🔗 Link in bio

#paragliding #oludeniz #turkey #adventure #travel`;
```

### Add More Platforms
- Duplicate nodes
- Add Twitter, LinkedIn, etc.
- Configure respective APIs

---

## 🐛 Troubleshooting

### "Invalid access token"
- Token expired → Get new long-lived token
- Wrong permissions → Re-grant in Graph API Explorer

### "Instagram media creation failed"
- Image URL not accessible → Check image hosting
- Image too large → Resize to < 8MB
- Wait longer → Increase timeout in "Wait for Processing" node

### "Facebook post failed"
- Page not connected → Re-link in Facebook settings
- App not approved → Submit for review if needed

---

## 💰 Cost
- **Facebook/Instagram API**: FREE ✅
- **n8n execution**: ~$0.001 per post
- **Total**: Nearly FREE!

---

## 📊 Analytics

Track performance in:
- Facebook Page → Insights
- Instagram → Professional Dashboard
- n8n → Execution logs

---

**You're all set!** 🚀 Every new blog post will auto-share to Facebook & Instagram!
