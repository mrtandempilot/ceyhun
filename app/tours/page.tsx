"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Tour } from "@/types/tour";
import Image from "next/image";

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

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchTours() {
      try {
        const { data, error } = await supabase
          .from('tours')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setTours(data || []);
      } catch (err) {
        console.error('Error fetching tours:', err);
        setError('Failed to load tours. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchTours();
  }, []);

  const formatPrice = (tour: Tour) => {
    const price = tour.price_adult;
    const currency = tour.currency === 'TRY' ? '₺' : tour.currency === 'USD' ? '$' : '€';
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

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900">
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Our Tours
              </span>
            </h1>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mt-8"></div>
            <p className="text-xl text-gray-400 mt-4">Loading amazing adventures...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-900">
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-4 text-white">Our Tours</h1>
            <p className="text-xl text-red-400">{error}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Explore Our{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Adventures
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose from our exciting selection of tours and activities designed to create unforgettable memories
          </p>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour, index) => {
              const badge = tourBadges[tour.category] || tourBadges.Sky;
              const feature = tourFeatures[tour.category] || tourFeatures.Sky;
              const difficulty = difficultyLevels[tour.category] || difficultyLevels.Sky;
              const isFavorite = favorites.has(tour.id);

              return (
                <div
                  key={tour.id}
                  className="bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700 hover:border-cyan-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20"
                >
                  {/* Tour Image */}
                  <div className="relative h-56 md:h-72 group">
                    {tour.image_url ? (
                      <Image
                        src={tour.image_url}
                        alt={tour.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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

                    {/* Badge */}
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
                      {tour.duration}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-400 uppercase">
                        {tour.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-white">{tour.name}</h3>
                    <p className={`${feature.color} text-sm mb-3 line-clamp-2`}>
                      {tour.short_description}
                    </p>

                    {/* Includes section */}
                    {tour.included && tour.included.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-white mb-2 text-sm">Includes:</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          {tour.included.slice(0, 3).map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-green-400 mr-2">✓</span>
                              <span className="line-clamp-1">{item}</span>
                            </li>
                          ))}
                          {tour.included.length > 3 && (
                            <li className="text-gray-500 italic text-xs">
                              +{tour.included.length - 3} more...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Price and Feature */}
                    <div className="flex justify-between items-center mb-4 pt-4 border-t border-slate-700">
                      <div>
                        <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                          {formatPrice(tour)}
                        </span>
                        {tour.price_child && (
                          <p className="text-sm text-gray-400">per adult</p>
                        )}
                      </div>
                      <span className={`${feature.color} text-xs font-semibold px-3 py-1 bg-slate-700 rounded-full`}>
                        {feature.label}
                      </span>
                    </div>

                    {/* Rating and Difficulty */}
                    <div className="flex justify-between items-center mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-white font-semibold">4.{7 + (index % 3)}</span>
                        <span className="text-gray-400">({80 + index * 20} reviews)</span>
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
                      🛒 View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {tours.length === 0 && (
            <div className="text-center py-12 bg-slate-800 rounded-2xl border border-slate-700">
              <p className="text-xl text-gray-400">
                No tours available at the moment. Please check back later!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Ready for Your Adventure?
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            Contact us today to book your tour or if you have any questions. Our friendly team is here to help!
          </p>
          <Link
            href="/contact"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block transform hover:scale-105 shadow-lg"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
