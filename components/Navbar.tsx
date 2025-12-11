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
  const [scrolled, setScrolled] = useState(false);
  const [dropdownTimer, setDropdownTimer] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav
        className={`max-w-7xl mx-auto transition-all duration-500 ${scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-2xl shadow-black/10'
          : 'bg-white/70 backdrop-blur-lg shadow-lg'
          } rounded-full px-6 border border-white/20`}
      >
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-lg group-hover:bg-purple-500/30 transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                Oludeniz Tours
              </h1>
              <p className="text-xs text-gray-500 font-medium">Experience Paradise</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className="px-5 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-300 font-medium"
            >
              Home
            </Link>

            {/* Tours Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (dropdownTimer) clearTimeout(dropdownTimer);
                setToursDropdownOpen(true);
              }}
              onMouseLeave={() => {
                const timer = setTimeout(() => setToursDropdownOpen(false), 200);
                setDropdownTimer(timer);
              }}
            >
              <button className="px-5 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-300 font-medium flex items-center">
                Tours
                <svg
                  className={`ml-1.5 h-4 w-4 transition-transform duration-300 ${toursDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {toursDropdownOpen && (
                <div className="absolute top-full left-0 mt-3 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl py-3 min-w-[240px] z-50 border border-gray-100">
                  <Link
                    href="/tours"
                    className="block px-5 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 font-medium rounded-2xl mx-2"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      All Tours
                    </div>
                  </Link>
                  <div className="my-2 mx-4 border-t border-gray-200"></div>
                  {tours.map((tour) => (
                    <Link
                      key={tour.id}
                      href={`/tours/${tour.slug}`}
                      className="block px-5 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 whitespace-nowrap rounded-2xl mx-2"
                    >
                      {tour.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/blog"
              className="px-5 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-300 font-medium"
            >
              Blog
            </Link>

            {user && user.email === 'mrtandempilot@gmail.com' && (
              <Link
                href="/dashboard"
                className="relative px-5 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-300 font-medium"
              >
                Dashboard
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-pink-500/50 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            <Link
              href="/about"
              className="px-5 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-300 font-medium"
            >
              About
            </Link>

            <Link
              href="/weather"
              className="px-5 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-300 font-medium"
            >
              Weather
            </Link>

            <Link
              href="/contact"
              className="px-5 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-300 font-medium"
            >
              Contact
            </Link>

            <Link
              href="/landing"
              className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-full transition-all duration-300 font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105"
            >
              AI Landing
            </Link>

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-2 ml-2 pl-4 border-l border-gray-200">
                    <Link
                      href="/account"
                      className="px-5 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-300 font-medium"
                    >
                      Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-all duration-300 font-medium hover:shadow-md"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="ml-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full transition-all duration-300 font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105"
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
              className="text-gray-700 focus:outline-none p-2.5 rounded-full hover:bg-purple-50 transition-all duration-300"
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
          <div className="md:hidden pb-4 pt-4 mt-2 bg-gray-50/80 backdrop-blur-lg rounded-3xl mx-2 mb-2">
            <div className="px-3 space-y-1">
              <Link
                href="/"
                className="block py-3 px-4 hover:bg-white/80 rounded-full transition-all duration-300 text-gray-700 hover:text-purple-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>

              <div>
                <button
                  onClick={() => setMobileToursOpen(!mobileToursOpen)}
                  className="w-full py-3 px-4 hover:bg-white/80 rounded-full transition-all duration-300 text-gray-700 hover:text-purple-600 font-medium flex items-center justify-between"
                >
                  Tours
                  <svg
                    className={`h-4 w-4 transition-transform duration-300 ${mobileToursOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileToursOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link
                      href="/tours"
                      className="block py-2 px-4 text-gray-600 hover:text-purple-600 hover:bg-white/80 rounded-full transition-all duration-300"
                      onClick={() => setIsOpen(false)}
                    >
                      All Tours
                    </Link>
                    {tours.map((tour) => (
                      <Link
                        key={tour.id}
                        href={`/tours/${tour.slug}`}
                        className="block py-2 px-4 text-gray-600 hover:text-purple-600 hover:bg-white/80 rounded-full transition-all duration-300"
                        onClick={() => setIsOpen(false)}
                      >
                        {tour.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/blog"
                className="block py-3 px-4 hover:bg-white/80 rounded-full transition-all duration-300 text-gray-700 hover:text-purple-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>

              {user && user.email === 'mrtandempilot@gmail.com' && (
                <Link
                  href="/dashboard"
                  className="block py-3 px-4 hover:bg-white/80 rounded-full transition-all duration-300 text-gray-700 hover:text-purple-600 font-medium relative"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-pink-500/50">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}

              <Link
                href="/about"
                className="block py-3 px-4 hover:bg-white/80 rounded-full transition-all duration-300 text-gray-700 hover:text-purple-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>

              <Link
                href="/weather"
                className="block py-3 px-4 hover:bg-white/80 rounded-full transition-all duration-300 text-gray-700 hover:text-purple-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Weather
              </Link>

              <Link
                href="/contact"
                className="block py-3 px-4 hover:bg-white/80 rounded-full transition-all duration-300 text-gray-700 hover:text-purple-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>

              <Link
                href="/landing"
                className="block py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-full transition-all duration-300 font-semibold text-center shadow-lg hover:shadow-xl"
                onClick={() => setIsOpen(false)}
              >
                AI Landing
              </Link>

              {!loading && (
                <>
                  {user ? (
                    <div className="pt-3 mt-3 border-t border-gray-200 space-y-1">
                      <Link
                        href="/account"
                        className="block py-3 px-4 hover:bg-white/80 rounded-full transition-all duration-300 text-gray-700 hover:text-purple-600 font-medium"
                        onClick={() => setIsOpen(false)}
                      >
                        Account
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                        className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-full transition-all duration-300 text-gray-700 font-medium text-left"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <Link
                        href="/login"
                        className="block py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full transition-all duration-300 font-semibold text-center shadow-lg hover:shadow-xl"
                        onClick={() => setIsOpen(false)}
                      >
                        Login
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
