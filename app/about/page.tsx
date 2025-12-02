"use client";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">About</span> Us
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Learn more about Oludeniz Tours
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6 text-white">Welcome to Oludeniz Tours</h2>

            <p className="text-gray-300 mb-6 leading-relaxed">
              We are a leading tour operator in Oludeniz, Turkey, offering unforgettable paragliding experiences and adventure tours.
              With years of experience and a commitment to safety and customer satisfaction, we provide world-class services to travelers from around the globe.
            </p>

            <h3 className="text-2xl font-bold mb-4 mt-8 text-white">Our Mission</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Our mission is to provide safe, exciting, and memorable adventure experiences while showcasing the natural beauty of Oludeniz.
              We strive to exceed expectations with professional service, top-quality equipment, and expert guides.
            </p>

            <h3 className="text-2xl font-bold mb-4 mt-8 text-white">Why Choose Us?</h3>
            <ul className="text-gray-300 space-y-3 mb-6">
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 mt-1">✓</span>
                <span><strong className="text-white">Safety First:</strong> All our equipment is regularly inspected and certified</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 mt-1">✓</span>
                <span><strong className="text-white">Experienced Team:</strong> Our pilots and guides have years of professional experience</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 mt-1">✓</span>
                <span><strong className="text-white">Best Locations:</strong> We operate in the most scenic locations in Oludeniz</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 mt-1">✓</span>
                <span><strong className="text-white">Affordable Prices:</strong> Competitive rates with no hidden fees</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 mt-1">✓</span>
                <span><strong className="text-white">Customer Service:</strong> Available 24/7 to assist you before, during, and after your adventure</span>
              </li>
            </ul>

            <h3 className="text-2xl font-bold mb-4 mt-8 text-white">Our Services</h3>
            <p className="text-gray-300 mb-6">
              We offer a wide range of activities including:
            </p>
            <ul className="text-gray-300 space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-orange-400 mr-3">🪂</span>
                <span>Paragliding (Tandem flights with professional pilots)</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-400 mr-3">🏍️</span>
                <span>ATV Safari Tours</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-400 mr-3">🐴</span>
                <span>Horse Riding Adventures</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-400 mr-3">⛵</span>
                <span>Boat Tours</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-400 mr-3">✨</span>
                <span>And much more!</span>
              </li>
            </ul>

            <h3 className="text-2xl font-bold mb-4 mt-8 text-white">Contact Us</h3>
            <p className="text-gray-300">
              Ready to book your adventure? Have questions? Feel free to contact us anytime.
              We're here to make your Oludeniz experience unforgettable!
            </p>

            <div className="mt-8">
              <a
                href="/contact"
                className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
