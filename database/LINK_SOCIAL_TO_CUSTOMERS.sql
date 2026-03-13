-- Link Existing Social Media Conversations to Customers
-- This script attempts to automatically link existing Instagram and Telegram conversations
-- to customer records based on matching usernames, phone numbers, and emails

-- ============================================
-- LINK TELEGRAM CONVERSATIONS TO CUSTOMERS
-- ============================================

-- Step 1: Link by exact phone number match
UPDATE public.telegram_conversations tc
SET customer_id = c.id
FROM public.customers c
WHERE tc.customer_id IS NULL
  AND tc.customer_phone IS NOT NULL
  AND c.phone IS NOT NULL
  AND tc.customer_phone = c.phone;

-- Step 2: Link by Telegram username match
UPDATE public.telegram_conversations tc
SET customer_id = c.id
FROM public.customers c
WHERE tc.customer_id IS NULL
  AND tc.customer_username IS NOT NULL
  AND c.telegram_username IS NOT NULL
  AND LOWER(tc.customer_username) = LOWER(c.telegram_username);

-- Step 3: Link by Telegram chat ID match
UPDATE public.telegram_conversations tc
SET customer_id = c.id
FROM public.customers c
WHERE tc.customer_id IS NULL
  AND tc.telegram_chat_id IS NOT NULL
  AND c.telegram_chat_id IS NOT NULL
  AND tc.telegram_chat_id = c.telegram_chat_id;

-- Step 4: Update customer records with Telegram info from conversations (if not already set)
UPDATE public.customers c
SET telegram_username = COALESCE(c.telegram_username, tc.customer_username),
    telegram_chat_id = COALESCE(c.telegram_chat_id, tc.telegram_chat_id)
FROM public.telegram_conversations tc
WHERE tc.customer_id = c.id
  AND (c.telegram_username IS NULL OR c.telegram_chat_id IS NULL);

-- ============================================
-- LINK INSTAGRAM CONVERSATIONS TO CUSTOMERS
-- ============================================

-- Step 1: Link by Instagram username match
UPDATE public.instagram_conversations ic
SET contact_id = c.id
FROM public.customers c
WHERE ic.contact_id IS NULL
  AND ic.username IS NOT NULL
  AND c.instagram_username IS NOT NULL
  AND LOWER(ic.username) = LOWER(c.instagram_username);

-- Step 2: Update customer records with Instagram username from conversations (if not already set)
UPDATE public.customers c
SET instagram_username = COALESCE(c.instagram_username, ic.username)
FROM public.instagram_conversations ic
WHERE ic.contact_id = c.id
  AND c.instagram_username IS NULL
  AND ic.username IS NOT NULL;

-- ============================================
-- REPORTING
-- ============================================

-- Show linking statistics
SELECT 
    'Telegram Conversations' as table_name,
    COUNT(*) as total_conversations,
    COUNT(customer_id) as linked_to_customers,
    COUNT(*) - COUNT(customer_id) as unlinked
FROM public.telegram_conversations

UNION ALL

SELECT 
    'Instagram Conversations' as table_name,
    COUNT(*) as total_conversations,
    COUNT(contact_id) as linked_to_customers,
    COUNT(*) - COUNT(contact_id) as unlinked
FROM public.instagram_conversations;

-- Show customers with social media accounts
SELECT 
    COUNT(*) as total_customers,
    COUNT(instagram_username) as with_instagram,
    COUNT(telegram_username) as with_telegram,
    COUNT(telegram_chat_id) as with_telegram_chat_id,
    COUNT(whatsapp_number) as with_whatsapp
FROM public.customers;
