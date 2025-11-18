-- =====================================================
-- AUTOMATIC TICKET GENERATION & SENDING
-- =====================================================
-- This creates a database trigger that automatically generates
-- and sends tickets when a booking status changes to 'confirmed'
-- =====================================================

-- Step 1: Create the function that will be triggered
CREATE OR REPLACE FUNCTION auto_generate_ticket()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://mvt36n7e.rpcld.com/webhook/payment-received';
  payload JSON;
BEGIN
  -- Only trigger if status changed to 'confirmed' and ticket_id is null
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') AND NEW.ticket_id IS NULL THEN
    
    -- Prepare the payload
    payload := json_build_object(
      'body', json_build_object(
        'body', json_build_object(
          'booking_id', NEW.id,
          'payment_status', 'succeeded',
          'amount', NEW.total_amount
        )
      )
    );
    
    -- Call the n8n webhook using pg_net extension
    -- Note: This requires pg_net extension to be enabled in Supabase
    PERFORM
      net.http_post(
        url := webhook_url,
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := payload::jsonb
      );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_ticket ON bookings;

CREATE TRIGGER trigger_auto_generate_ticket
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_ticket();

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_generate_ticket';

-- =====================================================
-- NOTES
-- =====================================================
-- IMPORTANT: Before enabling this trigger:
-- 1. Enable pg_net extension in Supabase (if not already enabled)
-- 2. Replace 'YOUR_N8N_URL' with your actual n8n webhook URL
-- 3. Make sure your n8n workflow is active and running
--
-- How it works:
-- 1. When a booking status changes to 'confirmed'
-- 2. The trigger calls your n8n webhook
-- 3. n8n generates the ticket and sends it via WhatsApp
-- 4. No manual intervention needed!
--
-- To disable this trigger:
-- DROP TRIGGER IF EXISTS trigger_auto_generate_ticket ON bookings;
-- =====================================================
