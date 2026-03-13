-- Add Social Media Fields to Customers Table
-- This migration adds Instagram, Telegram, and WhatsApp fields to the customers table
-- for linking social media conversations to customer records

-- Add social media columns to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS instagram_username TEXT,
ADD COLUMN IF NOT EXISTS telegram_username TEXT,
ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS social_media_profiles JSONB DEFAULT '{}'::jsonb;

-- Create indexes for faster lookups when matching incoming messages
CREATE INDEX IF NOT EXISTS idx_customers_instagram_username ON public.customers(instagram_username) WHERE instagram_username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_telegram_username ON public.customers(telegram_username) WHERE telegram_username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_telegram_chat_id ON public.customers(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_whatsapp_number ON public.customers(whatsapp_number) WHERE whatsapp_number IS NOT NULL;

-- Add unique constraints to prevent duplicate social media accounts
-- Note: Using unique indexes with WHERE clause to allow NULL values
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_instagram_username_unique 
ON public.customers(LOWER(instagram_username)) 
WHERE instagram_username IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_telegram_chat_id_unique 
ON public.customers(telegram_chat_id) 
WHERE telegram_chat_id IS NOT NULL;

-- Add customer_id foreign key to telegram_conversations
ALTER TABLE public.telegram_conversations 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

-- Create index on customer_id for better join performance
CREATE INDEX IF NOT EXISTS idx_telegram_conversations_customer_id 
ON public.telegram_conversations(customer_id);

-- Add comment to document the purpose
COMMENT ON COLUMN public.customers.instagram_username IS 'Customer Instagram username for linking Instagram DM conversations';
COMMENT ON COLUMN public.customers.telegram_username IS 'Customer Telegram username for linking Telegram conversations';
COMMENT ON COLUMN public.customers.telegram_chat_id IS 'Customer Telegram chat ID for linking Telegram conversations';
COMMENT ON COLUMN public.customers.whatsapp_number IS 'Customer WhatsApp number for linking WhatsApp conversations';
COMMENT ON COLUMN public.customers.social_media_profiles IS 'JSON object for storing other social media profiles (Facebook, Twitter, etc.)';
COMMENT ON COLUMN public.telegram_conversations.customer_id IS 'Foreign key linking to customers table';

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.customers TO authenticated;
GRANT SELECT, UPDATE ON public.telegram_conversations TO authenticated;
