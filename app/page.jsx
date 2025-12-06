"use client";

import { useEffect, useState } from "react";

export default function LandingPage() {
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Check localStorage for user data
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setIsRegistered(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-8">
      {/* Hero Section */}
      <header className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-wide">
          INNOVANCE 4.0
        </h1>
        <h2 className="text-2xl font-semibold">By IoT Labs</h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-200">
          Join us for the ultimate innovation fest — where technology,
          creativity, and collaboration meet.
        </p>
      </header>

      {/* Call to Action */}
      <div className="mt-10 flex space-x-6">
        {isRegistered ? (
          <a
            href="/payment"
            className="bg-green-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-500 transition transform hover:scale-105"
          >
            Continue to Payment
          </a>
        ) : (
          <a
            href="/register"
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition transform hover:scale-105"
          >
            Register Now
          </a>
        )}

        <a
          href="/about"
          className="bg-white text-purple-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition transform hover:scale-105"
        >
          Learn More
        </a>
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-sm text-gray-300">
        © {new Date().getFullYear()} IoT Labs. All rights reserved.
      </footer>
    </div>
  );
}