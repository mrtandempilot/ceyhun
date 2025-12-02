'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Tour } from "@/types/tour";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Gradient colors per tour category – used for cards & buttons
const categoryColors: { [key: string]: string } = {
  Sky: "from-blue-400 to-blue-600",
  Water: "from-cyan-400 to-cyan-600",
  Land: "from-green-400 to-green-600",
};

const categoryButtonColors: { [key: string]: string } = {
  Sky: "bg-blue-600 hover:bg-blue-700",
  Water: "bg-cyan-600 hover:bg-cyan-700",
  Land: "bg-green-600 hover:bg-green-700",
};

const categoryPriceColors: { [key: string]: string } = {
  Sky: "text-blue-600",
  Water: "text-cyan-600",
  Land: "text-green-600",
};

export default function RecommendedTours() {
  const [recommendedTours, setRecommendedTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchRecommendedTours() {
      try {
        const { data, error } = await supabase
          .from('tours')
          .select('*')
          .eq('is_active', true)
          .limit(4);
        if (error) throw error;
        setRecommendedTours(data || []);
      } catch (err) {
        console.error('Error fetching recommended tours:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendedTours();
  }, []);

  // Hide on homepage to avoid duplication with Featured Tours
  if (pathname === '/') {
    return null;
  }

  const formatPrice = (tour: Tour) => {
    const price = tour.price_adult;
    const currency =
      tour.currency === 'TRY' ? '₺' : tour.currency === 'USD' ? '$' : '€';
    return `${currency}${price.toFixed(0)}`;
  };

  return (
    <section className="py-16 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">You May Like</span> These Tours
        </h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
            <p className="text-xl text-gray-400 mt-4">Loading amazing tours...</p>
          </div>
        ) : recommendedTours.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {recommendedTours.map((tour) => (
              <div
                key={tour.id}
                className="bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700 hover:border-cyan-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20"
              >
                {tour.image_url ? (
                  <div className="relative h-48 md:h-56 group">
                    <Image
                      src={tour.image_url}
                      alt={tour.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`h-48 bg-gradient-to-r ${categoryColors[tour.category] || 'from-blue-400 to-blue-600'}`}
                  />
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-400 uppercase">
                      {tour.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{tour.name}</h3>
                  <p className="text-gray-300 mb-3 line-clamp-2 text-sm">
                    {tour.short_description}
                  </p>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                    <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      {formatPrice(tour)}
                    </span>
                    <Link
                      href={`/tours/${tour.slug}`}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg font-semibold"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400 mb-4">More amazing tours coming soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}
