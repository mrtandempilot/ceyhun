import { Metadata } from 'next';
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Tour } from "@/types/tour";
import Image from "next/image";
import ToursList from '@/components/ToursList'; // Assume we will create this component

export const metadata: Metadata = {
    title: 'Our Tours - Unforgettable Adventures in Oludeniz',
    description: 'Choose from our exciting selection of tours and activities in Oludeniz, from sky-high paragliding to serene boat trips. Book your next adventure!',
    keywords: 'Oludeniz tours, paragliding, boat trips, Fethiye activities, adventure tours, Turkey',
    openGraph: {
        title: 'Our Tours - Oludeniz Adventures',
        description: 'Explore the best tours Oludeniz has to offer.',
        type: 'website',
        url: 'https://www.oludeniz.tours/tours',
    },
};

async function getTours() {
    try {
        const { data, error } = await supabase
            .from('tours')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return { tours: data || [], error: null };
    } catch (err) {
        console.error('Error fetching tours:', err);
        return { tours: [], error: 'Failed to load tours. Please try again later.' };
    }
}

export default async function ToursPage() {
  const { tours, error } = await getTours();

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
      <ToursList tours={tours} />

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
