# n8n Blog Auto-Publisher Setup Guide

## 🚀 Quick Start

### Step 1: Import Workflow

1. Open n8n
2. Click "+" to create new workflow
3. Click the three dots menu (⋮) → "Import from File"
4. Select `blog-auto-publisher.json`
5. Click "Import"

### Step 2: Update API URL

1. Click on the **"Create Blog Post"** node
2. Change the URL from:
   ```
   http://localhost:3000/api/blog/create
   ```
   To your production URL:
   ```
   https://yourdomain.com/api/blog/create
   ```
   
   (Keep `localhost:3000` for testing locally)

### Step 3: Test the Workflow

1. Click "Test workflow" button
2. You should see:
   - ✅ Blog post created successfully
   - The post URL in the success message
3. Check your blog at `/blog` to see the new post!

---

## 📝 How to Use

### Option A: Manual Trigger (Current Setup)

The workflow includes sample blog data. To post:

1. Edit the **"Sample Blog Data"** node
2. Modify the `blogPost` object with your content
3. Click "Test workflow"
4. Done! ✅

### Option B: Schedule Trigger

To auto-publish posts on a schedule:

1. Delete the "When clicking 'Test workflow'" node
2. Add a **"Schedule Trigger"** node:
   - Click "+" → Search "Schedule Trigger"
   - Set your schedule (e.g., "Every day at 9 AM")
3. Connect Schedule Trigger → Sample Blog Data
4. Activate the workflow

### Option C: Webhook Trigger

To trigger from external services:

1. Delete the "When clicking 'Test workflow'" node
2. Add a **"Webhook"** node:
   - Click "+" → Search "Webhook"
   - Set HTTP Method to POST
   - Copy the webhook URL
3. Connect Webhook → Create Blog Post (skip Sample Blog Data)
4. Send POST requests to the webhook URL with blog data

### Option D: Google Sheets Integration

To pull blog posts from Google Sheets:

1. Replace "Sample Blog Data" with **"Google Sheets"** node
2. Configure:
   - Operation: "Read"
   - Sheet ID: Your spreadsheet ID
   - Range: "A2:K100" (adjust as needed)
3. Add a **"Code"** node to transform sheet data:
   ```javascript
   return {
     json: {
       title: $json.Title,
       content: $json.Content,
       excerpt: $json.Excerpt,
       featured_image: $json.Image_URL,
       categories: $json.Categories?.split(',') || [],
       tags: $json.Tags?.split(',') || [],
       author_name: $json.Author || 'Admin',
       status: $json.Status || 'published'
     }
   };
   ```

### Option E: AI Content Generation

Generate blog posts with OpenAI:

1. Add **"OpenAI"** node before "Create Blog Post"
2. Configure:
   - Resource: "Text"
   - Operation: "Message a Model"
   - Model: "gpt-4" or "gpt-3.5-turbo"
   - Prompt:
     ```
     Write a blog post about {{ $json.topic }}.
     Include:
     - Engaging title
     - 500-word content with markdown formatting
     - Meta description
     - 5 relevant tags
     
     Format as JSON with fields: title, content, excerpt, tags
     ```
3. Add **"Code"** node to parse OpenAI response
4. Connect to "Create Blog Post"

---

## 🔧 Advanced Configurations

### Add Image from URL

In the "Sample Blog Data" node, set:

```javascript
featured_image: "https://images.unsplash.com/photo-xxxxx",
image_alt: "Descriptive alt text for SEO"
```

### Add Multiple Categories

```javascript
categories: ["Adventures", "Tips & Guides", "Safety"]
```

### Add Multiple Tags

```javascript
tags: ["paragliding", "oludeniz", "turkey", "adventure", "travel"]
```

### Schedule for Future Publishing

```javascript
scheduled_for: "2025-12-10T10:00:00Z"  // ISO 8601 format
```

### Create Draft Instead of Publishing

```javascript
status: "draft"  // Options: "draft", "published", "scheduled"
```

### Mark as Featured Post

```javascript
is_featured: true  // Will show in hero section
```

---

## 🎯 Real-World Examples

### Example 1: RSS Feed to Blog

1. Add **"RSS Feed Trigger"** node
2. Set feed URL (e.g., your Medium feed)
3. Add **"Code"** node to format:
   ```javascript
   return {
     json: {
       title: $json.title,
       content: $json.content,
       excerpt: $json.description,
       featured_image: $json.image,
       tags: $json.categories || [],
       author_name: $json.creator,
       status: "published"
     }
   };
   ```
4. Connect to "Create Blog Post"

### Example 2: Email to Blog

1. Add **"Email Trigger (IMAP)"** node
2. Filter for specific email address/subject
3. Parse email content
4. Create blog post from email

### Example 3: Airtable to Blog

1. Add **"Airtable Trigger"** node
2. Watch for new records in "Blog Posts" table
3. Map Airtable fields to blog fields
4. Auto-publish approved posts

### Example 4: Slack Command to Blog

1. Add **"Webhook"** node (for Slack slash command)
2. Parse Slack message
3. Create blog post
4. Send confirmation back to Slack

---

## 🔐 Security Best Practices

1. **Use HTTPS** for production API URL
2. **Environment Variables** - Store sensitive data in n8n credentials
3. **Validate Input** - The API already validates, but add extra checks
4. **Rate Limiting** - Add delays between bulk posts
5. **Error Handling** - The workflow includes success/error branching

---

## 📊 Monitoring & Logging

### View Created Posts

After workflow runs:
1. Check the "Success Message" output
2. Copy the blog URL
3. Visit to verify the post

### Check Errors

If workflow fails:
1. Check "Error Message" output
2. Common issues:
   - API URL incorrect
   - Missing required fields (title, content)
   - Network issues
   - Service role key not set

### Workflow History

1. Click "Executions" tab in n8n
2. See all workflow runs
3. View input/output for each step
4. Debug issues

---

## 🎨 Customization Ideas

### Add Notification

After successful post, add nodes to:
- Send Slack message
- Send Discord notification
- Send email to team
- Post to social media

### Add Quality Checks

Before creating post:
- Check word count (minimum 300 words)
- Validate image URLs
- Check for required categories
- Verify meta description length

### Batch Processing

To create multiple posts:
1. Use "Split In Batches" node
2. Add delay between posts (500ms recommended)
3. Process array of blog posts

---

## 🐛 Troubleshooting

### "Failed to connect to API"
- ✅ Check API URL is correct
- ✅ Verify app is running (`npm run dev`)
- ✅ Check firewall isn't blocking requests

### "Missing required field: title"
- ✅ Ensure `title` and `content` are provided
- ✅ Check data mapping in Code node

### "Slug already exists"
- ✅ API auto-appends numbers to duplicate slugs
- ✅ This should work automatically

### "Service role key error"
- ✅ Verify `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local`
- ✅ Restart your Next.js app after adding the key

---

## 📝 Sample Data Formats

### Minimal Post

```json
{
  "title": "My Blog Post",
  "content": "This is the content..."
}
```

### Full-Featured Post

```json
{
  "title": "Amazing Adventure Story",
  "content": "# Heading\n\nContent here...",
  "excerpt": "Short description",
  "featured_image": "https://example.com/image.jpg",
  "featured_image_alt": "Image description",
  "author_name": "John Doe",
  "author_avatar": "https://example.com/avatar.jpg",
  "author_bio": "John is an adventure enthusiast...",
  "categories": ["Adventures", "Tips"],
  "tags": ["paragliding", "travel"],
  "meta_description": "SEO description",
  "meta_keywords": ["keyword1", "keyword2"],
  "status": "published",
  "is_featured": true,
  "scheduled_for": "2025-12-10T10:00:00Z"
}
```

---

## 🎉 You're All Set!

Your n8n workflow is ready to automate blog posting. Start simple with the manual trigger, then expand to your preferred automation method.

**Happy blogging! 📝✨**
