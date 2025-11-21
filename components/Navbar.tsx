"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useNotifications } from "./NotificationProvider";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <nav 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                  <span className="text-2xl">🪂</span>
                </div>
              </div>
              <span className={`text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${
                scrolled ? '' : 'text-white bg-gradient-to-r from-white to-purple-200'
              }`}>
                Oludeniz Tours
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { href: '/', label: 'Home' },
              { href: '/tours', label: 'Tours' },
              ...(user && user.email === 'mrtandempilot@gmail.com' 
                ? [
                    { href: '/dashboard', label: 'Dashboard' },
                    { href: '/dashboard/notifications', label: 'Notifications' }
                  ] 
                : []
              ),
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' }
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  scrolled
                    ? 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                    : 'text-white hover:bg-white/10 hover:backdrop-blur-sm'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href="/account"
                      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                        scrolled
                          ? 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                        scrolled
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                          : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
                      }`}
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className={`ml-4 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                      scrolled
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                        : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
                    }`}
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
              className={`p-2 rounded-xl transition-all duration-300 ${
                scrolled
                  ? 'text-gray-700 hover:bg-purple-50'
                  : 'text-white hover:bg-white/10'
              }`}
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
          <div className="md:hidden pb-6 pt-2 bg-white/95 backdrop-blur-xl rounded-2xl mt-2 shadow-2xl border border-gray-200 animate-fade-in">
            <div className="px-4 space-y-1">
              {[
                { href: '/', label: 'Home' },
                { href: '/tours', label: 'Tours' },
                ...(user && user.email === 'mrtandempilot@gmail.com' 
                  ? [
                      { href: '/dashboard', label: 'Dashboard' },
                      { href: '/dashboard/notifications', label: 'Notifications' }
                    ] 
                  : []
                ),
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-3 px-4 rounded-xl font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {!loading && (
                <>
                  {user ? (
                    <div className="pt-3 border-t border-gray-200 mt-3 space-y-1">
                      <Link
                        href="/account"
                        className="block py-3 px-4 rounded-xl font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all duration-300"
                        onClick={() => setIsOpen(false)}
                      >
                        Account
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                        className="w-full text-left py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all duration-300"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-gray-200 mt-3">
                      <Link
                        href="/login"
                        className="block py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all duration-300 text-center"
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
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
}
