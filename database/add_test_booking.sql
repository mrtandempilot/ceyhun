-- Insert a test booking for today to test Auto-Dispatch
INSERT INTO public.bookings (
  customer_name,
  customer_email,
  customer_phone,
  tour_name,
  booking_date,
  tour_start_time,
  adults,
  children,
  status,
  price,
  ticket_id
) VALUES (
  'Test Customer (Dispatch)',
  'test@dispatch.com',
  '+90 555 000 0000',
  'Yamaç Paraşütü - Standart',
  CURRENT_DATE,
  '14:00',
  1,
  0,
  'confirmed',
  150.00,
  'TICKET-' || floor(random() * 100000)::text
);
