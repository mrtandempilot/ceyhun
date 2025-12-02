# OpenRouter AI Blog Generator Setup

## 🤖 What This Does

This workflow automatically generates complete blog posts using AI (via OpenRouter) and publishes them to your blog. Just specify a topic, and the AI writes everything!

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get OpenRouter API Key

1. Go to https://openrouter.ai/
2. Sign up / Log in
3. Go to "Keys" section
4. Click "Create Key"
5. Copy your API key

### Step 2: Add API Key to n8n

1. In n8n, go to **Settings** (bottom left) → **Credentials**
2. Click **"+ Add Credential"**
3. Search for **"HTTP Header Auth"** or **"Generic Auth"**
4. Set it up manually:
   - **Name**: OpenRouter API
   - **Type**: Header Auth
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer YOUR_API_KEY_HERE`
5. Save

**OR** use the simpler method in the workflow (already configured - just add your key in the Authorization header).

### Step 3: Import Workflow

1. In n8n, click **"+"** → **"Import from File"**
2. Select `ai-blog-generator-openrouter.json`
3. Click **"Import"**

### Step 4: Test It!

1. Click **"Test workflow"**
2. Wait 10-20 seconds (AI is thinking 🧠)
3. Check the output - you should see a complete blog post!
4. Visit `/blog` to see it published!

---

## 🎯 How to Use

### Method 1: Change the Topic (Easiest)

Edit the **"Blog Topic Settings"** node:

```javascript
return {
  json: {
    topic: "best time to visit Oludeniz for paragliding",  // ← Change this
    tone: "informative and friendly",
    target_audience: "adventure travelers",
    keywords: ["paragliding", "oludeniz", "best-time", "weather"],
    category: "Tips & Guides",  // Must match your categories
    tags: ["paragliding", "oludeniz", "travel-tips", "weather"]
  }
};
```

### Method 2: Multiple Topics (Batch)

Change **"Blog Topic Settings"** to return an array:

```javascript
const topics = [
  {
    topic: "paragliding safety checklist",
    category: "Safety",
    tags: ["safety", "checklist", "paragliding"]
  },
  {
    topic: "what to wear for paragliding",
    category: "Tips & Guides",
    tags: ["clothing", "paragliding", "tips"]
  },
  {
    topic: "best beaches in Oludeniz",
    category: "Destinations",
    tags: ["beaches", "oludeniz", "travel"]
  }
];

return topics.map(t => ({
  json: {
    ...t,
    tone: "friendly and helpful",
    target_audience: "tourists and adventure seekers",
    keywords: t.tags
  }
}));
```

Then add a **"Split In Batches"** node before "Generate with OpenRouter".

### Method 3: Schedule Daily Posts

1. Delete **"When clicking 'Test workflow'"** node
2. Add **"Schedule Trigger"** node
3. Set schedule: "Every day at 9:00 AM"
4. Have different topics rotate or pull from a database

---

## 🎨 AI Model Options

The workflow uses **Claude 3.5 Sonnet** by default. You can change the model in the **"Generate with OpenRouter"** node:

### Available Models (via OpenRouter):

**Best for Blog Content:**
- `anthropic/claude-3.5-sonnet` - Best quality, creative (recommended)
- `anthropic/claude-3-opus` - Highest quality, expensive
- `openai/gpt-4-turbo` - Very good, versatile
- `openai/gpt-4` - Reliable, good quality

**Budget-Friendly:**
- `openai/gpt-3.5-turbo` - Fast, cheap, decent quality
- `anthropic/claude-3-haiku` - Fast, cheap, good for simple posts
- `meta-llama/llama-3-70b-instruct` - Open source, free tier

**Specialized:**
- `google/gemini-pro` - Good for technical content
- `perplexity/sonar-medium-online` - Has web search (uses recent info)

To change model, edit the `model` parameter in **"Generate with OpenRouter"** body:

```json
"model": "anthropic/claude-3.5-sonnet"  // ← Change this
```

---

## 💰 Cost Estimates

**Claude 3.5 Sonnet** (recommended):
- ~$0.01-0.03 per blog post
- Excellent quality

**GPT-4 Turbo**:
- ~$0.02-0.05 per blog post
- Very good quality

**GPT-3.5 Turbo** (budget):
- ~$0.001-0.003 per blog post
- Good quality for simple posts

**Llama 3 70B** (free tier):
- Free (with limits)
- Good quality

---

## 🎯 Customization Tips

### Add Featured Image Selection

Replace the hardcoded image URL with Unsplash API:

1. Add **"HTTP Request"** node before "Create Blog Post"
2. URL: `https://api.unsplash.com/search/photos?query={{ $json.keywords[0] }}&per_page=1`
3. Add Unsplash API key
4. Extract image URL in "Format Blog Data"

### Add Content Review Step

1. After "Format Blog Data", add **"IF"** node
2. Check if content length > 500 words
3. If yes → Create post
4. If no → Regenerate or send alert

### Add Human Approval

1. After "Format Blog Data", save as draft (`status: "draft"`)
2. Send email to admin with post preview
3. Admin approves → separate workflow publishes it

### Improve Prompts

Edit the prompt in **"Generate with OpenRouter"** to:
- Add your brand voice guidelines
- Include specific formatting requirements
- Add examples of good posts
- Specify word count ranges

---

## 🔧 Advanced Features

### Multi-Language Posts

Modify the prompt to include:

```javascript
content: `Write this blog post in ${language}...`
```

Supported: English, Turkish, Spanish, French, German, etc.

### SEO Keywords Integration

Connect to **Google Search Console API** to get:
- Trending keywords
- Low-competition keywords
- Your current ranking keywords

Then use those as topics!

### Content Calendar

1. Create Google Sheet with topics
2. Use **"Google Sheets"** node to read
3. Generate one post per day from the sheet

### A/B Testing Titles

Generate multiple title options:

```javascript
"Generate 5 different title options and pick the most engaging one..."
```

---

## 📊 Quality Checks

The AI is instructed to:
- ✅ Use proper markdown formatting
- ✅ Include keywords naturally
- ✅ Create SEO-friendly meta descriptions
- ✅ Write 800-1000 words
- ✅ Be engaging and actionable

**Pro Tip**: After generating a few posts, review them and update the AI prompt with feedback for better results!

---

## 🐛 Troubleshooting

### "OpenRouter API error"
- ✅ Check your API key is correct
- ✅ Verify you have credits on OpenRouter
- ✅ Check the model name is spelled correctly

### "Could not parse AI response"
- ✅ Sometimes AI doesn't return pure JSON
- ✅ The workflow tries to extract JSON automatically
- ✅ If it fails, check the AI response in execution logs

### "Blog post too short"
- ✅ Increase `max_tokens` in OpenRouter request
- ✅ Also update the prompt: "Write 1500-2000 words"

### "Generated content is repetitive"
- ✅ Adjust `temperature` (0.7 = balanced, 0.9 = more creative, 0.5 = more focused)
- ✅ Provide more specific prompts

---

## 🎉 Example Topics to Try

**Safety:**
- "Essential paragliding safety equipment checklist"
- "How to prepare for your first tandem flight"
- "Weather conditions perfect for paragliding"

**Travel Tips:**
- "Best months to visit Oludeniz for paragliding"
- "What to pack for a paragliding vacation"
- "How to choose a paragliding company in Turkey"

**Destinations:**
- "Top 5 paragliding spots in Oludeniz"
- "Hidden gems around Oludeniz Blue Lagoon"
- "Day trips from Oludeniz worth taking"

**Adventure Stories:**
- "What it feels like to paraglide over the Blue Lagoon"
- "A beginner's first paragliding experience"
- "Sunrise paragliding: An unforgettable adventure"

---

## 🚀 Ready to Generate!

1. Import the workflow
2. Add your OpenRouter API key
3. Change the topic in "Blog Topic Settings"
4. Click "Test workflow"
5. Watch the magic happen! ✨

Your blog will be automatically filled with high-quality, SEO-optimized content!

**Questions?** Let me know and I'll help you customize it further! 🎯
