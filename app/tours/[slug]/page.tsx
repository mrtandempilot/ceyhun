"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Tour } from "@/types/tour";
import { notFound } from "next/navigation";

const categoryColors: { [key: string]: string } = {
  Sky: "from-blue-400 to-blue-600",
  Water: "from-cyan-400 to-cyan-600",
  Land: "from-green-400 to-green-600"
};

const categoryButtonColors: { [key: string]: string } = {
  Sky: "bg-blue-600 hover:bg-blue-700",
  Water: "bg-cyan-600 hover:bg-cyan-700",
  Land: "bg-green-600 hover:bg-green-700"
};

export default function TourDetailPage({ params }: { params: { slug: string } }) {
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTour() {
      try {
        const { data, error } = await supabase
          .from('tours')
          .select('*')
          .eq('slug', params.slug)
          .eq('is_active', true)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            notFound();
          }
          throw error;
        }

        setTour(data);
      } catch (err) {
        console.error('Error fetching tour:', err);
        setError('Failed to load tour details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchTour();
  }, [params.slug]);

  const formatPrice = (tour: Tour) => {
    const price = tour.price_adult;
    const currency = tour.currency === 'TRY' ? '₺' : tour.currency === 'USD' ? '$' : '€';
    return `${currency}${price.toFixed(0)}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-4">Loading Tour Details...</h1>
          </div>
        </section>
      </main>
    );
  }

  if (error || !tour) {
    return (
      <main className="min-h-screen">
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-4">Tour Not Found</h1>
            <p className="text-xl max-w-3xl mx-auto">
              The tour you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </section>
      </main>
    );
  }



  return (
    <main className="min-h-screen">
      {/* Image Gallery Section */}
      <section className="pt-16 pb-0">
        <div className="max-w-full px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {tour.image_url ? (
              <>
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <Image
                    src={tour.image_url}
                    alt={`${tour.name} view 1`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <Image
                    src={tour.image_url}
                    alt={`${tour.name} view 2`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <Image
                    src={tour.image_url}
                    alt={`${tour.name} view 3`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </>
            ) : (
              <>
                <div className={`h-64 md:h-80 bg-gradient-to-r ${categoryColors[tour.category] || 'from-blue-400 to-blue-600'}`}></div>
                <div className={`h-64 md:h-80 bg-gradient-to-r ${categoryColors[tour.category] || 'from-blue-400 to-blue-600'}`}></div>
                <div className={`h-64 md:h-80 bg-gradient-to-r ${categoryColors[tour.category] || 'from-blue-400 to-blue-600'}`}></div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Tour Info Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">{tour.name}</h1>
          <p className="text-xl mb-6 max-w-3xl mx-auto">{tour.short_description}</p>
          <div className="flex items-center gap-6 justify-center mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{formatPrice(tour)}</div>
              <div className="text-sm opacity-90">per adult</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{tour.duration}</div>
              <div className="text-sm opacity-90">duration</div>
            </div>
          </div>
          <Link
            href={`/book?tour=${tour.id}`}
            className={`${categoryButtonColors[tour.category] || 'bg-blue-600 hover:bg-blue-700'} text-white px-8 py-3 rounded-lg font-semibold text-lg hover:scale-105 transition inline-block`}
          >
            Book This Tour
          </Link>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Details */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold mb-6">About This Tour</h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                {tour.full_description}
              </p>

              {/* What's Included */}
              {tour.included && tour.included.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold mb-4">What's Included</h3>
                  <ul className="space-y-2">
                    {tour.included.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What to Bring */}
              {tour.what_to_bring && tour.what_to_bring.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold mb-4">What to Bring</h3>
                  <ul className="space-y-2">
                    {tour.what_to_bring.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Meeting Point */}
              {tour.meeting_point && (
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold mb-4">Meeting Point</h3>
                  <p className="text-gray-700">{tour.meeting_point}</p>
                </div>
              )}
            </div>

            {/* Sidebar Details */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-6">Tour Details</h3>

                <div className="space-y-4">
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p className="text-gray-700">{tour.duration}</p>
                  </div>

                  {tour.start_times && tour.start_times.length > 0 && (
                    <div>
                      <span className="font-medium">Start Times:</span>
                      <div className="text-gray-700">
                        {tour.start_times.map((time: string, index: number) => (
                          <div key={index} className="mb-1">{time}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {tour.fitness_level && (
                    <div>
                      <span className="font-medium">Fitness Level:</span>
                      <p className="text-gray-700">{tour.fitness_level}</p>
                    </div>
                  )}

                  {tour.age_limit && (
                    <div>
                      <span className="font-medium">Age Limit:</span>
                      <p className="text-gray-700">{tour.age_limit}</p>
                    </div>
                  )}

                  <div>
                    <span className="font-medium">Pickup Available:</span>
                    <p className="text-gray-700">{tour.pickup_available ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href={`/book?tour=${tour.id}`}
                  className={`w-full ${categoryButtonColors[tour.category] || 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-3 rounded-lg font-semibold text-lg hover:scale-105 transition block text-center`}
                >
                  Book This Tour
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {tour.gallery_urls && tour.gallery_urls.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Tour Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tour.gallery_urls.map((url: string, index: number) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={url}
                    alt={`${tour.name} gallery ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Not Included */}
      {tour.not_included && tour.not_included.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8">What's Not Included</h2>
            <div className="bg-orange-50 rounded-lg p-6">
              <ul className="space-y-2">
                {tour.not_included.map((item: string, index: number) => (
                  <li key={index} className="flex items-start text-orange-800">
                    <span className="mr-2">⚠</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
