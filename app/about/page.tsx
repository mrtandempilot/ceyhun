"use client";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Learn more about Oludeniz Tours
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold mb-6">Welcome to Oludeniz Tours</h2>
            
            <p className="text-gray-700 mb-6">
              We are a leading tour operator in Oludeniz, Turkey, offering unforgettable paragliding experiences and adventure tours. 
              With years of experience and a commitment to safety and customer satisfaction, we provide world-class services to travelers from around the globe.
            </p>

            <h3 className="text-2xl font-bold mb-4 mt-8">Our Mission</h3>
            <p className="text-gray-700 mb-6">
              Our mission is to provide safe, exciting, and memorable adventure experiences while showcasing the natural beauty of Oludeniz. 
              We strive to exceed expectations with professional service, top-quality equipment, and expert guides.
            </p>

            <h3 className="text-2xl font-bold mb-4 mt-8">Why Choose Us?</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-3 mb-6">
              <li><strong>Safety First:</strong> All our equipment is regularly inspected and certified</li>
              <li><strong>Experienced Team:</strong> Our pilots and guides have years of professional experience</li>
              <li><strong>Best Locations:</strong> We operate in the most scenic locations in Oludeniz</li>
              <li><strong>Affordable Prices:</strong> Competitive rates with no hidden fees</li>
              <li><strong>Customer Service:</strong> Available 24/7 to assist you before, during, and after your adventure</li>
            </ul>

            <h3 className="text-2xl font-bold mb-4 mt-8">Our Services</h3>
            <p className="text-gray-700 mb-6">
              We offer a wide range of activities including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Paragliding (Tandem flights with professional pilots)</li>
              <li>ATV Safari Tours</li>
              <li>Horse Riding Adventures</li>
              <li>Boat Tours</li>
              <li>And much more!</li>
            </ul>

            <h3 className="text-2xl font-bold mb-4 mt-8">Contact Us</h3>
            <p className="text-gray-700">
              Ready to book your adventure? Have questions? Feel free to contact us anytime. 
              We're here to make your Oludeniz experience unforgettable!
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
