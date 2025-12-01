"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Tour } from "@/types/tour";
import BookingForm from "@/components/BookingForm";
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
      <main className="min-h-screen bg-slate-900">
        <section className="bg-slate-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
            <h1 className="text-4xl font-bold mb-4 mt-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Loading Tour Details...</h1>
          </div>
        </section>
      </main>
    );
  }

  if (error || !tour) {
    return (
      <main className="min-h-screen bg-slate-900">
        <section className="bg-slate-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-4 text-white">Tour Not Found</h1>
            <p className="text-xl max-w-3xl mx-auto text-gray-400">
              The tour you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const galleryImages = tour.gallery_urls || [];
  const getImageSrc = (index: number) => {
    return galleryImages.length > 0 ? galleryImages[index % galleryImages.length] : tour.image_url;
  };



  return (
    <main className="min-h-screen bg-slate-900">
      {/* Image Carousel Section - 3 Images Side by Side */}
      <section className="pt-16 bg-slate-900">
        <div className="relative max-w-full overflow-hidden">
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
            {/* Slide 1 - First set of 3 images */}
            <div className="min-w-full grid grid-cols-3 gap-[30px]">
              {galleryImages.length > 0 || tour.image_url ? (
                <>
                  <div className="relative h-56 md:h-72">
                    <Image
                      src={getImageSrc(0)}
                      alt={`${tour.name}
                  <div className="relative h-64 md:h-80">
                    <Image
                      src={getImageSrc(1)}
                      alt={`${tour.name} gallery view 2`}
                    fill
                    sizes="33vw"
                    className="object-cover"
                    />
                  </div>
                  <div className="relative h-64 md:h-80">
                    <Image
                      src={getImageSrc(2)}
                      alt={`${tour.name} gallery view 3`}
                      fill
                      sizes="33vw"
                      className="object-cover"
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

            {/* Slide 2 - Second set of 3 images */}
            <div className="min-w-full grid grid-cols-3 gap-[30px]">
              {galleryImages.length > 0 || tour.image_url ? (
                <>
                  <div className="relative h-64 md:h-80">
                    <Image
                      src={getImageSrc(3)}
                      alt={`${tour.name} gallery view 4`}
                      fill
                      sizes="33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="relative h-64 md:h-80">
                    <Image
                      src={getImageSrc(4)}
                      alt={`${tour.name} gallery view 5`}
                      fill
                      sizes="33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="relative h-64 md:h-80">
                    <Image
                      src={getImageSrc(5)}
                      alt={`${tour.name} gallery view 6`}
                      fill
                      sizes="33vw"
                      className="object-cover"
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

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? 1 : 0))}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
            aria-label="Previous images"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentImageIndex((prev) => (prev === 1 ? 0 : 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
            aria-label="Next images"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-slate-800 border-y border-slate-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">Free Cancellation</p>
                <p className="text-sm text-gray-400">Till 3 Days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">Photos</p>
                <p className="text-sm text-gray-400">Including</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">Time</p>
                <p className="text-sm text-gray-400">{tour.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">Shuttle</p>
                <p className="text-sm text-gray-400">{tour.pickup_available ? 'Available' : 'Fethiye'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Title and Price Section */}
      <section className="bg-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{tour.name}</h1>
              <p className="text-lg text-cyan-400">{tour.short_description}</p>
            </div>
            <div className="text-center md:text-right">
              <div className="flex items-baseline gap-2 justify-center md:justify-end">
                <span className="text-sm text-gray-400">From</span>
                <span className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">{formatPrice(tour)}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">/per person</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Details */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800 rounded-xl shadow-sm p-8 mb-6 border border-slate-700">
                <h2 className="text-2xl font-bold mb-4 text-white">About This Tour</h2>
                <p className="text-gray-300 leading-relaxed">
                  {tour.full_description}
                </p>
              </div>

              {/* What's Included */}
              {tour.included && tour.included.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold mb-4 text-white">What's Included</h3>
                  <ul className="space-y-2">
                    {tour.included.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What to Bring */}
              {tour.what_to_bring && tour.what_to_bring.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold mb-4 text-white">What to Bring</h3>
                  <ul className="space-y-2">
                    {tour.what_to_bring.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-cyan-400 mr-2">•</span>
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Meeting Point */}
              {tour.meeting_point && (
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold mb-4 text-white">Meeting Point</h3>
                  <p className="text-gray-300">{tour.meeting_point}</p>
                </div>
              )}
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <BookingForm
                tourId={tour.id}
                onSuccess={() => {
                  // Booking completed successfully
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {tour.gallery_urls && tour.gallery_urls.length > 0 && (
        <section className="py-16 bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Tour Gallery</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tour.gallery_urls.map((url: string, index: number) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-700 hover:border-cyan-500 transition-all">
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
        <section className="py-16 bg-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">What's Not Included</h2>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6">
              <ul className="space-y-2">
                {tour.not_included.map((item: string, index: number) => (
                  <li key={index} className="flex items-start text-orange-300">
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
