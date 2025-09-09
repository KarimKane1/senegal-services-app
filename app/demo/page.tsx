'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDemoLogin = async () => {
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
    }, 1000);
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Demo Banner */}
        <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm">
          🎯 DEMO MODE - This is a demonstration of Lumio for investors
        </div>
        
        {/* Demo App Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Lumio Demo
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Experience how friends and family recommend trusted service providers
            </p>
            
            {/* Demo Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
                <div className="text-gray-600">Service Providers</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-green-600 mb-2">156</div>
                <div className="text-gray-600">Recommendations</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-purple-600 mb-2">89</div>
                <div className="text-gray-600">Network Connections</div>
              </div>
            </div>
          </div>

          {/* Demo Providers Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Service Providers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoProviders.map((provider, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-bold text-lg">
                        {provider.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{provider.service}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {provider.qualities.map((quality, qIndex) => (
                        <span key={qIndex} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {quality}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Recommended by <span className="font-semibold">{provider.recommendedBy}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{provider.location}</span>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
                      Contact via WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Features */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How Lumio Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Build Your Network</h3>
                <p className="text-gray-600">Connect with friends and family to see their trusted recommendations</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Get Recommendations</h3>
                <p className="text-gray-600">Find service providers recommended by people you trust</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Contact Directly</h3>
                <p className="text-gray-600">Reach out to providers via WhatsApp with one click</p>
              </div>
            </div>
          </div>

          {/* Demo CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Experience the Full App?</h2>
            <p className="text-gray-600 mb-6">This demo shows the core features. The full app includes real-time recommendations, network building, and more.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try the Full App
              </button>
              <button 
                onClick={() => window.open('https://calendly.com/your-demo-link', '_blank')}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Schedule a Demo Call
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lumio Demo</h1>
          <p className="text-gray-600">Experience how friends recommend trusted service providers</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Demo Credentials</h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="text-sm text-gray-600 mb-2">Email:</div>
            <div className="font-mono text-sm">demo@lumio.africa</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Password:</div>
            <div className="font-mono text-sm">demo123</div>
          </div>
        </div>

        <button
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Loading Demo...' : 'Enter Demo Mode'}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This is a demonstration for investors and partners
          </p>
        </div>
      </div>
    </div>
  );
}

// Demo data
const demoProviders = [
  {
    name: "Ahmed Diallo",
    service: "Electrician",
    location: "Dakar, Senegal",
    recommendedBy: "Fatou Sarr",
    qualities: ["Professional", "Reliable", "Fair Pricing"],
  },
  {
    name: "Moussa Ba",
    service: "HVAC Technician",
    location: "Dakar, Senegal", 
    recommendedBy: "Aminata Diop",
    qualities: ["Timely", "Clean Work", "Expert Knowledge"],
  },
  {
    name: "Aminata Diop",
    service: "Handyman",
    location: "Dakar, Senegal",
    recommendedBy: "Cheikh Fall",
    qualities: ["Versatile", "Trustworthy", "Good Communication"],
  },
  {
    name: "Cheikh Fall",
    service: "Plumber",
    location: "Dakar, Senegal",
    recommendedBy: "Mariama Sow",
    qualities: ["Quick Response", "Quality Work", "Reasonable Price"],
  },
  {
    name: "Mariama Sow",
    service: "Carpenter",
    location: "Dakar, Senegal",
    recommendedBy: "Ibrahima Ndiaye",
    qualities: ["Skilled Craftsmanship", "On Time", "Clean & Organized"],
  },
  {
    name: "Ibrahima Ndiaye",
    service: "Electrician",
    location: "Dakar, Senegal",
    recommendedBy: "Awa Traore",
    qualities: ["Professional", "Safe Work", "Good Value"],
  },
];
