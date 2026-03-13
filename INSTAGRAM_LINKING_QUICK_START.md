# Instagram Customer Linking - Quick Start

## 🎯 What Was Done

I've implemented a complete system to link Instagram DM users to customer records and display their information in both the Instagram chat interface and web chatbot.

## ✅ Changes Made

### 1. Instagram Chat Interface (`app/dashboard/instagram/page.tsx`)
- **Added**: Display customer email with 📧 icon
- **Added**: Display customer phone with 📱 icon
- Now shows full customer information in the chat header when linked

### 2. Web Chatbot (`components/Chatbot.tsx`)
- **Added**: Customer name and email in chatbot header
- Shows: "Name • email@example.com" after customer enters info

### 3. Database Scripts
- **Created**: `database/LINK_INSTAGRAM_TO_CUSTOMER.sql`
  - Automatic linking by email
  - Automatic linking by Instagram username
  - Manual linking helper functions
  - Database triggers for auto-linking

### 4. Documentation
- **Created**: `docs/INSTAGRAM_CUSTOMER_LINKING_GUIDE.md` (comprehensive guide)

## 🚀 Quick Setup (3 Steps)

### Step 1: Run SQL Migration
Open Supabase SQL Editor and paste the entire contents of:
```
database/LINK_INSTAGRAM_TO_CUSTOMER.sql
```

### Step 2: Link Your Specific User
In Supabase SQL Editor, run:
```sql
SELECT link_instagram_user_to_customer(
  '17296017',  -- Or the complete Instagram ID
  'mosparagliding@gmail.com'
);
```

### Step 3: Test It
1. Go to `/dashboard/instagram`
2. Find the conversation with user ID ending in 17296017
3. Click on it - you should now see:
   - Full customer name
   - 📧 Email address
   - 📱 Phone number (if available)

## 📊 How to Find the Complete Instagram ID

If you need the full Instagram ID (not just the last 8 digits):

```sql
-- Run this in Supabase:
SELECT instagram_id, username, customer_name, customer_email
FROM instagram_conversations
WHERE instagram_id LIKE '%17296017'
ORDER BY last_message_at DESC;
```

Then use the complete `instagram_id` value in Step 2.

## 🔍 Verify It Worked

```sql
-- Check if linking was successful:
SELECT 
  ic.instagram_id,
  ic.username,
  ic.customer_name,
  ic.customer_email,
  c.first_name || ' ' || c.last_name as linked_customer_name,
  c.email as linked_customer_email,
  c.phone as customer_phone
FROM instagram_conversations ic
LEFT JOIN customers c ON ic.contact_id = c.id
WHERE ic.instagram_id LIKE '%17296017';
```

If `linked_customer_name` and `linked_customer_email` have values, it worked! ✅

## 📱 What You'll See

### Instagram Chat Page
Before:
```
User 296017
@instagram_user
Instagram ID: ...17296017
```

After:
```
John Doe
@instagram_user
Instagram ID: ...17296017
📧 mosparagliding@gmail.com
📱 +90 555 123 4567
```

### Web Chatbot Header
Before:
```
Chat Support
```

After (when customer enters info):
```
Chat Support
John Doe • john@example.com
```

## 🔄 Automatic Linking

From now on, new Instagram conversations will automatically link to customers if:
- The Instagram user's email matches a customer email in your database
- The Instagram username matches a customer's `instagram_username` field

## 🛠️ Manual Linking Anytime

To link any Instagram user to a customer:

```sql
SELECT link_instagram_user_to_customer(
  'INSTAGRAM_ID_HERE',
  'customer@email.com'
);
```

## 📋 View All Link Statuses

```sql
SELECT 
  instagram_id,
  username,
  customer_email,
  CASE 
    WHEN contact_id IS NOT NULL THEN '✅ Linked'
    WHEN customer_email IS NOT NULL THEN '⚠️ Email stored but not linked'
    ELSE '❌ Not linked'
  END as status
FROM instagram_conversations
ORDER BY last_message_at DESC;
```

## 📚 Full Documentation

For detailed information, troubleshooting, and advanced features:
- See: `docs/INSTAGRAM_CUSTOMER_LINKING_GUIDE.md`

## ⚡ Quick Troubleshooting

**Email not showing?**
- Check if customer exists: `SELECT * FROM customers WHERE email = 'email@example.com'`
- Check if linked: `SELECT contact_id FROM instagram_conversations WHERE instagram_id = 'ID'`
- If not linked, use the manual linking function above

**Name showing wrong?**
- Update customer record: `UPDATE customers SET first_name='X', last_name='Y' WHERE email='...'`
- Refresh Instagram chat page

## 🎉 That's It!

Your Instagram chat and chatbot now show customer information automatically. The linking happens in real-time as customers interact with your system.

---

**Need Help?**
- Check browser console for errors
- Check Supabase logs
- Review `docs/INSTAGRAM_CUSTOMER_LINKING_GUIDE.md`
