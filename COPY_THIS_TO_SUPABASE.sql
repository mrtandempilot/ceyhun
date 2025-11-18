-- =====================================================
-- COPY ALL OF THIS INTO SUPABASE SQL EDITOR AND RUN
-- =====================================================

-- Step 1: Create the function that will be triggered
CREATE OR REPLACE FUNCTION auto_generate_ticket()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://skywalkers.app.n8n.cloud/webhook/payment-received';
  payload JSON;
BEGIN
  -- Only trigger if status changed to 'confirmed' and ticket_id is null
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') AND NEW.ticket_id IS NULL THEN
    
    -- Prepare the payload - match n8n workflow structure
    payload := json_build_object(
      'body', json_build_object(
        'booking_id', NEW.id,
        'payment_status', 'succeeded',
        'amount', NEW.total_amount
      )
    );
    
    -- Call the n8n webhook using pg_net extension
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

-- Step 3: Verify trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_generate_ticket';

-- =====================================================
-- EXPECTED RESULT:
-- Should show 1 row with trigger_name = 'trigger_auto_generate_ticket'
-- =====================================================
