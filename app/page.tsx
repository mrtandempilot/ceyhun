"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Tour } from "@/types/tour";
import Image from "next/image";

const categoryColors: { [key: string]: string } = {
  Sky: "from-indigo-500 via-purple-500 to-pink-500",
  Water: "from-cyan-500 via-teal-500 to-emerald-500",
  Land: "from-amber-500 via-orange-500 to-red-500"
};

const categoryButtonColors: { [key: string]: string } = {
  Sky: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
  Water: "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700",
  Land: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
};

const categoryPriceColors: { [key: string]: string } = {
  Sky: "bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent",
  Water: "bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent",
  Land: "bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
};

export default function Home() {
  const [featuredTours, setFeaturedTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchFeaturedTours() {
      try {
        const { data, error } = await supabase
          .from('tours')
          .select('*')
          .eq('is_active', true)
          .limit(3);

        if (error) throw error;

        setFeaturedTours(data || []);
      } catch (err) {
        console.error('Error fetching featured tours:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedTours();
  }, []);

  const formatPrice = (tour: Tour) => {
    const price = tour.price_adult;
    const currency = tour.currency === 'TRY' ? '₺' : tour.currency === 'USD' ? '$' : '€';
    return `${currency}${price.toFixed(0)}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section with Parallax */}
      <section className="relative h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden">
        <div 
          className="absolute inset-0 transition-transform duration-100"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <Image 
            src="/images/mali.jpg"
            alt="Beautiful turquoise bay with sailboat"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/70 via-purple-900/60 to-pink-900/70"></div>
        </div>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-shimmer"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-4xl animate-fade-in-up">
            <div className="inline-block mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 animate-fade-in">
              <span className="text-sm font-semibold tracking-wide">✨ Premium Adventure Experiences</span>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent animate-gradient">
                Discover
              </span>
              <span className="block mt-2">Paradise</span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl mb-10 text-purple-100 font-light leading-relaxed max-w-2xl">
              Experience unforgettable paragliding and adventure tours in the breathtaking beauty of Oludeniz
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay">
              <Link
                href="/tours"
                className="group relative bg-white text-purple-900 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl overflow-hidden"
              >
                <span className="relative z-10">Explore Tours</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Link>
              <Link
                href="/contact"
                className="group relative border-2 border-white/40 bg-white/10 backdrop-blur-sm px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 hover:border-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
              >
                <span className="relative z-10">Get in Touch</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="py-24 bg-gradient-to-b from-white via-purple-50/30 to-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-float-delay"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-800 font-semibold text-sm mb-4">
              Featured Adventures
            </span>
            <h2 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
              Popular Tours
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked experiences that our guests love the most
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-xl text-gray-600 mt-4">Loading amazing tours...</p>
            </div>
          ) : featuredTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTours.map((tour, index) => (
                <div
                  key={tour.id}
                  className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="relative h-64 overflow-hidden">
                    {tour.image_url ? (
                      <Image
                        src={tour.image_url}
                        alt={tour.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className={`h-full bg-gradient-to-br ${categoryColors[tour.category] || 'from-indigo-500 via-purple-500 to-pink-500'} group-hover:scale-110 transition-transform duration-700`}></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full">
                      <span className="text-sm font-bold text-gray-800">{tour.category}</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-600 transition-colors duration-300">{tour.name}</h3>
                    <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">{tour.short_description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Starting from</p>
                        <span className={`text-3xl font-black ${categoryPriceColors[tour.category] || 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>
                          {formatPrice(tour)}
                        </span>
                      </div>
                      <Link
                        href={`/book?tour=${tour.id}`}
                        className={`${categoryButtonColors[tour.category] || 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'} text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl`}
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-xl">
              <div className="text-6xl mb-6">🏝️</div>
              <p className="text-2xl font-bold text-gray-800 mb-4">
                Amazing Adventures Await!
              </p>
              <p className="text-gray-600 mb-8 text-lg">
                Explore our incredible tour offerings
              </p>
              <Link
                href="/tours"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                View All Tours
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #8b5cf6 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-800 font-semibold text-sm mb-4">
              Why Us
            </span>
            <h2 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
              Your Adventure Partner
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing unforgettable experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🏆",
                title: "Expert Guides",
                description: "Certified professionals with years of experience ensuring your safety and creating unforgettable moments.",
                gradient: "from-amber-400 to-orange-500"
              },
              {
                icon: "⭐",
                title: "5-Star Rated",
                description: "Thousands of satisfied adventurers have rated us excellent. Join our community of happy customers.",
                gradient: "from-purple-400 to-pink-500"
              },
              {
                icon: "💎",
                title: "Premium Value",
                description: "Competitive prices with transparent pricing. Experience luxury without breaking the bank.",
                gradient: "from-cyan-400 to-teal-500"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up overflow-hidden"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
                <div className="relative z-10">
                  <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-600 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-6 animate-fade-in-up">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-purple-100 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Book your dream experience today and create memories that last a lifetime
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Link
              href="/tours"
              className="bg-white text-purple-900 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              Browse All Tours
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white bg-white/10 backdrop-blur-sm px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes scroll {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
          80% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fade-in-up 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delay {
          animation: float 8s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
