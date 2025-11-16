import React from 'react';
import Image from 'next/image';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketData: {
    ticket_id: string;
    booking_id: number;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    tour_name: string;
    booking_date: string;
    tour_start_time?: string;
    duration?: number;
    adults: number;
    children: number;
    total_amount?: number;
    hotel_name?: string;
    notes?: string;
    status?: string;
    qr_code_url: string;
  } | null;
}

export default function TicketModal({ isOpen, onClose, ticketData }: TicketModalProps) {
  if (!isOpen || !ticketData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition z-10 print:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Ticket Header - Blue Sky Design */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-1">🪂 Paragliding Tour Ticket</h2>
              <p className="text-blue-100">Sky Walkers Experience</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100 mb-1">Ticket ID</div>
              <div className="text-lg font-mono font-bold bg-white text-blue-600 px-3 py-1 rounded">
                {ticketData.ticket_id}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Tour Details */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Tour Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tour Type:</span>
                    <span className="font-semibold text-gray-900">{ticketData.tour_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(ticketData.booking_date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  {ticketData.tour_start_time && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-semibold text-gray-900">{ticketData.tour_start_time}</span>
                    </div>
                  )}
                  {ticketData.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold text-gray-900">{ticketData.duration} minutes</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passengers:</span>
                    <span className="font-semibold text-gray-900">
                      {ticketData.adults} Adult{ticketData.adults > 1 ? 's' : ''}
                      {ticketData.children > 0 && ` + ${ticketData.children} Child${ticketData.children > 1 ? 'ren' : ''}`}
                    </span>
                  </div>
                  {ticketData.total_amount && (
                    <div className="flex justify-between pt-2 border-t border-blue-200">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-blue-600 text-lg">${ticketData.total_amount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-400">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Customer Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-semibold text-gray-900">{ticketData.customer_name}</p>
                  </div>
                  {ticketData.customer_email && (
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-semibold text-gray-900 break-all">{ticketData.customer_email}</p>
                    </div>
                  )}
                  {ticketData.customer_phone && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-semibold text-gray-900">{ticketData.customer_phone}</p>
                    </div>
                  )}
                  {ticketData.hotel_name && (
                    <div>
                      <span className="text-gray-600">Hotel:</span>
                      <p className="font-semibold text-gray-900">{ticketData.hotel_name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - QR Code & Status */}
            <div className="space-y-4">
              {/* QR Code */}
              {ticketData.qr_code_url && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 text-center border-2 border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Scan to Verify Ticket</h3>
                  <div className="bg-white p-4 inline-block rounded-lg shadow-md">
                    <Image 
                      src={ticketData.qr_code_url} 
                      alt="Ticket QR Code" 
                      width={200} 
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Present this QR code at check-in
                  </p>
                </div>
              )}

              {/* Status Badge */}
              {ticketData.status && (
                <div className="text-center">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    ticketData.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    ticketData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    ticketData.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    Status: {ticketData.status.charAt(0).toUpperCase() + ticketData.status.slice(1)}
                  </span>
                </div>
              )}

              {/* Important Notes */}
              {ticketData.notes && (
                <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">📌 Important Notes</h3>
                  <p className="text-xs text-gray-700">{ticketData.notes}</p>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4 text-xs text-gray-700">
                <h4 className="font-bold mb-2 text-gray-900">✈️ Flight Instructions:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Arrive 30 minutes before flight time</li>
                  <li>Wear comfortable clothes and closed shoes</li>
                  <li>Bring sunglasses and sunscreen</li>
                  <li>No heavy meals 2 hours before flight</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center print:hidden">
            <p className="text-xs text-gray-600">
              Booking ID: #{ticketData.booking_id}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
              >
                🖨️ Print Ticket
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
          <div className="hidden print:block text-center text-xs text-gray-600">
            Thank you for choosing Sky Walkers! Have a great flight! 🪂
          </div>
        </div>
      </div>
    </div>
  );
}
