# Supabase Cloud to VPS Migration Guide

## 📋 Overview

This guide will help you migrate all your data from Supabase Cloud (free tier) to your own VPS Supabase instance.

## 🎯 Migration Steps

### Step 1: Export Data from Supabase Cloud

Since you're on the free tier, you have several options:

#### Option A: Export via Supabase Dashboard (RECOMMENDED)
1. Go to your Supabase Cloud dashboard
2. Navigate to **Table Editor**
3. For each table, click the **"..."** menu → **"Export as CSV"**
4. Save all CSV files to a folder on your computer

**Tables to export:**
- bookings
- customers
- pilots
- tour_packages
- communications
- customer_interactions
- reviews
- whatsapp_conversations
- whatsapp_messages
- telegram_conversations
- telegram_messages
- instagram_conversations
- instagram_messages
- chatbot_conversations
- conversations
- contact_submissions
- incoming_emails
- expenses
- blog_categories
- blog_posts

#### Option B: Use SQL Editor
1. Open **SQL Editor** in Supabase Cloud
2. Run `MIGRATION_1_EXPORT_CLOUD_DATA.sql`
3. Copy the results and save them

### Step 2: Setup Schema on VPS Supabase

1. Go to your **VPS Supabase dashboard**
2. Navigate to **SQL Editor**
3. Run the **`MIGRATION_MASTER.sql`** script
   - This creates all tables, indexes, triggers, and RLS policies
   - Wait for it to complete (may take 1-2 minutes)

### Step 3: Import Data to VPS

#### Option A: Import via Dashboard (EASIEST)
1. In VPS Supabase dashboard, go to **Table Editor**
2. For each table, click **"Insert"** → **"Import data from CSV"**
3. Upload the CSV files in this order:
   - **First:** customers, pilots, tour_packages, blog_categories
   - **Second:** bookings
   - **Third:** communications, customer_interactions, reviews, blog_posts
   - **Fourth:** All messaging tables
   - **Last:** contact_submissions, incoming_emails, expenses

#### Option B: Import via SQL
1. Open **SQL Editor** in VPS Supabase
2. Edit `MIGRATION_3_IMPORT_DATA.sql` to include your data
3. Run the script

### Step 4: Migrate Storage Buckets

**Manual steps required:**

1. **Download files from Cloud:**
   - Go to Supabase Cloud → **Storage**
   - Download all files from:
     - `tour-images` bucket
     - `blog-images` bucket
     - Any other custom buckets

2. **Create buckets on VPS:**
   - Go to VPS Supabase → **Storage**
   - Create the same buckets
   - Set the same permissions (public/private)

3. **Upload files to VPS:**
   - Upload all downloaded files to the corresponding buckets

### Step 5: Verify Migration

1. In VPS Supabase, open **SQL Editor**
2. Run **`MIGRATION_4_VERIFY.sql`**
3. Check the results:
   - ✅ Row counts should match Cloud instance
   - ✅ No orphaned foreign key references
   - ✅ All indexes created
   - ✅ All RLS policies in place

### Step 6: Update Application Configuration

Update your application's environment variables:

```env
# OLD (Cloud)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# NEW (VPS)
NEXT_PUBLIC_SUPABASE_URL=https://your-vps-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
```

### Step 7: Test Your Application

1. Deploy your application with new credentials
2. Test critical features:
   - ✅ User authentication
   - ✅ Booking creation
   - ✅ Customer management
   - ✅ File uploads
   - ✅ Messaging features

## 🚨 Important Notes

### User Authentication Migration

The `auth.users` table is managed by Supabase and cannot be easily exported. You have options:

1. **Ask users to re-register** (simplest)
2. **Use Supabase CLI** to export/import auth data
3. **Contact Supabase support** for migration assistance

### Data Import Order

**CRITICAL:** Import tables in the correct order due to foreign key dependencies:

1. **Independent tables** (no foreign keys): customers, pilots, tour_packages, blog_categories
2. **Bookings** (references customers via optional user_id)
3. **Dependent tables**: communications, reviews, customer_interactions, blog_posts
4. **Messaging tables**: conversations and messages
5. **Other tables**: contact_submissions, incoming_emails, expenses

### Troubleshooting

**Problem:** Import fails with foreign key error
- **Solution:** Check import order, ensure parent records exist first

**Problem:** Row counts don't match
- **Solution:** Re-export and re-import affected tables

**Problem:** RLS policies blocking access
- **Solution:** Temporarily disable RLS during import, re-enable after

## 📁 Migration Files

All migration scripts are in the `database/` folder:

- `MIGRATION_1_EXPORT_CLOUD_DATA.sql` - Export data from Cloud
- `MIGRATION_2_SETUP_VPS_SCHEMA.sql` - Create tables on VPS
- `MIGRATION_2B_INDEXES_TRIGGERS_RLS.sql` - Create indexes, triggers, RLS
- `MIGRATION_3_IMPORT_DATA.sql` - Import data to VPS
- `MIGRATION_4_VERIFY.sql` - Verify migration success
- **`MIGRATION_MASTER.sql`** - ⭐ All-in-one schema setup (recommended)

## ✅ Migration Checklist

- [ ] Export all tables from Cloud as CSV
- [ ] Download all files from Cloud storage
- [ ] Run MIGRATION_MASTER.sql on VPS
- [ ] Import all CSV files to VPS (in correct order)
- [ ] Create storage buckets on VPS
- [ ] Upload files to VPS storage
- [ ] Run MIGRATION_4_VERIFY.sql
- [ ] Compare row counts
- [ ] Update application environment variables
- [ ] Deploy application with new credentials
- [ ] Test all critical features
- [ ] Handle user authentication migration
- [ ] Decommission Cloud instance (after confirming everything works)

## 🆘 Need Help?

If you encounter issues:
1. Check the verification script output
2. Review the import order
3. Check Supabase logs for errors
4. Ask for assistance with specific error messages
