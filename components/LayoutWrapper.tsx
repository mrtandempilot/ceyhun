'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import QuickActions from './QuickActions';
import Navbar from './Navbar';
import Footer from './Footer';
import { NotificationProvider } from './NotificationProvider';
import { NotificationToast } from './NotificationToast';
import Chatbot from './Chatbot';
import RecommendedTours from './RecommendedTours';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function checkAdmin() {
      try {
        const user = await getCurrentUser();
        setIsAdmin(user?.email === 'mrtandempilot@gmail.com');
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [pathname]);

  return (
    <NotificationProvider>
      <Navbar />
      <NotificationToast />
      <Chatbot />
      {loading ? (
        <>
          {children}
          <RecommendedTours />
          <Footer />
        </>
      ) : isAdmin ? (
        <>
          {children}
        </>
      ) : (
        <>
          {children}
          <RecommendedTours />
          <Footer />
        </>
      )}
    </NotificationProvider>
  );
}
