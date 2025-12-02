'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Tour } from "@/types/tour";
import Image from "next/image";

// Badge mappings for tour cards
const tourBadges: { [key: string]: { label: string; color: string } } = {
  Sky: { label: "Popular", color: "bg-orange-500" },
  Water: { label: "New", color: "bg-green-500" },
  Land: { label: "Limited", color: "bg-blue-500" },
};

const tourFeatures: { [key: string]: { label: string; color: string } } = {
  Sky: { label: "All Inclusive", color: "text-cyan-400" },
  Water: { label: "Eco-Friendly", color: "text-green-400" },
  Land: { label: "Small Group", color: "text-orange-400" },
};

const difficultyLevels: { [key: string]: { label: string; icon: string } } = {
  Sky: { label: "Extreme", icon: "🔥" },
  Water: { label: "Moderate", icon: "🌊" },
  Land: { label: "Challenging", icon: "⛰️" },
};

export default function Home() {
  const [featuredTours, setFeaturedTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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
    const currency =
      tour.currency === 'TRY' ? '₺' : tour.currency === 'USD' ? '$' : '€';
    return `${currency}${price.toFixed(0)}`;
  };

  const toggleFavorite = (tourId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tourId)) {
        newFavorites.delete(tourId);
      } else {
        newFavorites.add(tourId);
      }
      return newFavorites;
    });
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section with Epic Adventure Tours */}
      <section className="relative min-h-[90vh] overflow-hidden">
        <Image
          src="/hero-bg.jpg"
          alt="Adventure destinations"
          fill
          className="object-cover opacity-70"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/20 to-slate-900" />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] text-center px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            Epic{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Adventure
            </span>{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Tours
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl">
            Discover the world's most thrilling destinations with our expertly crafted adventure packages.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <Link
              href="/tours"
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Explore Tours
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 rounded-lg font-semibold hover:bg-cyan-400 hover:text-slate-900 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Custom Trip
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl w-full">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700 hover:border-yellow-500 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                50+
              </div>
              <div className="text-gray-300 text-sm">Destinations</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700 hover:border-cyan-500 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-gray-300 text-sm">Expert Support</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700 hover:border-green-500 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
                98%
              </div>
              <div className="text-gray-300 text-sm">5-Star Reviews</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700 hover:border-purple-500 transition-all">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
                2010
              </div>
              <div className="text-gray-300 text-sm">Since</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Featured
            </span>{' '}
            Adventures
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Handpicked experiences designed to create unforgettable memories
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
              <p className="text-xl text-gray-400 mt-4">Loading amazing tours...</p>
            </div>
          ) : featuredTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredTours.map((tour, index) => {
                const badge = tourBadges[tour.category] || tourBadges.Sky;
                const feature = tourFeatures[tour.category] || tourFeatures.Sky;
                const difficulty = difficultyLevels[tour.category] || difficultyLevels.Sky;
                const isFavorite = favorites.has(tour.id);

                return (
                  <div
                    key={tour.id}
                    className="bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700 hover:border-cyan-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20"
                  >
                    {/* Tour Image with overlays */}
                    <div className="relative h-48 md:h-56 group">
                      {tour.image_url ? (
                        <Image
                          src={tour.image_url}
                          alt={tour.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800" />
                      )}

                      {/* Favorite icon */}
                      <button
                        onClick={() => toggleFavorite(tour.id)}
                        className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm p-2 rounded-full hover:bg-slate-900 transition-all z-10"
                        aria-label="Add to favorites"
                      >
                        <svg
                          className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'fill-none text-white'}`}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>

                      {/* Badge (Popular/New/Limited) */}
                      <div className={`absolute top-4 right-4 ${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                        {badge.label === 'Popular' && '🔥'}
                        {badge.label === 'New' && '✨'}
                        {badge.label === 'Limited' && '⚡'}
                        {badge.label}
                      </div>

                      {/* Duration badge */}
                      <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {tour.duration || '3 days'}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-2 text-white">
                        {tour.name}
                      </h3>

                      <p className={`${feature.color} text-sm mb-3`}>
                        {tour.short_description}
                      </p>

                      {/* Price and Feature badge */}
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                            {formatPrice(tour)}
                          </span>
                        </div>
                        <span className={`${feature.color} text-xs font-semibold px-3 py-1 bg-slate-700 rounded-full`}>
                          {feature.label}
                        </span>
                      </div>

                      {/* Rating and Difficulty */}
                      <div className="flex justify-between items-center mb-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-white font-semibold">4.{7 + index}</span>
                          <span className="text-gray-400">({80 + index * 50} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <span>{difficulty.icon}</span>
                          <span className="text-xs">{difficulty.label}</span>
                        </div>
                      </div>

                      {/* Book button */}
                      <Link
                        href={`/tours/${tour.slug}`}
                        className="w-full block text-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                      >
                        🛒 Book This Tour
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-800 rounded-2xl border border-slate-700">
              <p className="text-xl text-gray-400 mb-4">Ready to start your adventure?</p>
              <Link
                href="/tours"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all inline-block transform hover:scale-105"
              >
                Explore All Tours
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
