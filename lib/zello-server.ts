import { supabase } from './supabase';

// Zello Work Server API for sending automated notifications
export class ZelloNotificationService {
  private static readonly BASE_URL = 'https://api.zellowork.com';
  private static readonly NETWORK_NAME = 'skywalkersparagliding'; // Zello network name

  /**
   * Send a text message to the operations channel
   * Using Zello Work Server API v2 format
   */
  static async sendTextMessageToOperations(message: string): Promise<boolean> {
    try {
      const apiKey = process.env.ZELLO_SERVER_API_KEY;
      const username = process.env.ZELLO_SERVER_USERNAME || 'api'; // Default username for server API

      if (!apiKey) {
        console.error('ZELLO_SERVER_API_KEY not configured');
        return false;
      }

      // Zello Work Server API requires specific XML format or form-data
      // Using form-data as per API documentation
      const formData = new FormData();
      formData.append('network', this.NETWORK_NAME);
      formData.append('channel', 'operations');
      formData.append('message', message);
      formData.append('username', username);
      formData.append('password', apiKey); // API key as password

      // Zello Work Server API v2 endpoint
      const response = await fetch(`${this.BASE_URL}/v2/sendmessage`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Zello API error:', response.status, errorText);
        return false;
      }

      const result = await response.text();
      console.log('Zello message sent successfully:', result);
      return result.includes('success') || result.includes('ok');

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
