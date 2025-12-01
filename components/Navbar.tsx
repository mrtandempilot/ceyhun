"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useNotifications } from "./NotificationProvider";
import { Tour } from "@/types/tour";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState<Tour[]>([]);
  const [toursDropdownOpen, setToursDropdownOpen] = useState(false);
  const [mobileToursOpen, setMobileToursOpen] = useState(false);
  const router = useRouter();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    // Get initial user
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchTours() {
      try {
        const { data, error } = await supabase
          .from('tours')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) throw error;
        setTours(data || []);
      } catch (error) {
        console.error('Error fetching tours:', error);
      }
    }

    fetchTours();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold">
              Oludeniz Tours
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-blue-200 transition">
              Home
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setToursDropdownOpen(true)}
              onMouseLeave={() => setToursDropdownOpen(false)}
            >
              <button className="hover:text-blue-200 transition flex items-center">
                Tours
                <svg
                  className={`ml-1 h-4 w-4 transition-transform ${toursDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {toursDropdownOpen && (
                <div className="absolute top-full left-0 bg-white rounded-lg shadow-lg py-2 min-w-max z-50">
                  <Link
                    href="/tours"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    All Tours
                  </Link>
                  {tours.map((tour) => (
                    <Link
                      key={tour.id}
                      href={`/tours/${tour.slug}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition whitespace-nowrap"
                    >
                      {tour.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {user && user.email === 'mrtandempilot@gmail.com' && (
              <>
                <Link href="/dashboard" className="hover:text-blue-200 transition">
                  Dashboard
                </Link>
                <Link href="/dashboard/notifications" className="hover:text-blue-200 transition">
                  Notifications
                </Link>
                <Link href="/dashboard/channels" className="hover:text-blue-200 transition">
                  Channels
                </Link>
              </>
            )}
            <Link href="/about" className="hover:text-blue-200 transition">
              About
            </Link>
            <Link href="/contact" className="hover:text-blue-200 transition">
              Contact
            </Link>
            
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <Link href="/account" className="hover:text-blue-200 transition">
                      Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition"
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <Link
              href="/"
              className="block py-2 hover:text-blue-200 transition"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <div>
              <button
                onClick={() => setMobileToursOpen(!mobileToursOpen)}
                className="block py-2 hover:text-blue-200 transition w-full text-left flex items-center justify-between"
              >
                Tours
                <svg
                  className={`h-4 w-4 transition-transform ${mobileToursOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileToursOpen && (
                <div className="ml-4 space-y-1">
                  <Link
                    href="/tours"
                    className="block py-1 px-2 text-blue-200 hover:text-white transition"
                    onClick={() => setIsOpen(false)}
                  >
                    All Tours
                  </Link>
                  {tours.map((tour) => (
                    <Link
                      key={tour.id}
                      href={`/tours/${tour.slug}`}
                      className="block py-1 px-2 text-blue-200 hover:text-white transition"
                      onClick={() => setIsOpen(false)}
                    >
                      {tour.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {user && user.email === 'mrtandempilot@gmail.com' && (
              <>
                <Link
                  href="/dashboard"
                  className="block py-2 hover:text-blue-200 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/notifications"
                  className="block py-2 hover:text-blue-200 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Notifications
                </Link>
                <Link
                  href="/dashboard/channels"
                  className="block py-2 hover:text-blue-200 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Channels
                </Link>
              </>
            )}
            <Link
              href="/about"
              className="block py-2 hover:text-blue-200 transition"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block py-2 hover:text-blue-200 transition"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            
            {!loading && (
              <>
                {user ? (
                  <div className="pt-2 border-t border-blue-500 mt-2">
                    <Link
                      href="/account"
                      className="block py-2 hover:text-blue-200 transition"
                      onClick={() => setIsOpen(false)}
                    >
                      Account
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left py-2 hover:text-blue-200 transition"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="block py-2 hover:text-blue-200 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
