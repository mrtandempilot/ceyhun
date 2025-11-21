"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white mt-auto overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
      </div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-50"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
                  <span className="text-3xl">🪂</span>
                </div>
              </div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Oludeniz Tours
              </h3>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
              Experience the thrill of paragliding and adventure tours in the breathtaking beauty of Oludeniz. Creating unforgettable memories with professional guides and premium experiences.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: "📘", label: "Facebook" },
                { icon: "📸", label: "Instagram" },
                { icon: "🐦", label: "Twitter" },
                { icon: "▶️", label: "YouTube" }
              ].map((social) => (
                <button
                  key={social.label}
                  className="group relative w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                  aria-label={social.label}
                >
                  <span className="text-xl">{social.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/tours", label: "Tours" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" }
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="group flex items-center text-gray-300 hover:text-white transition-all duration-300"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 mr-0 group-hover:mr-2 transition-all duration-300 rounded-full"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></span>
              Get in Touch
            </h3>
            <ul className="space-y-4">
              {[
                { icon: "📍", text: "Oludeniz, Fethiye, Turkey" },
                { icon: "📞", text: "+90 XXX XXX XX XX" },
                { icon: "✉️", text: "info@olubeniztours.com" },
                { icon: "⏰", text: "Available 24/7" }
              ].map((item, index) => (
                <li key={index} className="flex items-start text-gray-300 group">
                  <span className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </span>
                  <span className="pt-1">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Oludeniz Tours. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-white transition-colors duration-300">
                Sitemap
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex flex-wrap justify-center items-center gap-8">
            {[
              { text: "🏆 Award Winning", subtext: "2024" },
              { text: "⭐ 5-Star Rated", subtext: "1000+ Reviews" },
              { text: "✓ Certified Guides", subtext: "Licensed" },
              { text: "💯 Safe & Secure", subtext: "Insurance" }
            ].map((badge, index) => (
              <div 
                key={index}
                className="group text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              >
                <p className="font-bold text-white mb-1">{badge.text}</p>
                <p className="text-xs text-gray-400">{badge.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
