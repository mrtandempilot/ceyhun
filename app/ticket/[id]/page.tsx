'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface TicketData {
  id: string;
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  tour_name: string;
  booking_date: string;
  tour_start_time: string;
  adults: number;
  children: number;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function TicketPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTicket() {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('ticket_id', ticketId)
          .single();

        if (error) throw error;
        
        setTicket(data);
      } catch (err: any) {
        console.error('Error fetching ticket:', err);
        setError('Ticket not found');
      } finally {
        setLoading(false);
      }
    }

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Ticket</h1>
          <p className="text-gray-600">{error || 'This ticket could not be found.'}</p>
        </div>
      </div>
    );
  }

  const isValid = ticket.status === 'confirmed' || ticket.status === 'completed';
  const bookingDate = new Date(ticket.booking_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🪂 Paragliding Ticket</h1>
          <p className="text-gray-600">Ölüdeniz, Fethiye</p>
        </div>

        {/* Ticket Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Status Banner */}
          <div className={`py-4 px-6 text-center font-bold text-white ${
            isValid ? 'bg-green-500' : 'bg-yellow-500'
          }`}>
            {isValid ? '✅ VALID TICKET' : '⏳ PENDING CONFIRMATION'}
          </div>

          {/* Ticket Details */}
          <div className="p-8">
            {/* Ticket ID */}
            <div className="text-center mb-8 pb-6 border-b-2 border-dashed border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Ticket ID</p>
              <p className="text-2xl font-mono font-bold text-indigo-600">{ticket.ticket_id}</p>
            </div>

            {/* Customer Info */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <span className="mr-2">👤</span> Passenger Information
              </h2>
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold text-gray-800">{ticket.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-gray-800">{ticket.customer_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold text-gray-800">{ticket.customer_phone}</span>
                </div>
              </div>
            </div>

            {/* Tour Info */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <span className="mr-2">🎫</span> Tour Details
              </h2>
              <div className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tour:</span>
                  <span className="font-semibold text-gray-800">{ticket.tour_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold text-gray-800">{bookingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold text-gray-800">{ticket.tour_start_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Participants:</span>
                  <span className="font-semibold text-gray-800">
                    {ticket.adults} Adult{ticket.adults > 1 ? 's' : ''}
                    {ticket.children > 0 && `, ${ticket.children} Child${ticket.children > 1 ? 'ren' : ''}`}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3 mt-3">
                  <span className="text-gray-600 font-semibold">Total Amount:</span>
                  <span className="font-bold text-xl text-indigo-600">₺{ticket.total_amount}</span>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">📋 Important Information:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Please arrive 15 minutes before your tour time</li>
                <li>• Bring this ticket (digital or printed)</li>
                <li>• Wear comfortable clothes and closed shoes</li>
                <li>• Maximum weight: 110 kg (240 lbs)</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>Booked on {new Date(ticket.created_at).toLocaleDateString()}</p>
              <p className="mt-2">For questions, contact us: +90 XXX XXX XX XX</p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <a 
            href="/" 
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← Back to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
