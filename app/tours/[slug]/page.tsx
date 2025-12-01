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
    <main className="min-h-screen bg-gray-50">
      {/* Image Gallery Section */}
      <section className="pt-16">
        <div className="max-w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {tour.image_url ? (
              <>
                <div className="relative h-64 md:h-96 overflow-hidden">
                  <Image
                    src={tour.image_url}
                    alt={`${tour.name} view 1`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="relative h-64 md:h-96 overflow-hidden">
                  <Image
                    src={tour.image_url}
                    alt={`${tour.name} view 2`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="relative h-64 md:h-96 overflow-hidden">
                  <Image
                    src={tour.image_url}
                    alt={`${tour.name} view 3`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </>
            ) : (
              <>
                <div className={`h-64 md:h-96 bg-gradient-to-r ${categoryColors[tour.category] || 'from-blue-400 to-blue-600'}`}></div>
                <div className={`h-64 md:h-96 bg-gradient-to-r ${categoryColors[tour.category] || 'from-blue-400 to-blue-600'}`}></div>
                <div className={`h-64 md:h-96 bg-gradient-to-r ${categoryColors[tour.category] || 'from-blue-400 to-blue-600'}`}></div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-y border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Free Cancellation</p>
                <p className="text-sm text-gray-600">Till 3 Days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Photos</p>
                <p className="text-sm text-gray-600">Including</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Time</p>
                <p className="text-sm text-gray-600">{tour.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Shuttle</p>
                <p className="text-sm text-gray-600">{tour.pickup_available ? 'Available' : 'Fethiye'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Title and Price Section */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{tour.name}</h1>
              <p className="text-lg text-gray-600">{tour.short_description}</p>
            </div>
            <div className="text-center md:text-right">
              <div className="flex items-baseline gap-2 justify-center md:justify-end">
                <span className="text-sm text-gray-500">From</span>
                <span className="text-4xl font-bold text-blue-600">{formatPrice(tour)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">/per person</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">About This Tour</h2>
                <p className="text-gray-700 leading-relaxed">
                  {tour.full_description}
                </p>
              </div>

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
