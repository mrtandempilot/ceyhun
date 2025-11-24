'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  unreadCount: number;
}

interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'system' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Get current user first, then set up subscriptions
    getCurrentUser().then((currentUser) => {
      console.log('🔔 NotificationProvider: User loaded:', currentUser?.email);
      setUser(currentUser);

      // Only set up real-time subscriptions for admin user
      if (currentUser && (currentUser.email === 'mrtandempilot@gmail.com' || currentUser.email === 'faralyaworks@gmail.com')) {
        console.log('🔔 Setting up real-time subscription for admin user:', currentUser.email);

        // Listen for real-time booking updates
        const channel = supabase
          .channel('bookings_notifications')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'bookings'
          }, (payload) => {
            console.log('🔔 Real-time booking received:', payload.new);
            handleNewBooking(payload.new);
          })
          .subscribe((status) => {
            console.log('🔔 Subscription status:', status);
            setIsSubscribed(status === 'SUBSCRIBED');
          });

        // Listen for real-time WhatsApp message updates
        const whatsappChannel = supabase
          .channel('whatsapp_notifications')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'whatsapp_messages',
            filter: `sender=eq.customer`
          }, (payload) => {
            console.log('🔔 New WhatsApp message received:', payload.new);
            handleNewWhatsAppMessage(payload.new);
          })
          .subscribe();

        // Store channels for cleanup
        (window as any).__notificationChannel = channel;
        (window as any).__whatsappChannel = whatsappChannel;
      } else {
        console.log('🔔 Skipping real-time setup - not admin user');
      }
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('🔔 Notification permission:', permission);
      });
    }

    // Listen for test events (always available)
    const handleTestEvent = (event: any) => {
      console.log('🔔 Test event received:', event.detail);
      handleNewBooking(event.detail);
    };

    window.addEventListener('test-booking', handleTestEvent);

    // Add a global test function for voice
    (window as any).testVoice = () => {
      console.log('🗣️ Testing voice manually...');
      speakText("Voice test activated");
    };

    // Add test for WhatsApp notification
    (window as any).testWhatsAppNotification = () => {
      console.log('🔔 Testing WhatsApp notification manually...');
      handleNewWhatsAppMessage({
        id: 'test',
        sender: 'customer',
        content: 'This is a test message',
        message_type: 'text',
        created_at: new Date().toISOString()
      });
    };

    return () => {
      console.log('🔔 Cleaning up subscription...');
      const channel = (window as any).__notificationChannel;
      if (channel) {
        supabase.removeChannel(channel);
      }
      const whatsappChannel = (window as any).__whatsappChannel;
      if (whatsappChannel) {
        supabase.removeChannel(whatsappChannel);
      }
      window.removeEventListener('test-booking', handleTestEvent);
    };
  }, []);

  const handleNewWhatsAppMessage = (message: any) => {
    console.log('🔔 handleNewWhatsAppMessage called with:', message);
    console.log('🔔 Current user:', user);

    // Only show notifications for admin user
    if (!user || (user.email !== 'mrtandempilot@gmail.com' && user.email !== 'faralyaworks@gmail.com')) {
      console.log('🔔 Skipping notification - not admin user or user not loaded');
      return;
    }

    // Skip if it's not a customer message
    if (message.sender !== 'customer') return;

    console.log('🔔 Creating notification for admin user');

    const notification = {
      type: 'alert' as const,
      title: '📱 New WhatsApp Message',
      message: `From: ${message.sender} - ${message.content.substring(0, 50)}...`,
      priority: 'medium' as const,
      actionUrl: `/dashboard/conversations`,
      data: message
    };

    addNotification(notification);

    // Browser notification
    showBrowserNotification(notification);

    // Play sound (optional)
    playNotificationSound();

    // Speak the notification
    speakText("New WhatsApp message");
  };

  const handleNewBooking = async (booking: any) => {
    console.log('🔔 handleNewBooking called with:', booking);
    console.log('🔔 Current user:', user);

    // Only show notifications for admin user
    if (!user || (user.email !== 'mrtandempilot@gmail.com' && user.email !== 'faralyaworks@gmail.com')) {
      console.log('🔔 Skipping notification - not admin user or user not loaded');
      return;
    }

    console.log('🔔 Creating notification for admin user');

    const notification = {
      type: 'booking' as const,
      title: '🎉 New Booking!',
      message: `${booking.customer_name} booked ${booking.tour_name} - $${booking.total_amount}`,
      priority: 'high' as const,
      actionUrl: `/dashboard/bookings`,
      data: booking
    };

    addNotification(notification);

    // Browser notification
    showBrowserNotification(notification);

    // Play sound (optional)
    playNotificationSound();

    // Email notification (if enabled)
    await sendEmailNotification(booking);
  };

  const sendEmailNotification = async (booking: any) => {
    try {
      console.log('📧 Checking email notification settings...');

      // Get notification settings from localStorage
      const settings = localStorage.getItem('notification-settings');
      console.log('📧 Raw settings from localStorage:', settings);

      if (!settings) {
        console.log('📧 No notification settings found, skipping email');
        return;
      }

      const notificationSettings = JSON.parse(settings);
      console.log('📧 Parsed notification settings:', notificationSettings);

      if (!notificationSettings.emailNotifications) {
        console.log('📧 Email notifications disabled in settings');
        return;
      }

      const emailAddress = notificationSettings.emailAddress || user?.email;
      console.log('📧 Target email address:', emailAddress);

      if (!emailAddress) {
        console.log('📧 No email address available, skipping email');
        return;
      }

      console.log('📧 Sending email notification for booking...');

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.log('📧 No auth token available for email');
        return;
      }

      const emailData = {
        customer_name: booking.customer_name,
        tour_name: booking.tour_name,
        total_amount: booking.total_amount,
        booking_date: booking.booking_date || booking.created_at,
        customer_email: booking.customer_email,
        customer_phone: booking.customer_phone
      };

      console.log('📧 Email data:', emailData);

      // Send email
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: 'booking',
          emailAddress: emailAddress,
          data: emailData
        }),
      });

      console.log('📧 Email API response status:', response.status);

      const result = await response.json();
      console.log('📧 Email send result:', result);

      if (result.success) {
        console.log('📧 Email notification sent successfully');
      } else {
        console.log('📧 Email notification failed:', result.message);
        console.log('📧 Full error details:', result);
      }
    } catch (error: any) {
      console.error('📧 Error sending email notification:', error);
      console.error('📧 Error details:', error?.message || error);
    }
  };

  const showBrowserNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `booking-${Date.now()}`, // Unique tag to prevent duplicates
        requireInteraction: notification.priority === 'high',
        silent: false
      });

      browserNotification.onclick = () => {
        if (notification.actionUrl) {
          window.focus();
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };

      // Auto-close after 10 seconds for non-high priority
      if (notification.priority !== 'high') {
        setTimeout(() => browserNotification.close(), 10000);
      }
    }
  };

  const playNotificationSound = () => {
    // Create a subtle notification sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Silently fail if audio context not supported
    }
  };

  const speakText = (text: string) => {
    console.log('🗣️ Attempting to speak:', text);

    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      console.error('🗣️ Speech synthesis not supported in this browser');
      alert('Speech synthesis not supported in this browser');
      return;
    }

    try {
      // Get available voices (this can help with debugging)
      const voices = speechSynthesis.getVoices();
      console.log('🗣️ Available voices:', voices.length, voices.map(v => v.name));

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 1.0; // Full volume
      utterance.rate = 0.8; // Slightly slower
      utterance.pitch = 1.0;
      utterance.lang = 'en-US'; // Explicitly set language

      // If voices are available, use the first one
      if (voices.length > 0) {
        utterance.voice = voices[0];
        console.log('🗣️ Using voice:', voices[0].name);
      }

      utterance.onstart = () => console.log('🗣️ Speech synthesis started successfully');
      utterance.onend = () => console.log('🗣️ Speech synthesis completed');
      utterance.onerror = (event) => {
        console.error('🗣️ Speech synthesis error:', event);
        alert('Speech synthesis failed: ' + event.error);
      };

      // Check if already speaking and cancel first
      if (speechSynthesis.speaking) {
        console.log('🗣️ Cancelling previous speech...');
        speechSynthesis.cancel();
      }

      console.log('🗣️ Starting speech synthesis...');
      speechSynthesis.speak(utterance);

      // Fallback: if speech doesn't start after 2 seconds, try again with alert
      setTimeout(() => {
        if (!speechSynthesis.speaking) {
          console.warn('🗣️ Speech did not start, trying fallback...');
          try {
            speechSynthesis.cancel();
            speechSynthesis.speak(new SpeechSynthesisUtterance(text));
          } catch (e) {
            console.error('🗣️ Fallback failed:', e);
            // Last resort: show alert
            alert('VOICE ALERT: New WhatsApp message! (Speech synthesis failed)');
          }
        }
      }, 2000);

    } catch (error) {
      console.error('🗣️ Critical speech error:', error);
      // Emergency alert fallback
      alert('VOICE ALERT: New WhatsApp message! (Critical speech error)');
    }
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [notification, ...prev]);

    // Auto-remove after 1 hour for read notifications, 24 hours for unread
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, notification.read ? 3600000 : 86400000); // 1 hour : 24 hours
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotification,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    // Return a safe default during initialization
    return {
      notifications: [],
      addNotification: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearNotification: () => {},
      unreadCount: 0
    };
  }
  return context;
}
