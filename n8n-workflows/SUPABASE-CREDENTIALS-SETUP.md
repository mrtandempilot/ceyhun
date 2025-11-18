# 🔑 Supabase Credentials Setup for n8n

## ❌ Error You're Seeing:
```
Authorization failed - please check your credentials
No API key found in request
```

## ✅ Solution: Configure Supabase Credentials

You need to create a credential in n8n that includes your Supabase API keys.

---

## 📝 Step-by-Step Setup (2 Minutes)

### Step 1: Get Your Supabase Keys

1. Go to https://app.supabase.com
2. Select your project
3. Click **Settings** (gear icon in sidebar)
4. Click **API** 
5. You'll see two keys:
   - **anon public** key - Copy this
   - **service_role** key - Copy this (⚠️ Keep secret!)

Example:
```
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdX...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdX...
```

---

### Step 2: Create Credential in n8n

1. **Open n8n**
2. Click **Credentials** in the left sidebar (or go to Settings → Credentials)
3. Click **+ Add Credential**
4. Search for **"HTTP Header Auth"**
5. Click on **HTTP Header Auth**

---

### Step 3: Configure the Credential

You need to add **TWO headers**:

#### Header #1: API Key Header
- **Name:** `supabase-auth` (or "Supabase API Key")
- **Header Name:** `apikey`
- **Header Value:** Paste your **anon public** key

#### Header #2: Authorization Header
- Click **+ Add Header** (there should be an option to add multiple headers)
- **Header Name:** `Authorization`
- **Header Value:** `Bearer YOUR_SERVICE_ROLE_KEY`
  - Replace `YOUR_SERVICE_ROLE_KEY` with your actual service_role key
  - **Important:** Don't forget the word `Bearer` with a space before the key!

Example:
```
Header 1:
  Name: apikey
  Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYm...

Header 2:
  Name: Authorization
  Value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdX...
```

---

### Step 4: Save the Credential

1. **Credential Name:** Type `supabase-auth` (must match the name in the workflow)
2. Click **Save**

---

### Step 5: Assign to Workflow Node

1. Go back to your workflow
2. Click on the **"Get Tomorrow's Bookings"** node
3. Under **Credential for HTTP Header Auth**, select **supabase-auth**
4. Do the same for ALL nodes that connect to Supabase:
   - "Get Unassigned Bookings"
   - "Get Available Pilots"
   - "Assign Pilot to Booking"

---

## 🔍 Alternative Method (If Multiple Headers Don't Work)

If n8n's HTTP Header Auth doesn't support multiple headers easily, use this workaround:

### Create TWO separate credentials:

**Credential 1: API Key**
- Type: HTTP Header Auth
- Name: `supabase-apikey`
- Header Name: `apikey`
- Header Value: Your anon public key

**Credential 2: Authorization**
- Type: HTTP Header Auth  
- Name: `supabase-auth`
- Header Name: `Authorization`
- Header Value: `Bearer YOUR_SERVICE_ROLE_KEY`

Then in each HTTP Request node:
1. Set **Authentication** to "Generic Credential Type"
2. Select **HTTP Header Auth**
3. Choose **both** credentials (if n8n allows) or use the service_role one

---

## 🎯 Simpler Alternative: Add Headers Manually

If credential setup is confusing, you can add the headers directly to each HTTP Request node:

1. Click on the HTTP Request node (e.g., "Get Tomorrow's Bookings")
2. Scroll to **Headers** section
3. Toggle **Send Headers** to ON
4. Click **Add Header Parameter**
5. Add these two headers:

**Header 1:**
- Name: `apikey`
- Value: Your anon public key

**Header 2:**
- Name: `Authorization`  
- Value: `Bearer YOUR_SERVICE_ROLE_KEY`

Repeat for all Supabase HTTP Request nodes.

---

## ✅ Test the Setup

1. Go back to your workflow
2. Click **Execute Workflow** (manual test)
3. Check the "Get Tomorrow's Bookings" node
4. If successful, you'll see data or an empty array `[]` (if no bookings tomorrow)
5. If you still get 401 error, double-check:
   - Keys are correct (no extra spaces)
   - You included `Bearer ` before the service_role key
   - The credential name matches what's in the workflow

---

## 🚨 Common Mistakes

❌ **Missing "Bearer "** - Authorization header MUST start with `Bearer ` (with space)
❌ **Wrong key** - Make sure you're using service_role for Authorization, not anon key
❌ **Extra spaces** - Copy/paste keys carefully, no line breaks or spaces
❌ **Credential name mismatch** - The credential must be named `supabase-auth` or update workflow nodes

---

## 📚 Summary

✅ Get both keys from Supabase (anon public + service_role)
✅ Create HTTP Header Auth credential in n8n
✅ Add TWO headers: `apikey` and `Authorization`
✅ Assign credential to all Supabase nodes
✅ Test the workflow

Once credentials are configured, the error will disappear! 🎉
