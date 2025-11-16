import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateUniqueTicketId } from '@/lib/utils';

async function populateTicketIds() {
  const dotenv = await import('dotenv');
  dotenv.config({ path: '.env.local' }); // Explicitly load .env.local

  console.log('DEBUG: NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('DEBUG: SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Loaded' : 'Not Loaded');

  console.log('Starting population of ticket IDs for existing bookings...');

  try {
    // Fetch bookings that do not have a ticket_id
    const { data: bookings, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .is('ticket_id', null);

    if (fetchError) {
      console.error('Error fetching bookings:', fetchError);
      return;
    }

    if (!bookings || bookings.length === 0) {
      console.log('No existing bookings found without a ticket ID. Exiting.');
      return;
    }

    console.log(`Found ${bookings.length} bookings without a ticket ID. Populating...`);

    for (const booking of bookings) {
      const newTicketId = generateUniqueTicketId();
      const { error: updateError } = await supabaseAdmin
        .from('bookings')
        .update({ ticket_id: newTicketId })
        .eq('id', booking.id);

      if (updateError) {
        console.error(`Error updating ticket ID for booking ${booking.id}:`, updateError);
      } else {
        console.log(`Updated booking ${booking.id} with ticket ID: ${newTicketId}`);
      }
    }

    console.log('Finished populating ticket IDs.');
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
}

populateTicketIds();
