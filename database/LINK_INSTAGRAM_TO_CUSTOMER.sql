-- Script to link Instagram conversations to customer records
-- This helps you associate Instagram DM users with registered customers

-- Step 1: Link Instagram conversations to existing customers by email
-- When a customer registers or exists in the system with matching email
UPDATE public.instagram_conversations ic
SET 
  contact_id = c.id,
  customer_name = CONCAT(c.first_name, ' ', c.last_name),
  customer_email = c.email
FROM public.customers c
WHERE ic.customer_email = c.email
  AND ic.contact_id IS NULL
  AND c.email IS NOT NULL;

-- Step 2: Link by Instagram username if available
UPDATE public.instagram_conversations ic
SET 
  contact_id = c.id,
  customer_name = CONCAT(c.first_name, ' ', c.last_name),
  customer_email = c.email
FROM public.customers c
WHERE ic.username IS NOT NULL
  AND c.instagram_username IS NOT NULL
  AND LOWER(ic.username) = LOWER(c.instagram_username)
  AND ic.contact_id IS NULL;

-- Step 3: Update customer's Instagram username from conversation if not set
UPDATE public.customers c
SET instagram_username = ic.username
FROM public.instagram_conversations ic
WHERE ic.contact_id = c.id
  AND ic.username IS NOT NULL
  AND (c.instagram_username IS NULL OR c.instagram_username = '');

-- Step 4: Create a function to automatically link new Instagram conversations
CREATE OR REPLACE FUNCTION link_instagram_to_customer()
RETURNS TRIGGER AS $$
DECLARE
  customer_record RECORD;
BEGIN
  -- Try to find customer by email first
  IF NEW.customer_email IS NOT NULL THEN
    SELECT id, first_name, last_name, email 
    INTO customer_record
    FROM public.customers 
    WHERE email = NEW.customer_email 
    LIMIT 1;
    
    IF FOUND THEN
      NEW.contact_id := customer_record.id;
      NEW.customer_name := CONCAT(customer_record.first_name, ' ', customer_record.last_name);
      RETURN NEW;
    END IF;
  END IF;
  
  -- Try to find by Instagram username
  IF NEW.username IS NOT NULL THEN
    SELECT id, first_name, last_name, email 
    INTO customer_record
    FROM public.customers 
    WHERE LOWER(instagram_username) = LOWER(NEW.username) 
    LIMIT 1;
    
    IF FOUND THEN
      NEW.contact_id := customer_record.id;
      NEW.customer_name := CONCAT(customer_record.first_name, ' ', customer_record.last_name);
      NEW.customer_email := customer_record.email;
      RETURN NEW;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic linking on insert/update
DROP TRIGGER IF EXISTS trigger_link_instagram_to_customer ON public.instagram_conversations;
CREATE TRIGGER trigger_link_instagram_to_customer
  BEFORE INSERT OR UPDATE ON public.instagram_conversations
  FOR EACH ROW
  EXECUTE FUNCTION link_instagram_to_customer();

-- Step 5: Manual linking helper - Use this to link a specific Instagram user to a customer
-- Example usage:
-- SELECT link_instagram_user_to_customer('17296017', 'mosparagliding@gmail.com');

CREATE OR REPLACE FUNCTION link_instagram_user_to_customer(
  p_instagram_id TEXT,
  p_customer_email TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_customer_id UUID;
  v_customer_name TEXT;
  v_conversation_id UUID;
BEGIN
  -- Find the customer
  SELECT id, CONCAT(first_name, ' ', last_name)
  INTO v_customer_id, v_customer_name
  FROM public.customers
  WHERE email = p_customer_email;
  
  IF NOT FOUND THEN
    RETURN 'ERROR: Customer with email ' || p_customer_email || ' not found';
  END IF;
  
  -- Update the Instagram conversation
  UPDATE public.instagram_conversations
  SET 
    contact_id = v_customer_id,
    customer_email = p_customer_email,
    customer_name = v_customer_name
  WHERE instagram_id = p_instagram_id
  RETURNING id INTO v_conversation_id;
  
  IF NOT FOUND THEN
    RETURN 'ERROR: Instagram conversation with ID ' || p_instagram_id || ' not found';
  END IF;
  
  RETURN 'SUCCESS: Linked Instagram user ' || p_instagram_id || ' to customer ' || v_customer_name || ' (' || p_customer_email || ')';
END;
$$ LANGUAGE plpgsql;

-- Step 6: View all Instagram conversations with customer linkage status
SELECT 
  ic.id,
  ic.instagram_id,
  ic.username,
  ic.customer_email,
  ic.customer_name,
  ic.contact_id,
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

-- ==================================================================
-- EXAMPLE: Link the specific user you mentioned
-- ==================================================================
-- Execute this to link Instagram user 17296017 to mosparagliding@gmail.com:

SELECT link_instagram_user_to_customer(
  '17296017',  -- Instagram user ID (the one ending in 17296017)
  'mosparagliding@gmail.com'  -- Customer email
);

-- After running the above, verify it worked:
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
