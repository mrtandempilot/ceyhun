import { supabase } from './supabase';

// Zello Work Server API for sending automated notifications
export class ZelloNotificationService {
  private static readonly BASE_URL = 'https://zellowork.io';
  private static readonly NETWORK_NAME = 'skywalkerspara';

  /**
   * Send a text message to the operations channel
   */
  static async sendTextMessageToOperations(message: string): Promise<boolean> {
    try {
      const apiKey = process.env.ZELLO_SERVER_API_KEY;
      if (!apiKey) {
        console.error('ZELLO_SERVER_API_KEY not configured');
        return false;
      }

      const payload = {
        key: apiKey,
        link_source: 'server_api',
        message: message,
        channel: 'operations' // Default operations channel
      };

      // Zello Work Server API endpoint for sending messages
      const response = await fetch(`${this.BASE_URL}/api/v1/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Zello API error:', response.status, errorText);
        return false;
      }

      const result = await response.json();
      console.log('Zello message sent successfully:', result);
      return true;

    } catch (error) {
      console.error('Failed to send Zello message:', error);
      return false;
    }
  }

  /**
   * Send a booking notification to operations channel
   */
  static async notifyBookingToPilots(bookingData: {
    customerName: string;
    tourName: string;
    bookingDate: string;
    timeSlot: string;
    passengers: number;
    contactInfo?: string;
  }): Promise<boolean> {

    const message = `🎯 **NEW BOOKING ALERT**

🏃 Customer: ${bookingData.customerName}
🏔️ Tour: ${bookingData.tourName}
📅 Date: ${bookingData.bookingDate}
⏰ Time: ${bookingData.timeSlot}
👥 Passengers: ${bookingData.passengers}${bookingData.contactInfo ? `\n📞 Contact: ${bookingData.contactInfo}` : ''}

Please confirm availability and prepare for the flight.`;

    return await this.sendTextMessageToOperations(message);
  }

  /**
   * Send a generic operations notification
   */
  static async notifyOperations(message: string): Promise<boolean> {
    return await this.sendTextMessageToOperations(`ℹ️ **Operations Update:** ${message}`);
  }

  /**
   * Send weather alert to all pilots
   */
  static async sendWeatherAlert(weatherInfo: string): Promise<boolean> {
    return await this.sendTextMessageToOperations(`🌤️ **Weather Update:** ${weatherInfo}`);
  }

  /**
   * Send safety/health notification
   */
  static async sendSafetyAlert(message: string): Promise<boolean> {
    return await this.sendTextMessageToOperations(`🚨 **Safety Alert:** ${message}`);
  }
}

// Utility function to format time slots
export function formatTimeSlot(timeStr: string, duration: number = 30): string {
  if (!timeStr) return 'TBD';

  try {
    // Assuming timeStr is like "10:00"
    const [hours, minutes] = timeStr.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(hours, minutes + duration, 0, 0);
    const endTimeStr = endTime.toTimeString().slice(0, 5);

    return `${timeStr}-${endTimeStr}`;
  } catch {
    return timeStr;
  }
}

// Export for use in API routes
export { ZelloNotificationService as default };
