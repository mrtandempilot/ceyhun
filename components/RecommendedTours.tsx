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
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12">You May Like These Tours</h2>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Loading...</p>
          </div>
        ) : recommendedTours.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {recommendedTours.map((tour) => (
              <div
                key={tour.id}
                className="bg-white bg-opacity-80 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition"
              >
                {tour.image_url ? (
                  <div className="relative h-48">
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
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-500 uppercase">
                      {tour.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{tour.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {tour.short_description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className={`text-2xl font-bold ${categoryPriceColors[tour.category] || 'text-blue-600'}`}>
                      {formatPrice(tour)}
                    </span>
                    <Link
                      href={`/book?tour=${tour.id}`}
                      className={`${categoryButtonColors[tour.category] || 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded-lg transition`}
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">More amazing tours coming soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}
