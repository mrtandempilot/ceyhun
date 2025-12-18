# Instagram Customer Linking Guide

## Overview

This guide explains how to link Instagram DM conversations to customer records in your system, enabling you to see customer names and emails in both the Instagram chat interface and the web chatbot.

## Features Implemented

✅ **Instagram Chat Enhancement**
- Display customer name and email in Instagram conversation header
- Show customer phone number when available
- Automatic linking of Instagram users to customer records

✅ **Chatbot Enhancement**
- Display customer name and email in chatbot header
- Persistent customer information across sessions

✅ **Database Integration**
- Automatic linking when Instagram user email matches customer email
- Automatic linking when Instagram username matches customer's Instagram username
- Manual linking function for specific cases

---

## How It Works

### 1. Instagram Conversations Table Structure

Your `instagram_conversations` table has these important fields:
- `instagram_id` - The Instagram user's numeric ID (e.g., "17296017")
- `username` - Instagram username (e.g., "@john_doe")
- `customer_email` - Email collected from the conversation
- `customer_name` - Customer's full name
- `contact_id` - Foreign key linking to `customers` table

### 2. Customers Table Integration

The `customers` table now includes:
- `instagram_username` - For linking Instagram accounts
- Standard fields: `first_name`, `last_name`, `email`, `phone`

### 3. Automatic Linking

The system automatically links Instagram conversations to customer records when:
- Instagram conversation email matches customer email
- Instagram username matches customer's Instagram username

---

## Step-by-Step Setup

### Step 1: Run the SQL Migration

Execute the SQL script to set up automatic linking:

```bash
# Open your Supabase SQL Editor and run:
database/LINK_INSTAGRAM_TO_CUSTOMER.sql
```

This script will:
1. Link existing Instagram conversations to customers by email
2. Link by Instagram username
3. Create triggers for automatic future linking
4. Create helper functions for manual linking

### Step 2: Link Your Specific Instagram User

For the Instagram user you mentioned (ID ending in 17296017):

```sql
-- Run this in Supabase SQL Editor:
SELECT link_instagram_user_to_customer(
  '17296017',  -- Full Instagram ID (or the complete ID you have)
  'mosparagliding@gmail.com'  -- Customer email
);
```

**Note:** Replace `'17296017'` with the complete Instagram ID if it's longer. The full ID might be something like `17296017` or a longer number.

### Step 3: Verify the Linking

Check if the linking worked:

```sql
SELECT 
  ic.instagram_id,
  ic.username,
  ic.customer_name,
  ic.customer_email,
  c.first_name,
  c.last_name,
  c.email,
  c.phone
FROM public.instagram_conversations ic
LEFT JOIN public.customers c ON ic.contact_id = c.id
WHERE ic.instagram_id LIKE '%17296017';
```

---

## Using the Enhanced Features

### Instagram Chat Interface

When you open the Instagram chat page (`/dashboard/instagram`):

1. **Conversation List**: Shows customer names instead of generic "User XXXXX"
2. **Chat Header**: Displays:
   - Customer full name
   - Instagram username (@username)
   - Instagram ID (last 8 digits)
   - 📧 Customer email (if linked)
   - 📱 Customer phone (if linked)

### Web Chatbot

When a customer uses the web chatbot:

1. **Before Linking**: Shows just "Chat Support"
2. **After Customer Enters Info**: Shows "Name • email@example.com" in header
3. **Persistent Across Sessions**: Customer info saved in browser session

---

## Manual Linking Process

### Option A: Link by Email

If you know the customer's email, update the Instagram conversation:

```sql
UPDATE public.instagram_conversations
SET customer_email = 'customer@example.com'
WHERE instagram_id = 'INSTAGRAM_USER_ID';
```

The trigger will automatically link it to the customer record.

### Option B: Link by Instagram Username

If the customer is in your database with their Instagram username:

```sql
UPDATE public.customers
SET instagram_username = 'instagram_handle'
WHERE email = 'customer@example.com';
```

Then update the conversation:

```sql
UPDATE public.instagram_conversations
SET username = 'instagram_handle'
WHERE instagram_id = 'INSTAGRAM_USER_ID';
```

### Option C: Direct Manual Link

Use the helper function:

```sql
SELECT link_instagram_user_to_customer(
  'INSTAGRAM_USER_ID',
  'customer@example.com'
);
```

---

## Viewing Link Status

See all Instagram conversations and their customer link status:

```sql
SELECT 
  ic.instagram_id,
  ic.username,
  ic.customer_email,
  ic.customer_name,
  CASE 
    WHEN ic.contact_id IS NOT NULL THEN '✅ Linked'
    WHEN ic.customer_email IS NOT NULL THEN '⚠️ Email stored but not linked'
    ELSE '❌ Not linked'
  END as link_status,
  c.first_name || ' ' || c.last_name as customer_full_name,
  c.email as customer_db_email,
  c.phone as customer_phone
FROM public.instagram_conversations ic
LEFT JOIN public.customers c ON ic.contact_id = c.id
ORDER BY ic.last_message_at DESC;
```

---

## When Customers Register

When a customer registers in your system (via booking, contact form, etc.):

### If They Already Have Instagram Conversations

The trigger will automatically link them if:
- Their email matches an Instagram conversation's `customer_email`
- Their Instagram username matches an Instagram conversation's `username`

### To Ensure Linking

1. **Collect Instagram Handle**: Add an optional Instagram username field to your registration/booking forms
2. **Store It**: Save to `customers.instagram_username`
3. **Auto-Link**: The trigger handles the rest

---

## Troubleshooting

### Customer Email Not Showing in Instagram Chat

**Check 1**: Is the conversation linked?
```sql
SELECT contact_id, customer_email 
FROM instagram_conversations 
WHERE instagram_id = 'YOUR_INSTAGRAM_ID';
```

**Check 2**: Does the customer exist?
```sql
SELECT id, email, first_name, last_name 
FROM customers 
WHERE email = 'customer@example.com';
```

**Fix**: Manually link using the helper function above.

### Customer Name Wrong in Chat

The name comes from:
1. First: Linked customer record (`customers.first_name + last_name`)
2. Fallback: Instagram conversation's `customer_name`
3. Fallback: Instagram `username`
4. Fallback: "User [last 6 digits of ID]"

To fix:
```sql
-- Update customer record
UPDATE customers 
SET first_name = 'Correct', last_name = 'Name'
WHERE email = 'customer@example.com';

-- Refresh will auto-update Instagram conversation
```

---

## API Integration

The Instagram conversations API (`/api/conversations/instagram`) automatically:
- Joins customer data via `contact_id`
- Returns enriched data with customer email and phone
- Uses customer name from database when available

No code changes needed for this to work - just ensure the database linking is set up.

---

## Best Practices

1. **Always Collect Email in Instagram DMs**: Have your bot or workflow ask for email early
2. **Store Instagram Usernames**: When customers register, ask for their Instagram handle
3. **Regular Linking Checks**: Run the link status query weekly to find unlinked conversations
4. **Privacy Compliance**: Ensure you have consent to store and link this data

---

## Example: Complete Workflow

### Scenario: Instagram User Messages You

1. **User sends DM** → Instagram webhook creates conversation in database
2. **Bot asks for email** → Email stored in `customer_email`
3. **Automatic linking** → Trigger checks customers table
   - If email exists → Links automatically
   - If not → Waits for customer to register
4. **User books a tour** → Registers with same email
5. **Auto-link happens** → Next time you open Instagram chat, you see their full info

---

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check Supabase logs for database errors
3. Verify RLS policies allow the queries
4. Ensure the trigger is active:
   ```sql
   SELECT * FROM pg_trigger 
   WHERE tgname = 'trigger_link_instagram_to_customer';
   ```

---

## Summary

You now have:
- ✅ Customer names and emails in Instagram chat interface
- ✅ Customer info displayed in web chatbot header
- ✅ Automatic linking of Instagram users to customer records
- ✅ Manual linking functions for specific cases
- ✅ Persistent customer information across sessions

Your specific user (Instagram ID: ...17296017, email: mosparagliding@gmail.com) can be linked using the SQL function provided in Step 2 above.
